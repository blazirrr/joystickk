import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { getDiscordOAuthUrl, exchangeDiscordCode, getDiscordUser } from "./discord-oauth";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { getDb } from "../db";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });

  // Discord OAuth login
  app.get("/api/oauth/discord/login", (req: Request, res: Response) => {
    const redirectUri = `${req.protocol}://${req.get("host")}/api/oauth/discord/callback`;
    const oauthUrl = getDiscordOAuthUrl(redirectUri);
    res.redirect(oauthUrl);
  });

  // Discord OAuth callback
  app.get("/api/oauth/discord/callback", async (req: Request, res: Response) => {
    const { code } = req.query;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Missing authorization code" });
    }

    try {
      const redirectUri = `${req.protocol}://${req.get("host")}/api/oauth/discord/callback`;
      
      // Exchange code for access token
      const tokenData = await exchangeDiscordCode(code, redirectUri);
      
      // Get Discord user info
      const discordUser = await getDiscordUser(tokenData.access_token);
      
      // Get or create user in database
      const dbInstance = await getDb();
      if (!dbInstance) {
        return res.status(500).json({ error: "Database not available" });
      }

      // Use Discord ID as openId for consistency
      const openId = `discord_${discordUser.id}`;
      
      // Check if user exists
      let userRecord = await dbInstance.select().from(users).where(eq(users.openId, openId)).limit(1);
      
      if (userRecord.length === 0) {
        // Create new user
        await dbInstance.insert(users).values({
          openId,
          name: discordUser.username,
          email: discordUser.email,
          loginMethod: "discord",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        });
        
        userRecord = await dbInstance.select().from(users).where(eq(users.openId, openId)).limit(1);
      } else {
        // Update last signed in
        await dbInstance.update(users).set({ lastSignedIn: new Date() }).where(eq(users.openId, openId));
      }

      // Create session token
      const sessionToken = await sdk.createSessionToken(openId, {
        name: discordUser.username || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      
      // Redirect to forum
      res.redirect("/forum");
    } catch (error) {
      console.error("Discord OAuth error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });
}
