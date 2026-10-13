const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'local_db');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getFilePath(collectionName) {
  ensureDir();
  return path.join(DATA_DIR, `${collectionName}.json`);
}

function readCollection(collectionName) {
  try {
    const file = getFilePath(collectionName);
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8')) || [];
  } catch (err) {
    return [];
  }
}

function writeCollection(collectionName, items) {
  try {
    const file = getFilePath(collectionName);
    fs.writeFileSync(file, JSON.stringify(items, null, 2), 'utf8');
  } catch (err) {
    console.error(`[local-seed-db] Error writing ${collectionName}:`, err);
  }
}

function matchesFilter(item, filter) {
  if (!filter || Object.keys(filter).length === 0) return true;
  for (const key of Object.keys(filter)) {
    const targetVal = filter[key];
    const itemVal = item[key];
    if (itemVal != targetVal && String(itemVal) !== String(targetVal)) {
      return false;
    }
  }
  return true;
}

class CommonLocalCollection {
  constructor(name) {
    this.name = name;
  }

  async findOne(filter = {}) {
    const items = readCollection(this.name);
    return items.find((it) => matchesFilter(it, filter)) || null;
  }

  async insertOne(doc) {
    const items = readCollection(this.name);
    const id = doc._id || doc.id || `loc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newDoc = { ...doc, _id: id, id: doc.id || id };
    items.unshift(newDoc);
    writeCollection(this.name, items);
    return { insertedId: id };
  }

  async updateOne(filter, update, options = {}) {
    const items = readCollection(this.name);
    const idx = items.findIndex((it) => matchesFilter(it, filter));

    if (idx !== -1) {
      if (update.$set) Object.assign(items[idx], update.$set);
      writeCollection(this.name, items);
      return { matchedCount: 1, modifiedCount: 1 };
    }

    if (options.upsert) {
      const newDoc = {
        _id: filter._id || filter.id || `loc_${Date.now()}`,
        ...filter,
        ...(update.$set || {})
      };
      items.push(newDoc);
      writeCollection(this.name, items);
      return { matchedCount: 0, modifiedCount: 0, upsertedCount: 1 };
    }

    return { matchedCount: 0, modifiedCount: 0 };
  }

  async findOneAndUpdate(filter, update, options = {}) {
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
      return options.returnDocument === "after" ? newDoc : null;
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

class CommonLocalDb {
  collection(name) {
    return new CommonLocalCollection(name);
  }
}

function getCommonLocalDb() {
  return new CommonLocalDb();
}

module.exports = { getCommonLocalDb };
