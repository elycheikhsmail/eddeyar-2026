import { handleSendTelegramMocked } from "./handleSendTelegram.mocked";
import { handleSendTelegramReal } from "./handleSendTelegram.real";

export const handleSendTelegram =
  process.env.NODE_ENV === "development" ? handleSendTelegramMocked : handleSendTelegramReal;
