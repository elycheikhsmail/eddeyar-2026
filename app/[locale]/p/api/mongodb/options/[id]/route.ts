import { NextRequest, NextResponse } from "next/server";
import { updateOption, toNullableNumber, toNumberOrDefault } from "../../_lib";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);
    const body = await request.json();
    const { name, nameAr, priority = 1, tag, depth, parentID } = body;

    if (!Number.isFinite(id) || !name || !depth) {
      return new NextResponse("Champs obligatoires manquants", { status: 400 });
    }

    const doc = await updateOption(id, {
      name: String(name),
      nameAr: nameAr == null ? null : String(nameAr),
      priority: toNumberOrDefault(priority, 1),
      tag: tag == null ? null : String(tag),
      depth: toNumberOrDefault(depth, 0),
      parentId: toNullableNumber(parentID),
    });

    if (!doc) return new NextResponse("Option introuvable", { status: 404 });
    return NextResponse.json(doc, { status: 200 });
  } catch {
    return new NextResponse("Erreur serveur", { status: 500 });
  }
}
