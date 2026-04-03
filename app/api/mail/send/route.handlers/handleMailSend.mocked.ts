import type { HandleMailSendInput, HandleMailSendOutput } from "./handleMailSend.interface";

export async function handleMailSendMocked(
  _input: HandleMailSendInput
): Promise<HandleMailSendOutput> {
  return { message: "Mail API is not implemented yet", status: 501 };
}
