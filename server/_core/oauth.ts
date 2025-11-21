import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import bcrypt from "bcrypt";
import { z } from "zod";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

// Validation schemas
const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export function registerOAuthRoutes(app: Express) {
  // Register route
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const body = RegisterSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await db.getUserByEmail(body.email);
      if (existingUser) {
        res.status(400).json({ error: "Email already registered" });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(body.password, 10);

      // Create user
      await db.createUser({
        email: body.email,
        name: body.name,
        passwordHash: hashedPassword,
        openId: `user_${Date.now()}`,
        loginMethod: "email",
        role: "user",
      });

      // Get the created user
      const user = await db.getUserByEmail(body.email);
      if (!user) {
        res.status(500).json({ error: "Failed to create user" });
        return;
      }

      // Create session token
      const sessionToken = await sdk.createSessionToken(
        user.id,
        user.email || "",
        user.name || ""
      );

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        res.status(400).json({ error: firstError?.message || "Validation failed" });
      } else {
        console.error("[Auth] Registration error:", error);
        res.status(500).json({ error: "Registration failed" });
      }
    }
  });

  // Login route
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const body = LoginSchema.parse(req.body);

      // Find user by email
      const user = await db.getUserByEmail(body.email);
      if (!user || !user.passwordHash) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(
        body.password,
        user.passwordHash
      );
      if (!passwordMatch) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Create session token
      const sessionToken = await sdk.createSessionToken(
        user.id,
        user.email || "",
        user.name || ""
      );

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        res.status(400).json({ error: firstError?.message || "Validation failed" });
      } else {
        console.error("[Auth] Login error:", error);
        res.status(500).json({ error: "Login failed" });
      }
    }
  });

  // Logout route
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });

  // Get current user
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } catch (error) {
      res.status(401).json({ error: "Not authenticated" });
    }
  });
}
