import {
  HandlePatchFavoriteInput,
  HandlePatchFavoriteOutput,
} from "./handlePatchFavorite.interface";

export async function handlePatchFavoriteMocked(
  _input: HandlePatchFavoriteInput
): Promise<HandlePatchFavoriteOutput> {
  return { ok: true, annonceId: "mock-id", isFavorite: true };
}
