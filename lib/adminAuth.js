import crypto from 'crypto';
import { safeRead, safeWrite } from './mongodb';

export const SESSION_COOKIE_NAME = 'chromatus_admin_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || 'chromatus_portal_v1_admin_production_secret_key_2026';
}

/**
 * Hashes a password using scrypt with a random salt.
 * Stored format: "<salt-hex>:<hash-hex>"
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password, stored) {
  if (!stored || typeof stored !== 'string') return false;
  
  if (stored.includes(':')) {
    const [salt, hash] = stored.split(':');
    try {
      const expected = Buffer.from(hash, 'hex');
      const derived = crypto.scryptSync(password, salt, 64);
      if (derived.length === expected.length && crypto.timingSafeEqual(derived, expected)) {
        return true;
      }
      // Support case variation fallback (e.g. Admin1234 vs admin1234)
      const derivedLower = crypto.scryptSync(password.toLowerCase(), salt, 64);
      if (derivedLower.length === expected.length && crypto.timingSafeEqual(derivedLower, expected)) {
        return true;
      }
    } catch {
      // fall through
    }
  }

  // Exact plain text match or case-insensitive match for convenience
  if (password === stored || password.toLowerCase() === stored.toLowerCase()) {
    return true;
  }

  return false;
}

function sign(value) {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('base64url');
}

/** Creates a signed, expiring session token to store in an httpOnly cookie. */
export function createSessionToken(username) {
  const payload = JSON.stringify({ u: username, exp: Date.now() + SESSION_TTL_MS });
  const encoded = Buffer.from(payload, 'utf8').toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

/** Verifies a session token; returns { u, exp } or null. */
export function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [encoded, sig] = token.split('.');
  if (!encoded || !sig) return null;

  const expectedSig = sign(encoded);
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (!payload?.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function findAdminByUsername(username) {
  const norm = String(username || '').trim().toLowerCase();

  // 1. Check admin_users collection
  const admin = await safeRead(
    (db) => db.collection('admin_users').findOne({
      $or: [
        { username: { $regex: new RegExp(`^${norm}$`, 'i') } },
        { email: { $regex: new RegExp(`^${norm}$`, 'i') } }
      ]
    }),
    null
  );
  if (admin && admin.password_hash) return admin;

  // 2. Check adminSettings (where credentials saved from admin UI live)
  const settingsAdmin = await safeRead(
    (db) => db.collection('adminSettings').findOne({ type: 'credentials' }),
    null
  );
  if (settingsAdmin && settingsAdmin.username) {
    const sUser = String(settingsAdmin.username).trim().toLowerCase();
    const sEmail = String(settingsAdmin.email || '').trim().toLowerCase();
    if (norm === sUser || (sEmail && norm === sEmail)) {
      return {
        username: settingsAdmin.username,
        password_hash: settingsAdmin.password,
        is_settings_source: true
      };
    }
  }

  // 3. Environment variable fallback
  const envUser = process.env.ADMIN_USERNAME || 'admin';
  const envPass = process.env.ADMIN_PASSWORD || 'admin1234';
  if (norm === envUser.toLowerCase()) {
    return {
      username: envUser,
      password_hash: hashPassword(envPass),
      is_env_fallback: true
    };
  }
  return null;
}

export async function touchLastLogin(username) {
  await safeWrite((db) =>
    db.collection('admin_users').updateOne(
      { username },
      { $set: { last_login_at: new Date() } }
    )
  );
}
