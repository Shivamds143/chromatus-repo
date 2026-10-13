import { safeRead, safeWrite, getNextSequence } from './mongodb';
import { getPublishedJobBySlug, getJobById } from './jobs';

const COLLECTION = 'job_applications';

const VALID_STATUSES = ['new', 'reviewed', 'shortlisted', 'rejected', 'hired'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Public: a candidate submits an application for a job. `jobIdOrSlug` may be
 * either the job's slug (from the public job page) or its numeric id.
 * Always validates the job exists and is currently published — an
 * application can never be filed against a job that isn't live.
 */
export async function submitApplication(input = {}) {
  const name = String(input.name || '').trim();
  const email = String(input.email || '').trim();
  const phone = String(input.phone || '').trim();
  const resumeUrl = String(input.resumeUrl || '').trim();
  const coverNote = String(input.coverNote || '').trim();
  const jobIdOrSlug = String(input.jobIdOrSlug || '').trim();

  if (!jobIdOrSlug) return { ok: false, error: 'Missing job reference' };
  if (!name) return { ok: false, error: 'Your name is required' };
  if (!email || !EMAIL_RE.test(email)) return { ok: false, error: 'A valid email address is required' };
  if (resumeUrl && !/^https?:\/\//i.test(resumeUrl)) {
    return { ok: false, error: 'Resume link must be a full URL starting with http:// or https://' };
  }

  const job = await getPublishedJobBySlug(jobIdOrSlug);
  if (!job) return { ok: false, error: 'This role is no longer accepting applications' };

  return safeWrite(async (db) => {
    const id = await getNextSequence(COLLECTION);
    await db.collection(COLLECTION).insertOne({
      _id: id,
      id,
      job_id: job.id,
      // Snapshot the job title/department so the application record still
      // makes sense even if the job posting is later edited or removed.
      job_title: job.title,
      job_department: job.department || null,
      name,
      email,
      phone: phone || null,
      resume_url: resumeUrl || null,
      cover_note: coverNote || null,
      status: 'new',
      submitted_at: new Date()
    });
    return { insertId: id };
  });
}

// ---------------------------------------------------------------------
// Admin-only helpers (used by /admin/careers/applications).
// ---------------------------------------------------------------------

/** Admin: every application, most recent first, optionally filtered to one job. */
export async function listApplicationsAdmin(jobId) {
  const filter = jobId ? { job_id: Number(jobId) } : {};
  return safeRead(async (db) => {
    const list1 = await db.collection(COLLECTION).find(filter).sort({ submitted_at: -1 }).toArray().catch(() => []);
    const list2 = await db.collection('jobApplications').find({}).sort({ createdAt: -1 }).toArray().catch(() => []);

    const seen = new Set();
    const result = [];
    for (const item of list1) {
      const key = String(item.id || item._id);
      seen.add(key);
      result.push(item);
    }
    for (const item of list2) {
      const key = String(item.id || item._id);
      if (seen.has(key)) continue;
      seen.add(key);
      result.push({
        id: item.id || String(item._id),
        job_id: null,
        job_title: item.position || 'General Application',
        name: item.fullName || 'Candidate',
        email: item.email,
        phone: item.phone,
        resume_url: item.resumeFileName ? `/api/admin/resumes/${item.id || item._id}` : (item.linkedinUrl || null),
        cover_note: item.message || null,
        experience: item.experience || null,
        linkedin_url: item.linkedinUrl || null,
        resume_file_name: item.resumeFileName || null,
        resume_original_name: item.resumeOriginalName || item.resumeFileName || null,
        status: 'new',
        submitted_at: item.createdAt || new Date(),
      });
    }
    return result.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  }, []);
}

export async function getApplicationById(id) {
  return safeRead((db) => db.collection(COLLECTION).findOne({ id: Number(id) }), null);
}

export async function updateApplicationStatus(id, status) {
  if (!VALID_STATUSES.includes(status)) return { ok: false, error: 'Invalid status' };
  return safeWrite((db) =>
    db.collection(COLLECTION).updateOne({ id: Number(id) }, { $set: { status } })
  );
}

export async function deleteApplication(id) {
  return safeWrite((db) => db.collection(COLLECTION).deleteOne({ id: Number(id) }));
}

/** Admin: count of applications per job id, e.g. { 3: 12, 7: 4 } — for a badge on the jobs list. */
export async function getApplicationCountsByJob() {
  const rows = await safeRead(
    (db) =>
      db
        .collection(COLLECTION)
        .aggregate([{ $group: { _id: '$job_id', count: { $sum: 1 } } }])
        .toArray(),
    []
  );
  return rows.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {});
}

export { VALID_STATUSES };
// getJobById re-exported for convenience where admin screens need job context alongside applications.
export { getJobById };
