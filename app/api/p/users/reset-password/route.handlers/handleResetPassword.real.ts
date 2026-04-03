import { getDb } from "../../../../../../lib/mongodb";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import type { HandleResetPasswordInput, HandleResetPasswordOutput } from "./handleResetPassword.interface";

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

export async function handleResetPasswordReal(
  input: HandleResetPasswordInput
): Promise<HandleResetPasswordOutput> {
  const { contact, otp, password } = input;

  if (!contact || !otp || !password) {
    throw new BadRequestError("Numéro de téléphone, code OTP et nouveau mot de passe requis.");
  }

  if (password.length < 4) {
    throw new BadRequestError("Le mot de passe doit contenir au moins 4 caractères.");
  }

  const db = await getDb();

  const reset = await db.collection("password_resets").findOne({
    contact,
    otpCode: otp,
    used: false,
  });

  if (!reset) {
    throw new BadRequestError("Code OTP invalide.");
  }

  if (reset.expiresAt && reset.expiresAt < new Date()) {
    await db
      .collection("password_resets")
      .updateOne({ _id: reset._id }, { $set: { used: true, expiredAt: new Date() } });
    throw new BadRequestError("Code OTP expiré. Veuillez demander un nouveau code.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const updateRes = await db
    .collection("users")
    .updateOne(
      { _id: new ObjectId(String(reset.userId)) },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );

  if (updateRes.matchedCount === 0) {
    throw new NotFoundError("Utilisateur introuvable.");
  }

  await db
    .collection("password_resets")
    .updateOne({ _id: reset._id }, { $set: { used: true, usedAt: new Date() } });

  return { message: "Mot de passe réinitialisé avec succès." };
}
