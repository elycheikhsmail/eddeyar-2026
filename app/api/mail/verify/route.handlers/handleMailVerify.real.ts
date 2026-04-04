import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { eq, and } from "drizzle-orm";
import { db } from "../../../../../lib/db";
import { users, userSessions } from "../../../../../lib/schema";
import type { HandleMailVerifyInput, HandleMailVerifyOutput } from "./handleMailVerify.interface";

export async function handleMailVerifyReal(
  input: HandleMailVerifyInput
): Promise<HandleMailVerifyOutput> {
  const { token: tokenFromEmail } = input;
  const now = new Date();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.verifyToken, tokenFromEmail))
    .limit(1);

  if (!user) return { type: "error", message: "Token invalide ou expiré", status: 401 };

  await db
    .update(users)
    .set({ isActive: true, emailVerified: true, lastLogin: now, verifyToken: null, verifyTokenExpires: null })
    .where(eq(users.id, user.id));

  await db
    .update(userSessions)
    .set({ isExpired: true })
    .where(and(eq(userSessions.userId, user.id), eq(userSessions.isExpired, false)));

  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET non défini");

  const sessionToken = uuidv4();
  const jwtToken = jwt.sign(
    { id: String(user.id), email: user.email, roleName: user.roleName, roleId: user.roleId, sessionToken },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  await db.insert(userSessions).values({
    userId: user.id,
    token: jwtToken,
    isExpired: false,
    lastAccessed: now,
    createdAt: now,
  });

  const cookieStore = await cookies();
  cookieStore.set({ name: "jwt", value: jwtToken, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 86400, path: "/" });
  cookieStore.set({ name: "user", value: String(user.id), httpOnly: false, sameSite: "lax", maxAge: 86400, path: "/" });

  return { type: "redirect", url: "/ar" };
}
