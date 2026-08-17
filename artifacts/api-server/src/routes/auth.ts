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

  const email = parsed.data.email.trim().toLowerCase();
  const { password } = parsed.data;
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

// ── Admin User Management ─────────────────────────────────────────────────────

const CreateAdminBody = z.object({
  name: z.string().min(2, "Ad en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı"),
});

const ChangePasswordBody = z.object({
  newPassword: z.string().min(8, "Şifre en az 8 karakter olmalı"),
});

router.get("/admin/users", requireAuth, async (_req, res): Promise<void> => {
  const users = await db
    .select({ id: adminUsersTable.id, name: adminUsersTable.name, email: adminUsersTable.email, createdAt: adminUsersTable.createdAt })
    .from(adminUsersTable)
    .orderBy(adminUsersTable.createdAt);
  res.json(users);
});

router.post("/admin/users", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateAdminBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Geçersiz veri" });
    return;
  }
  const { name, password } = parsed.data;
  const email = parsed.data.email.trim().toLowerCase();
  const existing = await db.select({ id: adminUsersTable.id }).from(adminUsersTable).where(eq(adminUsersTable.email, email));
  if (existing.length > 0) {
    res.status(409).json({ error: "Bu e-posta adresi zaten kullanımda" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(adminUsersTable).values({ name, email, passwordHash }).returning({
    id: adminUsersTable.id, name: adminUsersTable.name, email: adminUsersTable.email, createdAt: adminUsersTable.createdAt,
  });
  req.log.info({ userId: user.id }, "Admin user created");
  res.status(201).json(user);
});

router.put("/admin/users/:id/password", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Geçersiz ID" }); return; }
  const parsed = ChangePasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Geçersiz veri" });
    return;
  }
  const [existing] = await db.select({ id: adminUsersTable.id }).from(adminUsersTable).where(eq(adminUsersTable.id, id));
  if (!existing) { res.status(404).json({ error: "Kullanıcı bulunamadı" }); return; }
  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await db.update(adminUsersTable).set({ passwordHash }).where(eq(adminUsersTable.id, id));
  req.log.info({ targetUserId: id }, "Admin password changed");
  res.json({ ok: true });
});

router.delete("/admin/users/:id", requireAuth, async (req, res): Promise<void> => {
  const payload = (req as Request & { adminPayload: JwtPayload }).adminPayload;
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Geçersiz ID" }); return; }
  if (id === payload.adminId) {
    res.status(400).json({ error: "Kendinizi silemezsiniz" });
    return;
  }
  const count = await db.select({ id: adminUsersTable.id }).from(adminUsersTable);
  if (count.length <= 1) {
    res.status(400).json({ error: "Son yönetici silinemez" });
    return;
  }
  const [existing] = await db.select({ id: adminUsersTable.id }).from(adminUsersTable).where(eq(adminUsersTable.id, id));
  if (!existing) { res.status(404).json({ error: "Kullanıcı bulunamadı" }); return; }
  await db.delete(adminUsersTable).where(eq(adminUsersTable.id, id));
  req.log.info({ deletedUserId: id }, "Admin user deleted");
  res.json({ ok: true });
});

export default router;
