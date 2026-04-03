import { handleOtpVerifyMocked } from "./handleOtpVerify.mocked";
import { handleOtpVerifyReal } from "./handleOtpVerify.real";

export const handleOtpVerify =
  process.env.NODE_ENV === "development" ? handleOtpVerifyMocked : handleOtpVerifyReal;

export { BadRequestError, NotFoundError, TooManyRequestsError } from "./handleOtpVerify.real";
