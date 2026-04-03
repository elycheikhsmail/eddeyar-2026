import type { HandleGetMyFavoritesInput, HandleGetMyFavoritesResult } from "./handleGetMyFavorites.interface";
import mockData from "./data.json";

export async function handleGetMyFavoritesMocked(
  _input: HandleGetMyFavoritesInput
): Promise<HandleGetMyFavoritesResult> {
  return mockData as HandleGetMyFavoritesResult;
}
