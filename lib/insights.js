import { safeRead, safeWrite, getNextSequence } from './mongodb';
import { fallbackArticles } from '@/data/content/insights';

const COLLECTION = 'insights_articles';

const TYPE_MAP = {
  'blogs-articles': 'blog',
  'articles-insights': 'blog',
  whitepapers: 'whitepaper',
  'case-studies': 'case_study',
  reports: 'report',
  'research-reports': 'report',
  'industry-reports': 'report',
  'webinars-events': 'webinar'
};

export async function getArticles({ type } = {}) {
  const dbType = type ? TYPE_MAP[type] : null;
  const query = { is_published: 1, ...(dbType ? { type: dbType } : {}) };
  const rows = await safeRead(
    (db) => db.collection(COLLECTION).find(query).sort({ published_at: -1 }).toArray(),
    []
  );

  if (rows.length > 0) return rows;

  // Graceful fallback so the page still renders useful content before the
  // database has been migrated/seeded.
  return dbType ? fallbackArticles.filter((a) => a.type === dbType) : fallbackArticles;
}

export async function getArticleBySlug(slug) {
  const row = await safeRead(
    (db) => db.collection(COLLECTION).findOne({ slug, is_published: 1 }),
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
  return safeRead(
    (db) => db.collection(COLLECTION).find({}).sort({ published_at: -1, id: -1 }).toArray(),
    []
  );
}

export async function getArticleByIdAdmin(id) {
  return safeRead((db) => db.collection(COLLECTION).findOne({ id: Number(id) }), null);
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
  return safeWrite((db) =>
    db.collection(COLLECTION).updateOne(
      { id: Number(id) },
      {
        $set: {
          type: input.type,
          tag: input.tag,
          title: input.title,
          slug,
          summary: input.summary,
          body: input.body || '',
          author: input.author || 'Chromatus Consulting',
          published_at: input.published_at,
          is_published: input.is_published ? 1 : 0,
          updated_at: new Date()
        }
      }
    )
  );
}

export async function deleteArticle(id) {
  return safeWrite((db) => db.collection(COLLECTION).deleteOne({ id: Number(id) }));
}
