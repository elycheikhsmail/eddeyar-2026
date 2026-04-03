export { UnauthorizedError, BadRequestError, NotFoundError } from "./handleMyAnnonce.interface";

import { handlePutMyAnnonceMocked } from "./handlePutMyAnnonce.mocked";
import { handlePutMyAnnonceReal } from "./handleMyAnnonce.real";

export const handlePutMyAnnonce =
  process.env.NODE_ENV === "development"
    ? handlePutMyAnnonceMocked
    : handlePutMyAnnonceReal;
