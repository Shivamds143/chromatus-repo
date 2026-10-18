import { safeRead, safeWrite, getNextSequence } from './mongodb';
import { fallbackArticles } from '@/data/content/insights';

const COLLECTION = 'insights_articles';
const DELETED_COLLECTION = 'deleted_insights_articles';
const FLAGS_COLLECTION = 'system_flags';

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

let seedPromise = null;

export async function ensureInsightsSeeded() {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    try {
      await safeWrite(async (db) => {
        // Check if seeding flag exists
        const flag = await db.collection(FLAGS_COLLECTION).findOne({ _id: 'insights_seeded' });
        if (flag) return;

        // Fetch any deleted article markers
        const deletedDocs = await db.collection(DELETED_COLLECTION).find({}).toArray().catch(() => []);
        const deletedIds = new Set(deletedDocs.map((d) => String(d.id || d._id)));
        const deletedSlugs = new Set(deletedDocs.map((d) => String(d.slug)));

        // Find existing articles in DB
        const existing = await db.collection(COLLECTION).find({}).toArray().catch(() => []);
        const existingSlugs = new Set(existing.map((e) => e.slug));
        const existingIds = new Set(existing.map((e) => String(e.id || e._id)));

        // Seed fallback articles that haven't been deleted or already saved
        const toSeed = fallbackArticles
          .filter(
            (a) =>
              !existingIds.has(String(a.id)) &&
              !existingSlugs.has(String(a.slug)) &&
              !deletedIds.has(String(a.id)) &&
              !deletedSlugs.has(String(a.slug))
          )
          .map((a) => ({
            _id: Number(a.id),
            id: Number(a.id),
            type: a.type,
            tag: a.tag,
            title: a.title,
            slug: a.slug,
            summary: a.summary,
            body: a.body || '',
            cover_image: a.cover_image || '',
            author: a.author || 'Chromatus Consulting',
            published_at: a.published_at,
            is_published: a.is_published ? 1 : 0,
            updated_at: new Date()
          }));

        if (toSeed.length > 0) {
          await db.collection(COLLECTION).insertMany(toSeed);
        }

        // Mark collection as initialized so fallback articles are never revived if deleted
        await db.collection(FLAGS_COLLECTION).updateOne(
          { _id: 'insights_seeded' },
          { $set: { _id: 'insights_seeded', seeded_at: new Date() } },
          { upsert: true }
        );
      });
    } catch (err) {
      console.warn('[insights] ensureInsightsSeeded notice:', err?.message || err);
    }
  })();
  return seedPromise;
}

export async function getArticles({ type } = {}) {
  await ensureInsightsSeeded();

  const allowed = normalizeInsightTypes(type);
  const query = {
    is_published: { $in: [1, true, '1'] },
    ...(allowed ? { type: { $in: allowed } } : {})
  };

  const [rows, deletedDocs] = await Promise.all([
    safeRead(
      (db) => db.collection(COLLECTION).find(query).sort({ published_at: -1, id: -1 }).toArray(),
      []
    ),
    safeRead(
      (db) => db.collection(DELETED_COLLECTION).find({}).toArray(),
      []
    )
  ]);

  const deletedIds = new Set((deletedDocs || []).map((d) => String(d.id || d._id)));
  const deletedSlugs = new Set((deletedDocs || []).map((d) => String(d.slug)));

  return (rows || []).filter(
    (r) => !deletedIds.has(String(r.id || r._id)) && !deletedSlugs.has(String(r.slug))
  );
}

export async function getArticleBySlug(slug) {
  await ensureInsightsSeeded();

  const [row, deleted] = await Promise.all([
    safeRead(
      (db) => db.collection(COLLECTION).findOne({ slug, is_published: { $in: [1, true, '1'] } }),
      null
    ),
    safeRead(
      (db) => db.collection(DELETED_COLLECTION).findOne({ $or: [{ slug }, { _id: slug }] }),
      null
    )
  ]);

  if (deleted) return null;
  return row || null;
}

// ---------------------------------------------------------------------
// Admin-only helpers (used by /admin/insights and its API routes).
// ---------------------------------------------------------------------

export async function getAllArticlesAdmin() {
  await ensureInsightsSeeded();

  const [rows, deletedDocs] = await Promise.all([
    safeRead(
      (db) => db.collection(COLLECTION).find({}).sort({ published_at: -1, id: -1 }).toArray(),
      []
    ),
    safeRead(
      (db) => db.collection(DELETED_COLLECTION).find({}).toArray(),
      []
    )
  ]);

  const deletedIds = new Set((deletedDocs || []).map((d) => String(d.id || d._id)));
  const deletedSlugs = new Set((deletedDocs || []).map((d) => String(d.slug)));

  return (rows || []).filter(
    (r) => !deletedIds.has(String(r.id || r._id)) && !deletedSlugs.has(String(r.slug))
  );
}

export async function getArticleByIdAdmin(id) {
  await ensureInsightsSeeded();
  const numId = Number(id);
  const filter = !isNaN(numId)
    ? { $or: [{ id: numId }, { _id: numId }, { id: String(id) }, { _id: String(id) }] }
    : { $or: [{ id: String(id) }, { _id: String(id) }, { slug: String(id) }] };

  const [row, deleted] = await Promise.all([
    safeRead((db) => db.collection(COLLECTION).findOne(filter), null),
    safeRead(
      (db) =>
        db.collection(DELETED_COLLECTION).findOne({
          $or: [{ _id: String(id) }, { id: !isNaN(numId) ? numId : id }, { slug: String(id) }]
        }),
      null
    )
  ]);

  if (deleted) return null;
  return row || null;
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function createArticle(input) {
  await ensureInsightsSeeded();
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
  await ensureInsightsSeeded();
  const slug = input.slug ? slugify(input.slug) : slugify(input.title);
  const numId = Number(id);
  const filter = !isNaN(numId)
    ? { $or: [{ id: numId }, { _id: numId }, { id: String(id) }, { _id: String(id) }] }
    : { $or: [{ id: String(id) }, { _id: String(id) }, { slug: String(id) }] };

  return safeWrite(async (db) => {
    const existing = await db.collection(COLLECTION).findOne(filter);
    if (!existing) {
      const docId = !isNaN(numId) ? numId : await getNextSequence(COLLECTION);
      await db.collection(COLLECTION).insertOne({
        _id: docId,
        id: docId,
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
      filter,
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
  await ensureInsightsSeeded();
  const numId = Number(id);
  const filter = !isNaN(numId)
    ? { $or: [{ id: numId }, { _id: numId }, { id: String(id) }, { _id: String(id) }] }
    : { $or: [{ id: String(id) }, { _id: String(id) }, { slug: String(id) }] };

  return safeWrite(async (db) => {
    // 1. Find existing article to get slug
    const existing = await db.collection(COLLECTION).findOne(filter);
    const slug = existing?.slug || String(id);

    // 2. Record in deleted collection so it can NEVER be resurrected by fallback
    await db.collection(DELETED_COLLECTION).updateOne(
      { _id: String(id) },
      {
        $set: {
          _id: String(id),
          id: !isNaN(numId) ? numId : id,
          slug,
          deleted_at: new Date()
        }
      },
      { upsert: true }
    );

    // Also mark seeded flag in system_flags
    await db.collection(FLAGS_COLLECTION).updateOne(
      { _id: 'insights_seeded' },
      { $set: { _id: 'insights_seeded', seeded_at: new Date() } },
      { upsert: true }
    );

    // 3. Delete from insights_articles collection
    const res = await db.collection(COLLECTION).deleteOne(filter);
    return { ok: true, deletedCount: res?.deletedCount ?? 1 };
  });
}
