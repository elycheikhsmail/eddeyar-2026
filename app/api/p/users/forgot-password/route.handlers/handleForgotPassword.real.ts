import { getDb } from "../../../../../../lib/mongodb";
import type { HandleForgotPasswordInput, HandleForgotPasswordOutput } from "./handleForgotPassword.interface";

const CHINGUI_KEY = process.env.CHINGUISOFT_VALIDATION_KEY;
const CHINGUI_TOKEN = process.env.CHINGUISOFT_VALIDATION_TOKEN;

export class BadRequestError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "BadRequestError";
  }
}

export class NotFoundError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "NotFoundError";
  }
}

export class TooManyRequestsError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "TooManyRequestsError";
  }
}

export class InternalError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "InternalError";
  }
}

function isValidChinguPhone(p: string): boolean {
  return /^[234]\d{7}$/.test(p);
}

export async function handleForgotPasswordReal(
  input: HandleForgotPasswordInput
): Promise<HandleForgotPasswordOutput> {
  const { contact } = input;

  if (!contact) {
    throw new BadRequestError("Numéro de téléphone requis");
  }
  if (!isValidChinguPhone(contact)) {
    throw new BadRequestError(
      "Numéro invalide — doit commencer par 2, 3 ou 4 et contenir 8 chiffres"
    );
  }

  const db = await getDb();
  const contacts = db.collection("contacts");
  const resets = db.collection("password_resets");

  const contactDoc = await contacts.findOne({ contact, isVerified: true });
  if (!contactDoc || !contactDoc.userId) {
    throw new NotFoundError("Ce numéro de téléphone n'est pas associé à un compte vérifié.");
  }

  const recentRequests = await resets.countDocuments({
    contact,
    createdAt: { $gt: new Date(Date.now() - 60 * 60 * 1000) },
  });
  if (recentRequests >= 5) {
    throw new TooManyRequestsError("Trop de tentatives reçues. Veuillez réessayer plus tard.");
  }

  await resets.updateMany(
    { contact, used: { $ne: true } },
    { $set: { used: true, invalidatedAt: new Date() } }
  );

  if (!CHINGUI_KEY || !CHINGUI_TOKEN) {
    console.error("Chinguisoft env vars not set for password reset");
    throw new InternalError("Service SMS non configuré. Contactez l'administrateur.");
  }

  try {
    const chinguUrl = `https://chinguisoft.com/api/sms/validation/${encodeURIComponent(CHINGUI_KEY)}`;
    const payload = { phone: contact, lang: "fr" };
    const resp = await fetch(chinguUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Validation-token": CHINGUI_TOKEN },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      console.error("Chinguisoft error sending OTP:", resp.status, errText);
      throw new InternalError("Impossible d'envoyer le SMS. Réessayez plus tard.");
    }

    const chinguJson = await resp.json();
    const otpCode = String(chinguJson.code ?? "");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await resets.insertOne({
      userId: contactDoc.userId,
      contact,
      token: otpCode,
      otpCode,
      used: false,
      createdAt: new Date(),
      expiresAt,
    });

    return { message: "Un SMS contenant le code de vérification a été envoyé." };
  } catch (smsErr) {
    if (smsErr instanceof InternalError) throw smsErr;
    console.error("Error sending password reset OTP:", smsErr);
    throw new InternalError("Erreur lors de l'envoi du SMS. Réessayez plus tard.");
  }
}
