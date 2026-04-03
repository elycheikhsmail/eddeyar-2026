// app/[locale]/api/my/annonces/[annonceId]/favorite/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {
  handlePatchFavorite,
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
} from "./route.handlers/handlePatchFavorite";

/**
 * PATCH /:locale/api/my/annonces/:annonceId/favorite
 * Body: { isFavorite: boolean }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: any }
) {
  try {
    const result = await handlePatchFavorite({ request, params });
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof UnauthorizedError)
      return NextResponse.json({ ok: false, error: e.message }, { status: 401 });
    if (e instanceof BadRequestError)
      return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    if (e instanceof NotFoundError)
      return NextResponse.json({ ok: false, error: e.message }, { status: 404 });
    console.error("PATCH favorite error:", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
