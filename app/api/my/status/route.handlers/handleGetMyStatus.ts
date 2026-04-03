import { handleGetMyStatusMocked } from "./handleGetMyStatus.mocked";
import { handleGetMyStatusReal } from "./handleGetMyStatus.real";

export const handleGetMyStatus =
  process.env.NODE_ENV === "development" ? handleGetMyStatusMocked : handleGetMyStatusReal;
