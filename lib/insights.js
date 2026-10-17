import { safeRead, safeWrite, getNextSequence } from './mongodb';
import { fallbackArticles } from '@/data/content/insights';

const COLLECTION = 'insights_articles';

export function normalizeInsightTypes(type) {
  if (!type) return null;
  const t = String(type).toLowerCase().trim().replace(/_/g, '-');
  if (t === 'industry-reports' || t === 'report' || t === 'reports' || t === 'research-reports') {
    return ['industry-reports', 'report', 'reports', 'research-reports'];
  }
  if (t === 'whitepapers' || t === 'whitepaper') {
    return ['whitepapers', 'whitepaper'];
  }
  if (t === 'case-studies' || t === 'case-study' || t === 'case_study' || t === 'cases') {
    return ['case-studies', 'case_study', 'case-study'];
  }
  if (t === 'news-updates' || t === 'news' || t === 'news_updates' || t === 'updates') {
    return ['news-updates', 'news', 'news_updates', 'updates'];
  }
  if (t === 'webinars-events' || t === 'webinar' || t === 'webinars' || t === 'events') {
    return ['webinars-events', 'webinar', 'webinars', 'webinars_events'];
  }
  if (t === 'blogs-articles' || t === 'blog' || t === 'blogs' || t === 'articles-insights' || t === 'articles') {
    return ['blog', 'blogs', 'blogs-articles', 'articles-insights', 'articles'];
  }
  return [t];
}

export async function getArticles({ type } = {}) {
  const allowed = normalizeInsightTypes(type);
  const query = {
    is_published: { $in: [1, true, '1'] },
    ...(allowed ? { type: { $in: allowed } } : {})
  };
  const rows = await safeRead(
    (db) => db.collection(COLLECTION).find(query).sort({ published_at: -1 }).toArray(),
    []
  );

  if (rows.length > 0) return rows;

  // Graceful fallback so the page still renders useful content before the
  // database has been migrated/seeded.
  return allowed
    ? fallbackArticles.filter((a) => {
        const aNorm = normalizeInsightTypes(a.type) || [];
        return allowed.some((t) => aNorm.includes(t) || a.type === t);
      })
    : fallbackArticles;
}

export async function getArticleBySlug(slug) {
  const row = await safeRead(
    (db) => db.collection(COLLECTION).findOne({ slug, is_published: { $in: [1, true, '1'] } }),
    null
  );
  if (row) return row;
  return fallbackArticles.find((a) => a.slug === slug) || null;
}

// ---------------------------------------------------------------------
// Admin-only helpers (used by /admin/insights and its API routes).
// These intentionally ignore is_published so admins can see drafts too.
// ---------------------------------------------------------------------

export async function getAllArticlesAdmin() {
  const rows = await safeRead(
    (db) => db.collection(COLLECTION).find({}).sort({ published_at: -1, id: -1 }).toArray(),
    []
  );

  const existingSlugs = new Set((rows || []).map((r) => r.slug));
  const existingIds = new Set((rows || []).map((r) => Number(r.id)));
  const missingFallbacks = fallbackArticles.filter(
    (f) => !existingSlugs.has(f.slug) && !existingIds.has(Number(f.id))
  );

  return [...(rows || []), ...missingFallbacks];
}

export async function getArticleByIdAdmin(id) {
  const row = await safeRead((db) => db.collection(COLLECTION).findOne({ id: Number(id) }), null);
  if (row) return row;
  return fallbackArticles.find((a) => Number(a.id) === Number(id)) || null;
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function createArticle(input) {
  const slug = input.slug ? slugify(input.slug) : slugify(input.title);
  return safeWrite(async (db) => {
    const id = await getNextSequence(COLLECTION);
    await db.collection(COLLECTION).insertOne({
      _id: id,
      id,
      type: input.type,
      tag: input.tag,
      title: input.title,
      slug,
      summary: input.summary,
      body: input.body || '',
      cover_image: input.cover_image || input.coverImage || '',
      author: input.author || 'Chromatus Consulting',
      published_at: input.published_at,
      is_published: input.is_published ? 1 : 0,
      updated_at: new Date()
    });
    return { insertId: id };
  });
}

export async function updateArticle(id, input) {
  const slug = input.slug ? slugify(input.slug) : slugify(input.title);
  const numId = Number(id);
  return safeWrite(async (db) => {
    const existing = await db.collection(COLLECTION).findOne({ id: numId });
    if (!existing) {
      await db.collection(COLLECTION).insertOne({
        _id: numId,
        id: numId,
        type: input.type,
        tag: input.tag,
        title: input.title,
        slug,
        summary: input.summary,
        body: input.body || '',
        cover_image: input.cover_image || input.coverImage || '',
        author: input.author || 'Chromatus Consulting',
        published_at: input.published_at,
        is_published: input.is_published ? 1 : 0,
        updated_at: new Date()
      });
      return { ok: true, matchedCount: 1, modifiedCount: 1 };
    }
    return db.collection(COLLECTION).updateOne(
      { id: numId },
      {
        $set: {
          type: input.type,
          tag: input.tag,
          title: input.title,
          slug,
          summary: input.summary,
          body: input.body || '',
          cover_image: input.cover_image || input.coverImage || '',
          author: input.author || 'Chromatus Consulting',
          published_at: input.published_at,
          is_published: input.is_published ? 1 : 0,
          updated_at: new Date()
        }
      }
    );
  });
}

export async function deleteArticle(id) {
  return safeWrite((db) => db.collection(COLLECTION).deleteOne({ id: Number(id) }));
}
