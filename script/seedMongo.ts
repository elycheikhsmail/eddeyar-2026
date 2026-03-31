/**
 * script/seedMongo.ts
 *
 * Seed the database with reference data + demo content.
 * Idempotent : safe to re-run (uses upserts / skipDuplicates).
 *
 * Usage:
 *   pnpm run mongo:seed
 */

import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import "dotenv/config";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Env var ${name} is required`);
  return v;
}

const now = new Date();

// ---------------------------------------------------------------------------
// 1. LIEUX  (wilayas depth=1, moughataas depth=2)
//    _id = id = numeric counter
// ---------------------------------------------------------------------------

const WILAYAS = [
  { id: 1,  name: "Nouakchott-Ouest",      nameAr: "نواكشوط الغربية" },
  { id: 2,  name: "Nouakchott-Nord",        nameAr: "نواكشوط الشمالية" },
  { id: 3,  name: "Nouakchott-Sud",         nameAr: "نواكشوط الجنوبية" },
  { id: 4,  name: "Hodh Ech Chargui",       nameAr: "الحوض الشرقي" },
  { id: 5,  name: "Hodh El Gharbi",         nameAr: "الحوض الغربي" },
  { id: 6,  name: "Assaba",                 nameAr: "العصابة" },
  { id: 7,  name: "Gorgol",                 nameAr: "كوركول" },
  { id: 8,  name: "Brakna",                 nameAr: "البراكنة" },
  { id: 9,  name: "Trarza",                 nameAr: "الترارزة" },
  { id: 10, name: "Adrar",                  nameAr: "آدرار" },
  { id: 11, name: "Dakhlet Nouadhibou",     nameAr: "داخلت نواذيبو" },
  { id: 12, name: "Tagant",                 nameAr: "تكانت" },
  { id: 13, name: "Guidimaka",              nameAr: "كيديماغا" },
  { id: 14, name: "Tiris Zemmour",          nameAr: "تيرس زمور" },
  { id: 15, name: "Inchiri",               nameAr: "إنشيري" },
];

// moughataas: [wilayaId, id, nameFr, nameAr]
const MOUGHATAAS: [number, number, string, string][] = [
  // Nouakchott-Ouest (1)
  [1, 101, "Tevragh-Zeina",   "تفرغ زينة"],
  [1, 102, "Ksar",            "القصر"],
  [1, 103, "Sebkha",          "سبخة"],
  // Nouakchott-Nord (2)
  [2, 201, "Dar Naim",        "دار النعيم"],
  [2, 202, "Teyarett",        "تيارت"],
  [2, 203, "Toujounine",      "تجكجة"],
  // Nouakchott-Sud (3)
  [3, 301, "El Mina",         "المينة"],
  [3, 302, "Riadh",           "الرياض"],
  [3, 303, "Arafat",          "عرفات"],
  // Adrar (10)
  [10, 1001, "Atar",          "آتار"],
  [10, 1002, "Aoujeft",       "أوجفت"],
  // Nouadhibou (11)
  [11, 1101, "Nouadhibou",    "نواذيبو"],
  [11, 1102, "Bir Moghrein",  "بئر أم كرين"],
  // Trarza (9)
  [9, 901, "Rosso",           "روصو"],
  [9, 902, "Boutilimit",      "بوتلميت"],
];

// ---------------------------------------------------------------------------
// 2. OPTIONS  (type_annonces + categories + sub-categories)
//    tag distinguishes the category tree from the type tree
// ---------------------------------------------------------------------------

// Type annonces  depth=1  tag="type_annonce"
const TYPE_ANNONCES = [
  { id: 1001, name: "Vente",    nameAr: "بيع",     tag: "type_annonce" },
  { id: 1002, name: "Location", nameAr: "إيجار",   tag: "type_annonce" },
  { id: 1003, name: "Service",  nameAr: "خدمة",    tag: "type_annonce" },
];

// Categories  depth=1  tag="categorie"
const CATEGORIES = [
  { id: 2001, name: "Immobilier",    nameAr: "عقارات" },
  { id: 2002, name: "Voitures",      nameAr: "سيارات" },
  { id: 2003, name: "Électronique",  nameAr: "إلكترونيات" },
  { id: 2004, name: "Emplois",       nameAr: "وظائف" },
  { id: 2005, name: "Divers",        nameAr: "متنوعات" },
];

// Sub-categories  depth=2  tag="subcategorie"  parentID = category id
const SUB_CATEGORIES: { id: number; parentID: number; name: string; nameAr: string }[] = [
  // Immobilier
  { id: 3001, parentID: 2001, name: "Appartements",   nameAr: "شقق" },
  { id: 3002, parentID: 2001, name: "Villas",         nameAr: "فيلات" },
  { id: 3003, parentID: 2001, name: "Terrains",       nameAr: "أراضي" },
  { id: 3004, parentID: 2001, name: "Bureaux",        nameAr: "مكاتب" },
  // Voitures
  { id: 3101, parentID: 2002, name: "Berlines",       nameAr: "سيارات سياحية" },
  { id: 3102, parentID: 2002, name: "SUV / 4x4",      nameAr: "سيارات دفع رباعي" },
  { id: 3103, parentID: 2002, name: "Camions",        nameAr: "شاحنات" },
  // Électronique
  { id: 3201, parentID: 2003, name: "Téléphones",     nameAr: "هواتف" },
  { id: 3202, parentID: 2003, name: "Ordinateurs",    nameAr: "حواسيب" },
  { id: 3203, parentID: 2003, name: "Accessoires",    nameAr: "ملحقات" },
  // Emplois
  { id: 3301, parentID: 2004, name: "Informatique",   nameAr: "تقنية المعلومات" },
  { id: 3302, parentID: 2004, name: "Commerce",       nameAr: "تجارة" },
  { id: 3303, parentID: 2004, name: "Transport",      nameAr: "نقل" },
  // Divers
  { id: 3401, parentID: 2005, name: "Meubles",        nameAr: "أثاث" },
  { id: 3402, parentID: 2005, name: "Vêtements",      nameAr: "ملابس" },
  { id: 3403, parentID: 2005, name: "Alimentation",   nameAr: "مواد غذائية" },
];

// ---------------------------------------------------------------------------
// 3. DEMO USER  (password: Demo1234!)
// ---------------------------------------------------------------------------

const DEMO_USER_ID = new ObjectId("aaaaaaaaaaaaaaaaaaaaaaaa");

// ---------------------------------------------------------------------------
// 4. DEMO ANNONCES
// ---------------------------------------------------------------------------

function makeAnnonce(overrides: Record<string, any>) {
  return {
    _id: new ObjectId(),
    typeAnnonceId: "1001",         // Vente
    typeAnnonceName: "Vente",
    typeAnnonceNameAr: "بيع",
    categorieId: "2001",           // Immobilier
    categorieName: "Immobilier",
    categorieNameAr: "عقارات",
    subcategorieId: "3001",        // Appartements
    classificationFr: "Appartements",
    classificationAr: "شقق",
    lieuId: "1",                   // Nouakchott-Ouest
    lieuStr: "Nouakchott-Ouest",
    lieuStrAr: "نواكشوط الغربية",
    moughataaId: "101",            // Tevragh-Zeina
    moughataaStr: "Tevragh-Zeina",
    moughataaStrAr: "تفرغ زينة",
    userId: DEMO_USER_ID.toString(),
    title: "Appartement à vendre",
    description: "Bel appartement bien situé dans un quartier calme.",
    price: 2500000,
    contact: "36000000",
    haveImage: false,
    firstImagePath: null,
    status: "active",
    isPublished: true,
    directNegotiation: false,
    issmar: false,
    isSponsored: false,
    isPriceHidden: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

const DEMO_ANNONCES = [
  makeAnnonce({
    title: "Appartement F3 — Tevragh-Zeina",
    description: "Appartement 3 pièces, 80 m², lumineux, proche des commodités. Cuisine équipée, salon spacieux.",
    price: 2800000,
    typeAnnonceId: "1001", categorieId: "2001", subcategorieId: "3001",
    lieuId: "1", moughataaId: "101",
  }),
  makeAnnonce({
    title: "Villa avec jardin — Dar Naim",
    description: "Grande villa 5 pièces avec jardin et parking. Idéale pour famille. Quartier résidentiel.",
    price: 8500000,
    typeAnnonceId: "1001", categorieId: "2001", subcategorieId: "3002",
    classificationFr: "Villas", classificationAr: "فيلات",
    lieuId: "2", lieuStr: "Nouakchott-Nord", lieuStrAr: "نواكشوط الشمالية",
    moughataaId: "201", moughataaStr: "Dar Naim", moughataaStrAr: "دار النعيم",
  }),
  makeAnnonce({
    title: "Appartement à louer — El Mina",
    description: "Appartement meublé 2 pièces, eau et électricité incluses. Disponible immédiatement.",
    price: 35000,
    typeAnnonceId: "1002", typeAnnonceName: "Location", typeAnnonceNameAr: "إيجار",
    categorieId: "2001", subcategorieId: "3001",
    lieuId: "3", lieuStr: "Nouakchott-Sud", lieuStrAr: "نواكشوط الجنوبية",
    moughataaId: "301", moughataaStr: "El Mina", moughataaStrAr: "المينة",
    rentalPeriod: "monthly", rentalPeriodAr: "شهري",
  }),
  makeAnnonce({
    title: "Toyota Land Cruiser 2020 — Ksar",
    description: "Land Cruiser 200, diesel, 4x4, parfait état. Kilométrage : 85 000 km. Boîte automatique.",
    price: 12000000,
    typeAnnonceId: "1001", categorieId: "2002", subcategorieId: "3102",
    classificationFr: "SUV / 4x4", classificationAr: "سيارات دفع رباعي",
    lieuId: "1", moughataaId: "102", moughataaStr: "Ksar", moughataaStrAr: "القصر",
  }),
  makeAnnonce({
    title: "Toyota Hilux Pick-up 2019",
    description: "Hilux double cabine, diesel, climatisé, bon état général. Idéal pour le désert.",
    price: 8000000,
    typeAnnonceId: "1001", categorieId: "2002", subcategorieId: "3103",
    classificationFr: "Camions", classificationAr: "شاحنات",
    lieuId: "1", moughataaId: "101",
  }),
  makeAnnonce({
    title: "iPhone 15 Pro — Tevragh-Zeina",
    description: "iPhone 15 Pro 256 Go, couleur titane naturel, état neuf, avec boîte originale.",
    price: 180000,
    typeAnnonceId: "1001", categorieId: "2003", subcategorieId: "3201",
    classificationFr: "Téléphones", classificationAr: "هواتف",
    lieuId: "1", moughataaId: "101",
  }),
  makeAnnonce({
    title: "Laptop Dell XPS 15 — Nouadhibou",
    description: "Dell XPS 15, Intel Core i7, 16 Go RAM, 512 Go SSD, écran 4K OLED. Très bon état.",
    price: 250000,
    typeAnnonceId: "1001", categorieId: "2003", subcategorieId: "3202",
    classificationFr: "Ordinateurs", classificationAr: "حواسيب",
    lieuId: "11", lieuStr: "Dakhlet Nouadhibou", lieuStrAr: "داخلت نواذيبو",
    moughataaId: "1101", moughataaStr: "Nouadhibou", moughataaStrAr: "نواذيبو",
  }),
  makeAnnonce({
    title: "Développeur Web Full-Stack (CDI)",
    description: "Société IT recherche développeur Next.js / Node.js. Expérience 2 ans minimum. CV à envoyer.",
    price: null,
    typeAnnonceId: "1003", typeAnnonceName: "Service", typeAnnonceNameAr: "خدمة",
    categorieId: "2004", subcategorieId: "3301",
    classificationFr: "Informatique", classificationAr: "تقنية المعلومات",
    lieuId: "1", moughataaId: "101",
    isPriceHidden: true,
  }),
  makeAnnonce({
    title: "Terrain 500 m² — Atar",
    description: "Terrain viabilisé de 500 m² en plein centre d'Atar. Titre foncier disponible.",
    price: 1500000,
    typeAnnonceId: "1001", categorieId: "2001", subcategorieId: "3003",
    classificationFr: "Terrains", classificationAr: "أراضي",
    lieuId: "10", lieuStr: "Adrar", lieuStrAr: "آدرار",
    moughataaId: "1001", moughataaStr: "Atar", moughataaStrAr: "آتار",
  }),
  makeAnnonce({
    title: "Salon complet 7 places — Arafat",
    description: "Salon marocain 7 places, couleur bordeaux, très bon état. Vente urgente.",
    price: 45000,
    typeAnnonceId: "1001", categorieId: "2005", subcategorieId: "3401",
    classificationFr: "Meubles", classificationAr: "أثاث",
    lieuId: "3", lieuStr: "Nouakchott-Sud", lieuStrAr: "نواكشوط الجنوبية",
    moughataaId: "303", moughataaStr: "Arafat", moughataaStrAr: "عرفات",
  }),
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function run() {
  const uri = requiredEnv("DATABASE_URL");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    console.log(`\n🔗 Connected to: ${db.databaseName}\n`);

    // ── 1. Lieux (wilayas) ────────────────────────────────────────────────
    console.log("📍 Seeding wilayas…");
    const lieuxCol = db.collection("lieux");
    for (const w of WILAYAS) {
      await lieuxCol.updateOne(
        { _id: w.id as any },
        {
          $setOnInsert: {
            _id: w.id,
            id: w.id,
            name: w.name,
            nameAr: w.nameAr,
            depth: 1,
            priority: w.id,
            tag: "wilaya",
            parentID: null,
            createdAt: now,
          },
        },
        { upsert: true }
      );
    }
    console.log(`   ✅ ${WILAYAS.length} wilayas`);

    // ── 2. Lieux (moughataas) ─────────────────────────────────────────────
    console.log("📍 Seeding moughataas…");
    for (const [wilayaId, id, name, nameAr] of MOUGHATAAS) {
      await lieuxCol.updateOne(
        { _id: id as any },
        {
          $setOnInsert: {
            _id: id,
            id,
            name,
            nameAr,
            depth: 2,
            priority: id,
            tag: "moughataa",
            parentID: wilayaId,
            createdAt: now,
          },
        },
        { upsert: true }
      );
    }
    console.log(`   ✅ ${MOUGHATAAS.length} moughataas`);

    // ── 3. Options — type annonces ─────────────────────────────────────────
    console.log("🗂️  Seeding type_annonces…");
    const optionsCol = db.collection("options");
    for (const t of TYPE_ANNONCES) {
      await optionsCol.updateOne(
        { _id: t.id as any },
        {
          $setOnInsert: {
            _id: t.id,
            id: t.id,
            name: t.name,
            nameAr: t.nameAr,
            depth: 1,
            priority: t.id,
            tag: t.tag,
            parentID: null,
            createdAt: now,
          },
        },
        { upsert: true }
      );
    }
    console.log(`   ✅ ${TYPE_ANNONCES.length} type_annonces`);

    // ── 4. Options — categories ────────────────────────────────────────────
    console.log("🗂️  Seeding categories…");
    for (const c of CATEGORIES) {
      await optionsCol.updateOne(
        { _id: c.id as any },
        {
          $setOnInsert: {
            _id: c.id,
            id: c.id,
            name: c.name,
            nameAr: c.nameAr,
            depth: 1,
            priority: c.id,
            tag: "categorie",
            parentID: null,
            createdAt: now,
          },
        },
        { upsert: true }
      );
    }
    console.log(`   ✅ ${CATEGORIES.length} categories`);

    // ── 5. Options — sub-categories ────────────────────────────────────────
    console.log("🗂️  Seeding sub-categories…");
    for (const s of SUB_CATEGORIES) {
      await optionsCol.updateOne(
        { _id: s.id as any },
        {
          $setOnInsert: {
            _id: s.id,
            id: s.id,
            name: s.name,
            nameAr: s.nameAr,
            depth: 2,
            priority: s.id,
            tag: "subcategorie",
            parentID: s.parentID,
            createdAt: now,
          },
        },
        { upsert: true }
      );
    }
    console.log(`   ✅ ${SUB_CATEGORIES.length} sub-categories`);

    // ── 6. Counters (for auto-increment) ──────────────────────────────────
    console.log("🔢 Seeding counters…");
    const countersCol = db.collection("counters");
    const maxOptionId = Math.max(...SUB_CATEGORIES.map((s) => s.id), ...CATEGORIES.map((c) => c.id), ...TYPE_ANNONCES.map((t) => t.id));
    const maxLieuId = Math.max(...MOUGHATAAS.map(([, id]) => id), ...WILAYAS.map((w) => w.id));
    await countersCol.updateOne(
      { _id: "options:id" },
      { $max: { seq: maxOptionId } },
      { upsert: true }
    );
    await countersCol.updateOne(
      { _id: "lieux:id" },
      { $max: { seq: maxLieuId } },
      { upsert: true }
    );
    console.log("   ✅ counters");

    // ── 7. Demo user ───────────────────────────────────────────────────────
    console.log("👤 Seeding demo user…");
    const usersCol = db.collection("users");
    const existing = await usersCol.findOne({ email: "demo@eddeyar.mr" });
    if (!existing) {
      const hash = await bcrypt.hash("Demo1234!", 10);
      await usersCol.insertOne({
        _id: DEMO_USER_ID,
        email: "demo@eddeyar.mr",
        password: hash,
        createdAt: now,
        isActive: true,
        emailVerified: true,
        roleId: null,
        roleName: null,
        samsar: false,
      });

      // Contact (phone) for the demo user
      await db.collection("contacts").insertOne({
        userId: DEMO_USER_ID.toString(),
        contact: "36000000",
        createdAt: now,
        isActive: true,
        isVerified: true,
        verifyCode: "0000",
        verifyTokenExpires: null,
      });
      console.log("   ✅ demo user created  (email: demo@eddeyar.mr  /  password: Demo1234!)");
    } else {
      console.log("   ℹ️  demo user already exists — skipped");
    }

    // ── 8. Demo annonces ───────────────────────────────────────────────────
    console.log("📋 Seeding demo annonces…");
    const annoncesCol = db.collection("annonces");
    const checklistCol = db.collection("annonce_publication_checklist");
    let inserted = 0;
    for (const annonce of DEMO_ANNONCES) {
      const exists = await annoncesCol.findOne({
        userId: DEMO_USER_ID.toString(),
        title: annonce.title,
      });
      if (!exists) {
        await annoncesCol.insertOne(annonce);
        await checklistCol.insertOne({
          annonceId: annonce._id.toString(),
          isContactVerified: true,
          isAnnonceVerifiedByIA: false,
          isAnnonceVerifiedByAdmin: true,
          isAnnonceVerifiedByAssistant: false,
          isAllowedToBePublished: true,
        });
        inserted++;
      }
    }
    console.log(`   ✅ ${inserted} demo annonces inserted (${DEMO_ANNONCES.length - inserted} already existed)`);

    // ── Done ───────────────────────────────────────────────────────────────
    console.log(`
╔══════════════════════════════════════════════╗
║  ✅  Seed complete!                          ║
╠══════════════════════════════════════════════╣
║  wilayas        : ${String(WILAYAS.length).padEnd(26)}║
║  moughataas     : ${String(MOUGHATAAS.length).padEnd(26)}║
║  type_annonces  : ${String(TYPE_ANNONCES.length).padEnd(26)}║
║  categories     : ${String(CATEGORIES.length).padEnd(26)}║
║  sub-categories : ${String(SUB_CATEGORIES.length).padEnd(26)}║
║  demo annonces  : ${String(DEMO_ANNONCES.length).padEnd(26)}║
║                                              ║
║  Demo account:                               ║
║    email    : demo@eddeyar.mr                ║
║    phone    : 36000000                       ║
║    password : Demo1234!                      ║
╚══════════════════════════════════════════════╝
`);
  } finally {
    await client.close();
  }
}

run().catch((err) => {
  console.error("❌ seedMongo failed:", err);
  process.exit(1);
});
