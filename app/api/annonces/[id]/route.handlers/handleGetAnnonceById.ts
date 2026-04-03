import { handleGetAnnonceByIdMocked } from "./handleGetAnnonceById.mocked";
import { handleGetAnnonceByIdReal } from "./handleGetAnnonceById.real";

export const handleGetAnnonceById =
  process.env.NODE_ENV === "development" ? handleGetAnnonceByIdMocked : handleGetAnnonceByIdReal;

export { NotFoundError } from "./handleGetAnnonceById.real";
