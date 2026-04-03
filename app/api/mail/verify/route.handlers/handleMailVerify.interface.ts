export interface HandleMailVerifyInput {
  token: string;
  requestUrl: string;
}

export type HandleMailVerifyOutput =
  | { type: "redirect"; url: string }
  | { type: "error"; message: string; status: number };
