import { cookies } from "next/headers";
import type { HandleGetMyStatusResult } from "./handleGetMyStatus.interface";

export async function handleGetMyStatusReal(): Promise<HandleGetMyStatusResult> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const cookieStore = await cookies();
  const res = await fetch(`${baseUrl}/api/my/status`, {
    headers: { Cookie: cookieStore.toString() },
    cache: "no-store",
  });

  if (!res.ok) return { isSamsar: false };

  return res.json();
}
