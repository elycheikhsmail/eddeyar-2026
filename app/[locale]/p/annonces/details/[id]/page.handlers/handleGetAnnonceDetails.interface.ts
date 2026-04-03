import type { Annonce } from "../../../../../../packages/mytypes/types";

export interface HandleGetAnnonceDetailsInput {
  id: string;
}

export interface HandleGetAnnonceDetailsResult {
  annonce: Annonce | null;
}
