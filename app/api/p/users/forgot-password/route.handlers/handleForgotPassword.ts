import { handleForgotPasswordMocked } from "./handleForgotPassword.mocked";
import { handleForgotPasswordReal } from "./handleForgotPassword.real";

export const handleForgotPassword =
  process.env.NODE_ENV === "development"
    ? handleForgotPasswordMocked
    : handleForgotPasswordReal;

export { BadRequestError, NotFoundError, TooManyRequestsError, InternalError } from "./handleForgotPassword.real";
