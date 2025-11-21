import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import type { Express, Request, Response } from "express";

export function registerAuthRoutes(app: Express) {
  // Logout endpoint
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return res.json({ success: true });
  });
}
