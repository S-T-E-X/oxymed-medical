import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { db, adminUsersTable, adminAuditLogsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, requireAuth, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS, SESSION_MAX_AGE_MS } from "../lib/auth";
import type { JwtPayload } from "../lib/auth";
import type { Request } from "express";
import { z } from "zod/v4";
import { loginRateLimiter, expensiveAdminRateLimiter } from "../lib/security";
import { writeAdminAuditLog } from "../lib/audit";

const router: IRouter = Router();

const BCRYPT_ROUNDS = 12;

// Timing-equalising dummy hash: comparing against it when the account does not
// exist keeps the failure path the same duration as a wrong-password path, so
// the endpoint does not leak which e-mail addresses are registered. Derived
// from a per-process random value so no fixed credential material exists in
// the source tree.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync(randomUUID(), BCRYPT_ROUNDS);

// Admin passwords protect the entire CMS — require more than raw length.
const StrongPassword = z
  .string()
  .min(12, "Şifre en az 12 karakter olmalı")
  .max(128, "Şifre en fazla 128 karakter olabilir")
  .regex(/[a-z]/, "Şifre en az bir küçük harf içermeli")
  .regex(/[A-Z]/, "Şifre en az bir büyük harf içermeli")
  .regex(/[0-9]/, "Şifre en az bir rakam içermeli");

const LoginBody = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
});

router.post("/auth/login", loginRateLimiter, async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Geçersiz e-posta veya şifre" });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();
  const { password } = parsed.data;
  const [admin] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.email, email));

  if (!admin) {
    await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
    res.status(401).json({ error: "Geçersiz e-posta veya şifre" });
    return;
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    req.log.warn({ adminId: admin.id }, "Failed admin login attempt");
    // Audit failed login: use the target admin's id as the actor since the
    // request carries no valid session. This is intentional — a wrong-password
    // attempt on a real account is auditable, a wrong-email attempt is not (we
    // have already returned by then).
    // Write failed-login audit directly; we have the admin id without a session.
    try {
      await db.insert(adminAuditLogsTable).values({
        adminId: admin.id,
        action: "auth.login.failed",
        targetType: "admin_user",
        targetId: String(admin.id),
        details: { email: admin.email },
      });
    } catch { /* best-effort */ }
    res.status(401).json({ error: "Geçersiz e-posta veya şifre" });
    return;
  }

  const token = signToken({ adminId: admin.id, email: admin.email });
  req.log.info({ adminId: admin.id }, "Admin login successful");
  try {
    await db.insert(adminAuditLogsTable).values({
      adminId: admin.id,
      action: "auth.login.success",
      targetType: "admin_user",
      targetId: String(admin.id),
      details: { email: admin.email },
    });
  } catch { /* best-effort */ }
  // The token travels only inside an HttpOnly cookie — never in the JSON body
  // — so client-side script (and therefore XSS) can never read it.
  res.cookie(SESSION_COOKIE_NAME, token, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: SESSION_MAX_AGE_MS,
  });
  res.json({
    user: { id: admin.id, email: admin.email, name: admin.name },
  });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  // Clearing must use the same attributes the cookie was set with, or the
  // browser treats it as a different cookie and keeps the session alive.
  res.clearCookie(SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS);
  res.json({ ok: true });
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
  name: z.string().min(2, "Ad en az 2 karakter olmalı").max(120),
  email: z.string().email("Geçerli bir e-posta girin").max(254),
  password: StrongPassword,
});

const ChangePasswordBody = z.object({
  currentPassword: z.string().min(1, "Mevcut şifrenizi girin").max(128),
  newPassword: StrongPassword,
});

function parseAdminId(raw: string | string[] | undefined): number | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = z.coerce.number().int().positive().safeParse(value);
  return parsed.success ? parsed.data : null;
}

router.get("/admin/users", requireAuth, async (_req, res): Promise<void> => {
  const users = await db
    .select({ id: adminUsersTable.id, name: adminUsersTable.name, email: adminUsersTable.email, createdAt: adminUsersTable.createdAt })
    .from(adminUsersTable)
    .orderBy(adminUsersTable.createdAt);
  res.json(users);
});

router.post("/admin/users", requireAuth, expensiveAdminRateLimiter, async (req, res): Promise<void> => {
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
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const [user] = await db.insert(adminUsersTable).values({ name, email, passwordHash }).returning({
    id: adminUsersTable.id, name: adminUsersTable.name, email: adminUsersTable.email, createdAt: adminUsersTable.createdAt,
  });
  req.log.info({ userId: user.id }, "Admin user created");
  await writeAdminAuditLog(req, {
    action: "admin_user.create",
    targetType: "admin_user",
    targetId: user.id,
  });
  res.status(201).json(user);
});

router.put("/admin/users/:id/password", requireAuth, expensiveAdminRateLimiter, async (req, res): Promise<void> => {
  const payload = (req as Request & { adminPayload: JwtPayload }).adminPayload;
  const id = parseAdminId(req.params["id"]);
  if (id === null) { res.status(400).json({ error: "Geçersiz ID" }); return; }

  // Only the account owner may rotate a password, and only by proving they
  // know the current one. Otherwise a single stolen session could lock every
  // other administrator out of the CMS.
  if (id !== payload.adminId) {
    res.status(403).json({ error: "Yalnızca kendi şifrenizi değiştirebilirsiniz" });
    return;
  }

  const parsed = ChangePasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Geçersiz veri" });
    return;
  }
  const [existing] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.id, id));
  if (!existing) { res.status(404).json({ error: "Kullanıcı bulunamadı" }); return; }

  const currentValid = await bcrypt.compare(parsed.data.currentPassword, existing.passwordHash);
  if (!currentValid) {
    req.log.warn({ adminId: id }, "Password change rejected: wrong current password");
    res.status(401).json({ error: "Mevcut şifre hatalı" });
    return;
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, BCRYPT_ROUNDS);
  await db.update(adminUsersTable).set({ passwordHash }).where(eq(adminUsersTable.id, id));
  req.log.info({ targetUserId: id }, "Admin password changed");
  await writeAdminAuditLog(req, {
    action: "admin_user.password_change",
    targetType: "admin_user",
    targetId: id,
  });
  res.json({ ok: true });
});

router.delete("/admin/users/:id", requireAuth, expensiveAdminRateLimiter, async (req, res): Promise<void> => {
  const payload = (req as Request & { adminPayload: JwtPayload }).adminPayload;
  const id = parseAdminId(req.params["id"]);
  if (id === null) { res.status(400).json({ error: "Geçersiz ID" }); return; }
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
  await writeAdminAuditLog(req, {
    action: "admin_user.delete",
    targetType: "admin_user",
    targetId: id,
  });
  res.json({ ok: true });
});

export default router;
