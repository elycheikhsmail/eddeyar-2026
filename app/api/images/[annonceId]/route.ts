export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { handleGetImages } from "./route.handlers/handleGetImages";
import { handlePostImages } from "./route.handlers/handlePostImages";
import { handleDeleteImage } from "./route.handlers/handleDeleteImage";

// ---------- GET ----------
export async function GET(_request: NextRequest, ctx: any) {
  try {
    const params = await ctx.params;
    const { annonceId } = params as { annonceId: string };
    const result = await handleGetImages({ annonceId });
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("GET images error:", err);
    const status = err?.status ?? 500;
    return NextResponse.json(
      { error: err?.message ?? "Erreur lors de la récupération des images" },
      { status }
    );
  }
}

// ---------- POST ----------
export async function POST(request: NextRequest, ctx: any) {
  try {
    const params = await ctx.params;
    const { annonceId } = params as { annonceId: string };
    const result = await handlePostImages({ request, annonceId });
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Upload images error:", err);
    const status = err?.status ?? 500;
    return NextResponse.json(
      {
        error: err?.message ?? "Échec de l'upload des images",
        details: err?.status ? undefined : String(err?.message ?? err),
      },
      { status }
    );
  }
}

// ---------- DELETE ----------
export async function DELETE(request: NextRequest, ctx: any) {
  try {
    const params = await ctx.params;
    const { annonceId } = params as { annonceId: string };
    const result = await handleDeleteImage({ request, annonceId });
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("DELETE image error:", err);
    const status = err?.status ?? 500;
    return NextResponse.json(
      {
        error: err?.message ?? "Échec de la suppression",
        details: err?.status ? undefined : String(err?.message ?? err),
      },
      { status }
    );
  }
}
