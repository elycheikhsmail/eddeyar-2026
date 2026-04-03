import { handleConnexionPhoneMocked } from "./handleConnexionPhone.mocked";
import { handleConnexionPhoneReal } from "./handleConnexionPhone.real";

export const handleConnexionPhone =
  process.env.NODE_ENV === "development"
    ? handleConnexionPhoneMocked
    : handleConnexionPhoneReal;

export { UnauthorizedError, BadRequestError } from "./handleConnexionPhone.real";
