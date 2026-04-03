import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { ObjectId } from "mongodb";
import { getDb } from "../../../../../../../lib/mongodb";
import type { HandleConnexionPhoneInput, HandleConnexionPhoneOutput } from "./handleConnexionPhone.interface";

export class BadRequestError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "UnauthorizedError";
  }
}

export async function handleConnexionPhoneReal(
  input: HandleConnexionPhoneInput
): Promise<HandleConnexionPhoneOutput> {
  const { phone, password } = input;
  const contact = phone;

  if (!contact || !password) {
    throw new BadRequestError("phone number et mot de passe requis");
  }

  const db = await getDb();
  const userContact = await db.collection("contacts").findOne({ contact });
  if (!userContact) {
    throw new UnauthorizedError("phone number incorrect");
  }

  const user = await db.collection("users").findOne({ _id: new ObjectId(userContact.userId) });
  if (!user || !userContact.isVerified) {
    throw new UnauthorizedError("your phone number is not verified");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError("Email ou mot de passe incorrect");
  }

  await db.collection("user_sessions").updateMany(
    { userId: user._id.toString(), isExpired: false },
    { $set: { isExpired: true } }
  );

  const sessionToken = uuidv4();
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET non défini dans le fichier .env");
  }

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

  const newSession = await db.collection("user_sessions").insertOne({
    userId: user._id.toString(),
    token,
    isExpired: false,
    lastAccessed: new Date(),
    createdAt: new Date(),
  });

  await db.collection("users").updateOne(
    { _id: user._id },
    { $set: { lastLogin: new Date() } }
  );

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

  const { password: _, ...userWithoutPassword } = user;
  return {
    message: "Connexion réussie",
    user: userWithoutPassword,
    sessionId: newSession.insertedId,
    token,
  };
}
