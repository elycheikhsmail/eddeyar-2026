export interface HandleRegisterPhoneInput {
  email: string;
  password: string;
  contact: string;
  samsar: boolean;
}

export interface HandleRegisterPhoneOutput {
  message: string;
  user: {
    id: string;
    email: string;
    roleName: string;
    emailVerified: boolean;
    samsar: boolean;
  };
}
