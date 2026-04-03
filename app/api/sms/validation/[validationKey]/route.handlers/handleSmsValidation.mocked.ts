import type {
  HandleSmsValidationInput,
  HandleSmsValidationOutput,
} from "./handleSmsValidation.interface";

export async function handleSmsValidationMocked(
  _input: HandleSmsValidationInput
): Promise<HandleSmsValidationOutput> {
  return {
    code: 200,
    message: "SMS envoyé avec succès.",
    data: { key: "mock-key", phone: "36000000", status: "DELIVERED" },
    success: true,
  };
}
