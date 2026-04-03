import { NextRequest, NextResponse } from "next/server";
import { handleOtpVerify } from "./route.handlers/handleOtpVerify";

export async function POST(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const userId = String(body.userId ?? "").trim();
    const code = String(body.code ?? "").trim();
    const result = await handleOtpVerify({ userId, code });
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("Error verifying OTP:", err);
    const status = err?.status ?? 500;
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status }
    );
  }
}
