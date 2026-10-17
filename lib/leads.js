import { safeRead, safeWrite, getNextSequence } from './mongodb';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLead(body) {
  const name = (body?.name || body?.fullName || '').trim();
  const email = (body?.email || '').trim();
  const phone = (body?.phone || '').trim();
  const message = (body?.message || '').trim();
  const company = (body?.company || '').trim();

  if (!name) return { error: 'Please enter your name.' };
  if (!email || !EMAIL_RE.test(email)) return { error: 'Please enter a valid email address.' };
  if (!message) return { error: 'Please tell us a bit about your challenge.' };

  return { data: { name, email, phone, company, message } };
}

export async function insertLead({ name, email, phone, company, message, source }) {
  return safeWrite(async (db) => {
    const id = await getNextSequence('contact_submissions');
    await db.collection('contact_submissions').insertOne({
      _id: id,
      id,
      source: source || 'Website Contact Form',
      name,
      email,
      phone: phone || null,
      company: company || null,
      message,
      status: 'new',
      created_at: new Date()
    });
    return { insertId: id };
  });
}

// ---------------------------------------------------------------------
// Admin-only helpers (used by /admin/enquiries).
// ---------------------------------------------------------------------

export const ENQUIRY_STATUSES = ['new', 'in_progress', 'resolved', 'closed'];

export async function getAllEnquiries() {
  const seen = new Set();
  const result = [];

  await safeRead(async (db) => {
    const list1 = await db.collection('contact_submissions').find({}).sort({ created_at: -1 }).toArray().catch(() => []);
    const list2 = await db.collection('contactSubmissions').find({}).sort({ createdAt: -1 }).toArray().catch(() => []);
    
    // Normalize and merge without duplicate ids
    for (const item of [...list1, ...list2]) {
      const key = String(item.id || item._id);
      if (seen.has(key)) continue;
      seen.add(key);
      result.push({
        id: item.id || String(item._id),
        name: item.name || item.fullName || 'Anonymous',
        email: item.email,
        phone: item.phone || item.phoneNumber || item.phone_number || null,
        company: item.company || null,
        message: item.message,
        source: item.source || 'Website Contact Form',
        status: item.status || 'new',
        created_at: item.created_at || item.createdAt || new Date(),
      });
    }
    return result;
  }, []);

  // Also include any fallback contacts if present in fallback storage
  try {
    const { getFallbackData } = await import('./storage-fallback');
    const fallback = await getFallbackData();
    for (const item of fallback.contactSubmissions || []) {
      const key = String(item.id);
      if (seen.has(key)) continue;
      seen.add(key);
      result.push({
        id: item.id,
        name: item.fullName || 'Anonymous',
        email: item.email,
        phone: item.phone || null,
        company: item.company || null,
        message: item.message,
        source: 'Website Contact Form',
        status: 'new',
        created_at: item.createdAt || new Date(),
      });
    }
  } catch (_) {}

  return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function updateEnquiryStatus(id, status) {
  if (!ENQUIRY_STATUSES.includes(status)) {
    return { ok: false, error: 'Invalid status' };
  }
  return safeWrite(async (db) => {
    const num = Number(id);
    if (!Number.isNaN(num)) {
      await db.collection('contact_submissions').updateOne({ id: num }, { $set: { status } }).catch(() => {});
    }
    await db.collection('contactSubmissions').updateOne({ id: String(id) }, { $set: { status } }).catch(() => {});
    try {
      const { ObjectId } = await import('mongodb');
      if (ObjectId.isValid(id)) {
        await db.collection('contactSubmissions').updateOne({ _id: new ObjectId(id) }, { $set: { status } }).catch(() => {});
      }
    } catch (_) {}
  });
}

export async function deleteEnquiry(id) {
  return safeWrite(async (db) => {
    const num = Number(id);
    if (!Number.isNaN(num)) {
      await db.collection('contact_submissions').deleteOne({ id: num }).catch(() => {});
    }
    await db.collection('contactSubmissions').deleteOne({ id: String(id) }).catch(() => {});
    try {
      const { ObjectId } = await import('mongodb');
      if (ObjectId.isValid(id)) {
        await db.collection('contactSubmissions').deleteOne({ _id: new ObjectId(id) }).catch(() => {});
      }
    } catch (_) {}
  });
}

export async function getAllNewsletterSubscribers() {
  return safeRead(async (db) => {
    const list1 = await db.collection('newsletter_subscribers').find({}).sort({ created_at: -1 }).toArray().catch(() => []);
    const list2 = await db.collection('newsletterSubscriptions').find({}).sort({ createdAt: -1 }).toArray().catch(() => []);
    
    const seen = new Set();
    const result = [];
    for (const item of [...list1, ...list2]) {
      const email = (item.email || '').toLowerCase().trim();
      if (!email || seen.has(email)) continue;
      seen.add(email);
      result.push({
        id: item.id || String(item._id),
        email: item.email,
        status: item.status || 'subscribed',
        created_at: item.created_at || item.createdAt || new Date(),
      });
    }
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, []);
}

export async function deleteNewsletterSubscriber(id) {
  return safeWrite((db) => db.collection('newsletter_subscribers').deleteOne({ id: Number(id) }));
}
