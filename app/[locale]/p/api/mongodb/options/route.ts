import { NextRequest, NextResponse } from "next/server";
import {
  getOptions,
  createOption,
  toNullableNumber,
  toNumberOrDefault,
} from "../_lib";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = toNullableNumber(searchParams.get("parentId"));
    const rows = await getOptions(parentId);
    return NextResponse.json(rows);
  } catch {
    return new NextResponse("Erreur serveur", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, nameAr, priority = 1, tag, depth, parentID } = body;

    if (!name || !depth) {
      return new NextResponse("Champs obligatoires manquants", { status: 400 });
    }

    const doc = await createOption({
      name: String(name),
      nameAr: nameAr == null ? null : String(nameAr),
      priority: toNumberOrDefault(priority, 1),
      tag: tag == null ? null : String(tag),
      depth: toNumberOrDefault(depth, 0),
      parentId: toNullableNumber(parentID),
    });

    return NextResponse.json(doc, { status: 201 });
  } catch {
    return new NextResponse("Erreur serveur", { status: 500 });
  }
}
