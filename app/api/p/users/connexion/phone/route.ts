import { NextResponse } from "next/server";
import {
  handleConnexionPhone,
  BadRequestError,
  UnauthorizedError,
} from "./route.handlers/handleConnexionPhone";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await handleConnexionPhone({ phone: body.phone, password: body.password });
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof BadRequestError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    if (e instanceof UnauthorizedError)
      return NextResponse.json({ error: e.message }, { status: 401 });
    console.error("POST connexion/phone error:", e);
    return NextResponse.json({ error: "Erreur lors de la connexion" }, { status: 500 });
  }
}
