import { ENV } from "./env";

const DISCORD_API_URL = "https://discord.com/api/v10";
const DISCORD_OAUTH_URL = "https://discord.com/api/oauth2";

export function getDiscordOAuthUrl(redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: ENV.discordClientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify email",
  });

  return `${DISCORD_OAUTH_URL}/authorize?${params.toString()}`;
}

export async function exchangeDiscordCode(code: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: ENV.discordClientId,
    client_secret: ENV.discordClientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch(`${DISCORD_OAUTH_URL}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`Discord OAuth token exchange failed: ${response.statusText}`);
  }

  return response.json();
}

export async function getDiscordUser(accessToken: string) {
  const response = await fetch(`${DISCORD_API_URL}/users/@me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Discord user: ${response.statusText}`);
  }

  return response.json();
}

export interface DiscordUser {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  discriminator: string;
}
