import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { getDb } from "../../../../../../lib/mongodb";
import { Roles } from "../../../../../../DATA/roles";
import { sendVerificationEmail } from "../../../../../../lib/mailer";
import type { HandleRegisterInput, HandleRegisterOutput } from "./handleRegister.interface";

export class BadRequestError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "BadRequestError";
  }
}

export async function handleRegisterReal(
  input: HandleRegisterInput
): Promise<HandleRegisterOutput> {
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
  if (password.length < 6) {
    throw new BadRequestError("password trop court");
  }

  const db = await getDb();
  const existing = await db.collection("users").findOne({ email });
  if (existing) {
    throw new BadRequestError("Email already exists");
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
  await db.collection("contacts").insertOne({
    userId: insertedId.toString(),
    contact,
    createdAt: new Date(),
    isActive: false,
    isVerified: false,
    verifyCode: tokenContact,
    verifyTokenExpires: null,
  });

  try {
    const mailResult = await sendVerificationEmail(email, verifyToken);
    if (!mailResult?.ok) console.error("Email send failed (register):::", mailResult?.error);
  } catch (e) {
    console.error("sendVerificationEmail crashed", e);
  }

  return {
    message: "User registered successfully",
    user: {
      id: insertedId.toString(),
      email,
      roleName: userDoc.roleName,
      emailVerified: userDoc.emailVerified,
      samsar,
    },
  };
}
