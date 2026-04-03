import { handleRegisterMocked } from "./handleRegister.mocked";
import { handleRegisterReal } from "./handleRegister.real";

export const handleRegister =
  process.env.NODE_ENV === "development"
    ? handleRegisterMocked
    : handleRegisterReal;

export { BadRequestError } from "./handleRegister.real";
