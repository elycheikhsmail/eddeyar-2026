import { ObjectId } from "mongodb";
import { getDb } from "../../../../../../../lib/mongodb";
import { getUserFromCookies } from "../../../../../../../utiles/getUserFomCookies";
import {
  HandlePatchFavoriteInput,
  HandlePatchFavoriteOutput,
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
} from "./handlePatchFavorite.interface";

export async function handlePatchFavoriteReal(
  input: HandlePatchFavoriteInput
): Promise<HandlePatchFavoriteOutput> {
  const { request, params } = input;
  const db = await getDb();

  // ---- Auth obligatoire ----
  const user = await getUserFromCookies();
  const userId = String(user?.id ?? "");
  if (!userId) {
    throw new UnauthorizedError("Unauthorized");
  }

  // ---- Récup annonceId (params OU fallback via pathname) ----
  let annonceIdStr = params?.annonceId;

  if (!annonceIdStr) {
    const pathname = request.nextUrl.pathname;
    const parts = pathname.split("/").filter(Boolean);
    const annoncesIdx = parts.findIndex((p) => p === "annonces");
    if (annoncesIdx >= 0 && parts.length > annoncesIdx + 1) {
      annonceIdStr = parts[annoncesIdx + 1];
    }
  }

  if (!annonceIdStr) {
    throw new BadRequestError("Missing annonceId");
  }
  if (!ObjectId.isValid(annonceIdStr)) {
    throw new BadRequestError("Bad annonceId");
  }
  const annonceId = new ObjectId(annonceIdStr);

  // ---- Vérifier que l'annonce existe ----
  const exists = await db
    .collection("annonces")
    .findOne({ _id: annonceId }, { projection: { _id: 1 } });
  if (!exists) {
    throw new NotFoundError("Annonce not found");
  }

  // ---- Lire body ----
  const body = await request.json().catch(() => null as any);
  const isFavorite = body?.isFavorite;
  if (typeof isFavorite !== "boolean") {
    throw new BadRequestError("isFavorite must be boolean");
  }

  // ---- Collection favorites ----
  const favorites = db.collection("favorites");

  if (isFavorite) {
    await favorites.updateOne(
      { userId, annonceId },
      { $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
  } else {
    await favorites.deleteOne({ userId, annonceId });
  }

  return { ok: true, annonceId: annonceIdStr, isFavorite };
}
