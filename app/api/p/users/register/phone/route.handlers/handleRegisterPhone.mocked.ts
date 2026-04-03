import type { HandleRegisterPhoneInput, HandleRegisterPhoneOutput } from "./handleRegisterPhone.interface";

export async function handleRegisterPhoneMocked(
  _input: HandleRegisterPhoneInput
): Promise<HandleRegisterPhoneOutput> {
  return {
    message: "User registered successfully. OTP sent to phone.",
    user: {
      id: "mock-id",
      email: "test@example.com",
      roleName: "user",
      emailVerified: false,
      samsar: false,
    },
  };
}
