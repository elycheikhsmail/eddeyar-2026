import { handlePostSearchMocked } from "./handlePostSearch.mocked";
import { handlePostSearchReal } from "./handlePostSearch.real";

export const handlePostSearch =
  process.env.NODE_ENV === "development" ? handlePostSearchMocked : handlePostSearchReal;
