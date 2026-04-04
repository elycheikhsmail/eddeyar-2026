import { after } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { eq, and } from "drizzle-orm";
import { db } from "../../../../../../../lib/db";
import { users, contacts } from "../../../../../../../lib/schema";
import { Roles } from "../../../../../../../DATA/roles";
import type { HandleRegisterPhoneInput, HandleRegisterPhoneOutput } from "./handleRegisterPhone.interface";

const CHINGUI_KEY = String(process.env.CHINGUISOFT_VALIDATION_KEY);
const CHINGUI_TOKEN = String(process.env.CHINGUISOFT_VALIDATION_TOKEN);
const SMS_OTP_URL = String(process.env.SMS_OTP_URL);

export class BadRequestError extends Error {
  constructor(msg: string) { super(msg); this.name = "BadRequestError"; }
}

function isValidChinguPhone(p: string) { return /^[234]\d{7}$/.test(p); }

export async function handleRegisterPhoneReal(
  input: HandleRegisterPhoneInput
): Promise<HandleRegisterPhoneOutput> {
  const email = String(input.email ?? "").trim().toLowerCase();
  const password = String(input.password ?? "");
  const contact = String(input.contact ?? "").trim();
  const samsar = input.samsar;

  if (!email || !password || !contact || typeof samsar !== "boolean") {
    throw new BadRequestError("email, password, contact et samsar (boolean) sont requis");
  }
  if (!/\S+@\S+\.\S+/.test(email)) throw new BadRequestError("email invalide");
  if (!isValidChinguPhone(contact)) throw new BadRequestError("contact invalide — doit commencer par 2,3 ou 4 et contenir 8 chiffres");

  // Vérifie si le contact (téléphone) existe déjà
  const [existingContact] = await db
    .select()
    .from(contacts)
    .where(eq(contacts.contact, contact))
    .limit(1);

  if (existingContact) {
    if (existingContact.isVerified) {
      throw new BadRequestError("le numéro de téléphone existe déjà");
    } else {
      // Supprimer le contact non vérifié et son user
      await db.delete(contacts).where(eq(contacts.id, existingContact.id));
      await db.delete(users).where(eq(users.id, existingContact.userId));
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verifyToken = crypto.randomUUID();
  const verifyTokenExpires = new Date(Date.now() + 30 * 60 * 1000);

  const [newUser] = await db
    .insert(users)
    .values({
      email,
      password: hashedPassword,
      roleId: String(Roles[1].id),
      roleName: samsar ? "samsar" : Roles[1].name,
      createdAt: new Date(),
      isActive: false,
      emailVerified: false,
      verifyToken,
      verifyTokenExpires,
    })
    .returning({ id: users.id, email: users.email, roleName: users.roleName, emailVerified: users.emailVerified });

  const otpCode = "1234";
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await db.insert(contacts).values({
    userId: newUser.id,
    contact,
    contactType: "phone",
    createdAt: new Date(),
    isActive: false,
    isVerified: false,
    verifyCode: otpCode,
    verifyTokenExpires: expiresAt,
    verifyAttempts: 0,
  });

  const userResult = {
    id: String(newUser.id),
    email: newUser.email,
    roleName: newUser.roleName ?? "",
    emailVerified: newUser.emailVerified,
    samsar,
  };

  if (!CHINGUI_KEY || !CHINGUI_TOKEN) {
    console.error("Chinguisoft env vars not set");
    return { message: "User registered but OTP could not be sent (SMS credentials missing).", user: userResult };
  }

  try {
    const chinguUrl = `${SMS_OTP_URL}/${encodeURIComponent(CHINGUI_KEY)}`;
    const resp = await fetch(chinguUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Validation-token": CHINGUI_TOKEN },
      body: JSON.stringify({ phone: contact, lang: "fr" }),
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      console.error("Chinguisoft error:", resp.status, errText);
      return { message: "User registered but OTP could not be sent (SMS provider error).", user: userResult };
    }

    after(async () => {
      const json = await resp.json();
      console.log("Chinguisoft OTP sent, balance:", json.balance);
    });

    return { message: "User registered successfully. OTP sent to phone.", user: userResult };
  } catch (smsErr) {
    console.error("Error sending OTP:", smsErr);
    return { message: "User registered but OTP sending failed (internal).", user: userResult };
  }
}
