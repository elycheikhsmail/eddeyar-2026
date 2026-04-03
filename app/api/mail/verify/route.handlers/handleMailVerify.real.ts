import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../../../../../lib/mongodb";
import type {
  HandleMailVerifyInput,
  HandleMailVerifyOutput,
} from "./handleMailVerify.interface";

export async function handleMailVerifyReal(
  input: HandleMailVerifyInput
): Promise<HandleMailVerifyOutput> {
  const { token: tokenFromEmail } = input;

  const db = await getDb();
  const users = db.collection("users");
  const sessions = db.collection("userSessions");

  const now = new Date();
  const user = await users.findOne({ verifyToken: tokenFromEmail });
  if (!user) {
    return { type: "error", message: "Token invalide ou expiré", status: 401 };
  }

  await users.updateOne(
    { _id: new ObjectId(user._id) },
    {
      $set: { isActive: true, emailVerified: true, lastLogin: now },
      $unset: { verifyToken: "", verifyTokenExpires: "" },
    }
  );

  const userIdStr = user._id.toString();
  await sessions.updateMany(
    { userId: userIdStr, isExpired: false },
    { $set: { isExpired: true } }
  );

  const sessionToken = uuidv4();
  if (typeof process.env.JWT_SECRET !== "string") {
    throw new Error("JWT_SECRET non défini dans l'environnement");
  }

  const jwtToken = jwt.sign(
    {
      id: userIdStr,
      email: user.email,
      roleName: user.roleName,
      roleId: user.roleId,
      sessionToken,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  await sessions.insertOne({
    userId: userIdStr,
    token: jwtToken,
    isExpired: false,
    lastAccessed: now,
    createdAt: now,
    sessionToken,
  });

  const cookieStore = await cookies();
  cookieStore.set({
    name: "jwt",
    value: jwtToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  cookieStore.set({
    name: "user",
    value: userIdStr,
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return { type: "redirect", url: "/ar" };
}
