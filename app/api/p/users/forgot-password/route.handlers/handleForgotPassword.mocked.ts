import type { HandleForgotPasswordInput, HandleForgotPasswordOutput } from "./handleForgotPassword.interface";

export async function handleForgotPasswordMocked(
  _input: HandleForgotPasswordInput
): Promise<HandleForgotPasswordOutput> {
  return { message: "Un SMS contenant le code de vérification a été envoyé." };
}
