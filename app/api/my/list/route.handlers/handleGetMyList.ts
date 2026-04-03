import { handleGetMyListMocked } from "./handleGetMyList.mocked";
import { handleGetMyListReal } from "./handleGetMyList.real";

export const handleGetMyList =
  process.env.NODE_ENV === "development" ? handleGetMyListMocked : handleGetMyListReal;

export { UnauthorizedError } from "./handleGetMyList.real";
