import { safeRead, safeWrite, getNextSequence } from './mongodb';
import { getSiteSettings } from './settings';
import { CMS_PAGES } from './cmsRegistry';

const COLLECTION = 'seo_meta';

function cleanPath(pagePath) {
  const p = String(pagePath || '/').trim();
  if (!p) return '/';
  return p.startsWith('/') ? p : `/${p}`;
}

/**
 * Site origin used to build every absolute URL (canonical, OG, sitemap,
 * JSON-LD). NEXT_PUBLIC_SITE_URL always wins when set; otherwise falls back
 * to the "Site URL" saved in Admin → SEO → Global Defaults, then localhost.
 */
export async function getSiteUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/+$/, '');
  const settings = await getSiteSettings();
  return (settings.siteUrl || 'http://localhost:3000').replace(/\/+$/, '');
}

/** Turns a relative path (or an already-absolute URL) into an absolute URL. */
export async function absoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return undefined;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = await getSiteUrl();
  return `${base}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

/** Sync helper for building absolute URLs once a siteUrl is already resolved. */
function absoluteUrlWith(siteUrl, pathOrUrl) {
  if (!pathOrUrl) return undefined;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${siteUrl}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

// ---------------------------------------------------------------------
// CRUD - Admin -> SEO (per-route metadata overrides), stored in MongoDB.
// Every route (existing or new) is safe to look up: if nothing has been
// saved, null/defaults are returned and the caller's own hard-coded
// title/description keeps working exactly as before this feature existed.
// ---------------------------------------------------------------------

export async function getSeoMeta(pagePath) {
  return safeRead((db) => db.collection(COLLECTION).findOne({ page_path: cleanPath(pagePath) }), null);
}

/** Admin: every saved SEO row, most recently updated first. */
export async function listSeoMeta() {
  return safeRead((db) => db.collection(COLLECTION).find({}).sort({ updated_at: -1 }).toArray(), []);
}

export async function getSeoMetaById(id) {
  return safeRead((db) => db.collection(COLLECTION).findOne({ id: Number(id) }), null);
}

/** Every path an admin has explicitly set to "noindex" - excluded from the sitemap. */
export async function getNoindexPaths() {
  const rows = await safeRead(
    (db) => db.collection(COLLECTION).find({ robots_index: false }, { projection: { page_path: 1 } }).toArray(),
    []
  );
  return new Set(rows.map((r) => r.page_path));
}

export async function upsertSeoMeta(pagePath, input = {}) {
  const path = cleanPath(pagePath);
  if (!path) return { ok: false, error: 'A page path is required' };

  // A raw JSON-LD override is optional, but if present it must be valid JSON
  // (object or array of objects) - never silently store broken markup.
  let schemaJson = null;
  if (input.schemaJson && String(input.schemaJson).trim()) {
    try {
      const parsed = JSON.parse(input.schemaJson);
      if (typeof parsed !== 'object' || parsed === null) throw new Error('not an object');
      schemaJson = JSON.stringify(parsed);
    } catch {
      return { ok: false, error: 'Custom Schema.org JSON-LD must be valid JSON' };
    }
  }

  const robotsIndex = input.robotsIndex !== false && input.robotsIndex !== 'false';
  const robotsFollow = input.robotsFollow !== false && input.robotsFollow !== 'false';
  const robots = `${robotsIndex ? 'index' : 'noindex'},${robotsFollow ? 'follow' : 'nofollow'}`;

  return safeWrite(async (db) => {
    const existing = await db.collection(COLLECTION).findOne({ page_path: path });
    const id = existing?.id ?? (await getNextSequence(COLLECTION));
    await db.collection(COLLECTION).updateOne(
      { page_path: path },
      {
        $set: {
          id,
          page_path: path,
          page_label: input.pageLabel || existing?.page_label || null,

          meta_title: input.metaTitle || null,
          meta_description: input.metaDescription || null,
          canonical_url: input.canonicalUrl || null,

          robots_index: robotsIndex,
          robots_follow: robotsFollow,
          robots, // kept for backwards compatibility / quick display

          og_title: input.ogTitle || null,
          og_description: input.ogDescription || null,
          og_image: input.ogImage || null,
          og_type: input.ogType || 'website',
          og_url: input.ogUrl || null,

          twitter_card: input.twitterCard || 'summary_large_image',
          twitter_title: input.twitterTitle || null,
          twitter_description: input.twitterDescription || null,
          twitter_image: input.twitterImage || null,

          author: input.author || null,
          published_time: input.publishedTime || null,
          modified_time: input.modifiedTime || null,
          focus_keyword: input.focusKeyword || null,
          meta_keywords: input.metaKeywords || null,

          schema_json: schemaJson,
          updated_at: new Date()
        }
      },
      { upsert: true }
    );
    return { id };
  });
}

export async function deleteSeoMeta(id) {
  return safeWrite((db) => db.collection(COLLECTION).deleteOne({ id: Number(id) }));
}

// ---------------------------------------------------------------------
// Breadcrumbs - auto-derived from the URL path, preferring the CMS
// registry's human labels, so every route gets a sensible trail with zero
// per-page configuration.
// ---------------------------------------------------------------------

function titleCaseSegment(segment) {
  return decodeURIComponent(segment)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function labelForPath(pagePath) {
  const known = CMS_PAGES.find((p) => p.route === pagePath);
  if (known) return known.label;
  const segments = pagePath.split('/').filter(Boolean);
  if (!segments.length) return 'Home';
  return titleCaseSegment(segments[segments.length - 1]);
}

/** [{ name, path }] trail from "/" down to `pagePath`, e.g. Home > Services > Data & Analytics. */
export function buildBreadcrumbTrail(pagePath) {
  const segments = cleanPath(pagePath).split('/').filter(Boolean);
  const trail = [{ name: 'Home', path: '/' }];
  let acc = '';
  for (const seg of segments) {
    acc += `/${seg}`;
    trail.push({ name: labelForPath(acc), path: acc });
  }
  return trail;
}

// ---------------------------------------------------------------------
// generateMetadata() integration
// ---------------------------------------------------------------------

/**
 * Builds a Next.js `metadata` object for `generateMetadata()`.
 * Priority (highest wins): Admin -> SEO override for this exact path >
 * the page's own hard-coded fallback (title/description the developer
 * shipped with the page) > sitewide defaults from Admin -> SEO -> Global
 * Defaults. Never throws - safe to call from every page.js, and always
 * returns a single, non-duplicated canonical/robots/OG/Twitter block.
 */
export async function buildSeoMetadata(pagePath, fallback = {}) {
  const path = cleanPath(pagePath);
  const [row, settings] = await Promise.all([getSeoMeta(path), getSiteSettings()]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '')
    : (settings.siteUrl || 'http://localhost:3000').replace(/\/+$/, '');
  const abs = (p) => absoluteUrlWith(siteUrl, p);

  const title = row?.meta_title || fallback.title || settings.defaultMetaTitle || settings.siteName;
  const description =
    row?.meta_description || fallback.description || settings.defaultMetaDescription || undefined;
  const canonical = row?.canonical_url || fallback.canonicalUrl || abs(path);

  const robotsIndex = row ? row.robots_index !== false : fallback.noindex !== true;
  const robotsFollow = row ? row.robots_follow !== false : true;

  const ogImage = row?.og_image || fallback.ogImage || settings.defaultOgImage || undefined;
  const ogTitle = row?.og_title || row?.meta_title || fallback.title || title;
  const ogDescription = row?.og_description || row?.meta_description || description;
  const ogType = row?.og_type || fallback.ogType || 'website';
  const ogUrl = row?.og_url || canonical;
  const author = row?.author || fallback.author || settings.organizationName || undefined;
  const publishedTime = row?.published_time || fallback.publishedTime || undefined;
  const modifiedTime = row?.modified_time || fallback.modifiedTime || undefined;

  const openGraph = {
    title: ogTitle,
    description: ogDescription,
    url: ogUrl,
    siteName: settings.siteName,
    type: ogType,
    locale: 'en_US',
    ...(ogImage ? { images: [{ url: abs(ogImage), width: 1200, height: 630, alt: ogTitle }] } : {})
  };
  // Next.js only emits article:* OG tags when type is "article" - keeping
  // these scoped avoids invalid/duplicate tags on ordinary pages.
  if (ogType === 'article') {
    if (publishedTime) openGraph.publishedTime = publishedTime;
    if (modifiedTime) openGraph.modifiedTime = modifiedTime;
    if (author) openGraph.authors = [author];
  }

  const twitterCard = row?.twitter_card || 'summary_large_image';
  const twitterTitle = row?.twitter_title || ogTitle;
  const twitterDescription = row?.twitter_description || ogDescription;
  const twitterImage = row?.twitter_image || ogImage;

  /** @type {import('next').Metadata} */
  const metadata = {
    title,
    description,
    alternates: { canonical },
    robots: {
      index: robotsIndex,
      follow: robotsFollow,
      googleBot: { index: robotsIndex, follow: robotsFollow }
    },
    openGraph,
    twitter: {
      card: twitterCard,
      title: twitterTitle,
      description: twitterDescription,
      ...(twitterImage ? { images: [abs(twitterImage)] } : {}),
      ...(settings.twitterHandle ? { site: settings.twitterHandle, creator: settings.twitterHandle } : {})
    }
  };
  if (author) metadata.authors = [{ name: author }];
  const keywordList = [
    ...(row?.focus_keyword ? [row.focus_keyword] : []),
    ...(row?.meta_keywords ? row.meta_keywords.split(',').map((k) => k.trim()).filter(Boolean) : [])
  ];
  if (keywordList.length) metadata.keywords = [...new Set(keywordList)];

  return metadata;
}

// ---------------------------------------------------------------------
// Schema.org / JSON-LD
// ---------------------------------------------------------------------

/**
 * Builds the JSON-LD graph for a page: WebPage + BreadcrumbList (+ Article
 * when `options.type === 'article'`), all self-contained (no cross-script
 * @id lookups required). If the admin saved a raw JSON-LD override for this
 * path (Admin -> SEO -> Schema tab) it completely replaces the auto-generated
 * graph - total control when needed, sensible defaults otherwise.
 */
export async function buildJsonLd(pagePath, options = {}) {
  const path = cleanPath(pagePath);
  const [row, settings] = await Promise.all([getSeoMeta(path), getSiteSettings()]);

  if (row?.schema_json) {
    try {
      return JSON.parse(row.schema_json);
    } catch {
      // fall through to the auto-generated graph if the stored value somehow became invalid
    }
  }

  const siteUrl = await getSiteUrl();
  const abs = (p) => absoluteUrlWith(siteUrl, p);
  const url = abs(path);
  const title = row?.meta_title || options.title || settings.defaultMetaTitle || settings.siteName;
  const description = row?.meta_description || options.description || settings.defaultMetaDescription;
  const image = row?.og_image || options.image || settings.defaultOgImage;

  const organization = {
    '@type': 'Organization',
    name: settings.organizationName || settings.siteName,
    url: siteUrl,
    ...(settings.organizationLogo ? { logo: abs(settings.organizationLogo) } : {})
  };

  const graph = [
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: title,
      ...(description ? { description } : {}),
      ...(image ? { primaryImageOfPage: abs(image) } : {}),
      publisher: organization
    }
  ];

  const trail = buildBreadcrumbTrail(path);
  if (trail.length > 1) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: trail.map((crumb, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: crumb.name,
        item: abs(crumb.path)
      }))
    });
  }

  if (options.type === 'article') {
    const published = row?.published_time || options.publishedTime;
    graph.push({
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: title,
      ...(description ? { description } : {}),
      ...(image ? { image: [abs(image)] } : {}),
      author: {
        '@type': 'Person',
        name: row?.author || options.author || settings.organizationName || settings.siteName
      },
      publisher: organization,
      ...(published ? { datePublished: published } : {}),
      dateModified: row?.modified_time || options.modifiedTime || published || undefined,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url }
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

/** Sitewide Organization + WebSite graph, rendered once in the root layout. */
export async function buildOrganizationSchema(settings) {
  const siteUrl = await getSiteUrl();
  const abs = (p) => absoluteUrlWith(siteUrl, p);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: settings.organizationName || settings.siteName,
        url: siteUrl,
        ...(settings.organizationDescription ? { description: settings.organizationDescription } : {}),
        ...(settings.organizationLogo
          ? { logo: { '@type': 'ImageObject', url: abs(settings.organizationLogo) } }
          : {})
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: settings.siteName,
        publisher: { '@id': `${siteUrl}/#organization` }
      }
    ]
  };
}
