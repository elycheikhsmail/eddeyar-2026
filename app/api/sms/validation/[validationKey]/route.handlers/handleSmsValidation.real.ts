import type {
  HandleSmsValidationInput,
  HandleSmsValidationOutput,
} from "./handleSmsValidation.interface";

interface ValidationRequest {
  phone?: string;
  lang?: string;
  code?: string | number;
}

export async function handleSmsValidationReal(
  input: HandleSmsValidationInput
): Promise<HandleSmsValidationOutput> {
  const { validationKey, request } = input;

  const token = request.headers.get("Validation-token");
  if (!token || token !== process.env.CHINGUISOFT_VALIDATION_TOKEN) {
    return {
      code: 401,
      message: "Non autorisé. Jeton de validation manquant, invalide ou expiré.",
      success: false,
    };
  }

  let body: ValidationRequest;
  try {
    body = await request.json();
  } catch {
    return { code: 422, message: "Format JSON invalide", success: false };
  }

  const { phone, lang, code } = body;

  const errors: Record<string, string> = {};
  if (!phone) {
    errors.phone = "Le numéro de téléphone est obligatoire.";
  } else if (!/^[234]\d{7}$/.test(String(phone))) {
    errors.phone = "Le numéro de téléphone est invalide.";
  }
  if (!lang) {
    errors.lang = "La langue est obligatoire.";
  } else if (lang !== "ar" && lang !== "fr") {
    errors.lang = "La langue doit être 'ar' ou 'fr'.";
  }
  if (Object.keys(errors).length > 0) {
    return {
      code: 422,
      message: "Les données fournies sont invalides.",
      errors,
      success: false,
    };
  }

  let finalCode = String(code || "");
  if (!finalCode || finalCode.trim() === "") {
    const length = Math.floor(Math.random() * 4) + 3;
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    finalCode = String(Math.floor(min + Math.random() * (max - min + 1)));
  } else {
    if (!/^\d{3,6}$/.test(finalCode)) {
      return {
        code: 422,
        message: "Le code est invalide.",
        errors: { code: "Le code doit contenir entre 3 et 6 chiffres." },
        success: false,
      };
    }
  }

  return {
    code: 200,
    message: "SMS envoyé avec succès.",
    data: { key: validationKey, phone: String(phone), status: "DELIVERED" },
    success: true,
  };
}
