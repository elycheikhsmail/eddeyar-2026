import { cookies } from "next/headers";
import type { HandleLogoutInput, HandleLogoutOutput } from "./handleLogout.interface";

export async function handleLogoutReal(
  _input: HandleLogoutInput
): Promise<HandleLogoutOutput> {
  const cookieStore = await cookies();
  cookieStore.delete("jwt");
  cookieStore.delete("user");
  return { message: "Déconnexion réussie" };
}
