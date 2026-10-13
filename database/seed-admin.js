/**
 * Creates (or updates the password of) the default admin user, using
 * ADMIN_USERNAME / ADMIN_PASSWORD from .env.local.
 * Usage: npm run db:seed-admin
 */
const path = require('path');
const crypto = require('crypto');
const { MongoClient } = require('mongodb');
const { ensureDnsResolvers } = require('./dnsSetup');
require(path.join(__dirname, 'load-env'))();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

async function getNextSequence(db, name) {
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  return result?.seq ?? result?.value?.seq;
}

async function main() {
  const username = process.env.ADMIN_USERNAME || process.env.ADMIN_DEFAULT_EMAIL || 'admin';
  const password = process.env.ADMIN_PASSWORD || process.env.ADMIN_DEFAULT_PASSWORD;

  if (!password) {
    console.error('❌ ADMIN_PASSWORD or ADMIN_DEFAULT_PASSWORD is not set in environment variables');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in .env.local');
    process.exit(1);
  }
  const dbName = process.env.MONGODB_DB_NAME || process.env.MONGODB_DB || 'chromatus2';

  let db = null;
  let client = null;

  if (uri) {
    if (uri.startsWith('mongodb+srv://')) {
      ensureDnsResolvers();
    }
    try {
      client = new MongoClient(uri, { serverSelectionTimeoutMS: 4000, connectTimeoutMS: 4000 });
      await client.connect();
      db = client.db(dbName);
    } catch (err) {
      console.warn(`⚠ MongoDB connection failed (${err.message}). Seeding admin user to local file storage.`);
      db = null;
      if (client) try { await client.close(); } catch {}
    }
  }

  if (!db) {
    const { getCommonLocalDb } = require('./local-seed-db');
    db = getCommonLocalDb();
  }

  const passwordHash = hashPassword(password);
  const existing = await db.collection('admin_users').findOne({ username });

  if (existing) {
    await db.collection('admin_users').updateOne(
      { username },
      { $set: { password_hash: passwordHash } }
    );
  } else {
    const id = (await getNextSequence(db, 'admin_users')) || 1;
    await db.collection('admin_users').insertOne({
      _id: id,
      id,
      username,
      password_hash: passwordHash,
      display_name: 'Administrator',
      created_at: new Date(),
      last_login_at: null
    });
  }

  console.log(`✔ Admin user "${username}" is ready.`);
  console.log('  Sign in at /admin/login with the credentials from your .env');

  if (client && typeof client.close === 'function') {
    try { await client.close(); } catch {}
  }
}

main().catch((err) => {
  console.error('Seeding admin user failed:', err.message);
  process.exit(1);
});
