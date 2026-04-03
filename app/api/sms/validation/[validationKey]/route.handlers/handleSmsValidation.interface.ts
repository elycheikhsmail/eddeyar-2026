export interface HandleSmsValidationInput {
  validationKey: string;
  request: Request;
}

export interface HandleSmsValidationOutput {
  code: number;
  message: string;
  success: boolean;
  data?: {
    key: string;
    phone: string;
    status: string;
  };
  errors?: Record<string, string>;
}
