import type { HandleGetMyStatusResult } from "./handleGetMyStatus.interface";
import mockData from "./data.json";

export async function handleGetMyStatusMocked(): Promise<HandleGetMyStatusResult> {
  return mockData as HandleGetMyStatusResult;
}
