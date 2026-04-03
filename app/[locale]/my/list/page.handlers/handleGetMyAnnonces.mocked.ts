import type { UserAnnoncesSearch, HandleGetMyAnnoncesResult } from "./handleGetMyAnnonces.interface";
import mockData from "./data.json";

export async function handleGetMyAnnoncesMocked(
  _sp: UserAnnoncesSearch
): Promise<HandleGetMyAnnoncesResult> {
  return mockData as HandleGetMyAnnoncesResult;
}
