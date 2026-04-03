export interface HandleConnexionPhoneInput {
  phone: string;
  password: string;
}

export interface HandleConnexionPhoneOutput {
  message: string;
  user: any;
  sessionId: any;
  token: string;
}
