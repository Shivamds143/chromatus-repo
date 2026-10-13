import { safeRead, safeWrite, getNextSequence } from './mongodb';
import { careers } from '@/data/content/misc';

const COLLECTION = 'jobs';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Generates a unique slug for a job title, appending -2, -3, ... on collision. */
async function generateUniqueSlug(db, title, excludeId = null) {
  const base = slugify(title) || 'role';
  let slug = base;
  let n = 2;
  while (true) {
    const query = excludeId ? { slug, id: { $ne: Number(excludeId) } } : { slug };
    const clash = await db.collection(COLLECTION).findOne(query, { projection: { _id: 1 } });
    if (!clash) return slug;
    slug = `${base}-${n}`;
    n += 1;
  }
}

/** Public/frontend: published job openings, ordered for display. */
export async function getOpenRoles() {
  const rows = await safeRead(
    (db) =>
      db
        .collection(COLLECTION)
        .find({ is_active: 1 })
        .sort({ sort_order: 1, posted_at: -1 })
        .toArray(),
    []
  );
  return rows.length > 0 ? rows : careers.fallbackRoles;
}

/** Public/frontend: a single published job by its slug (falls back to matching by numeric id, for any job created before slugs existed). */
export async function getPublishedJobBySlug(slug) {
  if (!slug) return null;
  const bySlug = await safeRead(
    (db) => db.collection(COLLECTION).findOne({ slug, is_active: 1 }),
    null
  );
  if (bySlug) return bySlug;
  if (/^\d+$/.test(slug)) {
    return safeRead((db) => db.collection(COLLECTION).findOne({ id: Number(slug), is_active: 1 }), null);
  }
  return null;
}

// ---------------------------------------------------------------------
// Admin-only helpers (used by /admin/careers).
// ---------------------------------------------------------------------

/** Admin: every job (active + inactive/draft), in display order. */
export async function getAllJobsAdmin() {
  return safeRead(
    (db) => db.collection(COLLECTION).find({}).sort({ sort_order: 1, posted_at: -1 }).toArray(),
    []
  );
}

export async function getJobById(id) {
  return safeRead((db) => db.collection(COLLECTION).findOne({ id: Number(id) }), null);
}

export async function createJob({ title, department, location, type, description, isActive, postedAt }) {
  if (!title || !title.trim()) return { ok: false, error: 'Job title is required' };
  return safeWrite(async (db) => {
    const last = await db.collection(COLLECTION).find({}).sort({ sort_order: -1 }).limit(1).toArray();
    const nextOrder = (last[0]?.sort_order ?? -1) + 1;
    const id = await getNextSequence(COLLECTION);
    const slug = await generateUniqueSlug(db, title);
    await db.collection(COLLECTION).insertOne({
      _id: id,
      id,
      slug,
      title: title.trim(),
      department: department || 'General',
      location: location || 'Remote',
      type: type || 'Full-time',
      description: description || '',
      is_active: isActive ? 1 : 0,
      sort_order: nextOrder,
      posted_at: postedAt || new Date().toISOString().slice(0, 10)
    });
    return { insertId: id };
  });
}

export async function updateJob(id, { title, department, location, type, description, isActive, postedAt }) {
  if (!title || !title.trim()) return { ok: false, error: 'Job title is required' };
  return safeWrite(async (db) => {
    const existing = await db.collection(COLLECTION).findOne({ id: Number(id) });
    // The slug is kept stable once set (so a live application link never
    // breaks when a title is edited) — only ever backfilled if missing.
    const slug = existing?.slug || (await generateUniqueSlug(db, title, id));
    await db.collection(COLLECTION).updateOne(
      { id: Number(id) },
      {
        $set: {
          slug,
          title: title.trim(),
          department: department || 'General',
          location: location || 'Remote',
          type: type || 'Full-time',
          description: description || '',
          is_active: isActive ? 1 : 0,
          posted_at: postedAt || new Date().toISOString().slice(0, 10)
        }
      }
    );
  });
}

export async function deleteJob(id) {
  return safeWrite((db) => db.collection(COLLECTION).deleteOne({ id: Number(id) }));
}

/** Persists a full reorder — `ids` is the complete list of job ids in new display order. */
export async function reorderJobs(ids) {
  return safeWrite(async (db) => {
    const collection = db.collection(COLLECTION);
    for (let i = 0; i < ids.length; i += 1) {
      await collection.updateOne({ id: Number(ids[i]) }, { $set: { sort_order: i } });
    }
    return { ok: true };
  });
}
