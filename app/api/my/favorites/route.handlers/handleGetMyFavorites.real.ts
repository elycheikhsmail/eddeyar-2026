import { eq, desc } from "drizzle-orm";
import { db } from "../../../../../lib/db";
import { favorites } from "../../../../../lib/schema";
import { getUserFromCookies } from "../../../../../utiles/getUserFomCookies";
import type { HandleGetMyFavoritesInput, HandleGetMyFavoritesOutput } from "./handleGetMyFavorites.interface";

export class UnauthorizedError extends Error {
  constructor(msg: string) { super(msg); this.name = "UnauthorizedError"; }
}

export async function handleGetMyFavoritesReal(
  _input: HandleGetMyFavoritesInput
): Promise<HandleGetMyFavoritesOutput> {
  const user = await getUserFromCookies();
  const userId = parseInt(String(user?.id ?? ""), 10);
  if (isNaN(userId)) throw new UnauthorizedError("Unauthorized");

  const rows = await db
    .select({ annonceId: favorites.annonceId, createdAt: favorites.createdAt })
    .from(favorites)
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt));

  return {
    ok: true,
    data: rows.map((r) => String(r.annonceId)),
    raw: rows,
  };
}
