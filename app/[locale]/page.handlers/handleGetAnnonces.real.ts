import type { Search, HandleGetAnnoncesResult } from "./handleGetAnnonces.interface";

export async function handleGetAnnoncesReal(
  sp: Search
): Promise<HandleGetAnnoncesResult> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const params = new URLSearchParams();

  (Object.entries(sp) as [string, string | undefined][]).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, value);
  });

  const res = await fetch(`${baseUrl}/api/annonces?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`handleGetAnnoncesReal: ${res.status}`);

  return res.json();
}
