import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, verifySessionToken } from './adminAuth';

/**
 * Reads and verifies the admin session cookie.
 * Returns { username } if valid, otherwise null. Never throws.
 *
 * `cookies()` is an async Dynamic API as of Next.js 15+, so this function
 * (and every caller) must be awaited.
 */
export async function getAdminSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  const payload = verifySessionToken(token);
  return payload ? { username: payload.u } : null;
}
