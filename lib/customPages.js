import { safeRead, safeWrite, getNextSequence } from './mongodb';

const PAGES_COLLECTION = 'custom_pages';
const SECTIONS_COLLECTION = 'custom_page_sections';

export const SECTION_TYPES = [
  { type: 'hero', label: 'Hero banner', sample: { eyebrow: '', title: '', lead: '', image: '' } },
  { type: 'richtext', label: 'Rich text block', sample: { heading: '', body: '' } },
  {
    type: 'cards',
    label: 'Card grid',
    sample: { heading: '', items: [{ title: '', description: '', icon: '' }] }
  },
  {
    type: 'stats',
    label: 'Stats band',
    sample: { items: [{ value: '', label: '' }] }
  },
  {
    type: 'image_text',
    label: 'Image + text',
    sample: { heading: '', body: '', image: '', imageAlt: '' }
  },
  { type: 'cta', label: 'Call to action', sample: { heading: '', buttonLabel: '', buttonHref: '' } },
  { type: 'testimonials', label: 'Testimonials (published library)', sample: {} },
  { type: 'faq', label: 'FAQs (published library)', sample: {} }
];

// Page types this shared page-builder can power. Each type is served at a
// different public URL prefix but reuses the exact same admin editor,
// section builder, and database collections.
export const PAGE_TYPES = {
  custom: { label: 'Custom Pages', routePrefix: '/pages', adminPath: '/admin/custom-pages' },
  service: { label: 'Services', routePrefix: '/services', adminPath: '/admin/services' },
  industry: { label: 'Industries', routePrefix: '/industries', adminPath: '/admin/industries' }
};

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

export { slugify };

function safeParse(json) {
  try {
    return typeof json === 'string' ? JSON.parse(json) : json || {};
  } catch {
    return {};
  }
}

/** Admin: list every page of a given type with its section count. */
export async function listCustomPages(pageType = 'custom') {
  return safeRead(async (db) => {
    const pages = await db
      .collection(PAGES_COLLECTION)
      .find({ page_type: pageType })
      .sort({ sort_order: 1, updated_at: -1 })
      .toArray();
    const sectionsCol = db.collection(SECTIONS_COLLECTION);
    return Promise.all(
      pages.map(async (p) => ({
        ...p,
        section_count: await sectionsCol.countDocuments({ page_id: p.id })
      }))
    );
  }, []);
}

/** Public: every published page of a given type — used to build sitemap.xml. */
export async function listPublishedCustomPages(pageType = 'custom') {
  return safeRead(
    (db) =>
      db
        .collection(PAGES_COLLECTION)
        .find({ page_type: pageType, is_published: { $in: [1, true, '1'] } })
        .project({ slug: 1, updated_at: 1, page_type: 1 })
        .toArray(),
    []
  );
}

/** Public: every published page of a given type with full meta. */
export async function getPublishedCustomPages(pageType = 'custom', { preview = false } = {}) {
  return safeRead(
    async (db) => {
      const query = { page_type: pageType };
      if (!preview) {
        query.is_published = { $in: [1, true, '1'] };
      }
      return db
        .collection(PAGES_COLLECTION)
        .find(query)
        .sort({ sort_order: 1, updated_at: -1 })
        .toArray();
    },
    []
  );
}

export async function getCustomPageForAdmin(id) {
  return safeRead(async (db) => {
    const page = await db.collection(PAGES_COLLECTION).findOne({ id: Number(id) });
    if (!page) return null;
    const sections = await db
      .collection(SECTIONS_COLLECTION)
      .find({ page_id: page.id })
      .sort({ sort_order: 1, id: 1 })
      .toArray();
    return { ...page, sections: sections.map((s) => ({ ...s, type: s.type || s.section_type, data: safeParse(s.data) })) };
  }, null);
}

/** Public/frontend: a published page with its sections, by slug + type. `preview`
 * lets a logged-in admin see an unpublished page/sections before publish. */
export async function getCustomPageBySlug(slug, { preview = false, pageType = 'custom' } = {}) {
  return safeRead(async (db) => {
    const page = await db.collection(PAGES_COLLECTION).findOne({ slug, page_type: pageType });
    if (!page) return null;
    const isPub = page.is_published === 1 || page.is_published === true || page.is_published === '1';
    if (!isPub && !preview) return null;

    const sections = await db
      .collection(SECTIONS_COLLECTION)
      .find({ page_id: page.id })
      .sort({ sort_order: 1, id: 1 })
      .toArray();
    return {
      ...page,
      sections: sections.map((s) => ({
        ...s,
        type: s.type || s.section_type,
        data: safeParse(s.data),
      })),
    };
  }, null);
}

export async function createCustomPage({ slug, title, metaDescription, pageType = 'custom', image = null, starterBody = '' }) {
  const cleanSlug = slugify(slug || title);
  if (!cleanSlug) return { ok: false, error: 'A valid slug or title is required' };
  return safeWrite(async (db) => {
    const last = await db
      .collection(PAGES_COLLECTION)
      .find({ page_type: pageType })
      .sort({ sort_order: -1 })
      .limit(1)
      .toArray();
    const nextOrder = (last[0]?.sort_order ?? -1) + 1;
    const id = await getNextSequence(PAGES_COLLECTION);
    await db.collection(PAGES_COLLECTION).insertOne({
      _id: id,
      id,
      slug: cleanSlug,
      title: title || cleanSlug,
      meta_description: metaDescription || null,
      image: image || null,
      show_in_footer: 0,
      page_type: pageType,
      sort_order: nextOrder,
      is_published: 0,
      updated_at: new Date()
    });

    // Automatically create a starter content section so the new page is ready to use immediately
    const secId = await getNextSequence(SECTIONS_COLLECTION);
    await db.collection(SECTIONS_COLLECTION).insertOne({
      _id: secId,
      id: secId,
      page_id: id,
      type: 'richtext',
      sort_order: 0,
      data: JSON.stringify({
        heading: 'Overview',
        body: starterBody || 'Welcome to ' + (title || 'this page') + '. You can customize this content, add new paragraphs, highlight cards, and more using the simple editor.'
      })
    });

    return { insertId: id };
  });
}

export async function updateCustomPageMeta(id, { slug, title, metaDescription, isPublished, image, pageType, showInFooter }) {
  const cleanSlug = slugify(slug);
  if (!cleanSlug) return { ok: false, error: 'A valid slug is required' };
  return safeWrite((db) => {
    const fields = {
      slug: cleanSlug,
      title: title || cleanSlug,
      meta_description: metaDescription || null,
      image: image !== undefined ? (image || null) : null,
      is_published: isPublished ? 1 : 0,
      updated_at: new Date()
    };
    if (pageType) fields.page_type = pageType;
    if (showInFooter !== undefined) fields.show_in_footer = showInFooter ? 1 : 0;

    return db.collection(PAGES_COLLECTION).updateOne(
      { id: Number(id) },
      { $set: fields }
    );
  });
}

/** Public: list of published custom pages marked to show in the website footer */
export async function getFooterCustomPages() {
  return safeRead(
    (db) =>
      db
        .collection(PAGES_COLLECTION)
        .find({
          page_type: 'custom',
          is_published: { $in: [1, true, '1'] },
          show_in_footer: { $in: [1, true, '1'] }
        })
        .sort({ sort_order: 1, title: 1 })
        .project({ slug: 1, title: 1 })
        .toArray(),
    []
  );
}

export async function deleteCustomPage(id) {
  return safeWrite(async (db) => {
    await db.collection(SECTIONS_COLLECTION).deleteMany({ page_id: Number(id) });
    return db.collection(PAGES_COLLECTION).deleteOne({ id: Number(id) });
  });
}

/** Persists a full reorder of top-level pages of one type — `ids` is the
 * complete list of custom_pages ids (of that type) in new display order. */
export async function reorderCustomPages(ids) {
  return safeWrite(async (db) => {
    const collection = db.collection(PAGES_COLLECTION);
    for (let i = 0; i < ids.length; i += 1) {
      await collection.updateOne({ id: Number(ids[i]) }, { $set: { sort_order: i } });
    }
    return { ok: true };
  });
}

export async function addSection(pageId, type) {
  const meta = SECTION_TYPES.find((s) => s.type === type);
  if (!meta) return { ok: false, error: 'Unknown section type' };
  return safeWrite(async (db) => {
    const last = await db
      .collection(SECTIONS_COLLECTION)
      .find({ page_id: Number(pageId) })
      .sort({ sort_order: -1 })
      .limit(1)
      .toArray();
    const nextOrder = (last[0]?.sort_order ?? -1) + 1;
    const id = await getNextSequence(SECTIONS_COLLECTION);
    await db.collection(SECTIONS_COLLECTION).insertOne({
      _id: id,
      id,
      page_id: Number(pageId),
      type,
      sort_order: nextOrder,
      data: JSON.stringify(meta.sample)
    });
    return { insertId: id };
  });
}

export async function updateSectionData(sectionId, data) {
  return safeWrite((db) =>
    db.collection(SECTIONS_COLLECTION).updateOne(
      { id: Number(sectionId) },
      { $set: { data: JSON.stringify(data) } }
    )
  );
}

export async function deleteSection(sectionId) {
  return safeWrite((db) => db.collection(SECTIONS_COLLECTION).deleteOne({ id: Number(sectionId) }));
}

/** Persists a full reorder — `ids` is the complete list of section ids in new display order. */
export async function reorderSections(ids) {
  return safeWrite(async (db) => {
    const collection = db.collection(SECTIONS_COLLECTION);
    for (let i = 0; i < ids.length; i += 1) {
      await collection.updateOne({ id: Number(ids[i]) }, { $set: { sort_order: i } });
    }
    return { ok: true };
  });
}
