export interface HandleConnexionInput {
  email: string;
  password: string;
}

export interface HandleConnexionOutput {
  message: string;
  user: any;
  sessionId: any;
  token: string;
}
