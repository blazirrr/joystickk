export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "App";

export const APP_LOGO = "/logo-transparent-final.png";

// Discord login URL for forum access
export const getDiscordLoginUrl = () => {
  return `${window.location.origin}/api/oauth/discord/login`;
};
