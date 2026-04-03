import { NextRequest } from "next/server";

export interface HandlePostMyAnnonceInput {
  request: NextRequest;
}

export interface HandlePostMyAnnonceOutput {
  data: any;
  status: number;
}

export class UnauthorizedError extends Error {
  constructor(message = "Utilisateur non authentifié") {
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
