import type {
  HandleGetAnnonceDetailsInput,
  HandleGetAnnonceDetailsResult,
} from "./handleGetAnnonceDetails.interface";

export async function handleGetAnnonceDetailsReal(
  { id }: HandleGetAnnonceDetailsInput
): Promise<HandleGetAnnonceDetailsResult> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/annonces/${id}`, {
    cache: "no-store",
  });

  if (res.status === 404) return { annonce: null };
  if (!res.ok) throw new Error(`handleGetAnnonceDetailsReal: ${res.status}`);

  return res.json();
}
