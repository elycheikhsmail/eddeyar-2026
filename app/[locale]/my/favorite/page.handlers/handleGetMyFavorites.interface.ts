import type { Annonce } from "../../../../../packages/mytypes/types";

export interface HandleGetMyFavoritesInput {
  page?: string;
}

export interface HandleGetMyFavoritesResult {
  annonces: Annonce[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
  unauthorized?: boolean;
}
