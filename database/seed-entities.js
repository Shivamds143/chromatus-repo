/**
 * Seed initial records for client_logos, testimonials, faqs, and jobs
 * if the corresponding collection in chromatus_db is currently empty.
 *
 * Run: node --dns-result-order=ipv4first --env-file=.env.local database/seed-entities.js
 */

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const { MongoClient } = require('mongodb');

const clientLogosData = [
  {
    id: 1,
    name: 'Vertex Global',
    subtitle: 'Technology & Enterprise Solutions',
    logo_url: '',
    website: 'https://example.com',
    is_published: 1,
    sort_order: 0,
    created_at: new Date()
  },
  {
    id: 2,
    name: 'OmniHealth Labs',
    subtitle: 'Clinical & Healthcare Systems',
    logo_url: '',
    website: 'https://example.com',
    is_published: 1,
    sort_order: 1,
    created_at: new Date()
  },
  {
    id: 3,
    name: 'Kinetix Mobility',
    subtitle: 'Automotive & Logistics',
    logo_url: '',
    website: 'https://example.com',
    is_published: 1,
    sort_order: 2,
    created_at: new Date()
  },
  {
    id: 4,
    name: 'Aura Semiconductor',
    subtitle: 'Advanced Electronics',
    logo_url: '',
    website: 'https://example.com',
    is_published: 1,
    sort_order: 3,
    created_at: new Date()
  },
  {
    id: 5,
    name: 'Solaria Energy',
    subtitle: 'Renewable Power & Infrastructure',
    logo_url: '',
    website: 'https://example.com',
    is_published: 1,
    sort_order: 4,
    created_at: new Date()
  },
  {
    id: 6,
    name: 'Novus Telecom',
    subtitle: 'Global Communications',
    logo_url: '',
    website: 'https://example.com',
    is_published: 1,
    sort_order: 5,
    created_at: new Date()
  }
];

const testimonialsData = [
  {
    id: 1,
    quote: 'When we needed a deeper cut on one market segment after delivery, the team turned it around fast without missing our timeline.',
    author_name: 'HC Marketing Team',
    author_role: 'Marketing Manager',
    company: 'Healthcare IT Company',
    avatar_url: '',
    is_published: 1,
    sort_order: 0
  },
  {
    id: 2,
    quote: 'They understood our research need precisely and delivered insight that gave us a genuinely clearer read on our competitors.',
    author_name: 'F3 Strategy Lead',
    author_role: 'Brand Manager',
    company: 'Fortune 300, Chemicals & Materials',
    avatar_url: '',
    is_published: 1,
    sort_order: 1
  },
  {
    id: 3,
    quote: 'The home healthcare findings lined up with our own internal data and opened up a real case for diversifying the business.',
    author_name: 'HH Growth Director',
    author_role: 'Marketing Manager',
    company: 'Home Healthcare Company',
    avatar_url: '',
    is_published: 1,
    sort_order: 2
  },
  {
    id: 4,
    quote: 'Detailed, country-by-country insight delivered quickly — it gave us a clear market picture when we needed one.',
    author_name: 'TC Product Lead',
    author_role: 'Marketing Manager',
    company: 'Telecom Company',
    avatar_url: '',
    is_published: 1,
    sort_order: 3
  }
];

const faqsData = [
  {
    id: 1,
    question: 'What industries do you work across?',
    answer: 'Healthcare, Automotive & Transportation, Food & Beverages, Telecom & IT, Aerospace & Defense, Semiconductors & Electronics, Energy & Power, and Chemicals & Materials — the methodology adapts to the category, and we regularly work on cross-industry questions beyond these eight as well.',
    category: 'Industries',
    is_published: 1,
    sort_order: 0
  },
  {
    id: 2,
    question: 'How long does a typical study take?',
    answer: 'It depends on scope, but most concept tests and CSAT studies run four to eight weeks from kickoff to final report.',
    category: 'Engagements',
    is_published: 1,
    sort_order: 1
  },
  {
    id: 3,
    question: 'What research methods do you use?',
    answer: 'A mix of primary research (surveys, interviews, field studies) and secondary research (market data, industry benchmarking, competitive intelligence), including CAPI, CATI, and CAWI methodologies depending on the study.',
    category: 'Methodology',
    is_published: 1,
    sort_order: 2
  },
  {
    id: 4,
    question: 'Do you offer more than one-off studies?',
    answer: 'Yes — for CSR programs and long-term initiatives we run baseline and endline studies to measure impact against a clear starting point, alongside project-based research engagements.',
    category: 'Services',
    is_published: 1,
    sort_order: 3
  }
];

const jobsData = [
  {
    id: 1,
    slug: 'business-developer',
    title: 'Business Developer',
    department: 'Sales',
    location: 'Pune / Remote',
    type: 'Full-time',
    summary: 'Want to gain maximum exposure while working for a leading organization? We are looking for a driven aspirant to maximize our brand value by widening our client base. The ideal candidate would be someone who fosters collaborative growth and loves to take on challenges.',
    description: 'Want to gain maximum exposure while working for a leading organization? We are looking for a driven aspirant to maximize our brand value by widening our client base. The ideal candidate would be someone who fosters collaborative growth and loves to take on challenges.',
    is_active: 1,
    sort_order: 0,
    posted_at: new Date().toISOString().slice(0, 10)
  }
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('chromatus_db');

  // 1. Client Logos
  const clientCount = await db.collection('client_logos').countDocuments();
  if (clientCount === 0) {
    await db.collection('client_logos').insertMany(clientLogosData.map(d => ({ ...d, _id: d.id })));
    await db.collection('_counters').updateOne({ _id: 'client_logos' }, { $set: { seq: clientLogosData.length } }, { upsert: true });
    console.log(`Seeded ${clientLogosData.length} client logos`);
  } else {
    console.log(`client_logos already has ${clientCount} docs, skipped`);
  }

  // 2. Testimonials
  const testCount = await db.collection('testimonials').countDocuments();
  if (testCount === 0) {
    await db.collection('testimonials').insertMany(testimonialsData.map(d => ({ ...d, _id: d.id })));
    await db.collection('_counters').updateOne({ _id: 'testimonials' }, { $set: { seq: testimonialsData.length } }, { upsert: true });
    console.log(`Seeded ${testimonialsData.length} testimonials`);
  } else {
    console.log(`testimonials already has ${testCount} docs, skipped`);
  }

  // 3. FAQs
  const faqCount = await db.collection('faqs').countDocuments();
  if (faqCount === 0) {
    await db.collection('faqs').insertMany(faqsData.map(d => ({ ...d, _id: d.id })));
    await db.collection('_counters').updateOne({ _id: 'faqs' }, { $set: { seq: faqsData.length } }, { upsert: true });
    console.log(`Seeded ${faqsData.length} faqs`);
  } else {
    console.log(`faqs already has ${faqCount} docs, skipped`);
  }

  // 4. Jobs
  const jobCount = await db.collection('jobs').countDocuments();
  if (jobCount === 0) {
    await db.collection('jobs').insertMany(jobsData.map(d => ({ ...d, _id: d.id })));
    await db.collection('_counters').updateOne({ _id: 'jobs' }, { $set: { seq: jobsData.length } }, { upsert: true });
    console.log(`Seeded ${jobsData.length} jobs`);
  } else {
    console.log(`jobs already has ${jobCount} docs, skipped`);
  }

  await client.close();
  console.log('Done!');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
