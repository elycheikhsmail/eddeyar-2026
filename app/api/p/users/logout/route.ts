import { NextResponse } from "next/server";
import { handleLogout } from "./route.handlers/handleLogout";

export async function POST() {
  try {
    const result = await handleLogout({});
    return NextResponse.json(result);
  } catch (e) {
    console.error("POST logout error:", e);
    return NextResponse.json({ error: "Erreur lors de la déconnexion" }, { status: 500 });
  }
}
