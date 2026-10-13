import { safeRead, safeWrite, getNextSequence } from './mongodb';

const COLLECTION = 'faqs';

/** Public/frontend: published FAQs only, in admin-defined order. */
export async function listPublishedFaqs() {
  return safeRead(
    (db) =>
      db
        .collection(COLLECTION)
        .find({ is_published: 1 })
        .sort({ sort_order: 1, id: 1 })
        .toArray(),
    []
  );
}

/** Admin: every FAQ, published or not. */
export async function listAllFaqs() {
  return safeRead(
    (db) => db.collection(COLLECTION).find({}).sort({ sort_order: 1, id: 1 }).toArray(),
    []
  );
}

export async function getFaq(id) {
  return safeRead((db) => db.collection(COLLECTION).findOne({ id: Number(id) }), null);
}

export async function createFaq(input) {
  return safeWrite(async (db) => {
    const last = await db.collection(COLLECTION).find({}).sort({ sort_order: -1 }).limit(1).toArray();
    const nextOrder = (last[0]?.sort_order ?? -1) + 1;
    const id = await getNextSequence(COLLECTION);
    await db.collection(COLLECTION).insertOne({
      _id: id,
      id,
      question: input.question || '',
      answer: input.answer || '',
      category: input.category || 'General',
      is_published: input.isPublished ? 1 : 0,
      sort_order: nextOrder
    });
    return { insertId: id };
  });
}

export async function updateFaq(id, input) {
  return safeWrite((db) =>
    db.collection(COLLECTION).updateOne(
      { id: Number(id) },
      {
        $set: {
          question: input.question || '',
          answer: input.answer || '',
          category: input.category || 'General',
          is_published: input.isPublished ? 1 : 0
        }
      }
    )
  );
}

export async function deleteFaq(id) {
  return safeWrite((db) => db.collection(COLLECTION).deleteOne({ id: Number(id) }));
}

/** Persists a full reorder — `ids` is the complete list in new display order. */
export async function reorderFaqs(ids) {
  return safeWrite(async (db) => {
    const collection = db.collection(COLLECTION);
    for (let i = 0; i < ids.length; i += 1) {
      await collection.updateOne({ id: Number(ids[i]) }, { $set: { sort_order: i } });
    }
    return { ok: true };
  });
}
