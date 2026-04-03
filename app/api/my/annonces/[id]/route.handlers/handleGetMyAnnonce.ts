export { UnauthorizedError, BadRequestError, NotFoundError } from "./handleMyAnnonce.interface";

import { handleGetMyAnnonceMocked } from "./handleGetMyAnnonce.mocked";
import { handleGetMyAnnonceReal } from "./handleMyAnnonce.real";

export const handleGetMyAnnonce =
  process.env.NODE_ENV === "development"
    ? handleGetMyAnnonceMocked
    : handleGetMyAnnonceReal;
