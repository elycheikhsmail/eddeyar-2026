import type {
  HandleGetAnnonceDetailsInput,
  HandleGetAnnonceDetailsResult,
} from "./handleGetAnnonceDetails.interface";
import mockData from "./data.json";

export async function handleGetAnnonceDetailsMocked(
  _input: HandleGetAnnonceDetailsInput
): Promise<HandleGetAnnonceDetailsResult> {
  return mockData as HandleGetAnnonceDetailsResult;
}
