import { NextRequest, NextResponse } from "next/server";
import { handleRegisterPhone, BadRequestError } from "./route.handlers/handleRegisterPhone";

export async function POST(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const result = await handleRegisterPhone({
      email: body.email,
      password: body.password,
      contact: body.contact,
      samsar: body.samsar,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    if (e instanceof BadRequestError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    console.error("POST register/phone error:", e);
    if ((e as any)?.code === 11000 || (e as any)?.codeName === "DuplicateKey") {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
