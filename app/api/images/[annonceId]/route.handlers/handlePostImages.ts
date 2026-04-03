import { handlePostImagesMocked } from "./handlePostImages.mocked";
import { handlePostImagesReal } from "./handleImages.real";

export const handlePostImages =
  process.env.NODE_ENV === "development" ? handlePostImagesMocked : handlePostImagesReal;
