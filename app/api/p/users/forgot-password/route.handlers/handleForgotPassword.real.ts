import { eq, and, gt, sql } from "drizzle-orm";
import { db } from "../../../../../../lib/db";
import { contacts, passwordResets } from "../../../../../../lib/schema";
import type { HandleForgotPasswordInput, HandleForgotPasswordOutput } from "./handleForgotPassword.interface";

const CHINGUI_KEY = process.env.CHINGUISOFT_VALIDATION_KEY;
const CHINGUI_TOKEN = process.env.CHINGUISOFT_VALIDATION_TOKEN;

export class BadRequestError extends Error {
  constructor(msg: string) { super(msg); this.name = "BadRequestError"; }
}
export class NotFoundError extends Error {
  constructor(msg: string) { super(msg); this.name = "NotFoundError"; }
}
export class TooManyRequestsError extends Error {
  constructor(msg: string) { super(msg); this.name = "TooManyRequestsError"; }
}
export class InternalError extends Error {
  constructor(msg: string) { super(msg); this.name = "InternalError"; }
}

function isValidChinguPhone(p: string) { return /^[234]\d{7}$/.test(p); }

export async function handleForgotPasswordReal(
  input: HandleForgotPasswordInput
): Promise<HandleForgotPasswordOutput> {
  const { contact } = input;
  if (!contact) throw new BadRequestError("Numéro de téléphone requis");
  if (!isValidChinguPhone(contact)) throw new BadRequestError("Numéro invalide — doit commencer par 2, 3 ou 4 et contenir 8 chiffres");

  const [contactDoc] = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.contact, contact), eq(contacts.isVerified, true)))
    .limit(1);

  if (!contactDoc) throw new NotFoundError("Ce numéro de téléphone n'est pas associé à un compte vérifié.");

  // Rate limiting : max 5 requêtes par heure
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(passwordResets)
    .where(and(eq(passwordResets.contact, contact), gt(passwordResets.createdAt, oneHourAgo)));

  if (count >= 5) throw new TooManyRequestsError("Trop de tentatives reçues. Veuillez réessayer plus tard.");

  // Invalider les anciens resets
  await db
    .update(passwordResets)
    .set({ used: true, invalidatedAt: new Date() })
    .where(and(eq(passwordResets.contact, contact), eq(passwordResets.used, false)));

  if (!CHINGUI_KEY || !CHINGUI_TOKEN) {
    throw new InternalError("Service SMS non configuré. Contactez l'administrateur.");
  }

  try {
    const resp = await fetch(`https://chinguisoft.com/api/sms/validation/${encodeURIComponent(CHINGUI_KEY)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Validation-token": CHINGUI_TOKEN },
      body: JSON.stringify({ phone: contact, lang: "fr" }),
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      console.error("Chinguisoft error sending OTP:", resp.status, errText);
      throw new InternalError("Impossible d'envoyer le SMS. Réessayez plus tard.");
    }

    const chinguJson = await resp.json();
    const otpCode = String(chinguJson.code ?? "");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.insert(passwordResets).values({
      userId: contactDoc.userId,
      contact,
      token: otpCode,
      otpCode,
      used: false,
      createdAt: new Date(),
      expiresAt,
    });

    return { message: "Un SMS contenant le code de vérification a été envoyé." };
  } catch (err) {
    if (err instanceof InternalError) throw err;
    console.error("Error sending password reset OTP:", err);
    throw new InternalError("Erreur lors de l'envoi du SMS. Réessayez plus tard.");
  }
}
