export type HandleMailSendInput = Record<string, never>;

export interface HandleMailSendOutput {
  message: string;
  status: number;
}
