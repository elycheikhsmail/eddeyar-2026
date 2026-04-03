import type { HandleSendTelegramInput, HandleSendTelegramOutput } from "./handleSendTelegram.interface";

export async function handleSendTelegramMocked(
  _input: HandleSendTelegramInput
): Promise<HandleSendTelegramOutput> {
  return { ok: true, data: { result: { message_id: 1, text: "mock" } } };
}
