import { eq, and } from "drizzle-orm";
import { db } from "../../../../../../../lib/db";
import { annonces, favorites } from "../../../../../../../lib/schema";
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

  const user = await getUserFromCookies();
  const userId = parseInt(String(user?.id ?? ""), 10);
  if (isNaN(userId)) throw new UnauthorizedError("Unauthorized");

  // Résolution de l'annonceId
  let annonceIdStr = params?.annonceId;
  if (!annonceIdStr) {
    const pathname = request.nextUrl.pathname;
    const parts = pathname.split("/").filter(Boolean);
    const idx = parts.findIndex((p) => p === "annonces");
    if (idx >= 0 && parts.length > idx + 1) annonceIdStr = parts[idx + 1];
  }
  if (!annonceIdStr) throw new BadRequestError("Missing annonceId");

  const annonceId = parseInt(annonceIdStr, 10);
  if (isNaN(annonceId)) throw new BadRequestError("Bad annonceId");

  const [exists] = await db
    .select({ id: annonces.id })
    .from(annonces)
    .where(eq(annonces.id, annonceId))
    .limit(1);
  if (!exists) throw new NotFoundError("Annonce not found");

  const body = await request.json().catch(() => null as any);
  const isFavorite = body?.isFavorite;
  if (typeof isFavorite !== "boolean") throw new BadRequestError("isFavorite must be boolean");

  if (isFavorite) {
    // Upsert (ignore si déjà présent)
    await db
      .insert(favorites)
      .values({ userId, annonceId, createdAt: new Date() })
      .onConflictDoNothing();
  } else {
    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.annonceId, annonceId)));
  }

  return { ok: true, annonceId: annonceIdStr, isFavorite };
}
