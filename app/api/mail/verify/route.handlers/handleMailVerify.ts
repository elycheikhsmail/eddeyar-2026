import { handleMailVerifyMocked } from "./handleMailVerify.mocked";
import { handleMailVerifyReal } from "./handleMailVerify.real";

export const handleMailVerify =
  process.env.NODE_ENV === "development" ? handleMailVerifyMocked : handleMailVerifyReal;
