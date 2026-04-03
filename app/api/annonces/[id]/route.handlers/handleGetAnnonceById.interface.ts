import type { Annonce } from "../../../../../packages/mytypes/types";

export interface HandleGetAnnonceByIdInput {
  id: string;
}

export interface HandleGetAnnonceByIdOutput {
  annonce: Annonce;
}
