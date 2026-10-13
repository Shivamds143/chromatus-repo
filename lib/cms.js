import { safeRead, safeWrite } from './mongodb';
import { isPreviewActive } from './preview';

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Deep-merges admin `override` data on top of the static `base` (fallback)
 * content. Arrays are replaced wholesale by the override (this is what
 * lets admins add/remove/reorder items like cards or list entries) since
 * arrays are not merged index-by-index. Anything the admin hasn't touched
 * simply doesn't exist in `override` and falls back to `base`, so partial
 * edits never break a page's shape.
 */
export function deepMergeContent(base, override) {
  if (override === undefined || override === null) return base;
  if (Array.isArray(base) || Array.isArray(override)) {
    return Array.isArray(override) ? override : base;
  }
  if (isPlainObject(base) && isPlainObject(override)) {
    const merged = { ...base };
    for (const key of Object.keys(override)) {
      merged[key] = deepMergeContent(base[key], override[key]);
    }
    return merged;
  }
  return override;
}

/**
 * Used by every page.js: returns the live content for `key`, merged over
 * the page's original static default. If nothing has been published for
 * this key (or the DB is unreachable), the original static content is
 * returned untouched — so the site's design/copy never regresses.
 */
export async function getPageContent(key, fallback) {
  const row = await safeRead(
    (db) => db.collection('page_content').findOne({ page_key: key }),
    null
  );
  if (!row || !row.data) return fallback;
  // An admin who has turned on preview mode sees the latest saved draft
  // (published or not) so they can check a page before publishing it.
  if (!row.is_published && !await isPreviewActive()) return fallback;

  try {
    const override = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
    return deepMergeContent(fallback, override);
  } catch (err) {
    console.error('[cms] failed to parse page_content for key:', key, err.message);
    return fallback;
  }
}

/** Admin-side: raw stored record for a key (unmerged), for the editor form. */
export async function getRawPageContent(key) {
  const row = await safeRead(
    (db) => db.collection('page_content').findOne({ page_key: key }),
    null
  );
  if (!row) return { data: null, isPublished: false, updatedAt: null };

  let data = null;
  try {
    data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
  } catch (err) {
    console.error('[cms] failed to parse stored data for key:', key, err.message);
  }
  return { data, isPublished: !!row.is_published, updatedAt: row.updated_at };
}

export async function savePageContent(key, data, isPublished) {
  return safeWrite((db) =>
    db.collection('page_content').updateOne(
      { page_key: key },
      { $set: { page_key: key, data, is_published: !!isPublished, updated_at: new Date() } },
      { upsert: true }
    )
  );
}

/** All keys that currently have a saved override, with publish status. */
export async function listSavedPageStatus() {
  const rows = await safeRead((db) => db.collection('page_content').find({}).toArray(), []);
  const map = {};
  for (const r of rows) {
    map[r.page_key] = { isPublished: !!r.is_published, updatedAt: r.updated_at };
  }
  return map;
}
