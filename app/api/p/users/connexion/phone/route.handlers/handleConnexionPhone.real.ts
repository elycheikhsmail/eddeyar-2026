import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { eq, and } from "drizzle-orm";
import { db } from "../../../../../../../lib/db";
import { users, contacts, userSessions } from "../../../../../../../lib/schema";
import type { HandleConnexionPhoneInput, HandleConnexionPhoneOutput } from "./handleConnexionPhone.interface";

export class BadRequestError extends Error {
  constructor(msg: string) { super(msg); this.name = "BadRequestError"; }
}
export class UnauthorizedError extends Error {
  constructor(msg: string) { super(msg); this.name = "UnauthorizedError"; }
}

export async function handleConnexionPhoneReal(
  input: HandleConnexionPhoneInput
): Promise<HandleConnexionPhoneOutput> {
  const { phone, password } = input;
  if (!phone || !password) throw new BadRequestError("phone number et mot de passe requis");

  const [contactDoc] = await db
    .select()
    .from(contacts)
    .where(eq(contacts.contact, phone))
    .limit(1);

  if (!contactDoc) throw new UnauthorizedError("phone number incorrect");
  if (!contactDoc.isVerified) throw new UnauthorizedError("your phone number is not verified");

  const [user] = await db.select().from(users).where(eq(users.id, contactDoc.userId)).limit(1);
  if (!user) throw new UnauthorizedError("Utilisateur introuvable");

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new UnauthorizedError("Email ou mot de passe incorrect");

  await db
    .update(userSessions)
    .set({ isExpired: true })
    .where(and(eq(userSessions.userId, user.id), eq(userSessions.isExpired, false)));

  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET non défini");

  const sessionToken = uuidv4();
  const token = jwt.sign(
    { id: String(user.id), email: user.email, roleName: user.roleName, roleId: user.roleId, sessionToken },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  const [session] = await db
    .insert(userSessions)
    .values({ userId: user.id, token, isExpired: false, lastAccessed: new Date(), createdAt: new Date() })
    .returning({ id: userSessions.id });

  await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, user.id));

  const cookieStore = await cookies();
  cookieStore.set({ name: "jwt", value: token, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 86400, path: "/" });
  cookieStore.set({ name: "user", value: String(user.id), path: "/" });

  const { password: _, ...userWithoutPassword } = user;
  return { message: "Connexion réussie", user: userWithoutPassword, sessionId: session.id, token };
}
