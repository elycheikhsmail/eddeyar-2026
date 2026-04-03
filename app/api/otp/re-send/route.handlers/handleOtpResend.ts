import { handleOtpResendMocked } from "./handleOtpResend.mocked";
import { handleOtpResendReal } from "./handleOtpResend.real";

export const handleOtpResend =
  process.env.NODE_ENV === "development" ? handleOtpResendMocked : handleOtpResendReal;

export { BadRequestError, NotFoundError, TooManyRequestsError } from "./handleOtpResend.real";
