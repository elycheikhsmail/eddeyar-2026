import { NextResponse } from "next/server";
import {
  handleConnexion,
  BadRequestError,
  UnauthorizedError,
} from "./route.handlers/handleConnexion";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await handleConnexion({ email: body.email, password: body.password });
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof BadRequestError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    if (e instanceof UnauthorizedError)
      return NextResponse.json({ error: e.message }, { status: 401 });
    console.error("POST connexion error:", e);
    return NextResponse.json({ error: "Erreur lors de la connexion" }, { status: 500 });
  }
}
