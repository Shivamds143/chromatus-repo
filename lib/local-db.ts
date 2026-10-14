import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data", "local_db");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getFilePath(collectionName: string): string {
  ensureDir();
  return path.join(DATA_DIR, `${collectionName}.json`);
}

function readCollection(collectionName: string): any[] {
  try {
    const file = getFilePath(collectionName);
    if (!fs.existsSync(file)) return [];
    const content = fs.readFileSync(file, "utf8");
    return JSON.parse(content) || [];
  } catch (err) {
    console.warn(`[local-db] could not read collection ${collectionName}:`, err);
    return [];
  }
}

function writeCollection(collectionName: string, items: any[]): void {
  try {
    const file = getFilePath(collectionName);
    fs.writeFileSync(file, JSON.stringify(items, null, 2), "utf8");
  } catch (err) {
    console.error(`[local-db] could not write collection ${collectionName}:`, err);
  }
}

function matchesFilter(item: any, filter?: any): boolean {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const key of Object.keys(filter)) {
    if (key === "$or" && Array.isArray(filter.$or)) {
      if (!filter.$or.some((sub: any) => matchesFilter(item, sub))) return false;
      continue;
    }

    if (key === "$and" && Array.isArray(filter.$and)) {
      if (!filter.$and.every((sub: any) => matchesFilter(item, sub))) return false;
      continue;
    }

    const targetVal = filter[key];
    const itemVal = item[key];

    if (targetVal instanceof RegExp) {
      if (!targetVal.test(String(itemVal ?? ""))) return false;
    } else if (typeof targetVal === "object" && targetVal !== null && !(targetVal instanceof Date)) {
      if ("$regex" in targetVal) {
        const regex = new RegExp(targetVal.$regex, targetVal.$options || "");
        if (!regex.test(String(itemVal ?? ""))) return false;
      }
      if ("$in" in targetVal && Array.isArray(targetVal.$in)) {
        if (!targetVal.$in.includes(itemVal)) return false;
      }
      if ("$nin" in targetVal && Array.isArray(targetVal.$nin)) {
        if (targetVal.$nin.includes(itemVal)) return false;
      }
      if ("$ne" in targetVal) {
        if (itemVal === targetVal.$ne) return false;
      }
      if ("$gt" in targetVal) {
        if (!(itemVal > targetVal.$gt)) return false;
      }
      if ("$gte" in targetVal) {
        if (!(itemVal >= targetVal.$gte)) return false;
      }
      if ("$lt" in targetVal) {
        if (!(itemVal < targetVal.$lt)) return false;
      }
      if ("$lte" in targetVal) {
        if (!(itemVal <= targetVal.$lte)) return false;
      }
    } else {
      // Direct comparison (supports string or numeric id)
      if (itemVal != targetVal && String(itemVal) !== String(targetVal)) {
        return false;
      }
    }
  }

  return true;
}

function applySort(items: any[], sortObj?: any): any[] {
  if (!sortObj) return items;
  const entries = Object.entries(sortObj);
  if (entries.length === 0) return items;

  return [...items].sort((a, b) => {
    for (const [key, dir] of entries) {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal === bVal) continue;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      const cmp = aVal > bVal ? 1 : -1;
      return dir === -1 ? -cmp : cmp;
    }
    return 0;
  });
}

export class LocalCollection {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  async findOne(filter: any = {}): Promise<any | null> {
    const items = readCollection(this.name);
    return items.find((it) => matchesFilter(it, filter)) || null;
  }

  find(filter: any = {}) {
    const name = this.name;
    let sortObj: any = null;
    let limitVal: number | null = null;
    let skipVal: number = 0;
    let projectObj: any = null;

    const query = {
      project(projection: any) {
        projectObj = projection;
        return query;
      },
      sort(sort: any) {
        sortObj = sort;
        return query;
      },
      limit(limit: number) {
        limitVal = limit;
        return query;
      },
      skip(skip: number) {
        skipVal = skip;
        return query;
      },
      async toArray(): Promise<any[]> {
        let items = readCollection(name).filter((it) => matchesFilter(it, filter));
        if (sortObj) items = applySort(items, sortObj);
        if (skipVal > 0) items = items.slice(skipVal);
        if (limitVal !== null && limitVal >= 0) items = items.slice(0, limitVal);
        if (projectObj && typeof projectObj === "object") {
          const keys = Object.keys(projectObj);
          const isExclusive = keys.some((k) => projectObj[k] === 0);
          items = items.map((item) => {
            if (isExclusive) {
              const copy = { ...item };
              for (const k of keys) {
                if (projectObj[k] === 0) delete copy[k];
              }
              return copy;
            } else {
              const res: any = { _id: item._id, id: item.id };
              for (const k of keys) {
                if (projectObj[k] === 1) res[k] = item[k];
              }
              return res;
            }
          });
        }
        return items;
      },
    };

    return query;
  }

  async insertOne(doc: any): Promise<{ insertedId: any; acknowledged: boolean }> {
    const items = readCollection(this.name);
    const id = doc._id || doc.id || `loc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newDoc = { ...doc, _id: id, id: doc.id || id };
    items.unshift(newDoc);
    writeCollection(this.name, items);
    return { insertedId: id, acknowledged: true };
  }

  async insertMany(docs: any[]): Promise<{ insertedCount: number; acknowledged: boolean }> {
    const items = readCollection(this.name);
    for (const doc of docs) {
      const id = doc._id || doc.id || `loc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      items.push({ ...doc, _id: id, id: doc.id || id });
    }
    writeCollection(this.name, items);
    return { insertedCount: docs.length, acknowledged: true };
  }

  async updateOne(
    filter: any,
    update: any,
    options: { upsert?: boolean } = {}
  ): Promise<{ matchedCount: number; modifiedCount: number; upsertedCount: number }> {
    const items = readCollection(this.name);
    const idx = items.findIndex((it) => matchesFilter(it, filter));

    if (idx !== -1) {
      const existing = items[idx];
      const updated = { ...existing };
      if (update.$set) Object.assign(updated, update.$set);
      if (update.$inc) {
        for (const [k, v] of Object.entries(update.$inc)) {
          updated[k] = (Number(updated[k]) || 0) + (Number(v) || 0);
        }
      }
      items[idx] = updated;
      writeCollection(this.name, items);
      return { matchedCount: 1, modifiedCount: 1, upsertedCount: 0 };
    }

    if (options.upsert) {
      const newDoc = {
        _id: filter._id || filter.id || `loc_${Date.now()}`,
        ...filter,
        ...(update.$set || {}),
      };
      items.push(newDoc);
      writeCollection(this.name, items);
      return { matchedCount: 0, modifiedCount: 0, upsertedCount: 1 };
    }

    return { matchedCount: 0, modifiedCount: 0, upsertedCount: 0 };
  }

  async updateMany(filter: any, update: any): Promise<{ matchedCount: number; modifiedCount: number }> {
    const items = readCollection(this.name);
    let count = 0;
    for (let i = 0; i < items.length; i++) {
      if (matchesFilter(items[i], filter)) {
        if (update.$set) Object.assign(items[i], update.$set);
        count++;
      }
    }
    if (count > 0) writeCollection(this.name, items);
    return { matchedCount: count, modifiedCount: count };
  }

  async deleteOne(filter: any): Promise<{ deletedCount: number; acknowledged: boolean }> {
    const items = readCollection(this.name);
    const idx = items.findIndex((it) => matchesFilter(it, filter));
    if (idx !== -1) {
      items.splice(idx, 1);
      writeCollection(this.name, items);
      return { deletedCount: 1, acknowledged: true };
    }
    return { deletedCount: 0, acknowledged: true };
  }

  async deleteMany(filter: any): Promise<{ deletedCount: number; acknowledged: boolean }> {
    const items = readCollection(this.name);
    const filtered = items.filter((it) => !matchesFilter(it, filter));
    const deletedCount = items.length - filtered.length;
    if (deletedCount > 0) writeCollection(this.name, filtered);
    return { deletedCount, acknowledged: true };
  }

  async countDocuments(filter: any = {}): Promise<number> {
    const items = readCollection(this.name);
    return items.filter((it) => matchesFilter(it, filter)).length;
  }

  async findOneAndUpdate(
    filter: any,
    update: any,
    options: { upsert?: boolean; returnDocument?: "before" | "after" } = {}
  ): Promise<any> {
    const items = readCollection(this.name);
    let idx = items.findIndex((it) => matchesFilter(it, filter));

    if (idx === -1 && options.upsert) {
      const newDoc = {
        _id: filter._id || filter.id || `loc_${Date.now()}`,
        ...filter,
      };
      if (update.$set) Object.assign(newDoc, update.$set);
      if (update.$inc) {
        for (const [k, v] of Object.entries(update.$inc)) {
          newDoc[k] = (Number(newDoc[k]) || 0) + (Number(v) || 0);
        }
      }
      items.push(newDoc);
      writeCollection(this.name, items);
      return newDoc;
    }

    if (idx !== -1) {
      const existing = { ...items[idx] };
      const updated = { ...items[idx] };
      if (update.$set) Object.assign(updated, update.$set);
      if (update.$inc) {
        for (const [k, v] of Object.entries(update.$inc)) {
          updated[k] = (Number(updated[k]) || 0) + (Number(v) || 0);
        }
      }
      items[idx] = updated;
      writeCollection(this.name, items);
      return options.returnDocument === "before" ? existing : updated;
    }

    return null;
  }
}

export class LocalDb {
  collection(name: string): LocalCollection {
    return new LocalCollection(name);
  }

  async listCollections() {
    ensureDir();
    const files = fs.readdirSync(DATA_DIR);
    return files
      .filter((f) => f.endsWith(".json"))
      .map((f) => ({ name: f.replace(".json", "") }));
  }

  async command(cmd: any) {
    return { ok: 1 };
  }
}

const localDbInstance = new LocalDb();

export function getLocalDb(): LocalDb {
  return localDbInstance;
}

export function getLocalNextSequence(name: string): number {
  ensureDir();
  const countersFile = path.join(DATA_DIR, "counters.json");
  let counters: Record<string, number> = {};
  try {
    if (fs.existsSync(countersFile)) {
      counters = JSON.parse(fs.readFileSync(countersFile, "utf8")) || {};
    }
  } catch {}

  const next = (Number(counters[name]) || 0) + 1;
  counters[name] = next;
  try {
    fs.writeFileSync(countersFile, JSON.stringify(counters, null, 2), "utf8");
  } catch {}
  return next;
}
