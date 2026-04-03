import type { HandleLogoutInput, HandleLogoutOutput } from "./handleLogout.interface";

export async function handleLogoutMocked(
  _input: HandleLogoutInput
): Promise<HandleLogoutOutput> {
  return { message: "Déconnexion réussie" };
}
