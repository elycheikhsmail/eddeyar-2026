import { handleGetMyFavoritesMocked } from "./handleGetMyFavorites.mocked";
import { handleGetMyFavoritesReal } from "./handleGetMyFavorites.real";

export const handleGetMyFavorites =
  process.env.USE_MOCK === "true" ? handleGetMyFavoritesMocked : handleGetMyFavoritesReal;
