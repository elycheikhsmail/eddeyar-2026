import { NextRequest, NextResponse } from "next/server";
import { handleGetAnnonces } from "./route.handlers/handleGetAnnonces";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  try {
    const data = await handleGetAnnonces({
      page: searchParams.get("page") || undefined,
      typeAnnonceId: searchParams.get("typeAnnonceId") || undefined,
      categorieId: searchParams.get("categorieId") || undefined,
      subCategorieId: searchParams.get("subCategorieId") || undefined,
      price: searchParams.get("price") || undefined,
      wilayaId: searchParams.get("wilayaId") || undefined,
      moughataaId: searchParams.get("moughataaId") || undefined,
      issmar: searchParams.get("issmar") || undefined,
      directNegotiation: searchParams.get("directNegotiation") || undefined,
      mainChoice: (searchParams.get("mainChoice") as any) || undefined,
      subChoice: (searchParams.get("subChoice") as any) || undefined,
      aiQuery: searchParams.get("aiQuery") || undefined,
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching annonces:", error);
    return NextResponse.json({ error: "Failed to fetch annonces" }, { status: 500 });
  }
}
