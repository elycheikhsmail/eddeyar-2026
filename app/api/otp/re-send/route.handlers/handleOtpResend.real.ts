import { getDb } from "../../../../../lib/mongodb";
import type { HandleOtpResendInput, HandleOtpResendOutput } from "./handleOtpResend.interface";

const CHINGUI_KEY = process.env.CHINGUISOFT_VALIDATION_KEY;
const CHINGUI_TOKEN = process.env.CHINGUISOFT_VALIDATION_TOKEN;

function isValidChinguPhone(p: string): boolean {
  return /^[234]\d{7}$/.test(p);
}

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
  waitSeconds?: number;
  constructor(message: string, waitSeconds?: number) {
    super(message);
    this.name = "TooManyRequestsError";
    this.waitSeconds = waitSeconds;
  }
}

export async function handleOtpResendReal(
  input: HandleOtpResendInput
): Promise<HandleOtpResendOutput> {
  const { userId } = input;
  if (!userId) throw new BadRequestError("userId is required");

  const db = await getDb();
  const contactDoc = await db.collection("contacts").findOne({ userId });
  if (!contactDoc) throw new NotFoundError("Contact not found");
  if (contactDoc.isVerified) throw new BadRequestError("Contact already verified");

  const phone = contactDoc.contact;
  if (!isValidChinguPhone(phone)) throw new BadRequestError("Phone format invalid for Chinguisoft");

  const now = new Date();
  const RESEND_COOLDOWN_MS = 60 * 1000;
  const MAX_RESENDS_PER_HOUR = 5;
  const lastResendAt = contactDoc.lastResendAt ? new Date(contactDoc.lastResendAt) : null;
  const resendCount = contactDoc.resendCount ?? 0;

  if (lastResendAt && now.getTime() - lastResendAt.getTime() < RESEND_COOLDOWN_MS) {
    const waitSeconds = Math.ceil(
      (RESEND_COOLDOWN_MS - (now.getTime() - lastResendAt.getTime())) / 1000
    );
    throw new TooManyRequestsError(
      "You must wait before requesting another OTP.",
      waitSeconds
    );
  }
  if (resendCount >= MAX_RESENDS_PER_HOUR) {
    throw new TooManyRequestsError("Too many OTP requests. Try again later.");
  }

  if (!CHINGUI_KEY || !CHINGUI_TOKEN) {
    console.error("Chinguisoft credentials missing");
    throw new Error("SMS provider credentials not set");
  }

  const chinguUrl = `https://chinguisoft.com/api/sms/validation/${encodeURIComponent(CHINGUI_KEY)}`;
  const resp = await fetch(chinguUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Validation-token": CHINGUI_TOKEN,
    },
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

  await db.collection("contacts").updateOne(
    { _id: contactDoc._id },
    {
      $set: {
        verifyCode: otpCode,
        verifyTokenExpires: expiresAt,
        verifyAttempts: 0,
        lastResendAt: now,
      },
      $inc: { resendCount: 1 },
    }
  );

  return { message: "OTP resent successfully" };
}
