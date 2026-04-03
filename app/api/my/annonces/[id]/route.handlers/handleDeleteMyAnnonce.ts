export { UnauthorizedError, BadRequestError, NotFoundError } from "./handleMyAnnonce.interface";

import { handleDeleteMyAnnonceMocked } from "./handleDeleteMyAnnonce.mocked";
import { handleDeleteMyAnnonceReal } from "./handleMyAnnonce.real";

export const handleDeleteMyAnnonce =
  process.env.NODE_ENV === "development"
    ? handleDeleteMyAnnonceMocked
    : handleDeleteMyAnnonceReal;
