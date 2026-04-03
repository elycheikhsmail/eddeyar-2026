// app/[locale]/api/my/favorites/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { handleGetFavoriteAnnonces, UnauthorizedError } from "./route.handlers/handleGetFavoriteAnnonces";

export async function GET(_request: NextRequest) {
  try {
    const result = await handleGetFavoriteAnnonces({});
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    console.error("GET /my/annonces/favorite error:", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
