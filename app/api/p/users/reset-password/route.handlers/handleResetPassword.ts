import { handleResetPasswordMocked } from "./handleResetPassword.mocked";
import { handleResetPasswordReal } from "./handleResetPassword.real";

export const handleResetPassword =
  process.env.NODE_ENV === "development" ? handleResetPasswordMocked : handleResetPasswordReal;

export { BadRequestError, NotFoundError } from "./handleResetPassword.real";
