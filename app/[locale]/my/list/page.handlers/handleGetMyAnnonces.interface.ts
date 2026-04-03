import type { Annonce } from "../../../../../packages/mytypes/types";
import type { UserAnnoncesSearch } from "../../../../../lib/services/annoncesService";

export type { UserAnnoncesSearch };

export interface HandleGetMyAnnoncesResult {
  annonces: Annonce[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}
