import { describe, it, expect } from "vitest";
import { ENV } from "./_core/env";

describe("Discord OAuth Credentials", () => {
  it("should have Discord Client ID configured", () => {
    expect(ENV.discordClientId).toBeDefined();
    expect(ENV.discordClientId).toBeTruthy();
    expect(typeof ENV.discordClientId).toBe("string");
  });

  it("should have Discord Client Secret configured", () => {
    expect(ENV.discordClientSecret).toBeDefined();
    expect(ENV.discordClientSecret).toBeTruthy();
    expect(typeof ENV.discordClientSecret).toBe("string");
  });

  it("should validate Discord Client ID format", () => {
    // Discord Client IDs are numeric strings
    expect(/^\d+$/.test(ENV.discordClientId)).toBe(true);
  });

  it("should validate Discord Client Secret format", () => {
    // Discord Client Secrets are alphanumeric strings with underscores
    expect(/^[a-zA-Z0-9_-]+$/.test(ENV.discordClientSecret)).toBe(true);
  });

  it("should be able to construct Discord OAuth URL", () => {
    const redirectUri = "http://localhost:3000/api/oauth/discord/callback";
    const scope = "identify email";
    const clientId = ENV.discordClientId;

    const oauthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;

    expect(oauthUrl).toContain(clientId);
    expect(oauthUrl).toContain("discord.com");
    expect(oauthUrl).toContain("redirect_uri");
  });
});
