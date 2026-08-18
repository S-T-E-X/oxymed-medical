import express, { type Express, type NextFunction, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { apiRateLimiter } from "./lib/security";

const app: Express = express();

// Behind the Replit proxy: trust exactly one hop so rate limiting keys on the
// real client IP instead of the proxy address, without trusting arbitrary
// client-supplied X-Forwarded-For chains.
app.set("trust proxy", 1);
app.disable("x-powered-by");

function parseAllowedOrigins(): string[] {
  const configured = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  const replitDomains = (process.env.REPLIT_DOMAINS ?? "")
    .split(",")
    .map((domain) => domain.trim())
    .filter((domain) => domain.length > 0)
    .map((domain) => `https://${domain}`);

  return Array.from(new Set([...configured, ...replitDomains]));
}

const allowedOrigins = parseAllowedOrigins();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(
  helmet({
    // The API serves JSON and proxies stored media; it renders no HTML of its
    // own, and a restrictive CSP here would not apply to the SPA anyway.
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      // Same-origin and non-browser callers (curl, server-side fetch, health
      // checks) send no Origin header — those are unaffected by CORS anyway.
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
    maxAge: 600,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use("/api", apiRateLimiter);

app.use("/api", router);

// Last-resort error handler. Without it Express prints the stack trace into
// the HTTP response in development and leaks internals; here every unexpected
// failure is logged server-side and answered with an opaque message.
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  // Malformed JSON bodies and oversized payloads arrive as http-errors.
  const status = (err as { status?: number; statusCode?: number })?.status
    ?? (err as { statusCode?: number })?.statusCode;

  if (typeof status === "number" && status >= 400 && status < 500) {
    res.status(status).json({ error: "Geçersiz istek" });
    return;
  }

  req.log?.error({ err }, "Unhandled error");
  res.status(500).json({ error: "Sunucu hatası" });
});

export default app;
