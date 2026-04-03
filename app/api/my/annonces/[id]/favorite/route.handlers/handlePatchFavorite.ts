export { UnauthorizedError, BadRequestError, NotFoundError } from "./handlePatchFavorite.interface";

import { handlePatchFavoriteMocked } from "./handlePatchFavorite.mocked";
import { handlePatchFavoriteReal } from "./handlePatchFavorite.real";

export const handlePatchFavorite =
  process.env.NODE_ENV === "development"
    ? handlePatchFavoriteMocked
    : handlePatchFavoriteReal;
