import { eq, and } from "drizzle-orm";
import { db } from "../../../../../../lib/db";
import { annonces } from "../../../../../../lib/schema";
import { getUserFromCookies } from "../../../../../../utiles/getUserFomCookies";
import {
  HandleGetMyAnnonceInput,
  HandleGetMyAnnonceOutput,
  HandlePutMyAnnonceInput,
  HandlePutMyAnnonceOutput,
  HandleDeleteMyAnnonceInput,
  HandleDeleteMyAnnonceOutput,
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
} from "./handleMyAnnonce.interface";

async function resolveUserId(): Promise<number> {
  const user = await getUserFromCookies();
  const uid = parseInt(String(user?.id ?? ""), 10);
  if (isNaN(uid)) throw new UnauthorizedError("Non authentifié");
  return uid;
}

function parseId(id: string): number {
  const n = parseInt(id, 10);
  if (isNaN(n)) throw new BadRequestError("ID d'annonce invalide");
  return n;
}

export async function handleGetMyAnnonceReal(
  input: HandleGetMyAnnonceInput
): Promise<HandleGetMyAnnonceOutput> {
  const uid = await resolveUserId();
  const annonceId = parseId(input.id);

  const [doc] = await db
    .select()
    .from(annonces)
    .where(and(eq(annonces.id, annonceId), eq(annonces.userId, uid)))
    .limit(1);

  if (!doc) throw new NotFoundError("Annonce introuvable");
  return { id: String(doc.id), ...doc };
}

export async function handlePutMyAnnonceReal(
  input: HandlePutMyAnnonceInput
): Promise<HandlePutMyAnnonceOutput> {
  const uid = await resolveUserId();
  const annonceId = parseId(input.id);
  const { body } = input;

  const norm = (v: unknown) => (typeof v === "string" && v.trim() !== "" ? v.trim() : null);

  const update: Partial<typeof annonces.$inferInsert> = { updatedAt: new Date() };

  if (typeof body.typeAnnonceId === "string") {
    const id = parseInt(body.typeAnnonceId, 10);
    if (!isNaN(id)) update.typeAnnonceId = id;
  }
  if (typeof body.categorieId === "string") {
    const id = parseInt(body.categorieId, 10);
    if (!isNaN(id)) update.categorieId = id;
  }
  if (typeof body.subcategorieId === "string") {
    const id = parseInt(body.subcategorieId, 10);
    if (!isNaN(id)) update.subcategorieId = id;
  }
  if (typeof body.title === "string") update.title = body.title;
  if (typeof body.description === "string") update.description = body.description;
  if (typeof body.privateDescription === "string") update.privateDescription = body.privateDescription;
  if (typeof body.price === "number" || body.price === null) update.price = body.price != null ? String(body.price) : null;
  if ("lieuId" in body) { const id = parseInt(String(body.lieuId ?? ""), 10); update.lieuId = isNaN(id) ? null : id; }
  if ("moughataaId" in body) { const id = parseInt(String(body.moughataaId ?? ""), 10); update.moughataaId = isNaN(id) ? null : id; }
  if (typeof body.lieuStr === "string") update.lieuStr = body.lieuStr;
  if (typeof body.lieuStrAr === "string") update.lieuStrAr = body.lieuStrAr;
  if (typeof body.moughataaStr === "string") update.moughataaStr = body.moughataaStr;
  if (typeof body.moughataaStrAr === "string") update.moughataaStrAr = body.moughataaStrAr;
  if (typeof body.issmar === "boolean") update.issmar = body.issmar;
  if (typeof body.directNegotiation === "boolean" || body.directNegotiation == null) {
    update.directNegotiation = body.directNegotiation ?? null;
  }
  if ("rentalPeriod" in body) update.rentalPeriod = norm(body.rentalPeriod);
  if ("rentalPeriodAr" in body) update.rentalPeriodAr = norm(body.rentalPeriodAr);

  const [updated] = await db
    .update(annonces)
    .set(update)
    .where(and(eq(annonces.id, annonceId), eq(annonces.userId, uid)))
    .returning();

  if (!updated) throw new NotFoundError("Annonce introuvable ou non autorisée");
  return { id: String(updated.id), ...updated };
}

export async function handleDeleteMyAnnonceReal(
  input: HandleDeleteMyAnnonceInput
): Promise<HandleDeleteMyAnnonceOutput> {
  const uid = await resolveUserId();
  const annonceId = parseId(input.id);

  const [updated] = await db
    .update(annonces)
    .set({ status: "deleted", updatedAt: new Date() })
    .where(and(eq(annonces.id, annonceId), eq(annonces.userId, uid)))
    .returning({ id: annonces.id });

  if (!updated) throw new NotFoundError("Annonce introuvable ou non autorisée");
  return { message: "Annonce supprimée (soft delete)" };
}
