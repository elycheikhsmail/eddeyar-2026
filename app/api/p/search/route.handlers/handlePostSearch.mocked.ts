import type { HandlePostSearchInput, HandlePostSearchOutput } from "./handlePostSearch.interface";

export async function handlePostSearchMocked(
  _input: HandlePostSearchInput
): Promise<HandlePostSearchOutput> {
  return { ok: true, saved: true };
}
