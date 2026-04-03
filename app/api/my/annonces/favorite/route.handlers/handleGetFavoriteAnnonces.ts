import { handleGetFavoriteAnnoncesMocked } from "./handleGetFavoriteAnnonces.mocked";
import { handleGetFavoriteAnnoncesReal } from "./handleGetFavoriteAnnonces.real";

export const handleGetFavoriteAnnonces =
  process.env.NODE_ENV === "development" ? handleGetFavoriteAnnoncesMocked : handleGetFavoriteAnnoncesReal;

export { UnauthorizedError } from "./handleGetFavoriteAnnonces.real";
