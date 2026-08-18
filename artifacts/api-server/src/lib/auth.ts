import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { db, adminUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    logger.error("JWT_SECRET environment variable is not set — server cannot start securely");
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
}

// Short-lived sessions limit the damage window of a leaked admin token.
const JWT_EXPIRES_IN = "8h";
export const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;

// The session token is delivered exclusively via an HttpOnly cookie so it is
// never readable from JavaScript (XSS cannot exfiltrate it).
export const SESSION_COOKIE_NAME = "oxymed_admin_session";

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "strict" as const,
  // Browser always talks to us over HTTPS via the Replit proxy.
  secure: true,
  path: "/api",
};

function getTokenFromRequest(req: Request): string | null {
  const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
  const cookieToken = cookies?.[SESSION_COOKIE_NAME];
  if (typeof cookieToken === "string" && cookieToken.length > 0) return cookieToken;
  return null;
}
const JWT_ISSUER = "oxymed-api";
const JWT_AUDIENCE = "oxymed-admin";

export interface JwtPayload {
  adminId: number;
  email: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    algorithm: "HS256",
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getJwtSecret(), {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    algorithms: ["HS256"],
  }) as JwtPayload;
}

/**
 * Non-throwing async check used by public endpoints that show more to an admin
 * (drafts, inactive rows, redacted settings). Performs the same two-step
 * verification as `requireAuth`: signature validity **and** DB existence. A
 * token for a deleted account therefore yields `false` here just as it would
 * be rejected by `requireAuth`.
 *
 * Callers MUST also set `Vary: Cookie` because the response body
 * depends on credentials.
 */
export async function isAdminRequest(req: Request): Promise<boolean> {
  const token = getTokenFromRequest(req);
  if (!token) return false;
  let payload: JwtPayload;
  try {
    payload = verifyToken(token);
  } catch {
    return false;
  }
  try {
    const [admin] = await db
      .select({ id: adminUsersTable.id })
      .from(adminUsersTable)
      .where(eq(adminUsersTable.id, payload.adminId));
    return admin != null;
  } catch {
    // If the DB is unavailable we fail closed: do not grant admin access.
    return false;
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = getTokenFromRequest(req);
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  let payload: JwtPayload;
  try {
    payload = verifyToken(token);
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  // A signed token is not enough: the account must still exist. Deleting an
  // admin therefore revokes their outstanding sessions immediately.
  try {
    const [admin] = await db
      .select({ id: adminUsersTable.id })
      .from(adminUsersTable)
      .where(eq(adminUsersTable.id, payload.adminId));

    if (!admin) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }
  } catch (error) {
    logger.error({ err: error }, "Failed to verify admin session against database");
    res.status(503).json({ error: "Service unavailable" });
    return;
  }

  (req as Request & { adminPayload: JwtPayload }).adminPayload = payload;
  next();
}
