import { eq, and, inArray, desc, sql, SQL } from "drizzle-orm";
import { db } from "../db";
import {
  annonces as annoncesTable,
  favorites,
  users,
} from "../schema";
import { getUserFromCookies } from "../../utiles/getUserFomCookies";
import { Annonce } from "../../packages/mytypes/types";

export type Search = {
  page?: string;
  typeAnnonceId?: string;
  categorieId?: string;
  subCategorieId?: string;
  price?: string;
  wilayaId?: string;
  moughataaId?: string;
  issmar?: string;
  directNegotiation?: string;
  mainChoice?: "Location" | "Vente";
  subChoice?: "voitures" | "Maisons";
  aiQuery?: string;
};

// ---------------------------------------------------------------------------
// AI Vector Search helper
// ---------------------------------------------------------------------------
async function fetchSimilarAnnonces(queryText: string): Promise<number[]> {
  try {
    const API_URL =
      process.env.SMART_SEARCH_API_URL ||
      "https://eddeyarrag-1.onrender.com/api/v1/query_annonces";

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: queryText }),
    });

    if (!res.ok) {
      console.error("AI Search API error:", res.status, res.statusText);
      return [];
    }

    const data = await res.json();
    if (data.status === "success" && Array.isArray(data.results)) {
      return data.results
        .map((r: any) => parseInt(r.payload?.annonce_id, 10))
        .filter((id: number) => Number.isFinite(id));
    }
    return [];
  } catch (err) {
    console.error("AI Search network error:", err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Mapper DB row → Annonce (type partagé)
// ---------------------------------------------------------------------------
function toAnnonce(a: typeof annoncesTable.$inferSelect, isFavorite = false): Annonce {
  return {
    id: String(a.id),
    typeAnnonceId: String(a.typeAnnonceId),
    categorieId: String(a.categorieId),
    subcategorieId: a.subcategorieId ? String(a.subcategorieId) : undefined,
    lieuId: a.lieuId ? String(a.lieuId) : null,
    moughataaId: a.moughataaId ? String(a.moughataaId) : null,
    lieuStr: a.lieuStr ?? "",
    lieuStrAr: a.lieuStrAr ?? "",
    moughataaStr: a.moughataaStr ?? "",
    moughataaStrAr: a.moughataaStrAr ?? "",
    userId: String(a.userId),
    title: a.title,
    description: a.description,
    privateDescription: a.privateDescription ?? undefined,
    price: a.price != null ? Number(a.price) : undefined,
    contact: a.contact,
    haveImage: !!a.haveImage,
    firstImagePath: a.firstImagePath ?? "",
    images: [],
    status: a.status,
    isPublished: a.isPublished,
    isSponsored: a.isSponsored,
    isPriceHidden: a.isPriceHidden,
    directNegotiation: a.directNegotiation ?? undefined,
    issmar: a.issmar ?? undefined,
    classificationFr: a.classificationFr ?? "",
    classificationAr: a.classificationAr ?? "",
    rentalPeriod: a.rentalPeriod ?? "",
    rentalPeriodAr: a.rentalPeriodAr ?? "",
    isFavorite,
    updatedAt: a.updatedAt,
    createdAt: a.createdAt,
  };
}

// ---------------------------------------------------------------------------
// getAnnonces — liste paginée avec filtres
// ---------------------------------------------------------------------------
export async function getAnnonces(sp: Search) {
  const currentPage = Number(sp.page) || 1;
  const itemsPerPage = 16;
  const offset = (currentPage - 1) * itemsPerPage;

  // ── Filtres de base ───────────────────────────────────────────────────────
  const conditions: SQL[] = [
    eq(annoncesTable.status, "active"),
    eq(annoncesTable.isPublished, true),
  ];

  // ── AI search ─────────────────────────────────────────────────────────────
  if (sp.aiQuery?.trim()) {
    const aiIds = await fetchSimilarAnnonces(sp.aiQuery);
    if (aiIds.length > 0) {
      conditions.push(inArray(annoncesTable.id, aiIds));
    } else {
      // Aucun résultat AI → renvoyer 0 résultats
      conditions.push(sql`false`);
    }
  }

  if (sp.typeAnnonceId) {
    const id = parseInt(sp.typeAnnonceId, 10);
    if (!isNaN(id)) conditions.push(eq(annoncesTable.typeAnnonceId, id));
  }
  if (sp.categorieId) {
    const id = parseInt(sp.categorieId, 10);
    if (!isNaN(id)) conditions.push(eq(annoncesTable.categorieId, id));
  }
  if (sp.subCategorieId) {
    const id = parseInt(sp.subCategorieId, 10);
    if (!isNaN(id)) conditions.push(eq(annoncesTable.subcategorieId, id));
  }
  if (sp.price && !isNaN(Number(sp.price))) {
    conditions.push(eq(annoncesTable.price, String(sp.price)));
  }
  if (sp.wilayaId) {
    const id = parseInt(sp.wilayaId, 10);
    if (!isNaN(id)) conditions.push(eq(annoncesTable.lieuId, id));
  }
  if (sp.moughataaId) {
    const id = parseInt(sp.moughataaId, 10);
    if (!isNaN(id)) conditions.push(eq(annoncesTable.moughataaId, id));
  }
  if (sp.issmar === "true") conditions.push(eq(annoncesTable.issmar, true));
  if (sp.directNegotiation === "true") conditions.push(eq(annoncesTable.directNegotiation, true));
  if (sp.directNegotiation === "false") conditions.push(eq(annoncesTable.directNegotiation, false));

  // mainChoice / subChoice — filtrés par typeAnnonceId / categorieId côté UI
  // (les IDs sont préférés aux noms pour PostgreSQL)

  const where = and(...conditions);

  // ── Requêtes en parallèle ─────────────────────────────────────────────────
  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(annoncesTable)
      .where(where)
      .orderBy(desc(annoncesTable.isSponsored), desc(annoncesTable.updatedAt))
      .limit(itemsPerPage)
      .offset(offset),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(annoncesTable)
      .where(where),
  ]);

  // ── Favoris + statut samsar ───────────────────────────────────────────────
  const user = await getUserFromCookies();
  let favoriteIds: string[] = [];
  let isSamsar = false;

  if (user?.id) {
    const userId = parseInt(String(user.id), 10);
    if (!isNaN(userId)) {
      const [favs, [userInDb]] = await Promise.all([
        db
          .select({ annonceId: favorites.annonceId })
          .from(favorites)
          .where(eq(favorites.userId, userId)),
        db
          .select({ roleName: users.roleName })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1),
      ]);
      favoriteIds = favs.map((f) => String(f.annonceId));
      isSamsar = userInDb?.roleName === "samsar";
    }
  }

  const favoriteSet = new Set(favoriteIds);
  const annoncesResult: Annonce[] = rows.map((a) =>
    toAnnonce(a, favoriteSet.has(String(a.id)))
  );

  return {
    annonces: annoncesResult,
    totalPages: Math.max(1, Math.ceil(total / itemsPerPage)),
    currentPage,
    totalCount: total,
    isSamsar,
    favoriteIds,
  };
}

// ---------------------------------------------------------------------------
// getFavoriteAnnonces — annonces favorites paginées
// ---------------------------------------------------------------------------
export async function getFavoriteAnnonces(
  sp: { page?: string },
  userId: string
) {
  const currentPage = Number(sp.page) || 1;
  const itemsPerPage = 6;
  const offset = (currentPage - 1) * itemsPerPage;
  const uid = parseInt(userId, 10);

  if (isNaN(uid)) return { annonces: [], totalPages: 1, currentPage, totalCount: 0 };

  // Compter d'abord le total
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(favorites)
    .where(eq(favorites.userId, uid));

  if (total === 0) return { annonces: [], totalPages: 1, currentPage, totalCount: 0 };

  // Charger les annonces via JOIN
  const rows = await db
    .select({ annonce: annoncesTable })
    .from(favorites)
    .innerJoin(annoncesTable, eq(favorites.annonceId, annoncesTable.id))
    .where(eq(favorites.userId, uid))
    .orderBy(desc(annoncesTable.updatedAt))
    .limit(itemsPerPage)
    .offset(offset);

  const annonces: Annonce[] = rows.map((r) => toAnnonce(r.annonce, true));

  return {
    annonces,
    totalPages: Math.max(1, Math.ceil(total / itemsPerPage)),
    currentPage,
    totalCount: total,
  };
}

// ---------------------------------------------------------------------------
// getUserAnnonces — annonces de l'utilisateur
// ---------------------------------------------------------------------------
export type UserAnnoncesSearch = {
  page?: string;
  typeAnnonceId?: string;
  categorieId?: string;
  subCategorieId?: string;
  price?: string;
};

export async function getUserAnnonces(sp: UserAnnoncesSearch, userId: string) {
  const currentPage = Number(sp.page) || 1;
  const itemsPerPage = 6;
  const offset = (currentPage - 1) * itemsPerPage;
  const uid = parseInt(userId, 10);

  if (isNaN(uid)) return { annonces: [], totalPages: 1, currentPage, totalCount: 0 };

  const conditions: SQL[] = [
    eq(annoncesTable.status, "active"),
    eq(annoncesTable.userId, uid),
  ];

  if (sp.typeAnnonceId) {
    const id = parseInt(sp.typeAnnonceId, 10);
    if (!isNaN(id)) conditions.push(eq(annoncesTable.typeAnnonceId, id));
  }
  if (sp.categorieId) {
    const id = parseInt(sp.categorieId, 10);
    if (!isNaN(id)) conditions.push(eq(annoncesTable.categorieId, id));
  }
  if (sp.subCategorieId) {
    const id = parseInt(sp.subCategorieId, 10);
    if (!isNaN(id)) conditions.push(eq(annoncesTable.subcategorieId, id));
  }
  if (sp.price && !isNaN(Number(sp.price))) {
    conditions.push(eq(annoncesTable.price, String(sp.price)));
  }

  const where = and(...conditions);

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(annoncesTable)
      .where(where)
      .orderBy(desc(annoncesTable.updatedAt))
      .limit(itemsPerPage)
      .offset(offset),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(annoncesTable)
      .where(where),
  ]);

  return {
    annonces: rows.map((a) => toAnnonce(a)),
    totalPages: Math.max(1, Math.ceil(total / itemsPerPage)),
    currentPage,
    totalCount: total,
  };
}

// ---------------------------------------------------------------------------
// getUserStatus — vérifie si l'utilisateur est samsar (courtier)
// ---------------------------------------------------------------------------
export async function getUserStatus(userId: string) {
  const uid = parseInt(userId, 10);
  if (isNaN(uid)) return { isSamsar: false };

  const [user] = await db
    .select({ roleName: users.roleName })
    .from(users)
    .where(eq(users.id, uid))
    .limit(1);

  return { isSamsar: user?.roleName === "samsar" };
}
