import { handleRegisterPhoneMocked } from "./handleRegisterPhone.mocked";
import { handleRegisterPhoneReal } from "./handleRegisterPhone.real";

export const handleRegisterPhone =
  process.env.NODE_ENV === "development"
    ? handleRegisterPhoneMocked
    : handleRegisterPhoneReal;

export { BadRequestError } from "./handleRegisterPhone.real";
