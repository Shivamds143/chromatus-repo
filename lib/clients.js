import { safeRead, safeWrite, getNextSequence } from './mongodb';

const COLLECTION = 'client_logos';

export const fallbackClients = [
  {
    id: 1,
    name: 'Vertex Global',
    subtitle: 'Technology & Enterprise Solutions',
    logo_url: '',
    website: 'https://example.com',
    is_published: 1,
    sort_order: 0,
  },
  {
    id: 2,
    name: 'OmniHealth Labs',
    subtitle: 'Clinical & Healthcare Systems',
    logo_url: '',
    website: 'https://example.com',
    is_published: 1,
    sort_order: 1,
  },
  {
    id: 3,
    name: 'Kinetix Mobility',
    subtitle: 'Automotive & Logistics',
    logo_url: '',
    website: 'https://example.com',
    is_published: 1,
    sort_order: 2,
  },
  {
    id: 4,
    name: 'Aura Semiconductor',
    subtitle: 'Advanced Electronics',
    logo_url: '',
    website: 'https://example.com',
    is_published: 1,
    sort_order: 3,
  },
  {
    id: 5,
    name: 'Solaria Energy',
    subtitle: 'Renewable Power & Infrastructure',
    logo_url: '',
    website: 'https://example.com',
    is_published: 1,
    sort_order: 4,
  },
  {
    id: 6,
    name: 'Novus Telecom',
    subtitle: 'Global Communications',
    logo_url: '',
    website: 'https://example.com',
    is_published: 1,
    sort_order: 5,
  },
];

/** Public frontend: published client logos in admin-defined order */
export async function listPublishedClients() {
  const rows = await safeRead(
    (db) =>
      db
        .collection(COLLECTION)
        .find({ is_published: { $in: [1, true, '1'] } })
        .sort({ sort_order: 1, id: 1 })
        .toArray(),
    []
  );

  if (rows && rows.length > 0) return rows;
  return fallbackClients;
}

/** Admin: every client logo, published or draft */
export async function listAllClients() {
  const rows = await safeRead(
    (db) => db.collection(COLLECTION).find({}).sort({ sort_order: 1, id: 1 }).toArray(),
    []
  );

  if (rows && rows.length > 0) return rows;
  return fallbackClients;
}

export async function getClientById(id) {
  return safeRead((db) => db.collection(COLLECTION).findOne({ id: Number(id) }), null);
}

export async function createClient(input) {
  return safeWrite(async (db) => {
    const last = await db.collection(COLLECTION).find({}).sort({ sort_order: -1 }).limit(1).toArray();
    const nextOrder = (last[0]?.sort_order ?? -1) + 1;
    const id = (await getNextSequence(COLLECTION)) || Date.now();
    const newDoc = {
      _id: id,
      id,
      name: input.name || '',
      subtitle: input.subtitle || '',
      logo_url: input.logoUrl || input.logo_url || '',
      website: input.website || null,
      is_published: input.isPublished ? 1 : 0,
      sort_order: nextOrder,
      created_at: new Date(),
    };
    await db.collection(COLLECTION).insertOne(newDoc);
    return { insertId: id };
  });
}

export async function updateClient(id, input) {
  return safeWrite((db) =>
    db.collection(COLLECTION).updateOne(
      { id: Number(id) },
      {
        $set: {
          name: input.name || '',
          subtitle: input.subtitle || '',
          logo_url: input.logoUrl || input.logo_url || '',
          website: input.website || null,
          is_published: input.isPublished ? 1 : 0,
          updated_at: new Date(),
        },
      }
    )
  );
}

export async function deleteClient(id) {
  return safeWrite((db) => db.collection(COLLECTION).deleteOne({ id: Number(id) }));
}

/** Full reorder — `ids` is array of client ids in new order */
export async function reorderClients(ids) {
  return safeWrite(async (db) => {
    const collection = db.collection(COLLECTION);
    for (let i = 0; i < ids.length; i += 1) {
      await collection.updateOne({ id: Number(ids[i]) }, { $set: { sort_order: i } });
    }
    return { ok: true };
  });
}
