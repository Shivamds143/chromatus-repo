import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const FALLBACK_FILE = path.join(DATA_DIR, "fallback_submissions.json");

export type FallbackContact = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  company: string;
  message: string | null;
  createdAt: string;
  source: "fallback";
};

export type FallbackNewsletter = {
  id: string;
  email: string;
  createdAt: string;
  source: "fallback";
};

export type FallbackJobApplication = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  position: string;
  experience: string | null;
  linkedinUrl: string | null;
  message: string | null;
  resumeFileName: string;
  resumeOriginalName: string;
  resumeFileSize: number;
  resumeMimeType: string;
  createdAt: string;
  source: "fallback";
};

type FallbackStore = {
  contactSubmissions: FallbackContact[];
  newsletterSubscriptions: FallbackNewsletter[];
  jobApplications: FallbackJobApplication[];
};

async function ensureStore(): Promise<FallbackStore> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const content = await fs.readFile(FALLBACK_FILE, "utf-8");
    const parsed = JSON.parse(content);
    return {
      contactSubmissions: parsed.contactSubmissions || [],
      newsletterSubscriptions: parsed.newsletterSubscriptions || [],
      jobApplications: parsed.jobApplications || [],
    };
  } catch {
    const empty: FallbackStore = {
      contactSubmissions: [],
      newsletterSubscriptions: [],
      jobApplications: [],
    };
    try {
      await fs.writeFile(FALLBACK_FILE, JSON.stringify(empty, null, 2), "utf-8");
    } catch {
      // ignore write errors in restricted envs
    }
    return empty;
  }
}

async function writeStore(store: FallbackStore): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(FALLBACK_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch {
    try {
      const tmpDir = path.join("/tmp", "chromatus_data");
      await fs.mkdir(tmpDir, { recursive: true });
      await fs.writeFile(path.join(tmpDir, "fallback_submissions.json"), JSON.stringify(store, null, 2), "utf-8");
    } catch {
      // ignore in read-only environments
    }
  }
}

export async function saveContactSubmissionFallback(data: {
  fullName: string;
  email: string;
  phone?: string | null;
  company: string;
  message?: string | null;
  createdAt?: Date;
}): Promise<FallbackContact> {
  const store = await ensureStore();
  const entry: FallbackContact = {
    id: `offline_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone || null,
    company: data.company,
    message: data.message || null,
    createdAt: (data.createdAt || new Date()).toISOString(),
    source: "fallback",
  };
  store.contactSubmissions.unshift(entry);
  await writeStore(store);
  return entry;
}

export async function saveNewsletterSubscriptionFallback(email: string): Promise<FallbackNewsletter> {
  const store = await ensureStore();
  const normalized = email.trim().toLowerCase();
  const existing = store.newsletterSubscriptions.find((s) => s.email === normalized);
  if (existing) return existing;

  const entry: FallbackNewsletter = {
    id: `offline_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    email: normalized,
    createdAt: new Date().toISOString(),
    source: "fallback",
  };
  store.newsletterSubscriptions.unshift(entry);
  await writeStore(store);
  return entry;
}

export async function saveJobApplicationFallback(data: {
  fullName: string;
  email: string;
  phone?: string | null;
  position: string;
  experience?: string | null;
  linkedinUrl?: string | null;
  message?: string | null;
  resumeFileName: string;
  resumeOriginalName: string;
  resumeFileSize: number;
  resumeMimeType: string;
  createdAt?: Date;
}): Promise<FallbackJobApplication> {
  const store = await ensureStore();
  const entry: FallbackJobApplication = {
    id: `offline_job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone || null,
    position: data.position,
    experience: data.experience || null,
    linkedinUrl: data.linkedinUrl || null,
    message: data.message || null,
    resumeFileName: data.resumeFileName,
    resumeOriginalName: data.resumeOriginalName,
    resumeFileSize: data.resumeFileSize,
    resumeMimeType: data.resumeMimeType,
    createdAt: (data.createdAt || new Date()).toISOString(),
    source: "fallback",
  };
  store.jobApplications.unshift(entry);
  await writeStore(store);
  return entry;
}

export async function getFallbackData(): Promise<{
  contactSubmissions: Array<{
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    company: string;
    message: string | null;
    createdAt: Date;
    source: "fallback";
  }>;
  newsletterSubscriptions: Array<{
    id: string;
    email: string;
    createdAt: Date;
    source: "fallback";
  }>;
  jobApplications: Array<{
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    position: string;
    experience: string | null;
    linkedinUrl: string | null;
    message: string | null;
    resumeFileName: string;
    resumeOriginalName: string;
    resumeFileSize: number;
    resumeMimeType: string;
    createdAt: Date;
    source: "fallback";
  }>;
}> {
  const store = await ensureStore();
  return {
    contactSubmissions: store.contactSubmissions.map((s) => ({
      ...s,
      createdAt: new Date(s.createdAt),
      source: "fallback" as const,
    })),
    newsletterSubscriptions: store.newsletterSubscriptions.map((s) => ({
      ...s,
      createdAt: new Date(s.createdAt),
      source: "fallback" as const,
    })),
    jobApplications: (store.jobApplications || []).map((s) => ({
      ...s,
      createdAt: new Date(s.createdAt),
      source: "fallback" as const,
    })),
  };
}

export async function syncFallbackToMongo(db: any): Promise<{
  syncedContacts: number;
  syncedNewsletters: number;
  syncedJobApplications: number;
}> {
  const store = await ensureStore();
  let syncedContacts = 0;
  let syncedNewsletters = 0;
  let syncedJobApplications = 0;

  if (store.contactSubmissions.length > 0) {
    for (const contact of store.contactSubmissions) {
      await db.collection("contactSubmissions").insertOne({
        fullName: contact.fullName,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        message: contact.message,
        createdAt: new Date(contact.createdAt),
      });
      syncedContacts++;
    }
    store.contactSubmissions = [];
  }

  if (store.newsletterSubscriptions.length > 0) {
    for (const sub of store.newsletterSubscriptions) {
      await db.collection("newsletterSubscriptions").updateOne(
        { email: sub.email },
        {
          $setOnInsert: {
            email: sub.email,
            createdAt: new Date(sub.createdAt),
          },
        },
        { upsert: true }
      );
      syncedNewsletters++;
    }
    store.newsletterSubscriptions = [];
  }

  if (store.jobApplications && store.jobApplications.length > 0) {
    for (const app of store.jobApplications) {
      await db.collection("jobApplications").insertOne({
        fullName: app.fullName,
        email: app.email,
        phone: app.phone,
        position: app.position,
        experience: app.experience,
        linkedinUrl: app.linkedinUrl,
        message: app.message,
        resumeFileName: app.resumeFileName,
        resumeOriginalName: app.resumeOriginalName,
        resumeFileSize: app.resumeFileSize,
        resumeMimeType: app.resumeMimeType,
        createdAt: new Date(app.createdAt),
      });
      syncedJobApplications++;
    }
    store.jobApplications = [];
  }

  await writeStore(store);
  return { syncedContacts, syncedNewsletters, syncedJobApplications };
}
