import { Router, Request, Response } from "express";
import { getDiscordOAuthUrl, exchangeDiscordCode, getDiscordUser } from "./discord-oauth";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { getSessionCookieOptions } from "./cookies";
import { COOKIE_NAME } from "@shared/const";

const router = Router();

// Redirect to Discord OAuth
router.get("/login", (req: Request, res: Response) => {
  const redirectUri = `${req.protocol}://${req.get("host")}/api/oauth/discord/callback`;
  const oauthUrl = getDiscordOAuthUrl(redirectUri);
  res.redirect(oauthUrl);
});

// Discord OAuth callback
router.get("/callback", async (req: Request, res: Response) => {
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
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    // Use Discord ID as openId for consistency
    const openId = `discord_${discordUser.id}`;
    
    // Check if user exists
    let user = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    
    if (user.length === 0) {
      // Create new user
      await db.insert(users).values({
        openId,
        name: discordUser.username,
        email: discordUser.email,
        loginMethod: "discord",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      });
      
      user = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    } else {
      // Update last signed in
      await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.openId, openId));
    }

    // Set session cookie
    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, openId, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
    
    // Redirect to forum
    res.redirect("/forum");
  } catch (error) {
    console.error("Discord OAuth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

export default router;
