import type { HandleGetFavoriteAnnoncesInput, HandleGetFavoriteAnnoncesOutput } from "./handleGetFavoriteAnnonces.interface";
import data from "./data.json";

export async function handleGetFavoriteAnnoncesMocked(
  _input: HandleGetFavoriteAnnoncesInput
): Promise<HandleGetFavoriteAnnoncesOutput> {
  return data;
}
