import { handleGetMyStatusMocked } from "./handleGetMyStatus.mocked";
import { handleGetMyStatusReal } from "./handleGetMyStatus.real";

export const handleGetMyStatus =
  process.env.USE_MOCK === "true" ? handleGetMyStatusMocked : handleGetMyStatusReal;
