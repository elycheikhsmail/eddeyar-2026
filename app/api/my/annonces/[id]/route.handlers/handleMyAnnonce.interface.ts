export interface HandleGetMyAnnonceInput {
  id: string;
}

export interface HandleGetMyAnnonceOutput {
  id: string;
  [key: string]: any;
}

export interface PutBody {
  typeAnnonceId?: string;
  categorieId?: string;
  subcategorieId?: string;
  title?: string;
  description?: string;
  privateDescription?: string;
  price?: number | null;
  lieuId?: string;
  moughataaId?: string;
  lieuStr?: string;
  lieuStrAr?: string;
  moughataaStr?: string;
  moughataaStrAr?: string;
  issmar?: boolean;
  directNegotiation?: boolean | null;
  rentalPeriod?: string | null;
  rentalPeriodAr?: string | null;
}

export interface HandlePutMyAnnonceInput {
  id: string;
  body: PutBody;
}

export interface HandlePutMyAnnonceOutput {
  id: string;
  [key: string]: any;
}

export interface HandleDeleteMyAnnonceInput {
  id: string;
}

export interface HandleDeleteMyAnnonceOutput {
  message: string;
}

export class UnauthorizedError extends Error {
  constructor(message = "Non authentifié") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
