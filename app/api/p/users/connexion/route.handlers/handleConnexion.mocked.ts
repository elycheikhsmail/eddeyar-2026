import type { HandleConnexionInput, HandleConnexionOutput } from "./handleConnexion.interface";

export async function handleConnexionMocked(
  _input: HandleConnexionInput
): Promise<HandleConnexionOutput> {
  return {
    message: "Connexion réussie",
    user: { id: "mock-user-id", email: "demo@eddeyar.mr", roleName: "user" },
    sessionId: "mock-session",
    token: "mock-jwt-token",
  };
}
