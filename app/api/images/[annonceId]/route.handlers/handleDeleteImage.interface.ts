import type { NextRequest } from "next/server";

export interface HandleDeleteImageInput {
  request: NextRequest;
  annonceId: string;
}

export interface HandleDeleteImageOutput {
  ok: boolean;
  removed: string;
  remaining: string[];
  haveImage: boolean;
  firstImagePath: string | null;
}
