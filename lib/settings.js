import { safeRead, safeWrite } from './mongodb';

// These values match the hard-coded defaults that already ship in
// tailwind.config.js / globals.css, so if the DB is unreachable (or the
// table hasn't been migrated yet) the site renders pixel-identical to
// before this feature existed.
export const DEFAULT_SETTINGS = {
  siteName: 'Chromatus Consulting',
  tagline: '',
  logoUrl: '/images/logo.png',
  colorNavy: '#0E4A6B',
  colorNavyLight: '#15619B',
  colorNavyDark: '#0A3350',
  colorBrandblue: '#1F82C5',
  colorBrandblueDark: '#15619B',
  colorBrandorange: '#EA7A00',
  colorBrandorangeDark: '#C46600',
  // SEO sitewide defaults / fallbacks (Admin -> SEO -> Global Defaults).
  // Used whenever a page has no per-route override saved.
  siteUrl: '',
  defaultMetaTitle: 'Chromatus Consulting — We turn data into decisions.',
  defaultMetaDescription:
    'Chromatus Consulting helps businesses understand their markets, their customers, and their competition — so every decision is backed by evidence, not guesswork.',
  defaultOgImage: '/images/logo.png',
  twitterHandle: '',
  organizationName: 'Chromatus Consulting',
  organizationLogo: '/images/logo.png',
  organizationDescription: ''
};

function rowToSettings(row) {
  if (!row) return { ...DEFAULT_SETTINGS };
  return {
    siteName: row.site_name || DEFAULT_SETTINGS.siteName,
    tagline: row.tagline || '',
    logoUrl: row.logo_url || DEFAULT_SETTINGS.logoUrl,
    colorNavy: row.color_navy || DEFAULT_SETTINGS.colorNavy,
    colorNavyLight: row.color_navy_light || DEFAULT_SETTINGS.colorNavyLight,
    colorNavyDark: row.color_navy_dark || DEFAULT_SETTINGS.colorNavyDark,
    colorBrandblue: row.color_brandblue || DEFAULT_SETTINGS.colorBrandblue,
    colorBrandblueDark: row.color_brandblue_dark || DEFAULT_SETTINGS.colorBrandblueDark,
    colorBrandorange: row.color_brandorange || DEFAULT_SETTINGS.colorBrandorange,
    colorBrandorangeDark: row.color_brandorange_dark || DEFAULT_SETTINGS.colorBrandorangeDark,
    siteUrl: row.site_url || DEFAULT_SETTINGS.siteUrl,
    defaultMetaTitle: row.default_meta_title || DEFAULT_SETTINGS.defaultMetaTitle,
    defaultMetaDescription: row.default_meta_description || DEFAULT_SETTINGS.defaultMetaDescription,
    defaultOgImage: row.default_og_image || DEFAULT_SETTINGS.defaultOgImage,
    twitterHandle: row.twitter_handle || DEFAULT_SETTINGS.twitterHandle,
    organizationName: row.organization_name || DEFAULT_SETTINGS.organizationName,
    organizationLogo: row.organization_logo || DEFAULT_SETTINGS.organizationLogo,
    organizationDescription: row.organization_description || DEFAULT_SETTINGS.organizationDescription
  };
}

/** "#1F82C5" -> "31 130 197" (Tailwind's rgb(var(--x) / alpha) triple format). */
export function hexToRgbTriple(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return null;
  const int = parseInt(m[1], 16);
  return `${(int >> 16) & 255} ${(int >> 8) & 255} ${int & 255}`;
}

/** Builds the :root override block for the <style> tag rendered in <head>. */
export function settingsToCssVars(settings) {
  const pairs = [
    ['--color-navy-rgb', settings.colorNavy],
    ['--color-navy-light-rgb', settings.colorNavyLight],
    ['--color-navy-dark-rgb', settings.colorNavyDark],
    ['--color-brandblue-rgb', settings.colorBrandblue],
    ['--color-brandblue-dark-rgb', settings.colorBrandblueDark],
    ['--color-brandorange-rgb', settings.colorBrandorange],
    ['--color-brandorange-dark-rgb', settings.colorBrandorangeDark]
  ];
  const declarations = pairs
    .map(([varName, hex]) => {
      const triple = hexToRgbTriple(hex);
      return triple ? `${varName}: ${triple};` : '';
    })
    .filter(Boolean)
    .join(' ');
  return `:root { ${declarations} }`;
}

/** Public/frontend read — always resolves, never throws. */
export async function getSiteSettings() {
  const row = await safeRead((db) => db.collection('site_settings').findOne({ _id: 1 }), null);
  return rowToSettings(row);
}

export async function saveSiteSettings(input) {
  const s = { ...DEFAULT_SETTINGS, ...input };
  return safeWrite((db) =>
    db.collection('site_settings').updateOne(
      { _id: 1 },
      {
        $set: {
          site_name: s.siteName,
          tagline: s.tagline,
          logo_url: s.logoUrl,
          color_navy: s.colorNavy,
          color_navy_light: s.colorNavyLight,
          color_navy_dark: s.colorNavyDark,
          color_brandblue: s.colorBrandblue,
          color_brandblue_dark: s.colorBrandblueDark,
          color_brandorange: s.colorBrandorange,
          color_brandorange_dark: s.colorBrandorangeDark,
          site_url: s.siteUrl,
          default_meta_title: s.defaultMetaTitle,
          default_meta_description: s.defaultMetaDescription,
          default_og_image: s.defaultOgImage,
          twitter_handle: s.twitterHandle,
          organization_name: s.organizationName,
          organization_logo: s.organizationLogo,
          organization_description: s.organizationDescription
        }
      },
      { upsert: true }
    )
  );
}
