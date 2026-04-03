import { handleMailSendMocked } from "./handleMailSend.mocked";
import { handleMailSendReal } from "./handleMailSend.real";

export const handleMailSend =
  process.env.NODE_ENV === "development" ? handleMailSendMocked : handleMailSendReal;
