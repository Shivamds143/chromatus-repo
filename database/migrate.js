/**
 * Creates MongoDB indexes/collections and seeds the singleton settings
 * documents (site_settings, global_elements, cookie_consent_settings).
 * Safe to run repeatedly — every operation is idempotent.
 *
 * Usage: npm run db:migrate
 */
const path = require('path');
const { MongoClient } = require('mongodb');
const { ensureDnsResolvers } = require('./dnsSetup');
require(path.join(__dirname, 'load-env'))();

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to .env.local (see .env.example).');
  }
  const dbName = process.env.MONGODB_DB || 'chromatus_db';

  if (uri.startsWith('mongodb+srv://')) {
    ensureDnsResolvers();
  }

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000, connectTimeoutMS: 8000 });
  await client.connect();
  const db = client.db(dbName);

  console.log(`Connected to MongoDB database "${dbName}".`);

  // --- Unique / lookup indexes (equivalent to the old MySQL UNIQUE keys) ---
  await db.collection('site_pages').createIndex({ path: 1 }, { unique: true });
  await db.collection('insights_articles').createIndex({ slug: 1 }, { unique: true });
  await db.collection('newsletter_subscribers').createIndex({ email: 1 }, { unique: true });
  await db.collection('admin_users').createIndex({ username: 1 }, { unique: true });
  await db.collection('page_content').createIndex({ page_key: 1 }, { unique: true });
  await db.collection('seo_meta').createIndex({ page_path: 1 }, { unique: true });
  await db.collection('redirects').createIndex({ from_path: 1 }, { unique: true });
  await db.collection('custom_pages').createIndex({ slug: 1, page_type: 1 }, { unique: true });
  await db.collection('custom_page_sections').createIndex({ page_id: 1, sort_order: 1 });
  await db.collection('faqs').createIndex({ sort_order: 1, id: 1 });
  await db.collection('testimonials').createIndex({ sort_order: 1, id: 1 });
  await db.collection('jobs').createIndex({ sort_order: 1, posted_at: -1 });
  await db.collection('jobs').createIndex({ slug: 1 }, { unique: true, sparse: true });
  await db.collection('job_applications').createIndex({ job_id: 1, submitted_at: -1 });
  console.log('✔ Indexes created.');

  // --- Singleton settings documents (equivalent to the old INSERT IGNORE rows) ---
  await db.collection('site_settings').updateOne(
    { _id: 1 },
    { $setOnInsert: { _id: 1 } },
    { upsert: true }
  );
  await db.collection('global_elements').updateOne(
    { _id: 1 },
    { $setOnInsert: { _id: 1 } },
    { upsert: true }
  );
  await db.collection('cookie_consent_settings').updateOne(
    { _id: 1 },
    { $setOnInsert: { _id: 1 } },
    { upsert: true }
  );
  console.log('✔ Singleton settings documents ensured.');

  await client.close();
  console.log('✔ MongoDB migration complete.');
}

main().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
