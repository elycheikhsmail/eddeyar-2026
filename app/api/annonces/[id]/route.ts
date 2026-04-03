import { NextResponse } from "next/server";
import { handleGetAnnonceById, NotFoundError } from "./route.handlers/handleGetAnnonceById";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const result = await handleGetAnnonceById({ id });
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 });
    console.error("Error fetching annonce by id:", e);
    return NextResponse.json({ error: "Failed to fetch annonce" }, { status: 500 });
  }
}
