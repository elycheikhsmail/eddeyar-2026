export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { handleGetMyFavorites, UnauthorizedError } from "./route.handlers/handleGetMyFavorites";

export async function GET(_request: NextRequest) {
  try {
    const result = await handleGetMyFavorites({});
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    console.error("GET /my/favorites error:", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
