// app/[locale]/api/p/users/reset-password/route.ts
import { NextResponse } from "next/server";
import { handleResetPassword, BadRequestError, NotFoundError } from "./route.handlers/handleResetPassword";

// Force dynamic to prevent caching in production
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { contact, otp, password } = await req.json();
    const result = await handleResetPassword({ contact, otp, password });
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof BadRequestError) return NextResponse.json({ error: e.message }, { status: 400 });
    if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 });
    console.error("Reset-password error:", e);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }
}
