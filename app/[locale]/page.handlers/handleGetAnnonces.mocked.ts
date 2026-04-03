import type { Search, HandleGetAnnoncesResult } from "./handleGetAnnonces.interface";
import mockData from "./data.json";

export async function handleGetAnnoncesMocked(
  _sp: Search
): Promise<HandleGetAnnoncesResult> {
  return mockData as HandleGetAnnoncesResult;
}
