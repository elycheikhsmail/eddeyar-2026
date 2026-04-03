import {
  HandleDeleteMyAnnonceInput,
  HandleDeleteMyAnnonceOutput,
} from "./handleMyAnnonce.interface";

export async function handleDeleteMyAnnonceMocked(
  _input: HandleDeleteMyAnnonceInput
): Promise<HandleDeleteMyAnnonceOutput> {
  return { message: "Annonce supprimée (soft delete)" };
}
