import { handleSmsValidationMocked } from "./handleSmsValidation.mocked";
import { handleSmsValidationReal } from "./handleSmsValidation.real";

export const handleSmsValidation =
  process.env.NODE_ENV === "development" ? handleSmsValidationMocked : handleSmsValidationReal;
