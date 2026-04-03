import { NextResponse } from "next/server";
import { handleMailVerify } from "./route.handlers/handleMailVerify";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token manquant" }, { status: 400 });
  try {
    const result = await handleMailVerify({ token, requestUrl: request.url });
    if (result.type === "redirect") return NextResponse.redirect(new URL(result.url, request.url));
    return NextResponse.json({ error: result.message }, { status: result.status });
  } catch (error: any) {
    console.error("Erreur vérification email:", error);
    return NextResponse.json(
      { error: error?.message || "Erreur lors de la vérification" },
      { status: 500 }
    );
  }
}
