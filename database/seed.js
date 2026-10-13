/**
 * Bootstraps a fresh MongoDB database with the real Chromatus Consulting
 * content and metadata this site ships with — no sample/demo data.
 *
 * This script is idempotent and non-destructive: everything it writes uses
 * "insert if missing" — if a document already exists (e.g. an admin has
 * since edited that page, that SEO entry, or that redirect), this script
 * leaves it untouched rather than overwriting it. Safe to re-run.
 *
 * What it seeds:
 *  - site_pages       — the site-search index (every real route + summary)
 *  - page_content     — the exact content from the supplied Chromatus
 *                        Website Content document, for every admin-editable
 *                        page key, published immediately
 *  - seo_meta         — professional starter SEO metadata (title,
 *                        description, robots, Open Graph, focus keyword)
 *                        for every existing route, editable from
 *                        Admin -> SEO from day one
 *  - redirects        — 301s from the old, mismatched industry URLs to the
 *                        corrected ones (e.g. /industries/financial-services
 *                        -> /industries/energy-power), so old links and any
 *                        existing search-engine index entries keep working
 *
 * It deliberately does NOT seed sample jobs, sample insights articles, or
 * placeholder custom pages — Admin -> Careers / Admin -> Insights start
 * empty, and every page already degrades to an honest empty state until
 * real entries are added.
 *
 * Usage: npm run db:seed
 */
const path = require('path');
const { pathToFileURL } = require('url');
const { MongoClient } = require('mongodb');
const { ensureDnsResolvers } = require('./dnsSetup');
require(path.join(__dirname, 'load-env'))();

async function getNextSequence(db, name) {
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  return result?.seq ?? result?.value?.seq;
}

function importSrc(relativePath) {
  const rootPath = path.join(__dirname, '..', relativePath);
  const srcPath = path.join(__dirname, '..', 'src', relativePath);
  const target = require('fs').existsSync(rootPath) ? rootPath : srcPath;
  return import(pathToFileURL(target).href);
}

// ---------------------------------------------------------------------
// The canonical route list. Doubles as the site-search index (site_pages)
// and as the source of routes/descriptions for the SEO seed below.
// ---------------------------------------------------------------------
const sitePages = [
  { path: '/', section: 'Home', title: 'Home', summary: 'We turn data into decisions. Chromatus Consulting helps businesses understand their markets, their customers, and their competition.' },
  { path: '/about-us', section: 'About Us', title: 'About Us', summary: 'Our story, leadership team, expertise, and approach.' },
  { path: '/about-us/our-story', section: 'About Us', title: 'Our Story', summary: 'How Chromatus started and how the firm works today.' },
  { path: '/about-us/leadership-team', section: 'About Us', title: 'Leadership Team', summary: 'The researchers and consultants who lead Chromatus, and the wider team behind them.' },
  { path: '/about-us/values-culture', section: 'About Us', title: 'Values & Culture', summary: 'Our expertise across market & consumer research and strategy & business consulting, and our four-step research approach.' },
  { path: '/about-us/awards-recognitions', section: 'About Us', title: 'Awards & Recognitions', summary: 'Recognition and milestones, published here as they are announced.' },
  { path: '/services', section: 'Services', title: 'Services', summary: 'Consumer Behaviour, Brand Management, New Product Launch, Satisfaction Studies, Price Benchmarking, and more.' },
  { path: '/services/strategy-transformation', section: 'Services', title: 'Market Assessment', summary: 'Before making a move, understand the market you are moving into.' },
  { path: '/services/technology-consulting', section: 'Services', title: 'New Product Launch', summary: 'Turn an idea into a market-ready product.' },
  { path: '/services/data-analytics', section: 'Services', title: 'Consumer Behaviour', summary: 'Understand the thinking behind the purchase.' },
  { path: '/services/cloud-digital-solutions', section: 'Services', title: 'Price Benchmarking', summary: 'Make sure your pricing works for you, not against you.' },
  { path: '/services/managed-services', section: 'Services', title: 'Satisfaction Studies', summary: 'Listen to customers before dissatisfaction becomes a problem.' },
  { path: '/services/engagement-models', section: 'Services', title: 'Brand Management', summary: 'Know how your brand stands in the minds of customers.' },
  { path: '/services/location-feasibility-study', section: 'Services', title: 'Location Feasibility Study', summary: 'Before you invest in a location, understand it first.' },
  { path: '/services/baseline-endline-study', section: 'Services', title: 'Baseline & Endline Study', summary: 'Measure impact with evidence, not estimates.' },
  { path: '/services/government-surveys', section: 'Services', title: 'Government Surveys', summary: 'Ground-level data for decisions that affect communities.' },
  { path: '/industries', section: 'Industries', title: 'Industries', summary: 'Eight core industry verticals, from Healthcare to Chemicals & Materials.' },
  { path: '/industries/healthcare', section: 'Industries', title: 'Healthcare', summary: 'Markets where decisions affect both business and people.' },
  { path: '/industries/automotive-transportation', section: 'Industries', title: 'Automotive & Transportation', summary: 'From individual components to the wider mobility ecosystem.' },
  { path: '/industries/food-beverages', section: 'Industries', title: 'Food & Beverages', summary: 'What people eat, drink, and choose is changing quickly.' },
  { path: '/industries/telecom-it', section: 'Industries', title: 'Telecom & IT', summary: "In technology markets, yesterday's opportunity can quickly become tomorrow's standard." },
  { path: '/industries/aerospace-defense', section: 'Industries', title: 'Aerospace & Defense', summary: 'Research for markets where precision matters.' },
  { path: '/industries/semiconductors-electronics', section: 'Industries', title: 'Semiconductors & Electronics', summary: 'Small components. Large market implications.' },
  { path: '/industries/energy-power', section: 'Industries', title: 'Energy & Power', summary: 'Understanding markets being reshaped by technology, infrastructure, and transition.' },
  { path: '/industries/chemicals-materials', section: 'Industries', title: 'Chemicals & Materials', summary: 'Where technical complexity meets commercial opportunity.' },
  { path: '/industries/beyond-these-eight', section: 'Industries', title: 'Beyond These Eight', summary: 'Some markets do not fit neatly into one box. Neither does our research.' },
  { path: '/insights', section: 'Insights', title: 'Insights', summary: 'Research reports, articles, whitepapers, case studies, and webinars.' },
  { path: '/insights/blogs-articles', section: 'Insights', title: 'Articles & Insights', summary: 'Short, focused perspectives on market developments and changing customer behaviour.' },
  { path: '/insights/whitepapers', section: 'Insights', title: 'Whitepapers', summary: 'Detailed analysis built around specific business questions and market developments.' },
  { path: '/insights/case-studies', section: 'Insights', title: 'Case Studies', summary: 'How research translates into business decisions.' },
  { path: '/insights/reports', section: 'Insights', title: 'Research Reports', summary: 'Research reports going deeper into specific markets, industries, and geographies.' },
  { path: '/insights/webinars-events', section: 'Insights', title: 'Webinars & Events', summary: 'Live and recorded sessions with Chromatus practice leads.' },
  { path: '/careers', section: 'Careers', title: 'Careers', summary: 'Build your career around better questions.' },
  { path: '/careers/open-positions', section: 'Careers', title: 'Open Positions', summary: 'Find your next challenge — every open role in one place.' },
  { path: '/careers/life-at-chromatus', section: 'Careers', title: 'Life at Chromatus', summary: 'A look at day-to-day life, culture, and how our teams work together.' },
  { path: '/careers/benefits', section: 'Careers', title: 'Benefits', summary: 'Support built around how our teams actually work.' },
  { path: '/careers/diversity-equity-inclusion', section: 'Careers', title: 'Diversity, Equity & Inclusion', summary: 'Different perspectives make better research.' },
  { path: '/careers/early-careers', section: 'Careers', title: 'Early Careers', summary: 'Start your career solving real problems.' },
  { path: '/contact-us', section: 'Contact Us', title: 'Contact Us', summary: 'Get in touch, locations, and contact details.' },
  { path: '/contact-us/contact-form', section: 'Contact Us', title: 'Contact Form', summary: 'Send us a message and the right specialist will follow up.' },
  { path: '/contact-us/office-locations', section: 'Contact Us', title: 'Office Locations', summary: 'Find our offices and teams.' },
  { path: '/contact-us/general-inquiries', section: 'Contact Us', title: 'General Inquiries', summary: 'A quick directory for common requests: sales, careers, press, and support.' },
  { path: '/chromatus-pro', section: 'CHROMATUS PRO', title: 'CHROMATUS PRO', summary: "Schedule a consultation and let's solve something extraordinary together." }
];

// Old (mismatched) industry URL -> corrected URL that now matches its real
// content. Seeded as permanent redirects so old links/search results keep
// resolving to the right page.
const industryRedirects = [
  { from: '/industries/financial-services', to: '/industries/energy-power', notes: 'Corrected: this route\u2019s content is Energy & Power, not Financial Services.' },
  { from: '/industries/manufacturing', to: '/industries/automotive-transportation', notes: 'Corrected: this route\u2019s content is Automotive & Transportation.' },
  { from: '/industries/retail-consumer-goods', to: '/industries/food-beverages', notes: 'Corrected: this route\u2019s content is Food & Beverages.' },
  { from: '/industries/technology', to: '/industries/telecom-it', notes: 'Corrected: this route\u2019s content is Telecom & IT.' },
  { from: '/industries/other-industries', to: '/industries/beyond-these-eight', notes: 'Corrected slug for clarity.' }
];

async function seedSitePages(db) {
  console.log('Seeding site_pages (search index) ...');
  for (const page of sitePages) {
    await db.collection('site_pages').updateOne({ path: page.path }, { $set: page }, { upsert: true });
  }
}

async function seedRedirects(db) {
  console.log('Seeding corrective redirects for renamed industry routes ...');
  for (const r of industryRedirects) {
    const existing = await db.collection('redirects').findOne({ from_path: r.from });
    if (existing) continue;
    const id = await getNextSequence(db, 'redirects');
    await db.collection('redirects').insertOne({
      _id: id,
      id,
      from_path: r.from,
      to_path: r.to,
      status_code: 301,
      is_active: true,
      notes: r.notes,
      created_at: new Date(),
      updated_at: new Date()
    });
  }
}

async function seedPageContent(db) {
  console.log('Seeding page_content with the full supplied Chromatus website content ...');

  const [{ CMS_PAGES }, home, about, services, industries, insights, misc, careersExtra, contactExtra] = await Promise.all([
    importSrc('lib/cmsRegistry.js'),
    importSrc('data/content/home.js'),
    importSrc('data/content/about.js'),
    importSrc('data/content/services.js'),
    importSrc('data/content/industries.js'),
    importSrc('data/content/insights.js'),
    importSrc('data/content/misc.js'),
    importSrc('data/content/careersExtra.js'),
    importSrc('data/content/contactExtra.js')
  ]);

  // Mirrors src/lib/cmsDefaults.js — every key an admin can open and every
  // page.js reads via getPageContent(). Kept in sync manually since this
  // script runs under plain Node and can't resolve the "@/" alias used by
  // cmsDefaults.js itself.
  const CONTENT = {
    home: home.home,
    aboutOverview: about.aboutOverview,
    ourStory: about.ourStory,
    leadershipTeam: about.leadershipTeam,
    valuesCulture: about.valuesCulture,
    awardsRecognitions: about.awardsRecognitions,
    servicesOverview: services.servicesOverview,
    strategyTransformation: services.strategyTransformation,
    technologyConsulting: services.technologyConsulting,
    dataAnalytics: services.dataAnalytics,
    cloudDigitalSolutions: services.cloudDigitalSolutions,
    managedServices: services.managedServices,
    engagementModels: services.engagementModels,
    locationFeasibilityStudy: services.locationFeasibilityStudy,
    baselineEndlineStudy: services.baselineEndlineStudy,
    governmentSurveys: services.governmentSurveys,
    industriesOverview: industries.industriesOverview,
    energyPower: industries.energyPower,
    healthcare: industries.healthcare,
    automotiveTransportation: industries.automotiveTransportation,
    foodBeverages: industries.foodBeverages,
    telecomIt: industries.telecomIt,
    aerospaceDefense: industries.aerospaceDefense,
    semiconductorsElectronics: industries.semiconductorsElectronics,
    chemicalsMaterials: industries.chemicalsMaterials,
    beyondTheseEight: industries.beyondTheseEight,
    insightsOverview: insights.insightsOverview,
    careers: misc.careers,
    openPositions: careersExtra.openPositions,
    lifeAtChromatus: careersExtra.lifeAtChromatus,
    careersBenefits: careersExtra.careersBenefits,
    diversityEquityInclusion: careersExtra.diversityEquityInclusion,
    earlyCareers: careersExtra.earlyCareers,
    chromatusPro: misc.chromatusPro,
    contact: misc.contact,
    contactFormPage: contactExtra.contactFormPage,
    officeLocations: contactExtra.officeLocations,
    generalInquiries: contactExtra.generalInquiries,
    legal_privacy: misc.legal.privacy,
    legal_terms: misc.legal.terms,
    legal_cookies: misc.legal.cookies
  };

  let seeded = 0;
  let skipped = 0;
  for (const { key } of CMS_PAGES) {
    const content = CONTENT[key];
    if (!content) {
      console.warn(`  (no content module found for key "${key}", skipping)`);
      continue;
    }
    const existing = await db.collection('page_content').findOne({ page_key: key });
    if (existing) {
      skipped += 1;
      continue;
    }
    await db.collection('page_content').insertOne({
      page_key: key,
      // Deep-cloned so later in-place edits to the shared content objects
      // (there are none, but this keeps the seed self-contained) never
      // leak between keys.
      data: JSON.parse(JSON.stringify(content)),
      is_published: true,
      created_at: new Date(),
      updated_at: new Date()
    });
    seeded += 1;
  }
  console.log(`  page_content: ${seeded} keys seeded, ${skipped} already existed and were left as-is.`);
}

async function seedSeoMeta(db) {
  console.log('Seeding professional starter SEO metadata for every route ...');

  const summaryByPath = new Map(sitePages.map((p) => [p.path, p.summary]));
  const { CMS_PAGES } = await importSrc('lib/cmsRegistry.js');

  let seeded = 0;
  let skipped = 0;
  for (const { route, label, group } of CMS_PAGES) {
    const existing = await db.collection('seo_meta').findOne({ page_path: route });
    if (existing) {
      skipped += 1;
      continue;
    }

    const isHome = route === '/';
    // "Overview" alone is used by 4 different sections (About, Services,
    // Industries, Insights) — qualify it with the section so no two pages
    // ever get the same meta title.
    const displayLabel = label === 'Overview' ? `${group} Overview` : label;
    const metaTitle = isHome ? 'Chromatus Consulting \u2014 We turn data into decisions.' : `${displayLabel} | Chromatus Consulting`;
    const metaDescription =
      summaryByPath.get(route) ||
      `${displayLabel} \u2014 Chromatus Consulting is a research and consulting firm that helps organizations make better business decisions through data.`;

    const id = await getNextSequence(db, 'seo_meta');
    await db.collection('seo_meta').insertOne({
      id,
      page_path: route,
      page_label: label,
      meta_title: metaTitle,
      meta_description: metaDescription,
      canonical_url: null,
      robots_index: true,
      robots_follow: true,
      robots: 'index,follow',
      og_title: metaTitle,
      og_description: metaDescription,
      og_image: null,
      og_type: 'website',
      og_url: null,
      twitter_card: 'summary_large_image',
      twitter_title: null,
      twitter_description: null,
      twitter_image: null,
      author: 'Chromatus Consulting',
      published_time: null,
      modified_time: null,
      focus_keyword: isHome ? 'market research consulting' : displayLabel.toLowerCase(),
      meta_keywords: null,
      schema_json: null,
      updated_at: new Date()
    });
    seeded += 1;
  }
  console.log(`  seo_meta: ${seeded} routes seeded, ${skipped} already had a saved SEO entry and were left as-is.`);
}

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

  await seedSitePages(db);
  await seedPageContent(db);
  await seedSeoMeta(db);
  await seedRedirects(db);

  console.log('\u2714 Seed data inserted successfully.');
  console.log('  No sample jobs or sample insights articles were seeded \u2014');
  console.log('  add real ones from Admin \u2192 Careers and Admin \u2192 Insights.');
  await client.close();
}

main().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
