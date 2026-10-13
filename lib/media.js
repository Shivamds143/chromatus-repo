import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { safeRead, safeWrite, getNextSequence } from './mongodb';

const COLLECTION = 'media_library';
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']);
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

function safeExt(filename) {
  const ext = path.extname(filename || '').toLowerCase();
  return /^\.[a-z0-9]{2,5}$/.test(ext) ? ext : '';
}

export async function saveUploadedFile(file) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    return { ok: false, error: 'No file provided' };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { ok: false, error: 'File is too large (max 8MB)' };
  }
  if (file.type && !ALLOWED_TYPES.has(file.type)) {
    return { ok: false, error: 'Unsupported file type. Use JPEG, PNG, WebP, GIF, or SVG.' };
  }

  const ext = safeExt(file.name) || '.bin';
  const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64Data = buffer.toString('base64');

  let diskWriteOk = false;
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, uniqueName), buffer);
    diskWriteOk = true;
  } catch (err) {
    // Expected on serverless environments like Vercel with read-only disk
    console.warn('[media] local disk write failed, fallback to database storage:', err.message);
  }

  const { ok, error, result } = await safeWrite(async (db) => {
    const id = await getNextSequence(COLLECTION);
    const url = diskWriteOk ? `/uploads/${uniqueName}` : `/api/media/${id}`;
    await db.collection(COLLECTION).insertOne({
      _id: id,
      id,
      filename: file.name || uniqueName,
      url,
      disk_path: diskWriteOk ? uniqueName : null,
      data: base64Data,
      alt_text: '',
      mime_type: file.type || 'image/jpeg',
      size_bytes: file.size || buffer.length,
      uploaded_at: new Date()
    });
    return { insertId: id, url };
  });
  if (!ok) return { ok: false, error };

  return { ok: true, id: result.insertId, url: result.url, filename: file.name || uniqueName };
}

export async function getMediaById(id) {
  return safeRead((db) => db.collection(COLLECTION).findOne({ id: Number(id) }), null);
}

export async function listMedia() {
  return safeRead(
    (db) =>
      db
        .collection(COLLECTION)
        .find({})
        .project({ data: 0 })
        .sort({ uploaded_at: -1 })
        .toArray(),
    []
  );
}

export async function deleteMedia(id) {
  const item = await safeRead((db) => db.collection(COLLECTION).findOne({ id: Number(id) }), null);
  if (!item) return { ok: false, error: 'Not found' };

  const { ok, error } = await safeWrite((db) =>
    db.collection(COLLECTION).deleteOne({ id: Number(id) })
  );
  if (!ok) return { ok: false, error };

  if (item.disk_path || (item.url && item.url.startsWith('/uploads/'))) {
    try {
      const filename = item.disk_path || path.basename(item.url);
      const filePath = path.join(UPLOAD_DIR, filename);
      await fs.unlink(filePath);
    } catch {
      // File already missing on disk — ignore
    }
  }
  return { ok: true };
}
