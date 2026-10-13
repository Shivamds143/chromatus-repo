import { safeRead, safeWrite, getNextSequence } from './mongodb';

const COLLECTION = 'redirects';

function normalizePath(p) {
  let path = String(p || '').trim();
  if (!path) return '';
  if (!path.startsWith('/')) path = `/${path}`;
  // Strip a trailing slash (except root "/") and any query string, so
  // "/old-page/" and "/old-page?ref=x" both match a "/old-page" redirect.
  path = path.split('?')[0].split('#')[0];
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  return path;
}

export async function listRedirects() {
  return safeRead((db) => db.collection(COLLECTION).find({}).sort({ updated_at: -1 }).toArray(), []);
}

export async function getRedirectById(id) {
  return safeRead((db) => db.collection(COLLECTION).findOne({ id: Number(id) }), null);
}

/** Used by the public lookup API (and indirectly by middleware) — only ever returns active redirects. */
export async function findActiveRedirect(fromPath) {
  const path = normalizePath(fromPath);
  if (!path) return null;
  return safeRead(
    (db) => db.collection(COLLECTION).findOne({ from_path: path, is_active: true }),
    null
  );
}

export async function upsertRedirect(input = {}) {
  const fromPath = normalizePath(input.fromPath);
  const toPath = String(input.toPath || '').trim();
  if (!fromPath) return { ok: false, error: 'A "from" path is required' };
  if (!toPath) return { ok: false, error: 'A "to" destination is required' };
  if (fromPath === normalizePath(toPath)) {
    return { ok: false, error: 'A redirect cannot point to itself' };
  }
  const statusCode = Number(input.statusCode) === 302 ? 302 : 301;

  return safeWrite(async (db) => {
    const existing = input.id
      ? await db.collection(COLLECTION).findOne({ id: Number(input.id) })
      : await db.collection(COLLECTION).findOne({ from_path: fromPath });
    const id = existing?.id ?? (await getNextSequence(COLLECTION));
    await db.collection(COLLECTION).updateOne(
      { id },
      {
        $set: {
          id,
          from_path: fromPath,
          to_path: toPath,
          status_code: statusCode,
          is_active: input.isActive !== false,
          notes: input.notes || null,
          updated_at: new Date()
        },
        $setOnInsert: { created_at: new Date() }
      },
      { upsert: true }
    );
    return { id };
  });
}

export async function deleteRedirect(id) {
  return safeWrite((db) => db.collection(COLLECTION).deleteOne({ id: Number(id) }));
}

/** Every "from" path with an active redirect — used to keep redirected URLs out of the sitemap. */
export async function getRedirectedPaths() {
  const rows = await safeRead(
    (db) => db.collection(COLLECTION).find({ is_active: true }, { projection: { from_path: 1 } }).toArray(),
    []
  );
  return new Set(rows.map((r) => r.from_path));
}
