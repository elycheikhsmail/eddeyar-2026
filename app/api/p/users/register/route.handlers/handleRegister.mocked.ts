import type { HandleRegisterInput, HandleRegisterOutput } from "./handleRegister.interface";

export async function handleRegisterMocked(
  _input: HandleRegisterInput
): Promise<HandleRegisterOutput> {
  return {
    message: "User registered successfully",
    user: {
      id: "mock-id",
      email: "test@example.com",
      roleName: "user",
      emailVerified: false,
      samsar: false,
    },
  };
}
