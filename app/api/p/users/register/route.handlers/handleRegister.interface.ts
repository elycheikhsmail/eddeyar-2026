export interface HandleRegisterInput {
  email: string;
  password: string;
  contact: string;
  samsar: boolean;
}

export interface HandleRegisterOutput {
  message: string;
  user: {
    id: string;
    email: string;
    roleName: string;
    emailVerified: boolean;
    samsar: boolean;
  };
}
