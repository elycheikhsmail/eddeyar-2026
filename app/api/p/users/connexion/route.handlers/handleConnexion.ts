import { handleConnexionMocked } from "./handleConnexion.mocked";
import { handleConnexionReal } from "./handleConnexion.real";

export const handleConnexion =
  process.env.NODE_ENV === "development"
    ? handleConnexionMocked
    : handleConnexionReal;

export { UnauthorizedError, BadRequestError } from "./handleConnexion.real";
