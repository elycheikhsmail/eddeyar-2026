import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../../../../../lib/mongodb";
import type { HandleOtpVerifyInput, HandleOtpVerifyOutput } from "./handleOtpVerify.interface";

export class BadRequestError extends Error {
  status = 400;
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}

export class NotFoundError extends Error {
  status = 404;
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class TooManyRequestsError extends Error {
  status = 429;
  constructor(message: string) {
    super(message);
    this.name = "TooManyRequestsError";
  }
}

export async function handleOtpVerifyReal(
  input: HandleOtpVerifyInput
): Promise<HandleOtpVerifyOutput> {
  const { userId, code } = input;
  if (!userId || !code) throw new BadRequestError("userId and code are required");

  const db = await getDb();
  const contactDoc = await db.collection("contacts").findOne({ userId });
  if (!contactDoc) throw new NotFoundError("Contact not found");
  if (contactDoc.isVerified) throw new BadRequestError("Contact already verified");

  const attempts = contactDoc.verifyAttempts ?? 0;
  if (attempts >= 5) throw new TooManyRequestsError("Too many verification attempts");

  const expiresAt = contactDoc.verifyTokenExpires
    ? new Date(contactDoc.verifyTokenExpires)
    : null;
  if (!expiresAt || isNaN(expiresAt.getTime()) || expiresAt < new Date()) {
    throw new BadRequestError("OTP expired");
  }

  if (String(contactDoc.verifyCode ?? "") !== code) {
    await db.collection("contacts").updateOne(
      { _id: contactDoc._id },
      { $inc: { verifyAttempts: 1 } }
    );
    throw new BadRequestError("Invalid OTP code");
  }

  await db.collection("contacts").updateOne(
    { _id: contactDoc._id },
    {
      $set: {
        isActive: true,
        isVerified: true,
        verifyAttempts: 0,
        verifyTokenExpires: null,
      },
    }
  );

  const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
  if (user) {
    await db
      .collection("users")
      .updateOne({ _id: user._id }, { $set: { isActive: true, lastLogin: new Date() } });
    await db
      .collection("user_sessions")
      .updateMany({ userId: user._id.toString(), isExpired: false }, { $set: { isExpired: true } });

    const sessionToken = uuidv4();
    if (process.env.JWT_SECRET) {
      const token = jwt.sign(
        {
          id: user._id.toString(),
          email: user.email,
          roleName: user.roleName,
          roleId: user.roleId,
          sessionToken,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      await db.collection("user_sessions").insertOne({
        userId: user._id.toString(),
        token,
        isExpired: false,
        lastAccessed: new Date(),
        createdAt: new Date(),
      });
      await db
        .collection("users")
        .updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } });

      const cookieStore = await cookies();
      cookieStore.set({
        name: "jwt",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24,
        path: "/",
      });
      cookieStore.set({ name: "user", value: user._id.toString(), path: "/" });
    }
  }

  return { message: "Phone verified successfully" };
}
