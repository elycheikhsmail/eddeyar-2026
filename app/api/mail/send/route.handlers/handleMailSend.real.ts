import { sendVerificationEmail } from "../../../../../lib/mailer";
import type { HandleMailSendInput, HandleMailSendOutput } from "./handleMailSend.interface";

export async function handleMailSendReal(
  _input: HandleMailSendInput
): Promise<HandleMailSendOutput> {
  await sendVerificationEmail("onboard@gmail.com", "test-token");
  return { message: "Mail API is not implemented yet", status: 501 };
}
