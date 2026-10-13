import dns from "dns";
import { Db, MongoClient } from "mongodb";
import { getLocalDb, getLocalNextSequence } from "./local-db";

// Fix mongodb+srv DNS resolution on environments where default resolver fails SRV lookup
if (typeof window === "undefined" && typeof dns.setServers === "function") {
  try {
    const servers = (process.env.MONGODB_DNS_SERVERS || "1.1.1.1,8.8.8.8")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    dns.setServers(servers);
  } catch {
    // keep system default if unable to set
  }
}

const databaseName = process.env.MONGODB_DB_NAME || process.env.MONGODB_DB || "chromatus2";

declare global {
  // eslint-disable-next-line no-var
  var mongoClientInstance: MongoClient | undefined;
  // eslint-disable-next-line no-var
  var mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var lastMongoErrorTime: number | undefined;
  // eslint-disable-next-line no-var
  var lastMongoErrorMessage: string | undefined;
}

const MONGO_COOLDOWN_MS = 15000; // 15s retry cooldown when cluster connection fails

export async function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI environment variable.");

  // If recently failed, fail fast to use local storage without 5s latency
  if (global.lastMongoErrorTime && Date.now() - global.lastMongoErrorTime < MONGO_COOLDOWN_MS) {
    throw new Error(global.lastMongoErrorMessage || "MongoDB cluster offline");
  }

  if (global.mongoClientPromise) {
    try {
      const client = await global.mongoClientPromise;
      return client;
    } catch {
      global.mongoClientPromise = undefined;
    }
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 3000,
    connectTimeoutMS: 3000,
  });

  const promise = client
    .connect()
    .then((c) => {
      global.mongoClientPromise = Promise.resolve(c);
      global.lastMongoErrorTime = undefined;
      global.lastMongoErrorMessage = undefined;
      return c;
    })
    .catch((err) => {
      global.mongoClientPromise = undefined;
      global.lastMongoErrorTime = Date.now();
      global.lastMongoErrorMessage = err?.message || String(err);
      throw err;
    });

  global.mongoClientPromise = promise;
  return promise;
}

export async function getDatabase(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(databaseName);
}

export const getDb = getDatabase;

export async function getCollection(name: string) {
  try {
    const db = await getDatabase();
    return db.collection(name);
  } catch {
    return getLocalDb().collection(name) as any;
  }
}

export async function getNextSequence(name: string): Promise<number> {
  try {
    const db = await getDatabase();
    const result = await db.collection("counters").findOneAndUpdate(
      { _id: name as any },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after" }
    );
    return (result as any)?.seq ?? (result as any)?.value?.seq ?? 1;
  } catch {
    return getLocalNextSequence(name);
  }
}

export async function safeRead<T>(fn: (db: Db) => Promise<T>, fallback: T = [] as any): Promise<T> {
  try {
    const db = await getDatabase();
    const res = await fn(db);
    return res;
  } catch (err: any) {
    // Read from local storage fallback
    try {
      const localDb = getLocalDb();
      const localRes = await fn(localDb as any);
      if (localRes !== null && localRes !== undefined) {
        if (Array.isArray(localRes) && localRes.length === 0 && Array.isArray(fallback) && fallback.length > 0) {
          return fallback;
        }
        return localRes;
      }
    } catch (localErr) {
      console.warn("[local-db] read failed:", localErr);
    }
    return fallback;
  }
}

export async function safeWrite<T>(fn: (db: Db) => Promise<T>): Promise<{ ok: boolean; result?: T; error?: string; isFallback?: boolean }> {
  let mongoResult: T | undefined;
  let mongoSuccess = false;
  let mongoErrMessage = "";

  // 1. Try writing to MongoDB
  try {
    const db = await getDatabase();
    mongoResult = await fn(db);
    mongoSuccess = true;
  } catch (err: any) {
    mongoErrMessage = err?.message || String(err);
  }

  // 2. Always persist to local fallback store as well
  try {
    const localDb = getLocalDb();
    const localResult = await fn(localDb as any);
    if (!mongoSuccess) {
      return { ok: true, result: localResult, isFallback: true };
    }
  } catch (localErr: any) {
    if (!mongoSuccess) {
      return { ok: false, error: mongoErrMessage || localErr?.message || "Write failed" };
    }
  }

  return { ok: true, result: mongoResult };
}

export async function checkMongoStatus(): Promise<{
  connected: boolean;
  error?: string;
  isIpWhitelistIssue: boolean;
  databaseName: string;
}> {
  try {
    const db = await getDatabase();
    await db.command({ ping: 1 });
    return {
      connected: true,
      isIpWhitelistIssue: false,
      databaseName,
    };
  } catch (err: any) {
    // Reset client promise so next call tries fresh
    global.mongoClientPromise = undefined;
    const message = err?.message || String(err);
    const isIpWhitelist =
      message.includes("SSL alert number 80") ||
      message.includes("tlsv1 alert internal error") ||
      message.includes("MongoServerSelectionError") ||
      message.includes("whitelist");

    return {
      connected: false,
      error: message,
      isIpWhitelistIssue: isIpWhitelist,
      databaseName,
    };
  }
}
