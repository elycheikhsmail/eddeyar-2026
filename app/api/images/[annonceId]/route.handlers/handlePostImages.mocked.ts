import type { HandlePostImagesInput, HandlePostImagesOutput } from "./handlePostImages.interface";

export async function handlePostImagesMocked(
  _input: HandlePostImagesInput
): Promise<HandlePostImagesOutput> {
  return {
    ok: true,
    images: [],
    firstImagePath: null,
  };
}
