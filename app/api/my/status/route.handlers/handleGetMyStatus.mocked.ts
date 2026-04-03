import type { HandleGetMyStatusInput, HandleGetMyStatusOutput } from "./handleGetMyStatus.interface";
import data from "./data.json";

export async function handleGetMyStatusMocked(
  _input: HandleGetMyStatusInput
): Promise<HandleGetMyStatusOutput> {
  return data;
}
