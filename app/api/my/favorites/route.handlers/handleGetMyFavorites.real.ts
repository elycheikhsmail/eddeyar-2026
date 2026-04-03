import { getDb } from "../../../../../lib/mongodb";
import { getUserFromCookies } from "../../../../../utiles/getUserFomCookies";
import type { HandleGetMyFavoritesInput, HandleGetMyFavoritesOutput } from "./handleGetMyFavorites.interface";

export class UnauthorizedError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "UnauthorizedError";
  }
}

export async function handleGetMyFavoritesReal(
  _input: HandleGetMyFavoritesInput
): Promise<HandleGetMyFavoritesOutput> {
  const db = await getDb();
  const user = await getUserFromCookies();
  const userId = String(user?.id ?? "");
  if (!userId) throw new UnauthorizedError("Unauthorized");

  const rows = await db
    .collection("favorites")
    .find({ userId }, { projection: { _id: 0, annonceId: 1, createdAt: 1 } })
    .sort({ createdAt: -1 })
    .toArray();

  return {
    ok: true,
    data: rows.map(r => String(r.annonceId)),
    raw: rows,
  };
}
