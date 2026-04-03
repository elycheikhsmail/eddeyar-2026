import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { getDb } from "../../../../../lib/mongodb";
import type { HandlePostSearchInput, HandlePostSearchOutput } from "./handlePostSearch.interface";

export async function handlePostSearchReal(
  input: HandlePostSearchInput
): Promise<HandlePostSearchOutput> {
  const db = await getDb();
  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("jwt");
  const body = { ...input.body, userId: "" };

  if (jwtCookie && process.env.JWT_SECRET) {
    try {
      const decodedToken = jwt.verify(jwtCookie.value, process.env.JWT_SECRET);
      if (typeof decodedToken === "object" && decodedToken !== null && "id" in decodedToken) {
        body.userId = (decodedToken as any).id;
      }
    } catch (err) {
      console.error("Token verification failed in search analytics:", err);
    }
  }

  await db.collection("search").insertOne(body);
  return body;
}
