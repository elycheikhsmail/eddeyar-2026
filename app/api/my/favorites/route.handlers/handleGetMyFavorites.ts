import { handleGetMyFavoritesMocked } from "./handleGetMyFavorites.mocked";
import { handleGetMyFavoritesReal } from "./handleGetMyFavorites.real";

export const handleGetMyFavorites =
  process.env.NODE_ENV === "development" ? handleGetMyFavoritesMocked : handleGetMyFavoritesReal;

export { UnauthorizedError } from "./handleGetMyFavorites.real";
