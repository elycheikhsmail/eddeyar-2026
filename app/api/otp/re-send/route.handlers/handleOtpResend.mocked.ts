import type { HandleOtpResendInput, HandleOtpResendOutput } from "./handleOtpResend.interface";

export async function handleOtpResendMocked(
  _input: HandleOtpResendInput
): Promise<HandleOtpResendOutput> {
  return { message: "OTP resent successfully" };
}
