import { cookies } from "next/headers";
import type { UserAnnoncesSearch, HandleGetMyAnnoncesResult } from "./handleGetMyAnnonces.interface";

export async function handleGetMyAnnoncesReal(
  sp: UserAnnoncesSearch
): Promise<HandleGetMyAnnoncesResult> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const params = new URLSearchParams();

  (Object.entries(sp) as [string, string | undefined][]).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, value);
  });

  const cookieStore = await cookies();
  const res = await fetch(`${baseUrl}/api/my/list?${params.toString()}`, {
    headers: { Cookie: cookieStore.toString() },
    cache: "no-store",
  });

  // Non connecté → liste vide
  if (res.status === 401) {
    return { annonces: [], totalPages: 1, currentPage: 1, totalCount: 0 };
  }

  if (!res.ok) throw new Error(`handleGetMyAnnoncesReal: ${res.status}`);

  return res.json();
}
