import type { HandleGetMyFavoritesInput, HandleGetMyFavoritesOutput } from "./handleGetMyFavorites.interface";
import data from "./data.json";

export async function handleGetMyFavoritesMocked(
  _input: HandleGetMyFavoritesInput
): Promise<HandleGetMyFavoritesOutput> {
  return data;
}
