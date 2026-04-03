import { ObjectId } from "mongodb";
import { getDb } from "../../../../../../lib/mongodb";
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

// ---- Shared helpers ----

async function resolveUserId(): Promise<string> {
  const user = await getUserFromCookies();
  const userIdStr = String(user?.id ?? "");
  if (!userIdStr) throw new UnauthorizedError("Non authentifié");
  return userIdStr;
}

function parseAnnonceId(id: string): ObjectId {
  try {
    return new ObjectId(id);
  } catch {
    throw new BadRequestError("ID d'annonce invalide");
  }
}

// ---- GET ----

export async function handleGetMyAnnonceReal(
  input: HandleGetMyAnnonceInput
): Promise<HandleGetMyAnnonceOutput> {
  const { id } = input;
  const db = await getDb();
  const userIdStr = await resolveUserId();
  const annonceId = parseAnnonceId(id);

  const doc = await db
    .collection("annonces")
    .findOne({ _id: annonceId, userId: userIdStr });
  if (!doc) throw new NotFoundError("Annonce introuvable");

  const { _id, ...rest } = doc as any;
  return { id: _id.toString(), ...rest };
}

// ---- PUT ----

export async function handlePutMyAnnonceReal(
  input: HandlePutMyAnnonceInput
): Promise<HandlePutMyAnnonceOutput> {
  const { id, body } = input;
  const db = await getDb();
  const userIdStr = await resolveUserId();
  const annonceId = parseAnnonceId(id);

  const norm = (v: unknown) =>
    typeof v === "string" && v.trim() !== "" ? v.trim() : null;

  const update: Record<string, any> = { updatedAt: new Date() };
  if (typeof body.typeAnnonceId === "string") update.typeAnnonceId = body.typeAnnonceId;
  if (typeof body.categorieId === "string") update.categorieId = body.categorieId;
  if (typeof body.subcategorieId === "string") update.subcategorieId = body.subcategorieId;
  if (typeof body.title === "string") update.title = body.title;
  if (typeof body.description === "string") update.description = body.description;
  if (typeof body.privateDescription === "string") update.privateDescription = body.privateDescription;
  if (typeof body.price === "number" || body.price === null) update.price = body.price ?? null;
  if ("lieuId" in body) update.lieuId = norm(body.lieuId);
  if ("moughataaId" in body) update.moughataaId = norm(body.moughataaId);
  if (typeof body.lieuStr === "string") update.lieuStr = body.lieuStr;
  if (typeof body.lieuStrAr === "string") update.lieuStrAr = body.lieuStrAr;
  if (typeof body.moughataaStr === "string") update.moughataaStr = body.moughataaStr;
  if (typeof body.moughataaStrAr === "string") update.moughataaStrAr = body.moughataaStrAr;
  if (typeof body.issmar === "boolean") update.issmar = body.issmar;
  if (
    typeof body.directNegotiation === "boolean" ||
    body.directNegotiation === null ||
    body.directNegotiation === undefined
  ) {
    update.directNegotiation = body.directNegotiation ?? null;
  }
  if ("rentalPeriod" in body) update.rentalPeriod = norm(body.rentalPeriod);
  if ("rentalPeriodAr" in body) update.rentalPeriodAr = norm(body.rentalPeriodAr);

  console.log("body: ", body);

  const value = await db
    .collection("annonces")
    .findOneAndUpdate(
      { _id: annonceId, userId: userIdStr },
      { $set: update },
      { returnDocument: "after" }
    );

  if (!value) throw new NotFoundError("Annonce introuvable ou non autorisée");

  const { _id, ...rest } = value as any;
  return { id: _id.toString(), ...rest };
}

// ---- DELETE ----

export async function handleDeleteMyAnnonceReal(
  input: HandleDeleteMyAnnonceInput
): Promise<HandleDeleteMyAnnonceOutput> {
  const { id } = input;
  const db = await getDb();
  const userIdStr = await resolveUserId();
  const annonceId = parseAnnonceId(id);

  const res = await db
    .collection("annonces")
    .updateOne(
      { _id: annonceId, userId: userIdStr },
      { $set: { status: "deleted", updatedAt: new Date() } }
    );

  if (res.matchedCount === 0)
    throw new NotFoundError("Annonce introuvable ou non autorisée");

  return { message: "Annonce supprimée (soft delete)" };
}
