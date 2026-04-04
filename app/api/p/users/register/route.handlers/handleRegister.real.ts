import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../../../../../../lib/db";
import { users, contacts } from "../../../../../../lib/schema";
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
  if (!/\S+@\S+\.\S+/.test(email)) throw new BadRequestError("email invalide");
  if (password.length < 6) throw new BadRequestError("password trop court");

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) throw new BadRequestError("Email already exists");

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

  await db.insert(contacts).values({
    userId: newUser.id,
    contact,
    contactType: "phone",
    createdAt: new Date(),
    isActive: false,
    isVerified: false,
    verifyCode: crypto.randomUUID(),
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
      id: String(newUser.id),
      email: newUser.email,
      roleName: newUser.roleName ?? "",
      emailVerified: newUser.emailVerified,
      samsar,
    },
  };
}
