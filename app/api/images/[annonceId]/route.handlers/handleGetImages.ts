import { handleGetImagesMocked } from "./handleGetImages.mocked";
import { handleGetImagesReal } from "./handleImages.real";

export const handleGetImages =
  process.env.NODE_ENV === "development" ? handleGetImagesMocked : handleGetImagesReal;
