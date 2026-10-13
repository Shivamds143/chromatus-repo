import { cookies } from 'next/headers';
import { getAdminSession } from './requireAdmin';

export const PREVIEW_COOKIE = 'chromatus_cms_preview';

/**
 * True only when an authenticated admin has explicitly turned preview mode
 * on. Never true for regular visitors, and safe to call from any server
 * component/route — never throws.
 */
export async function isPreviewActive() {
  try {
    const session = await getAdminSession();
    if (!session) return false;
    const store = await cookies();
    return store.get(PREVIEW_COOKIE)?.value === '1';
  } catch {
    return false;
  }
}
