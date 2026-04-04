/**
 * script/seedPostgres.ts
 *
 * Insère les données de référence + un compte démo dans PostgreSQL.
 * Idempotent : relançable sans dupliquer (ON CONFLICT DO NOTHING).
 *
 * Usage:
 *   bun --env-file=.env script/seedPostgres.ts
 *   bun --env-file=.env.test script/seedPostgres.ts
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import "dotenv/config";

import {
  lieux,
  options,
  users,
  contacts,
  annonces,
  annoncePublicationChecklist,
} from "../lib/schema";

// ---------------------------------------------------------------------------
// Connexion
// ---------------------------------------------------------------------------

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const pool = new Pool({ connectionString });
const db = drizzle(pool);

const now = new Date();

// ---------------------------------------------------------------------------
// 1. LIEUX — wilayas (depth=1) + moughataas (depth=2)
// ---------------------------------------------------------------------------

const WILAYAS = [
  { name: "Nouakchott-Ouest",  nameAr: "نواكشوط الغربية",  priority: 1 },
  { name: "Nouakchott-Nord",   nameAr: "نواكشوط الشمالية", priority: 2 },
  { name: "Nouakchott-Sud",    nameAr: "نواكشوط الجنوبية", priority: 3 },
  { name: "Hodh Ech Chargui",  nameAr: "الحوض الشرقي",     priority: 4 },
  { name: "Hodh El Gharbi",    nameAr: "الحوض الغربي",     priority: 5 },
  { name: "Assaba",            nameAr: "العصابة",           priority: 6 },
  { name: "Gorgol",            nameAr: "كوركول",            priority: 7 },
  { name: "Brakna",            nameAr: "البراكنة",          priority: 8 },
  { name: "Trarza",            nameAr: "الترارزة",          priority: 9 },
  { name: "Adrar",             nameAr: "آدرار",             priority: 10 },
  { name: "Dakhlet Nouadhibou",nameAr: "داخلت نواذيبو",    priority: 11 },
  { name: "Tagant",            nameAr: "تكانت",             priority: 12 },
  { name: "Guidimaka",         nameAr: "كيديماغا",          priority: 13 },
  { name: "Tiris Zemmour",     nameAr: "تيرس زمور",        priority: 14 },
  { name: "Inchiri",           nameAr: "إنشيري",            priority: 15 },
];

// [wilayaName, moughataaName, moughataaNameAr, priority]
const MOUGHATAAS: [string, string, string, number][] = [
  ["Nouakchott-Ouest", "Tevragh-Zeina",  "تفرغ زينة",    1],
  ["Nouakchott-Ouest", "Ksar",           "القصر",         2],
  ["Nouakchott-Ouest", "Sebkha",         "سبخة",          3],
  ["Nouakchott-Nord",  "Dar Naim",       "دار النعيم",    1],
  ["Nouakchott-Nord",  "Teyarett",       "تيارت",         2],
  ["Nouakchott-Nord",  "Toujounine",     "تجكجة",         3],
  ["Nouakchott-Sud",   "El Mina",        "المينة",        1],
  ["Nouakchott-Sud",   "Riadh",          "الرياض",        2],
  ["Nouakchott-Sud",   "Arafat",         "عرفات",         3],
  ["Adrar",            "Atar",           "آتار",          1],
  ["Adrar",            "Aoujeft",        "أوجفت",         2],
  ["Dakhlet Nouadhibou","Nouadhibou",    "نواذيبو",       1],
  ["Dakhlet Nouadhibou","Bir Moghrein",  "بئر أم كرين",   2],
  ["Trarza",           "Rosso",          "روصو",          1],
  ["Trarza",           "Boutilimit",     "بوتلميت",       2],
];

// ---------------------------------------------------------------------------
// 2. OPTIONS — type_annonces + categories + sub-categories
// ---------------------------------------------------------------------------

const TYPE_ANNONCES = [
  { name: "Vente",    nameAr: "بيع",    priority: 1 },
  { name: "Location", nameAr: "إيجار",  priority: 2 },
  { name: "Service",  nameAr: "خدمة",   priority: 3 },
];

const CATEGORIES = [
  { name: "Immobilier",   nameAr: "عقارات",      priority: 1 },
  { name: "Voitures",     nameAr: "سيارات",      priority: 2 },
  { name: "Électronique", nameAr: "إلكترونيات",  priority: 3 },
  { name: "Emplois",      nameAr: "وظائف",       priority: 4 },
  { name: "Divers",       nameAr: "متنوعات",     priority: 5 },
];

// [categoryName, name, nameAr, priority]
const SUB_CATEGORIES: [string, string, string, number][] = [
  ["Immobilier",   "Appartements",  "شقق",                   1],
  ["Immobilier",   "Villas",        "فيلات",                 2],
  ["Immobilier",   "Terrains",      "أراضي",                 3],
  ["Immobilier",   "Bureaux",       "مكاتب",                 4],
  ["Voitures",     "Berlines",      "سيارات سياحية",         1],
  ["Voitures",     "SUV / 4x4",    "سيارات دفع رباعي",      2],
  ["Voitures",     "Camions",       "شاحنات",                3],
  ["Électronique", "Téléphones",    "هواتف",                 1],
  ["Électronique", "Ordinateurs",   "حواسيب",                2],
  ["Électronique", "Accessoires",   "ملحقات",                3],
  ["Emplois",      "Informatique",  "تقنية المعلومات",       1],
  ["Emplois",      "Commerce",      "تجارة",                 2],
  ["Emplois",      "Transport",     "نقل",                   3],
  ["Divers",       "Meubles",       "أثاث",                  1],
  ["Divers",       "Vêtements",     "ملابس",                 2],
  ["Divers",       "Alimentation",  "مواد غذائية",           3],
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Upsert-like : insère uniquement si le nom+tag n'existe pas encore
async function upsertOption(row: {
  name: string;
  nameAr: string;
  priority: number;
  depth: number;
  tag: string;
  parentId?: number | null;
}): Promise<number> {
  const existing = await db
    .select({ id: options.id })
    .from(options)
    .where(and(eq(options.name, row.name), eq(options.tag, row.tag)))
    .limit(1);

  if (existing.length > 0) return existing[0].id;

  const inserted = await db
    .insert(options)
    .values({ ...row, createdAt: now })
    .returning({ id: options.id });

  return inserted[0].id;
}

async function upsertLieu(row: {
  name: string;
  nameAr: string;
  priority: number;
  depth: number;
  parentId?: number | null;
}): Promise<number> {
  const existing = await db
    .select({ id: lieux.id })
    .from(lieux)
    .where(and(eq(lieux.name, row.name), eq(lieux.depth, row.depth)))
    .limit(1);

  if (existing.length > 0) return existing[0].id;

  const inserted = await db
    .insert(lieux)
    .values(row)
    .returning({ id: lieux.id });

  return inserted[0].id;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function run() {
  console.log("\n🚀 Seeding PostgreSQL…\n");

  // ── 1. Wilayas ──────────────────────────────────────────────────────────
  console.log("📍 Seeding wilayas…");
  const wilayaIdByName = new Map<string, number>();
  for (const w of WILAYAS) {
    const id = await upsertLieu({ ...w, depth: 1, parentId: null });
    wilayaIdByName.set(w.name, id);
  }
  console.log(`   ✅ ${WILAYAS.length} wilayas`);

  // ── 2. Moughataas ───────────────────────────────────────────────────────
  console.log("📍 Seeding moughataas…");
  const moughataaIdByName = new Map<string, number>();
  for (const [wilayaName, name, nameAr, priority] of MOUGHATAAS) {
    const parentId = wilayaIdByName.get(wilayaName);
    if (!parentId) throw new Error(`Wilaya not found: ${wilayaName}`);
    const id = await upsertLieu({ name, nameAr, priority, depth: 2, parentId });
    moughataaIdByName.set(name, id);
  }
  console.log(`   ✅ ${MOUGHATAAS.length} moughataas`);

  // ── 3. Type annonces ────────────────────────────────────────────────────
  console.log("🗂️  Seeding type_annonces…");
  const typeIdByName = new Map<string, number>();
  for (const t of TYPE_ANNONCES) {
    const id = await upsertOption({ ...t, depth: 1, tag: "type_annonce", parentId: null });
    typeIdByName.set(t.name, id);
  }
  console.log(`   ✅ ${TYPE_ANNONCES.length} type_annonces`);

  // ── 4. Categories ───────────────────────────────────────────────────────
  console.log("🗂️  Seeding categories…");
  const catIdByName = new Map<string, number>();
  for (const c of CATEGORIES) {
    const id = await upsertOption({ ...c, depth: 1, tag: "categorie", parentId: null });
    catIdByName.set(c.name, id);
  }
  console.log(`   ✅ ${CATEGORIES.length} categories`);

  // ── 5. Sub-categories ───────────────────────────────────────────────────
  console.log("🗂️  Seeding sub-categories…");
  const subcatIdByName = new Map<string, number>();
  for (const [catName, name, nameAr, priority] of SUB_CATEGORIES) {
    const parentId = catIdByName.get(catName);
    if (!parentId) throw new Error(`Category not found: ${catName}`);
    const id = await upsertOption({ name, nameAr, priority, depth: 2, tag: "subcategorie", parentId });
    subcatIdByName.set(name, id);
  }
  console.log(`   ✅ ${SUB_CATEGORIES.length} sub-categories`);

  // ── 6. Demo user ─────────────────────────────────────────────────────────
  console.log("👤 Seeding demo user…");
  let demoUserId: number;
  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, "demo@eddeyar.mr"))
    .limit(1);

  if (existingUser.length > 0) {
    demoUserId = existingUser[0].id;
    console.log("   ℹ️  demo user already exists — skipped");
  } else {
    const hash = await bcrypt.hash("Demo1234!", 10);
    const inserted = await db
      .insert(users)
      .values({
        email: "demo@eddeyar.mr",
        password: hash,
        createdAt: now,
        isActive: true,
        emailVerified: true,
      })
      .returning({ id: users.id });
    demoUserId = inserted[0].id;

    await db.insert(contacts).values({
      userId: demoUserId,
      contact: "36000000",
      contactType: "phone",
      createdAt: now,
      isActive: true,
      isVerified: true,
      verifyCode: "0000",
    });
    console.log("   ✅ demo user created (email: demo@eddeyar.mr / password: Demo1234!)");
  }

  // ── 7. Demo annonces ─────────────────────────────────────────────────────
  console.log("📋 Seeding demo annonces…");

  // Lookup IDs résolus
  const lieuNK_Ouest   = wilayaIdByName.get("Nouakchott-Ouest")!;
  const lieuNK_Nord    = wilayaIdByName.get("Nouakchott-Nord")!;
  const lieuNK_Sud     = wilayaIdByName.get("Nouakchott-Sud")!;
  const lieuAdrar      = wilayaIdByName.get("Adrar")!;
  const lieuNouadhibou = wilayaIdByName.get("Dakhlet Nouadhibou")!;

  const mougTevraghZeina = moughataaIdByName.get("Tevragh-Zeina")!;
  const mougKsar         = moughataaIdByName.get("Ksar")!;
  const mougDarNaim      = moughataaIdByName.get("Dar Naim")!;
  const mougElMina       = moughataaIdByName.get("El Mina")!;
  const mougArafat       = moughataaIdByName.get("Arafat")!;
  const mougAtar         = moughataaIdByName.get("Atar")!;
  const mougNouadhibou   = moughataaIdByName.get("Nouadhibou")!;

  const typeVente    = typeIdByName.get("Vente")!;
  const typeLocation = typeIdByName.get("Location")!;
  const typeService  = typeIdByName.get("Service")!;

  const catImmo     = catIdByName.get("Immobilier")!;
  const catVoiture  = catIdByName.get("Voitures")!;
  const catElectro  = catIdByName.get("Électronique")!;
  const catEmploi   = catIdByName.get("Emplois")!;
  const catDivers   = catIdByName.get("Divers")!;

  const subcatAppart   = subcatIdByName.get("Appartements")!;
  const subcatVilla    = subcatIdByName.get("Villas")!;
  const subcatTerrain  = subcatIdByName.get("Terrains")!;
  const subcatSUV      = subcatIdByName.get("SUV / 4x4")!;
  const subcatCamion   = subcatIdByName.get("Camions")!;
  const subcatTel      = subcatIdByName.get("Téléphones")!;
  const subcatOrdi     = subcatIdByName.get("Ordinateurs")!;
  const subcatInfo     = subcatIdByName.get("Informatique")!;
  const subcatMeubles  = subcatIdByName.get("Meubles")!;

  const DEMO_ANNONCES: (typeof annonces.$inferInsert)[] = [
    {
      title: "Appartement F3 — Tevragh-Zeina",
      description: "Appartement 3 pièces, 80 m², lumineux, proche des commodités. Cuisine équipée, salon spacieux.",
      price: "2800000",
      typeAnnonceId: typeVente, categorieId: catImmo, subcategorieId: subcatAppart,
      lieuId: lieuNK_Ouest, lieuStr: "Nouakchott-Ouest", lieuStrAr: "نواكشوط الغربية",
      moughataaId: mougTevraghZeina, moughataaStr: "Tevragh-Zeina", moughataaStrAr: "تفرغ زينة",
      userId: demoUserId, contact: "36000000", haveImage: true,
      firstImagePath: "https://picsum.photos/seed/annonce1/800/600",
      status: "active", isPublished: true, createdAt: now, updatedAt: now,
    },
    {
      title: "Villa avec jardin — Dar Naim",
      description: "Grande villa 5 pièces avec jardin et parking. Idéale pour famille. Quartier résidentiel.",
      price: "8500000",
      typeAnnonceId: typeVente, categorieId: catImmo, subcategorieId: subcatVilla,
      lieuId: lieuNK_Nord, lieuStr: "Nouakchott-Nord", lieuStrAr: "نواكشوط الشمالية",
      moughataaId: mougDarNaim, moughataaStr: "Dar Naim", moughataaStrAr: "دار النعيم",
      userId: demoUserId, contact: "36000000",
      status: "active", isPublished: true, createdAt: now, updatedAt: now,
    },
    {
      title: "Appartement à louer — El Mina",
      description: "Appartement meublé 2 pièces, eau et électricité incluses. Disponible immédiatement.",
      price: "35000",
      typeAnnonceId: typeLocation, categorieId: catImmo, subcategorieId: subcatAppart,
      lieuId: lieuNK_Sud, lieuStr: "Nouakchott-Sud", lieuStrAr: "نواكشوط الجنوبية",
      moughataaId: mougElMina, moughataaStr: "El Mina", moughataaStrAr: "المينة",
      userId: demoUserId, contact: "36000000", rentalPeriod: "monthly", rentalPeriodAr: "شهري",
      status: "active", isPublished: true, createdAt: now, updatedAt: now,
    },
    {
      title: "Toyota Land Cruiser 2020 — Ksar",
      description: "Land Cruiser 200, diesel, 4x4, parfait état. Kilométrage : 85 000 km. Boîte automatique.",
      price: "12000000",
      typeAnnonceId: typeVente, categorieId: catVoiture, subcategorieId: subcatSUV,
      lieuId: lieuNK_Ouest, lieuStr: "Nouakchott-Ouest", lieuStrAr: "نواكشوط الغربية",
      moughataaId: mougKsar, moughataaStr: "Ksar", moughataaStrAr: "القصر",
      userId: demoUserId, contact: "36000000",
      status: "active", isPublished: true, createdAt: now, updatedAt: now,
    },
    {
      title: "Toyota Hilux Pick-up 2019",
      description: "Hilux double cabine, diesel, climatisé, bon état général. Idéal pour le désert.",
      price: "8000000",
      typeAnnonceId: typeVente, categorieId: catVoiture, subcategorieId: subcatCamion,
      lieuId: lieuNK_Ouest, lieuStr: "Nouakchott-Ouest", lieuStrAr: "نواكشوط الغربية",
      moughataaId: mougTevraghZeina, moughataaStr: "Tevragh-Zeina", moughataaStrAr: "تفرغ زينة",
      userId: demoUserId, contact: "36000000",
      status: "active", isPublished: true, createdAt: now, updatedAt: now,
    },
    {
      title: "iPhone 15 Pro — Tevragh-Zeina",
      description: "iPhone 15 Pro 256 Go, couleur titane naturel, état neuf, avec boîte originale.",
      price: "180000",
      typeAnnonceId: typeVente, categorieId: catElectro, subcategorieId: subcatTel,
      lieuId: lieuNK_Ouest, lieuStr: "Nouakchott-Ouest", lieuStrAr: "نواكشوط الغربية",
      moughataaId: mougTevraghZeina, moughataaStr: "Tevragh-Zeina", moughataaStrAr: "تفرغ زينة",
      userId: demoUserId, contact: "36000000",
      status: "active", isPublished: true, createdAt: now, updatedAt: now,
    },
    {
      title: "Laptop Dell XPS 15 — Nouadhibou",
      description: "Dell XPS 15, Intel Core i7, 16 Go RAM, 512 Go SSD, écran 4K OLED. Très bon état.",
      price: "250000",
      typeAnnonceId: typeVente, categorieId: catElectro, subcategorieId: subcatOrdi,
      lieuId: lieuNouadhibou, lieuStr: "Dakhlet Nouadhibou", lieuStrAr: "داخلت نواذيبو",
      moughataaId: mougNouadhibou, moughataaStr: "Nouadhibou", moughataaStrAr: "نواذيبو",
      userId: demoUserId, contact: "36000000",
      status: "active", isPublished: true, createdAt: now, updatedAt: now,
    },
    {
      title: "Développeur Web Full-Stack (CDI)",
      description: "Société IT recherche développeur Next.js / Node.js. Expérience 2 ans minimum. CV à envoyer.",
      price: null,
      typeAnnonceId: typeService, categorieId: catEmploi, subcategorieId: subcatInfo,
      lieuId: lieuNK_Ouest, lieuStr: "Nouakchott-Ouest", lieuStrAr: "نواكشوط الغربية",
      moughataaId: mougTevraghZeina, moughataaStr: "Tevragh-Zeina", moughataaStrAr: "تفرغ زينة",
      userId: demoUserId, contact: "36000000", isPriceHidden: true,
      status: "active", isPublished: true, createdAt: now, updatedAt: now,
    },
    {
      title: "Terrain 500 m² — Atar",
      description: "Terrain viabilisé de 500 m² en plein centre d'Atar. Titre foncier disponible.",
      price: "1500000",
      typeAnnonceId: typeVente, categorieId: catImmo, subcategorieId: subcatTerrain,
      lieuId: lieuAdrar, lieuStr: "Adrar", lieuStrAr: "آدرار",
      moughataaId: mougAtar, moughataaStr: "Atar", moughataaStrAr: "آتار",
      userId: demoUserId, contact: "36000000",
      status: "active", isPublished: true, createdAt: now, updatedAt: now,
    },
    {
      title: "Salon complet 7 places — Arafat",
      description: "Salon marocain 7 places, couleur bordeaux, très bon état. Vente urgente.",
      price: "45000",
      typeAnnonceId: typeVente, categorieId: catDivers, subcategorieId: subcatMeubles,
      lieuId: lieuNK_Sud, lieuStr: "Nouakchott-Sud", lieuStrAr: "نواكشوط الجنوبية",
      moughataaId: mougArafat, moughataaStr: "Arafat", moughataaStrAr: "عرفات",
      userId: demoUserId, contact: "36000000",
      status: "active", isPublished: true, createdAt: now, updatedAt: now,
    },
  ];

  let inserted = 0;
  for (const annonce of DEMO_ANNONCES) {
    const exists = await db
      .select({ id: annonces.id })
      .from(annonces)
      .where(and(eq(annonces.userId, demoUserId), eq(annonces.title, annonce.title!)))
      .limit(1);

    if (exists.length === 0) {
      const [newAnnonce] = await db.insert(annonces).values(annonce).returning({ id: annonces.id });
      await db.insert(annoncePublicationChecklist).values({
        annonceId: newAnnonce.id,
        isContactVerified: true,
        isAnnonceVerifiedByIa: false,
        isAnnonceVerifiedByAdmin: true,
        isAnnonceVerifiedByAssistant: false,
        isAllowedToBePublished: true,
      });
      inserted++;
    }
  }
  console.log(`   ✅ ${inserted} annonces insérées (${DEMO_ANNONCES.length - inserted} déjà existantes)`);

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log(`
╔══════════════════════════════════════════════╗
║  ✅  Seed PostgreSQL complet !               ║
╠══════════════════════════════════════════════╣
║  wilayas        : ${String(WILAYAS.length).padEnd(26)}║
║  moughataas     : ${String(MOUGHATAAS.length).padEnd(26)}║
║  type_annonces  : ${String(TYPE_ANNONCES.length).padEnd(26)}║
║  categories     : ${String(CATEGORIES.length).padEnd(26)}║
║  sub-categories : ${String(SUB_CATEGORIES.length).padEnd(26)}║
║  demo annonces  : ${String(DEMO_ANNONCES.length).padEnd(26)}║
║                                              ║
║  Compte démo :                               ║
║    email    : demo@eddeyar.mr                ║
║    phone    : 36000000                       ║
║    password : Demo1234!                      ║
╚══════════════════════════════════════════════╝
`);

  await pool.end();
}

run().catch((err) => {
  console.error("❌ seedPostgres failed:", err);
  process.exit(1);
});
