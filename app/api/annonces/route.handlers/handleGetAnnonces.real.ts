import { getAnnonces, Search } from "../../../../lib/services/annoncesService";
import type { HandleGetAnnoncesInput, HandleGetAnnoncesOutput } from "./handleGetAnnonces.interface";

export async function handleGetAnnoncesReal(
  input: HandleGetAnnoncesInput
): Promise<HandleGetAnnoncesOutput> {
  return await getAnnonces(input as Search);
}
