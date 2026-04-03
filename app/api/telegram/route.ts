// app/api/telegram/route.ts
import { NextResponse } from "next/server";
import { handleSendTelegram } from "./route.handlers/handleSendTelegram";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const msg = searchParams.get("msg") || "⚠️ message vide";
  try {
    const result = await handleSendTelegram({ msg });
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
