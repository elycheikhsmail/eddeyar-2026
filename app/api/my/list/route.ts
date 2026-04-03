import { NextResponse } from "next/server";
import { handleGetMyList, UnauthorizedError } from "./route.handlers/handleGetMyList";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    const data = await handleGetMyList({
      page: searchParams.get("page") || undefined,
      typeAnnonceId: searchParams.get("typeAnnonceId") || undefined,
      categorieId: searchParams.get("categorieId") || undefined,
      subCategorieId: searchParams.get("subCategorieId") || undefined,
      price: searchParams.get("price") || undefined,
    });
    return NextResponse.json(data);
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Error fetching user annonces:", e);
    return NextResponse.json({ error: "Failed to fetch user annonces" }, { status: 500 });
  }
}
