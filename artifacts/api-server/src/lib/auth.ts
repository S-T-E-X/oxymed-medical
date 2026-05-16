import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    logger.error("JWT_SECRET environment variable is not set — server cannot start securely");
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
}

const JWT_EXPIRES_IN = "7d";

export interface JwtPayload {
  adminId: number;
  email: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const payload = verifyToken(token);
    (req as Request & { adminPayload: JwtPayload }).adminPayload = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
