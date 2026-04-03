import type { HandleGetAnnonceByIdInput, HandleGetAnnonceByIdOutput } from "./handleGetAnnonceById.interface";
import data from "./data.json";

export async function handleGetAnnonceByIdMocked(
  _input: HandleGetAnnonceByIdInput
): Promise<HandleGetAnnonceByIdOutput> {
  return data as HandleGetAnnonceByIdOutput;
}
