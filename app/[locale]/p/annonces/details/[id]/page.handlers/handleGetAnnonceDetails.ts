import { handleGetAnnonceDetailsMocked } from "./handleGetAnnonceDetails.mocked";
import { handleGetAnnonceDetailsReal } from "./handleGetAnnonceDetails.real";

export const handleGetAnnonceDetails =
  process.env.USE_MOCK === "true"
    ? handleGetAnnonceDetailsMocked
    : handleGetAnnonceDetailsReal;
