import { handleLogoutMocked } from "./handleLogout.mocked";
import { handleLogoutReal } from "./handleLogout.real";

export const handleLogout =
  process.env.NODE_ENV === "development"
    ? handleLogoutMocked
    : handleLogoutReal;
