import fs from "fs/promises";
import path from "path";
import { getDatabase } from "./mongodb";

const DATA_DIR = path.join(process.cwd(), "data");
const CREDS_FILE = path.join(DATA_DIR, "admin_credentials.json");

export type AdminProfile = {
  username: string;
  email?: string;
  updatedAt?: string;
};

type StoredCredentials = {
  username: string;
  email: string;
  password: string;
  updatedAt: string;
};

function getDefaultCredentials(): StoredCredentials {
  return {
    username: process.env.ADMIN_USERNAME || "admin",
    email: process.env.ADMIN_EMAIL || "admin@chromatus.com",
    password: process.env.ADMIN_PASSWORD || "admin1234",
    updatedAt: new Date().toISOString(),
  };
}

export async function getActiveCredentials(): Promise<StoredCredentials> {
  // 1. Try reading from database
  try {
    const db = await getDatabase();
    const doc = await db.collection("adminSettings").findOne({ type: "credentials" });
    if (doc && doc.username && doc.password) {
      return {
        username: String(doc.username),
        email: String(doc.email || doc.username),
        password: String(doc.password),
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
      };
    }
  } catch {
    // Database might be offline or initializing, fall through
  }

  // 2. Try reading from persistent local file
  try {
    const content = await fs.readFile(CREDS_FILE, "utf-8");
    const parsed = JSON.parse(content);
    if (parsed.username && parsed.password) {
      return parsed;
    }
  } catch {
    // Not saved locally yet
  }

  // 3. Default from environment
  return getDefaultCredentials();
}

export async function saveCredentials(creds: StoredCredentials): Promise<void> {
  // Save locally
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(CREDS_FILE, JSON.stringify(creds, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not save admin credentials to local storage:", err);
  }

  // Save to database
  try {
    const db = await getDatabase();
    await db.collection("adminSettings").updateOne(
      { type: "credentials" },
      {
        $set: {
          type: "credentials",
          username: creds.username,
          email: creds.email,
          password: creds.password,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
  } catch (err) {
    console.warn("Could not save admin credentials to database:", err);
  }
}

export async function verifyAdminLogin(username: string, password: string): Promise<boolean> {
  const active = await getActiveCredentials();
  const inputUser = username.trim().toLowerCase();
  const matchUser =
    active.username.trim().toLowerCase() === inputUser ||
    (Boolean(active.email) && active.email.trim().toLowerCase() === inputUser);

  return Boolean(matchUser && active.password === password);
}

export async function updateAdminCredentials(params: {
  currentPassword: string;
  newUsername?: string;
  newEmail?: string;
  newPassword?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const active = await getActiveCredentials();

  // Validate current password
  if (active.password !== params.currentPassword) {
    return { ok: false, error: "Current password is incorrect." };
  }

  if (params.newPassword && params.newPassword.length < 6) {
    return { ok: false, error: "New password must be at least 6 characters." };
  }

  const updated: StoredCredentials = {
    username: params.newUsername?.trim() || active.username,
    email: params.newEmail?.trim() || active.email || active.username,
    password: params.newPassword || active.password,
    updatedAt: new Date().toISOString(),
  };

  await saveCredentials(updated);
  return { ok: true };
}
