export interface HandleOtpVerifyInput {
  userId: string;
  code: string;
}

export interface HandleOtpVerifyOutput {
  message: string;
}
