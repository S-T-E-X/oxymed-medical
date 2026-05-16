import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { adminUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, requireAuth } from "../lib/auth";
import type { JwtPayload } from "../lib/auth";
import type { Request } from "express";
import { z } from "zod/v4";

const router: IRouter = Router();

const LoginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;
  const [admin] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.email, email));

  if (!admin) {
    res.status(401).json({ error: "Geçersiz e-posta veya şifre" });
    return;
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Geçersiz e-posta veya şifre" });
    return;
  }

  const token = signToken({ adminId: admin.id, email: admin.email });
  req.log.info({ adminId: admin.id }, "Admin login successful");
  res.json({
    token,
    user: { id: admin.id, email: admin.email, name: admin.name },
  });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const payload = (req as Request & { adminPayload: JwtPayload }).adminPayload;
  const [admin] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.id, payload.adminId));

  if (!admin) {
    res.status(404).json({ error: "Admin not found" });
    return;
  }

  res.json({ id: admin.id, email: admin.email, name: admin.name });
});

router.get("/dashboard/stats", requireAuth, async (_req, res): Promise<void> => {
  const { slidersTable, productsTable, newsTable, referencesTable, quoteRequestsTable } = await import("@workspace/db");
  const { count, eq } = await import("drizzle-orm");

  const [slidersCount] = await db.select({ count: count() }).from(slidersTable);
  const [productsCount] = await db.select({ count: count() }).from(productsTable);
  const [newsCount] = await db.select({ count: count() }).from(newsTable);
  const [referencesCount] = await db.select({ count: count() }).from(referencesTable);
  const [totalQuotes] = await db.select({ count: count() }).from(quoteRequestsTable);
  const [pendingQuotes] = await db.select({ count: count() }).from(quoteRequestsTable).where(eq(quoteRequestsTable.status, "new"));

  res.json({
    sliders: slidersCount?.count ?? 0,
    products: productsCount?.count ?? 0,
    news: newsCount?.count ?? 0,
    references: referencesCount?.count ?? 0,
    totalQuotes: totalQuotes?.count ?? 0,
    pendingQuotes: pendingQuotes?.count ?? 0,
  });
});

export default router;
