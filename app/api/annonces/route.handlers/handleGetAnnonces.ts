import { handleGetAnnoncesMocked } from "./handleGetAnnonces.mocked";
import { handleGetAnnoncesReal } from "./handleGetAnnonces.real";

export const handleGetAnnonces =
  process.env.NODE_ENV === "development" ? handleGetAnnoncesMocked : handleGetAnnoncesReal;
