export { UnauthorizedError, BadRequestError } from "./handlePostMyAnnonce.interface";

import { handlePostMyAnnonceMocked } from "./handlePostMyAnnonce.mocked";
import { handlePostMyAnnonceReal } from "./handlePostMyAnnonce.real";

export const handlePostMyAnnonce =
  process.env.NODE_ENV === "development"
    ? handlePostMyAnnonceMocked
    : handlePostMyAnnonceReal;
