import { eq, sql } from "drizzle-orm";
import { db } from "../../../../../lib/db";
import { contacts } from "../../../../../lib/schema";
import type { HandleOtpResendInput, HandleOtpResendOutput } from "./handleOtpResend.interface";

const CHINGUI_KEY = process.env.CHINGUISOFT_VALIDATION_KEY;
const CHINGUI_TOKEN = process.env.CHINGUISOFT_VALIDATION_TOKEN;

function isValidChinguPhone(p: string) { return /^[234]\d{7}$/.test(p); }

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
  waitSeconds?: number;
  constructor(message: string, waitSeconds?: number) {
    super(message); this.name = "TooManyRequestsError"; this.waitSeconds = waitSeconds;
  }
}

export async function handleOtpResendReal(
  input: HandleOtpResendInput
): Promise<HandleOtpResendOutput> {
  const { userId } = input;
  if (!userId) throw new BadRequestError("userId is required");

  const uid = parseInt(String(userId), 10);
  if (isNaN(uid)) throw new BadRequestError("userId invalide");

  const [contactDoc] = await db.select().from(contacts).where(eq(contacts.userId, uid)).limit(1);
  if (!contactDoc) throw new NotFoundError("Contact not found");
  if (contactDoc.isVerified) throw new BadRequestError("Contact already verified");

  const phone = contactDoc.contact ?? "";
  if (!isValidChinguPhone(phone)) throw new BadRequestError("Phone format invalid for Chinguisoft");

  const now = new Date();
  const RESEND_COOLDOWN_MS = 60_000;
  const MAX_RESENDS = 5;

  if (contactDoc.lastResendAt) {
    const waited = now.getTime() - contactDoc.lastResendAt.getTime();
    if (waited < RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - waited) / 1000);
      throw new TooManyRequestsError("You must wait before requesting another OTP.", waitSeconds);
    }
  }
  if (contactDoc.resendCount >= MAX_RESENDS) {
    throw new TooManyRequestsError("Too many OTP requests. Try again later.");
  }

  if (!CHINGUI_KEY || !CHINGUI_TOKEN) {
    console.error("Chinguisoft credentials missing");
    throw new Error("SMS provider credentials not set");
  }

  const resp = await fetch(`https://chinguisoft.com/api/sms/validation/${encodeURIComponent(CHINGUI_KEY)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Validation-token": CHINGUI_TOKEN },
    body: JSON.stringify({ phone, lang: "fr" }),
  });

  if (!resp.ok) {
    const t = await resp.text().catch(() => "");
    console.error("Chinguisoft resend error", resp.status, t);
    throw new Error("Failed to send OTP via provider");
  }

  const json = await resp.json();
  const otpCode = String(json.code ?? "");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await db
    .update(contacts)
    .set({
      verifyCode: otpCode,
      verifyTokenExpires: expiresAt,
      verifyAttempts: 0,
      lastResendAt: now,
      resendCount: sql`${contacts.resendCount} + 1`,
    })
    .where(eq(contacts.id, contactDoc.id));

  return { message: "OTP resent successfully" };
}
