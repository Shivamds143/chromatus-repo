import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import { findAdminByUsername, verifyPassword, hashPassword } from '@/lib/adminAuth';
import { safeWrite } from '@/lib/mongodb';
import { getActiveCredentials, saveCredentials } from '@/lib/admin-credentials';

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

  const newHash = hashPassword(newPassword);
  const { ok, error } = await safeWrite(async (db) => {
    await db.collection('admin_users').updateOne(
      {
        $or: [
          { username: session.username },
          { email: session.username }
        ]
      },
      {
        $set: {
          username: admin.username || session.username,
          password_hash: newHash,
          updated_at: new Date()
        }
      },
      { upsert: true }
    );
  });
  if (!ok) return NextResponse.json({ error: error || 'Update failed' }, { status: 500 });

  try {
    const creds = await getActiveCredentials();
    await saveCredentials({
      username: creds.username || session.username,
      email: creds.email || session.username,
      password: newPassword,
      updatedAt: new Date().toISOString()
    });
  } catch (e) {
    console.warn('Could not sync admin credentials store:', e);
  }

  return NextResponse.json({ ok: true });
}
