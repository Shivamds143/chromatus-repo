import { safeRead } from './mongodb';
import { getAllRoutes, primaryNav } from '@/data/navigation';

// Build a static, always-available search index from the site's navigation
// and section descriptions. This guarantees search keeps working even if
// the database is unreachable — only the "Insights" article matches (which
// genuinely live in MongoDB) will be unavailable in that scenario.
function getStaticIndex() {
  const routes = getAllRoutes();
  const descriptionByHref = new Map();
  primaryNav.forEach((item) => {
    descriptionByHref.set(item.href, item.description);
    item.children.forEach((child) => descriptionByHref.set(child.href, item.description));
  });

  return routes.map((route) => ({
    type: 'page',
    title: route.label,
    href: route.href,
    summary: descriptionByHref.get(route.href) || ''
  }));
}

function matches(haystack, needle) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function performSearch(rawQuery) {
  const q = (rawQuery || '').trim();
  if (!q) return { query: q, pages: [], articles: [] };

  const staticPages = getStaticIndex().filter(
    (p) => matches(p.title, q) || matches(p.summary, q)
  );

  const re = new RegExp(escapeRegExp(q), 'i');

  // Prefer MongoDB search over site_pages (keeps results in sync with any
  // content edited directly in the database), and fall back to the static
  // index above if the DB call fails or returns nothing.
  const dbPages = await safeRead(
    (db) =>
      db
        .collection('site_pages')
        .find({ $or: [{ title: re }, { summary: re }] })
        .sort({ path: 1 })
        .limit(20)
        .toArray(),
    []
  );

  const pages = dbPages.length > 0
    ? dbPages.map((p) => ({ type: 'page', title: p.title, href: p.path, summary: p.summary }))
    : staticPages;

  const dbArticles = await safeRead(
    (db) =>
      db
        .collection('insights_articles')
        .find({
          is_published: 1,
          $or: [{ title: re }, { summary: re }, { body: re }]
        })
        .sort({ published_at: -1 })
        .limit(20)
        .toArray(),
    []
  );

  const articles = dbArticles.map((a) => ({
    type: 'article',
    title: a.title,
    href: `/insights/article/${a.slug}`,
    summary: a.summary,
    tag: a.tag,
    published_at: a.published_at
  }));

  return { query: q, pages, articles };
}
