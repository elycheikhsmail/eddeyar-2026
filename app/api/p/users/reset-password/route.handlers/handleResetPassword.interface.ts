export interface HandleResetPasswordInput {
  contact: string;
  otp: string;
  password: string;
}

export interface HandleResetPasswordOutput {
  message: string;
}
