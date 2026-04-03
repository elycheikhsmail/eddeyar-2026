import { NextResponse } from "next/server";
import { handlePostSearch } from "./route.handlers/handlePostSearch";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await handlePostSearch({ body });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Erreur search:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
