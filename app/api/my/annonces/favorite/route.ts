export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { handleGetFavoriteAnnonces, UnauthorizedError } from "./route.handlers/handleGetFavoriteAnnonces";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  try {
    const result = await handleGetFavoriteAnnonces({
      page: searchParams.get("page") || undefined,
    });
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Error fetching favorite annonces:", e);
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
  }
}
