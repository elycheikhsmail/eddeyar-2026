import type { HandleSendTelegramInput, HandleSendTelegramOutput } from "./handleSendTelegram.interface";

export async function handleSendTelegramReal(
  input: HandleSendTelegramInput
): Promise<HandleSendTelegramOutput> {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  console.log("TELEGRAM_BOT_TOKEN:", TELEGRAM_BOT_TOKEN);
  console.log("TELEGRAM_CHAT_ID:", TELEGRAM_CHAT_ID);

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID");
  }

  console.log("Sending message to Telegram...");

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: input.msg }),
  });

  console.log("Telegram response status:", res.status);

  const data = await res.json();
  return { ok: true, data };
}
