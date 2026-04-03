import { handleGetMyAnnoncesMocked } from "./handleGetMyAnnonces.mocked";
import { handleGetMyAnnoncesReal } from "./handleGetMyAnnonces.real";

export const handleGetMyAnnonces =
  process.env.USE_MOCK === "true" ? handleGetMyAnnoncesMocked : handleGetMyAnnoncesReal;
