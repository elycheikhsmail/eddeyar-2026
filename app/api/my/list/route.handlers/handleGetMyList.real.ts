import { getUserAnnonces, UserAnnoncesSearch } from "../../../../../lib/services/annoncesService";
import { getUserFromCookies } from "../../../../../utiles/getUserFomCookies";
import type { HandleGetMyListInput, HandleGetMyListOutput } from "./handleGetMyList.interface";

export class UnauthorizedError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "UnauthorizedError";
  }
}

export async function handleGetMyListReal(
  input: HandleGetMyListInput
): Promise<HandleGetMyListOutput> {
  const user = await getUserFromCookies();
  if (!user?.id) throw new UnauthorizedError("Unauthorized");

  const sp: UserAnnoncesSearch = {
    page: input.page,
    typeAnnonceId: input.typeAnnonceId,
    categorieId: input.categorieId,
    subCategorieId: input.subCategorieId,
    price: input.price,
  };

  return await getUserAnnonces(sp, String(user.id));
}
