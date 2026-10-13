import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import { findAdminByUsername, verifyPassword, hashPassword } from '@/lib/adminAuth';
import { safeWrite } from '@/lib/mongodb';

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const currentPassword = body?.currentPassword || '';
  const newPassword = body?.newPassword || '';

  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });
  }

  const admin = await findAdminByUsername(session.username);
  if (!admin || !verifyPassword(currentPassword, admin.password_hash)) {
    return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
  }

  const { ok, error } = await safeWrite((db) =>
    db.collection('admin_users').updateOne(
      { username: session.username },
      { $set: { password_hash: hashPassword(newPassword) } }
    )
  );
  if (!ok) return NextResponse.json({ error: error || 'Update failed' }, { status: 500 });

  return NextResponse.json({ ok: true });
}
