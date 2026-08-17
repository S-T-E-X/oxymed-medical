import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, certificatesTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";
import { writeAdminAuditLog } from "../lib/audit";
import {
  CreateCertificateBody,
  UpdateCertificateBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function parseId(raw: string | string[]): number {
  // Strict positive-integer parsing: malformed input yields 0, which matches
  // no serial primary key, so callers fall through to their normal 404 path
  // instead of passing NaN into a SQL query.
  const str = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number(str);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 0;
}

router.get("/certificates", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(certificatesTable)
    .where(eq(certificatesTable.isActive, true))
    .orderBy(asc(certificatesTable.sortOrder), asc(certificatesTable.id));
  res.json(rows);
});

router.get("/admin/certificates", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db.select().from(certificatesTable).orderBy(asc(certificatesTable.sortOrder), asc(certificatesTable.id));
  res.json(rows);
});

router.post("/certificates", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateCertificateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [certificate] = await db.insert(certificatesTable).values(parsed.data).returning();
  res.status(201).json(certificate);
});

router.patch("/certificates/:id", requireAuth, async (req, res): Promise<void> => {
  const parsed = UpdateCertificateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [certificate] = await db
    .update(certificatesTable)
    .set(parsed.data)
    .where(eq(certificatesTable.id, parseId(req.params["id"]!)))
    .returning();
  if (!certificate) {
    res.status(404).json({ error: "Certificate not found" });
    return;
  }
  res.json(certificate);
});

router.delete("/certificates/:id", requireAuth, async (req, res): Promise<void> => {
  const [certificate] = await db
    .delete(certificatesTable)
    .where(eq(certificatesTable.id, parseId(req.params["id"]!)))
    .returning();
  if (!certificate) {
    res.status(404).json({ error: "Certificate not found" });
    return;
  }
  await writeAdminAuditLog(req, {
    action: "certificate.delete",
    targetType: "certificate",
    targetId: certificate.id,
    details: { title: certificate.title },
  });
  res.sendStatus(204);
});

export default router;