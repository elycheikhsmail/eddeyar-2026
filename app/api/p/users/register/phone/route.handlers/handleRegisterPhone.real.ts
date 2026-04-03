import { after } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { ObjectId } from "mongodb";
import { getDb } from "../../../../../../../lib/mongodb";
import { Roles } from "../../../../../../../DATA/roles";
import type { HandleRegisterPhoneInput, HandleRegisterPhoneOutput } from "./handleRegisterPhone.interface";

const CHINGUI_KEY = String(process.env.CHINGUISOFT_VALIDATION_KEY);
const CHINGUI_TOKEN = String(process.env.CHINGUISOFT_VALIDATION_TOKEN);
const SMS_OTP_URL = String(process.env.SMS_OTP_URL);

export class BadRequestError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "BadRequestError";
  }
}

function isValidChinguPhone(p: string): boolean {
  return /^[234]\d{7}$/.test(p);
}

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
  if (!/\S+@\S+\.\S+/.test(email)) {
    throw new BadRequestError("email invalide");
  }
  if (!isValidChinguPhone(contact)) {
    throw new BadRequestError(
      "contact invalide — doit commencer par 2,3 ou 4 et contenir 8 chiffres"
    );
  }

  const db = await getDb();

  const existingContact = await db.collection("contacts").findOne({ contact });
  if (existingContact) {
    if (existingContact.isVerified) {
      throw new BadRequestError("le numéro de téléphone existe déjà");
    } else {
      await db.collection("contacts").deleteOne({ _id: existingContact._id });
      if (existingContact.userId) {
        try {
          await db.collection("users").deleteOne({ _id: new ObjectId(existingContact.userId) });
        } catch (e) {
          console.error("Error deleting unverified user:", e);
        }
      }
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verifyToken = crypto.randomUUID();
  const verifyTokenExpires = new Date(Date.now() + 30 * 60 * 1000);

  const userDoc = {
    email,
    samsar,
    password: hashedPassword,
    roleId: String(Roles[1].id),
    roleName: Roles[1].name,
    createdAt: new Date(),
    lastLogin: null,
    isActive: false,
    emailVerified: false,
    verifyToken,
    verifyTokenExpires,
  };

  const { insertedId } = await db.collection("users").insertOne(userDoc);

  const tokenContact = crypto.randomUUID();
  const contactDoc = {
    userId: insertedId.toString(),
    contact,
    createdAt: new Date(),
    isActive: false,
    isVerified: false,
    verifyCode: tokenContact,
    verifyTokenExpires: null,
    verifyAttempts: 0,
  };
  const contactInsert = await db.collection("contacts").insertOne(contactDoc);
  const otpCode = "1234";
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await db.collection("contacts").updateOne(
    { _id: contactInsert.insertedId },
    { $set: { verifyCode: otpCode, verifyTokenExpires: expiresAt, verifyAttempts: 0 } }
  );

  const userResult = {
    id: insertedId.toString(),
    email,
    roleName: userDoc.roleName,
    emailVerified: userDoc.emailVerified,
    samsar,
  };

  if (!CHINGUI_KEY || !CHINGUI_TOKEN) {
    console.error("Chinguisoft env vars not set");
    return {
      message: "User registered but OTP could not be sent (SMS credentials missing).",
      user: userResult,
    };
  }

  try {
    const chinguUrl = `${SMS_OTP_URL}/${encodeURIComponent(CHINGUI_KEY)}`;
    const payload = { phone: contact, lang: "fr" };
    const resp = await fetch(chinguUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Validation-token": CHINGUI_TOKEN },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      console.error("Chinguisoft error sending OTP:", resp.status, errText);
      return {
        message: "User registered but OTP could not be sent (SMS provider error).",
        user: userResult,
      };
    }

    after(async () => {
      const chinguJson = await resp.json();
      console.log("Chinguisoft OTP sent, balance:", chinguJson.balance);
    });

    return {
      message: "User registered successfully. OTP sent to phone.",
      user: userResult,
    };
  } catch (smsErr) {
    console.error("Error sending OTP:", smsErr);
    return {
      message: "User registered but OTP sending failed (internal).",
      user: userResult,
    };
  }
}
