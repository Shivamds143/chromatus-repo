import { safeRead } from './mongodb';
import {
  aboutSection,
  servicesSection,
  industriesSection,
  insightsSection,
  careersSection
} from './content';
import { fallbackArticles } from '@/data/content/insights';
import { getIndustriesEnabled } from './settings';
import { getPublishedCustomPages } from './customPages';

// Primary top-level pages
const PRIMARY_PAGES = [
  {
    title: 'Home',
    href: '/',
    section: 'Home',
    eyebrow: 'Chromatus Consulting',
    summary: 'Research and consulting firm helping organizations make better business decisions through data.',
    keywords: 'market research business consulting pune advisory data intelligence strategy',
    type: 'page'
  },
  {
    title: 'About Us',
    href: '/about',
    section: 'About',
    eyebrow: 'About Us',
    summary: 'Our story, leadership, expertise, and how we approach research.',
    keywords: 'chromatus history leadership vijay natekar team values culture approach research process',
    type: 'about'
  },
  {
    title: 'Services',
    href: '/services',
    section: 'Services',
    eyebrow: 'Services',
    summary: 'Research and consulting services built around a decision.',
    keywords: 'market assessment product launch consumer behaviour csat nps brand management feasibility pricing survey',
    type: 'service'
  },
  {
    title: 'Industries',
    href: '/industries',
    section: 'Industries',
    eyebrow: 'Industries',
    summary: 'Where industry knowledge meets business decisions across core sectors.',
    keywords: 'healthcare automotive transportation food beverages telecom it aerospace defense energy chemicals',
    type: 'industry'
  },
  {
    title: 'Insights & Resources',
    href: '/insights',
    section: 'Insights',
    eyebrow: 'Insights',
    summary: 'Thought leadership, industry reports, whitepapers, case studies, and resources.',
    keywords: 'reports whitepapers case studies articles news updates webinars events publications',
    type: 'insight'
  },
  {
    title: 'Careers',
    href: '/careers',
    section: 'Careers',
    eyebrow: 'Careers',
    summary: 'Build your career around better questions. Opportunities for researchers and analysts.',
    keywords: 'jobs hiring open positions careers diversity equity culture work at chromatus analysts',
    type: 'career'
  },
  {
    title: 'Contact Us',
    href: '/contact',
    section: 'Contact',
    eyebrow: 'Contact',
    summary: 'Connect with our research directors for data tailored to your specific business decisions.',
    keywords: 'contact enquiry pune office email phone schedule consultation quote',
    type: 'page'
  },
  {
    title: 'Chromatus Pro',
    href: '/contact#contact-form',
    section: 'Advisory',
    eyebrow: 'Advisory Practice',
    summary: 'Schedule a tailored research consultation and custom scope with our leadership team.',
    keywords: 'chromatus pro enterprise advisory bespoke custom research consulting brief',
    type: 'page'
  },
  {
    title: 'Frequently Asked Questions',
    href: '/faq',
    section: 'Resources',
    eyebrow: 'FAQ',
    summary: 'Common questions about our research methods, timelines, CAPI/CATI fieldwork, and deliverables.',
    keywords: 'faq questions answers methods methodology cati capi cawi timelines deliverables pricing',
    type: 'page'
  },
  {
    title: 'Privacy Policy',
    href: '/privacy-policy',
    section: 'Legal',
    eyebrow: 'Legal',
    summary: 'How Chromatus handles and protects personal data and respondent information.',
    keywords: 'privacy data security gdpr respondent compliance protection policy',
    type: 'page'
  },
  {
    title: 'Terms of Service',
    href: '/terms',
    section: 'Legal',
    eyebrow: 'Legal',
    summary: 'Terms and conditions governing the use of the Chromatus website and services.',
    keywords: 'terms conditions disclaimer legal copyright usage',
    type: 'page'
  }
];

function buildContentIndex(includeIndustries = true) {
  const items = [...PRIMARY_PAGES];

  if (!includeIndustries) {
    // Exclude top-level industries page if disabled
    const idx = items.findIndex((p) => p.href === '/industries');
    if (idx !== -1) items.splice(idx, 1);
  }

  // Section sub-pages from lib/content.ts
  const sections = [
    { sec: aboutSection, type: 'about' },
    { sec: servicesSection, type: 'service' },
    ...(includeIndustries ? [{ sec: industriesSection, type: 'industry' }] : []),
    { sec: insightsSection, type: 'insight' },
    { sec: careersSection, type: 'career' }
  ];

  for (const { sec, type } of sections) {
    if (!sec || !Array.isArray(sec.items)) continue;
    for (const sub of sec.items) {
      const bodyText = Array.isArray(sub.body) ? sub.body.join(' ') : (sub.body || '');
      const sectionsText = Array.isArray(sub.sections)
        ? sub.sections.map((s) => `${s.heading || ''} ${s.body || ''}`).join(' ')
        : '';
      const tilesText = Array.isArray(sub.tiles)
        ? sub.tiles.map((t) => `${t.label || ''} ${t.description || ''}`).join(' ')
        : '';
      const stepsText = Array.isArray(sub.steps)
        ? sub.steps.map((st) => `${st.title || ''} ${st.text || st.body || ''}`).join(' ')
        : '';

      items.push({
        title: sub.title,
        href: sub.href || `${sec.path}/${sub.slug}`,
        section: sec.eyebrow,
        eyebrow: sec.eyebrow,
        summary: sub.summary || '',
        keywords: `${bodyText} ${sectionsText} ${tilesText} ${stepsText}`.trim(),
        type
      });
    }
  }

  // Fallback insights articles
  if (Array.isArray(fallbackArticles)) {
    for (const art of fallbackArticles) {
      if (!art.is_published && art.is_published !== undefined) continue;
      items.push({
        title: art.title,
        href: `/insights/${art.slug}`,
        section: 'Insights Article',
        eyebrow: art.tag || 'Insights',
        summary: art.summary || '',
        keywords: `${art.body || ''} ${art.tag || ''} ${art.author || ''}`.trim(),
        type: 'article'
      });
    }
  }

  return items;
}

function calculateScore(item, q, words) {
  const title = (item.title || '').toLowerCase();
  const summary = (item.summary || '').toLowerCase();
  const section = (item.section || '').toLowerCase();
  const keywords = (item.keywords || '').toLowerCase();
  const qLower = q.toLowerCase();

  let score = 0;

  // Exact title match
  if (title === qLower) {
    score += 120;
  } else if (title.startsWith(qLower)) {
    score += 80;
  } else if (title.includes(qLower)) {
    score += 50;
  }

  // Section / Eyebrow match
  if (section.includes(qLower)) {
    score += 35;
  }

  // Summary match
  if (summary.includes(qLower)) {
    score += 30;
  }

  // Keyword / body match
  if (keywords.includes(qLower)) {
    score += 15;
  }

  // Word-by-word matching
  let wordsFoundInTitle = 0;
  let wordsFoundInTotal = 0;

  for (const w of words) {
    if (w.length < 2) continue;
    let found = false;
    if (title.includes(w)) {
      score += 20;
      wordsFoundInTitle++;
      found = true;
    }
    if (summary.includes(w)) {
      score += 10;
      found = true;
    }
    if (keywords.includes(w)) {
      score += 5;
      found = true;
    }
    if (found) wordsFoundInTotal++;
  }

  // Bonus if all query words were matched
  if (words.length > 1 && wordsFoundInTotal >= words.length) {
    score += 25;
  }
  if (words.length > 1 && wordsFoundInTitle >= words.length) {
    score += 40;
  }

  return score;
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function performSearch(rawQuery) {
  const q = (rawQuery || '').trim();
  if (!q) {
    return { query: q, results: [], pages: [], articles: [] };
  }

  const industriesEnabled = await getIndustriesEnabled().catch(() => true);
  const staticItems = buildContentIndex(industriesEnabled);

  // Fetch dynamic custom pages from DB if available
  const customPages = await getPublishedCustomPages().catch(() => []);
  const customItems = (customPages || [])
    .filter((cp) => {
      if (!industriesEnabled && cp.route?.startsWith('/industries')) return false;
      return true;
    })
    .map((cp) => ({
      title: cp.title,
      href: cp.route || `/pages/${cp.slug}`,
      section: cp.page_type === 'service' ? 'Services' : cp.page_type === 'industry' ? 'Industries' : 'Custom Page',
      eyebrow: cp.eyebrow || 'Page',
      summary: cp.meta_description || cp.summary || '',
      keywords: `${(cp.sections || []).map((s) => `${s.data?.heading || ''} ${s.data?.body || ''}`).join(' ')}`,
      type: cp.page_type || 'page'
    }));

  // Fetch DB insights articles if available (excluding any deleted articles)
  const re = new RegExp(escapeRegExp(q), 'i');
  const [dbArticles, deletedDocs] = await Promise.all([
    safeRead(
      (db) =>
        db
          .collection('insights_articles')
          .find({
            is_published: { $in: [1, true, '1'] },
            $or: [{ title: re }, { summary: re }, { body: re }, { tag: re }]
          })
          .sort({ published_at: -1 })
          .limit(15)
          .toArray(),
      []
    ),
    safeRead(
      (db) => db.collection('deleted_insights_articles').find({}).toArray(),
      []
    )
  ]);

  const deletedSlugs = new Set((deletedDocs || []).map((d) => String(d.slug || d._id)));

  const dbArticleItems = dbArticles
    .filter((a) => !deletedSlugs.has(String(a.slug)) && !deletedSlugs.has(String(a.id)))
    .map((a) => ({
      title: a.title,
      href: `/insights/${a.slug}`,
      section: 'Insights Article',
      eyebrow: a.tag || 'Insights',
      summary: a.summary || '',
      keywords: `${a.body || ''} ${a.tag || ''} ${a.author || ''}`.trim(),
      type: 'article'
    }));

  // Combine static index, custom pages, and DB articles without duplicating hrefs
  const seenHrefs = new Set();
  const allItems = [];

  // DB articles take precedence for insights
  for (const item of dbArticleItems) {
    seenHrefs.add(item.href);
    allItems.push(item);
  }

  // Custom pages take precedence
  for (const item of customItems) {
    if (!seenHrefs.has(item.href)) {
      seenHrefs.add(item.href);
      allItems.push(item);
    }
  }

  // Static index items
  for (const item of staticItems) {
    if (!seenHrefs.has(item.href)) {
      seenHrefs.add(item.href);
      allItems.push(item);
    }
  }

  // Score and rank matches
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const scored = [];

  for (const item of allItems) {
    const score = calculateScore(item, q, words);
    if (score > 0) {
      scored.push({ item, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  const results = scored.slice(0, 8).map(({ item }) => ({
    title: item.title,
    href: item.href,
    section: item.section,
    eyebrow: item.eyebrow,
    summary: item.summary,
    type: item.type
  }));

  // Backward compatibility with legacy callers
  const pages = results.filter((r) => r.type !== 'article');
  const articles = results.filter((r) => r.type === 'article');

  return {
    query: q,
    results,
    pages,
    articles
  };
}
