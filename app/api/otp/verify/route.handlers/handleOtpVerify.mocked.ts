import type { HandleOtpVerifyInput, HandleOtpVerifyOutput } from "./handleOtpVerify.interface";

export async function handleOtpVerifyMocked(
  _input: HandleOtpVerifyInput
): Promise<HandleOtpVerifyOutput> {
  return { message: "Phone verified successfully" };
}
