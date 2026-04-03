import type { HandleDeleteImageInput, HandleDeleteImageOutput } from "./handleDeleteImage.interface";

export async function handleDeleteImageMocked(
  _input: HandleDeleteImageInput
): Promise<HandleDeleteImageOutput> {
  return {
    ok: true,
    removed: "mock-url",
    remaining: [],
    haveImage: false,
    firstImagePath: null,
  };
}
