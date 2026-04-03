import { getUserStatus } from "../../../../../lib/services/annoncesService";
import { getUserFromCookies } from "../../../../../utiles/getUserFomCookies";
import type { HandleGetMyStatusInput, HandleGetMyStatusOutput } from "./handleGetMyStatus.interface";

export async function handleGetMyStatusReal(
  _input: HandleGetMyStatusInput
): Promise<HandleGetMyStatusOutput> {
  const user = await getUserFromCookies();
  if (!user?.id) return { isSamsar: false };

  return await getUserStatus(String(user.id));
}
