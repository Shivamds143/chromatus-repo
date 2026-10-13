import { Db, MongoClient } from "mongodb";

const databaseName = process.env.MONGODB_DB_NAME || process.env.MONGODB_DB || "chromatus2";

declare global {
  // eslint-disable-next-line no-var
  var mongoClientInstance: MongoClient | undefined;
  // eslint-disable-next-line no-var
  var mongoClientPromise: Promise<MongoClient> | undefined;
}

// Reset any stale rejected promises from previous attempts
if (global.mongoClientPromise) {
  // Test if it was already settled/failed
  global.mongoClientPromise.catch(() => {
    global.mongoClientPromise = undefined;
  });
}

export async function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI environment variable.");

  if (global.mongoClientPromise) {
    try {
      const client = await global.mongoClientPromise;
      // Quick check if still alive
      return client;
    } catch {
      global.mongoClientPromise = undefined;
    }
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  const promise = client
    .connect()
    .then((c) => {
      global.mongoClientPromise = Promise.resolve(c);
      return c;
    })
    .catch((err) => {
      global.mongoClientPromise = undefined;
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
  const db = await getDatabase();
  return db.collection(name);
}

export async function getNextSequence(name: string): Promise<number> {
  const db = await getDatabase();
  const result = await db.collection("counters").findOneAndUpdate(
    { _id: name as any },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  return (result as any)?.seq ?? (result as any)?.value?.seq ?? 1;
}

export async function safeRead<T>(fn: (db: Db) => Promise<T>, fallback: T = [] as any): Promise<T> {
  try {
    const db = await getDatabase();
    return await fn(db);
  } catch (err: any) {
    console.error("[mongodb] read failed:", err?.message || err);
    return fallback;
  }
}

export async function safeWrite<T>(fn: (db: Db) => Promise<T>): Promise<{ ok: boolean; result?: T; error?: string }> {
  try {
    const db = await getDatabase();
    const result = await fn(db);
    return { ok: true, result };
  } catch (err: any) {
    const safeMessage = err?.message || String(err);
    console.error("[mongodb] write failed:", safeMessage);
    return { ok: false, error: safeMessage };
  }
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
