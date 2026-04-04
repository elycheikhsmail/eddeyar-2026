import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "../../../../../lib/db";
import { searchLogs } from "../../../../../lib/schema";
import type { HandlePostSearchInput, HandlePostSearchOutput } from "./handlePostSearch.interface";

export async function handlePostSearchReal(
  input: HandlePostSearchInput
): Promise<HandlePostSearchOutput> {
  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("jwt");
  let userId: number | null = null;

  if (jwtCookie && process.env.JWT_SECRET) {
    try {
      const decoded = jwt.verify(jwtCookie.value, process.env.JWT_SECRET);
      if (typeof decoded === "object" && decoded !== null && "id" in decoded) {
        const uid = parseInt(String((decoded as any).id), 10);
        if (!isNaN(uid)) userId = uid;
      }
    } catch {
      // token invalide — on ignore
    }
  }

  await db.insert(searchLogs).values({
    userId,
    query: typeof input.body?.query === "string" ? input.body.query : null,
    filters: input.body ? JSON.stringify(input.body) : null,
    createdAt: new Date(),
  });

  return { ...input.body, userId: userId ? String(userId) : "" };
}
