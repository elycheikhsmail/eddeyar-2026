import type { HandleGetAnnoncesInput, HandleGetAnnoncesOutput } from "./handleGetAnnonces.interface";
import data from "./data.json";

export async function handleGetAnnoncesMocked(
  _input: HandleGetAnnoncesInput
): Promise<HandleGetAnnoncesOutput> {
  return data;
}
