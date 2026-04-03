import type { Annonce } from "../../../packages/mytypes/types";
import type { Search } from "../../../lib/services/annoncesService";

export type { Search };

export interface HandleGetAnnoncesResult {
  annonces: Annonce[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
  isSamsar: boolean;
  favoriteIds: string[];
}
