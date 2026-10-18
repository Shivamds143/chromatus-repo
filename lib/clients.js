import { safeRead, safeWrite, getNextSequence } from './mongodb';

const COLLECTION = 'client_logos';

export const fallbackClients = [
  { id: 1, name: 'Innovious Designs', subtitle: 'Engineering & Design Solutions', logo_url: '/clients/innovious-designs.png', website: '', is_published: 1, sort_order: 0 },
  { id: 2, name: 'Chandukaka Saraf', subtitle: 'Retail & Fine Jewelry', logo_url: '/clients/chandukaka-saraf.png', website: '', is_published: 1, sort_order: 1 },
  { id: 3, name: 'Nemade', subtitle: 'Engineering & Industrial Solutions', logo_url: '/clients/nemade.png', website: '', is_published: 1, sort_order: 2 },
  { id: 4, name: 'Swiss NeWater', subtitle: 'Water Purification & Sustainability', logo_url: '/clients/swiss-newater.png', website: '', is_published: 1, sort_order: 3 },
  { id: 5, name: 'Fusspot & Foodie', subtitle: 'Food & Lifestyle Retail', logo_url: '/clients/fusspot-foodie.png', website: '', is_published: 1, sort_order: 4 },
  { id: 6, name: 'EMIS', subtitle: 'Emerging Markets Information Service', logo_url: '/clients/emis.png', website: '', is_published: 1, sort_order: 5 },
  { id: 7, name: 'Opash', subtitle: 'Socio-Commercials Pvt. Ltd.', logo_url: '/clients/opash.png', website: '', is_published: 1, sort_order: 6 },
  { id: 8, name: 'Balasaheb Deoras Rugnalay', subtitle: 'Healthcare & Hospital', logo_url: '/clients/balasaheb-deoras-rugnalay.png', website: '', is_published: 1, sort_order: 7 },
  { id: 9, name: 'Auto Cluster', subtitle: 'Automotive Innovation & Research', logo_url: '/clients/auto-cluster.png', website: '', is_published: 1, sort_order: 8 },
  { id: 10, name: 'Keva', subtitle: 'Flavours & Fragrances', logo_url: '/clients/keva.png', website: '', is_published: 1, sort_order: 9 },
  { id: 11, name: 'Merck', subtitle: 'Global Healthcare & Life Sciences', logo_url: '/clients/merck.png', website: '', is_published: 1, sort_order: 10 },
  { id: 12, name: 'Superb Premix', subtitle: 'Food Products & Premixes', logo_url: '/clients/superb-premix.png', website: '', is_published: 1, sort_order: 11 },
  { id: 13, name: 'Nowrosjee Wadia College', subtitle: 'Higher Education & Research', logo_url: '/clients/nowrosjee-wadia-college.png', website: '', is_published: 1, sort_order: 12 },
  { id: 14, name: '3DOTS', subtitle: 'Creative & Digital Agency', logo_url: '/clients/3dots.png', website: '', is_published: 1, sort_order: 13 },
  { id: 15, name: 'Rapport', subtitle: 'Brand Consulting & Media', logo_url: '/clients/rapport.png', website: '', is_published: 1, sort_order: 14 },
  { id: 16, name: 'Dibber', subtitle: 'Early Childhood Education', logo_url: '/clients/dibber.png', website: '', is_published: 1, sort_order: 15 },
  { id: 17, name: 'Italian Trade Agency', subtitle: 'Trade Promotion & Development', logo_url: '/clients/italian-trade-agency.png', website: '', is_published: 1, sort_order: 16 },
  { id: 18, name: 'OISL', subtitle: 'OCL Iron and Steel Limited', logo_url: '/clients/oisl.png', website: '', is_published: 1, sort_order: 17 },
  { id: 19, name: 'Corrocoat', subtitle: 'Anti-Corrosion Engineering & Coatings', logo_url: '/clients/corrocoat.png', website: '', is_published: 1, sort_order: 18 },
  { id: 20, name: 'KCPL', subtitle: 'Industrial & Infrastructure Construction', logo_url: '/clients/kcpl.png', website: '', is_published: 1, sort_order: 19 },
  { id: 21, name: 'TUMC', subtitle: 'Techcomm Urban Management Consultants Pvt Ltd', logo_url: '/clients/tumc.png', website: '', is_published: 1, sort_order: 20 },
  { id: 22, name: 'Intigno', subtitle: 'Digital Solutions & Consulting', logo_url: '/clients/intigno.png', website: '', is_published: 1, sort_order: 21 },
  { id: 23, name: 'Hexagon', subtitle: 'Sensor, Software & Autonomous Solutions', logo_url: '/clients/hexagon.png', website: '', is_published: 1, sort_order: 22 },
  { id: 24, name: 'AB Petrochem', subtitle: 'Petrochemical Products & Distribution', logo_url: '/clients/ab-petrochem.png', website: '', is_published: 1, sort_order: 23 },
  { id: 25, name: 'Samava', subtitle: 'Enterprise & Business Services', logo_url: '/clients/samava.png', website: '', is_published: 1, sort_order: 24 },
  { id: 26, name: 'FDi 360', subtitle: 'Cross-Border Consulting', logo_url: '/clients/fdi-360.png', website: '', is_published: 1, sort_order: 25 },
  { id: 27, name: 'pqExcel', subtitle: 'Analytics & Productivity Systems', logo_url: '/clients/pqexcel.png', website: '', is_published: 1, sort_order: 26 },
  { id: 28, name: 'MHADA', subtitle: 'Maharashtra Housing and Area Development Authority', logo_url: '/clients/mhada.png', website: '', is_published: 1, sort_order: 27 },
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
