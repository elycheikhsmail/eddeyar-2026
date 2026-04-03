import { NextResponse } from "next/server";
import {
  handleForgotPassword,
  BadRequestError,
  NotFoundError,
  TooManyRequestsError,
  InternalError,
} from "./route.handlers/handleForgotPassword";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await handleForgotPassword({ contact: body.contact });
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    if (e instanceof BadRequestError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    if (e instanceof NotFoundError)
      return NextResponse.json({ error: e.message }, { status: 404 });
    if (e instanceof TooManyRequestsError)
      return NextResponse.json({ error: e.message }, { status: 429 });
    if (e instanceof InternalError)
      return NextResponse.json({ error: e.message }, { status: 500 });
    console.error("POST forgot-password error:", e);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }
}
