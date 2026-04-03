import type { NextRequest } from "next/server";

export interface HandlePostImagesInput {
  request: NextRequest;
  annonceId: string;
}

export interface HandlePostImagesOutput {
  ok: boolean;
  images: { url: string; isMain: boolean }[];
  firstImagePath: string | null;
}
