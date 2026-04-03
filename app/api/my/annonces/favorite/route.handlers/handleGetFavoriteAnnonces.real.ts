import { getFavoriteAnnonces } from "../../../../../../lib/services/annoncesService";
import { getUserFromCookies } from "../../../../../../utiles/getUserFomCookies";
import type { HandleGetFavoriteAnnoncesInput, HandleGetFavoriteAnnoncesOutput } from "./handleGetFavoriteAnnonces.interface";

export class UnauthorizedError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "UnauthorizedError";
  }
}

export async function handleGetFavoriteAnnoncesReal(
  input: HandleGetFavoriteAnnoncesInput
): Promise<HandleGetFavoriteAnnoncesOutput> {
  const user = await getUserFromCookies();
  if (!user?.id) throw new UnauthorizedError("Unauthorized");

  return await getFavoriteAnnonces({ page: input.page }, String(user.id));
}
