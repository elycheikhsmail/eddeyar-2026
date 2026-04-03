import type { HandleResetPasswordInput, HandleResetPasswordOutput } from "./handleResetPassword.interface";

export async function handleResetPasswordMocked(
  _input: HandleResetPasswordInput
): Promise<HandleResetPasswordOutput> {
  return { message: "Mot de passe réinitialisé avec succès." };
}
