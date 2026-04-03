import { handleDeleteImageMocked } from "./handleDeleteImage.mocked";
import { handleDeleteImageReal } from "./handleImages.real";

export const handleDeleteImage =
  process.env.NODE_ENV === "development" ? handleDeleteImageMocked : handleDeleteImageReal;
