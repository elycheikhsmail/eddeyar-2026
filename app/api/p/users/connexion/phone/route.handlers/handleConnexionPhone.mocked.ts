import type { HandleConnexionPhoneInput, HandleConnexionPhoneOutput } from "./handleConnexionPhone.interface";

export async function handleConnexionPhoneMocked(
  _input: HandleConnexionPhoneInput
): Promise<HandleConnexionPhoneOutput> {
  return {
    message: "Connexion réussie",
    user: { id: "mock-user-id", email: "demo@eddeyar.mr", roleName: "user" },
    sessionId: "mock-session",
    token: "mock-jwt-token",
  };
}
