import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";
import { db } from "../../../../../../lib/db";
import { passwordResets, users } from "../../../../../../lib/schema";
import type { HandleResetPasswordInput, HandleResetPasswordOutput } from "./handleResetPassword.interface";

export class BadRequestError extends Error {
  constructor(msg: string) { super(msg); this.name = "BadRequestError"; }
}
export class NotFoundError extends Error {
  constructor(msg: string) { super(msg); this.name = "NotFoundError"; }
}

export async function handleResetPasswordReal(
  input: HandleResetPasswordInput
): Promise<HandleResetPasswordOutput> {
  const { contact, otp, password } = input;
  if (!contact || !otp || !password) throw new BadRequestError("Numéro de téléphone, code OTP et nouveau mot de passe requis.");
  if (password.length < 4) throw new BadRequestError("Le mot de passe doit contenir au moins 4 caractères.");

  const [reset] = await db
    .select()
    .from(passwordResets)
    .where(and(eq(passwordResets.contact, contact), eq(passwordResets.otpCode, otp), eq(passwordResets.used, false)))
    .limit(1);

  if (!reset) throw new BadRequestError("Code OTP invalide.");
  if (reset.expiresAt < new Date()) {
    await db.update(passwordResets).set({ used: true }).where(eq(passwordResets.id, reset.id));
    throw new BadRequestError("Code OTP expiré. Veuillez demander un nouveau code.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const res = await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, reset.userId))
    .returning({ id: users.id });

  if (res.length === 0) throw new NotFoundError("Utilisateur introuvable.");

  await db.update(passwordResets).set({ used: true, usedAt: new Date() }).where(eq(passwordResets.id, reset.id));

  return { message: "Mot de passe réinitialisé avec succès." };
}
