import { cookies } from "next/headers";
import type { HandleGetMyFavoritesInput, HandleGetMyFavoritesResult } from "./handleGetMyFavorites.interface";

const EMPTY: HandleGetMyFavoritesResult = {
  annonces: [],
  totalPages: 1,
  currentPage: 1,
  totalCount: 0,
  unauthorized: true,
};

export async function handleGetMyFavoritesReal(
  { page }: HandleGetMyFavoritesInput
): Promise<HandleGetMyFavoritesResult> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const params = new URLSearchParams();
  if (page) params.set("page", page);

  const cookieStore = await cookies();
  const res = await fetch(`${baseUrl}/api/my/favorites?${params.toString()}`, {
    headers: { Cookie: cookieStore.toString() },
    cache: "no-store",
  });

  if (res.status === 401) return EMPTY;
  if (!res.ok) throw new Error(`handleGetMyFavoritesReal: ${res.status}`);

  return res.json();
}
