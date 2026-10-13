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
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    console.error('❌ ADMIN_PASSWORD is not set in .env.local');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in .env.local');
    process.exit(1);
  }
  const dbName = process.env.MONGODB_DB_NAME || process.env.MONGODB_DB || 'chromatus2';

  if (uri.startsWith('mongodb+srv://')) {
    ensureDnsResolvers();
  }

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000, connectTimeoutMS: 8000 });
  await client.connect();
  const db = client.db(dbName);

  const passwordHash = hashPassword(password);
  const existing = await db.collection('admin_users').findOne({ username });

  if (existing) {
    await db.collection('admin_users').updateOne(
      { username },
      { $set: { password_hash: passwordHash } }
    );
  } else {
    const id = await getNextSequence(db, 'admin_users');
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
  console.log('  Sign in at /admin/login with the credentials from your .env.local');
  console.log('  ⚠ Change ADMIN_PASSWORD (and re-run this script) before going to production.');

  await client.close();
}

main().catch((err) => {
  console.error('Seeding admin user failed:', err.message);
  process.exit(1);
});
