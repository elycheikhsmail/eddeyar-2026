import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { eq, and, sql } from "drizzle-orm";
import { db } from "../../../../../lib/db";
import { contacts, users, userSessions } from "../../../../../lib/schema";
import type { HandleOtpVerifyInput, HandleOtpVerifyOutput } from "./handleOtpVerify.interface";

export class BadRequestError extends Error {
  status = 400;
  constructor(message: string) { super(message); this.name = "BadRequestError"; }
}
export class NotFoundError extends Error {
  status = 404;
  constructor(message: string) { super(message); this.name = "NotFoundError"; }
}
export class TooManyRequestsError extends Error {
  status = 429;
  constructor(message: string) { super(message); this.name = "TooManyRequestsError"; }
}

export async function handleOtpVerifyReal(
  input: HandleOtpVerifyInput
): Promise<HandleOtpVerifyOutput> {
  const { userId, code } = input;
  if (!userId || !code) throw new BadRequestError("userId and code are required");

  const uid = parseInt(String(userId), 10);
  if (isNaN(uid)) throw new BadRequestError("userId invalide");

  const [contactDoc] = await db.select().from(contacts).where(eq(contacts.userId, uid)).limit(1);
  if (!contactDoc) throw new NotFoundError("Contact not found");
  if (contactDoc.isVerified) throw new BadRequestError("Contact already verified");
  if (contactDoc.verifyAttempts >= 5) throw new TooManyRequestsError("Too many verification attempts");

  const expiresAt = contactDoc.verifyTokenExpires;
  if (!expiresAt || expiresAt < new Date()) throw new BadRequestError("OTP expired");

  if (String(contactDoc.verifyCode) !== String(code)) {
    await db
      .update(contacts)
      .set({ verifyAttempts: sql`${contacts.verifyAttempts} + 1` })
      .where(eq(contacts.id, contactDoc.id));
    throw new BadRequestError("Invalid OTP code");
  }

  await db
    .update(contacts)
    .set({ isActive: true, isVerified: true, verifyAttempts: 0, verifyTokenExpires: null })
    .where(eq(contacts.id, contactDoc.id));

  const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
  if (user) {
    await db.update(users).set({ isActive: true, lastLogin: new Date() }).where(eq(users.id, user.id));
    await db.update(userSessions).set({ isExpired: true }).where(and(eq(userSessions.userId, user.id), eq(userSessions.isExpired, false)));

    if (process.env.JWT_SECRET) {
      const sessionToken = uuidv4();
      const token = jwt.sign(
        { id: String(user.id), email: user.email, roleName: user.roleName, roleId: user.roleId, sessionToken },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      await db.insert(userSessions).values({ userId: user.id, token, isExpired: false, lastAccessed: new Date(), createdAt: new Date() });

      const cookieStore = await cookies();
      cookieStore.set({ name: "jwt", value: token, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 86400, path: "/" });
      cookieStore.set({ name: "user", value: String(user.id), path: "/" });
    }
  }

  return { message: "Phone verified successfully" };
}
