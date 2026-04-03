import { NextRequest, NextResponse } from "next/server";
import { handleOtpResend, TooManyRequestsError } from "./route.handlers/handleOtpResend";

export async function POST(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const userId = String(body.userId ?? "").trim();
    const result = await handleOtpResend({ userId });
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("Resend route error", err);
    const status = err?.status ?? 500;
    const body: Record<string, any> = { error: err?.message ?? "Internal server error" };
    if (err instanceof TooManyRequestsError && err.waitSeconds != null) {
      body.waitSeconds = err.waitSeconds;
    }
    return NextResponse.json(body, { status });
  }
}
