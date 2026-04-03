import type { HandlePostSearchInput, HandlePostSearchOutput } from "./handlePostSearch.interface";

export async function handlePostSearchMocked(
  input: HandlePostSearchInput
): Promise<HandlePostSearchOutput> {
  return { ...input.body, userId: "mock-user" };
}
