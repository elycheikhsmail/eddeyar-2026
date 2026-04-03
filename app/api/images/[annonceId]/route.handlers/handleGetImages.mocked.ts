import type { HandleGetImagesInput, HandleGetImagesOutput } from "./handleGetImages.interface";

export async function handleGetImagesMocked(
  _input: HandleGetImagesInput
): Promise<HandleGetImagesOutput> {
  return {
    haveImage: false,
    firstImagePath: null,
    images: [],
  };
}
