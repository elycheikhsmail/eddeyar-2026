import type { HandleGetMyListInput, HandleGetMyListOutput } from "./handleGetMyList.interface";

export async function handleGetMyListMocked(
  _input: HandleGetMyListInput
): Promise<HandleGetMyListOutput> {
  return { annonces: [], total: 0 };
}
