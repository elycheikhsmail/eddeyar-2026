import type {
  HandleMailVerifyInput,
  HandleMailVerifyOutput,
} from "./handleMailVerify.interface";

export async function handleMailVerifyMocked(
  _input: HandleMailVerifyInput
): Promise<HandleMailVerifyOutput> {
  return { type: "redirect", url: "/ar" };
}
