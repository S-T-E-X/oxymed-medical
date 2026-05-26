import { Router, type IRouter } from "express";
import {
  db,
  warrantyDevicesTable,
  serviceReportsTable,
  serviceReportPhotosTable,
  serviceReportSignaturesTable,
  serviceReportPartsTable,
} from "@workspace/db";
import { eq, desc, and, sql, ilike, or } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { z } from "zod/v4";
import { randomUUID } from "crypto";

const router: IRouter = Router();

function parseId(raw: string | string[] | undefined): number {
  const s = Array.isArray(raw) ? raw[0] : raw;
  return parseInt(s ?? "", 10);
}

// ─── Report number generation ─────────────────────────────────────────────────

async function generateReportNo(): Promise<string> {
  const year = new Date().getFullYear();
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(serviceReportsTable)
    .where(sql`extract(year from created_at) = ${year}`);
  const seq = (Number(row?.count ?? 0) + 1).toString().padStart(6, "0");
  return `OXM-SRV-${year}-${seq}`;
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const ReportBody = z.object({
  deviceId: z.number().int().positive(),
  serviceDate: z.string().min(1),
  serviceTime: z.string().optional().nullable(),
  serviceType: z.string().min(1).default("periyodik_bakim"),
  priority: z.string().default("normal"),
  status: z.string().default("taslak"),
  serviceCode: z.string().optional().nullable(),
  reportDataJson: z.record(z.string(), z.unknown()).optional(),
  pdfUrl: z.string().optional().nullable(),
  createdBy: z.string().optional().nullable(),
  photos: z.array(z.object({
    url: z.string().min(1),
    caption: z.string().optional().nullable(),
    sortOrder: z.number().int().optional(),
  })).optional(),
  signatures: z.array(z.object({
    role: z.string().min(1),
    signerName: z.string().optional().nullable(),
    imageDataUrl: z.string().min(1),
  })).optional(),
  parts: z.array(z.object({
    partName: z.string().min(1),
    partCode: z.string().optional().nullable(),
    quantity: z.string().optional(),
    condition: z.string().optional().nullable(),
  })).optional(),
});

// ─── Helper: load full report ─────────────────────────────────────────────────

async function loadFullReport(id: number) {
  const [report] = await db
    .select()
    .from(serviceReportsTable)
    .where(eq(serviceReportsTable.id, id));
  if (!report) return null;

  const [device] = await db
    .select()
    .from(warrantyDevicesTable)
    .where(eq(warrantyDevicesTable.id, report.deviceId));

  const [photos, signatures, parts] = await Promise.all([
    db.select().from(serviceReportPhotosTable).where(eq(serviceReportPhotosTable.reportId, id)).orderBy(serviceReportPhotosTable.sortOrder),
    db.select().from(serviceReportSignaturesTable).where(eq(serviceReportSignaturesTable.reportId, id)),
    db.select().from(serviceReportPartsTable).where(eq(serviceReportPartsTable.reportId, id)),
  ]);

  return { ...report, device: device ?? null, photos, signatures, parts };
}

// ─── Routes: Admin ────────────────────────────────────────────────────────────

router.get("/service-reports", requireAuth, async (req, res): Promise<void> => {
  const deviceId = req.query["deviceId"] ? parseInt(req.query["deviceId"] as string, 10) : undefined;
  const status = req.query["status"] as string | undefined;
  const search = req.query["search"] as string | undefined;
  const limit = parseInt((req.query["limit"] as string) ?? "100", 10);
  const offset = parseInt((req.query["offset"] as string) ?? "0", 10);

  const conditions = [];
  if (deviceId) conditions.push(eq(serviceReportsTable.deviceId, deviceId));
  if (status) conditions.push(eq(serviceReportsTable.status, status));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  let reports = await db
    .select({
      report: serviceReportsTable,
      deviceSerialNumber: warrantyDevicesTable.serialNumber,
      deviceProductName: warrantyDevicesTable.productName,
      deviceModel: warrantyDevicesTable.model,
      deviceCustomerFirm: warrantyDevicesTable.customerFirm,
    })
    .from(serviceReportsTable)
    .leftJoin(warrantyDevicesTable, eq(serviceReportsTable.deviceId, warrantyDevicesTable.id))
    .where(where)
    .orderBy(desc(serviceReportsTable.createdAt))
    .limit(limit)
    .offset(offset);

  if (search) {
    const q = search.toLowerCase();
    reports = reports.filter((r) =>
      r.report.reportNo.toLowerCase().includes(q) ||
      (r.deviceSerialNumber ?? "").toLowerCase().includes(q) ||
      (r.deviceCustomerFirm ?? "").toLowerCase().includes(q) ||
      (r.deviceProductName ?? "").toLowerCase().includes(q)
    );
  }

  res.json({
    items: reports.map((r) => ({
      ...r.report,
      deviceSerialNumber: r.deviceSerialNumber,
      deviceProductName: r.deviceProductName,
      deviceModel: r.deviceModel,
      deviceCustomerFirm: r.deviceCustomerFirm,
    })),
  });
});

router.post("/service-reports", requireAuth, async (req, res): Promise<void> => {
  const parsed = ReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { photos, signatures, parts, ...reportData } = parsed.data;
  const reportNo = await generateReportNo();
  const verificationToken = randomUUID();

  const [report] = await db
    .insert(serviceReportsTable)
    .values({ ...reportData, reportNo, verificationToken })
    .returning();

  if (photos && photos.length > 0) {
    await db.insert(serviceReportPhotosTable).values(
      photos.map((p, i) => ({ reportId: report!.id, ...p, sortOrder: p.sortOrder ?? i }))
    );
  }
  if (signatures && signatures.length > 0) {
    await db.insert(serviceReportSignaturesTable).values(
      signatures.map((s) => ({ reportId: report!.id, ...s }))
    );
  }
  if (parts && parts.length > 0) {
    await db.insert(serviceReportPartsTable).values(
      parts.map((p) => ({ reportId: report!.id, ...p, quantity: p.quantity ?? "1" }))
    );
  }

  const full = await loadFullReport(report!.id);
  res.status(201).json(full);
});

router.get("/service-reports/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]);
  const full = await loadFullReport(id);
  if (!full) {
    res.status(404).json({ error: "Rapor bulunamadı" });
    return;
  }
  res.json(full);
});

router.patch("/service-reports/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]);
  const parsed = ReportBody.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { photos, signatures, parts, ...reportData } = parsed.data;

  if (Object.keys(reportData).length > 0) {
    await db
      .update(serviceReportsTable)
      .set({ ...reportData, updatedAt: new Date() })
      .where(eq(serviceReportsTable.id, id));
  }

  if (photos !== undefined) {
    await db.delete(serviceReportPhotosTable).where(eq(serviceReportPhotosTable.reportId, id));
    if (photos.length > 0) {
      await db.insert(serviceReportPhotosTable).values(
        photos.map((p, i) => ({ reportId: id, ...p, sortOrder: p.sortOrder ?? i }))
      );
    }
  }
  if (signatures !== undefined) {
    await db.delete(serviceReportSignaturesTable).where(eq(serviceReportSignaturesTable.reportId, id));
    if (signatures.length > 0) {
      await db.insert(serviceReportSignaturesTable).values(
        signatures.map((s) => ({ reportId: id, ...s }))
      );
    }
  }
  if (parts !== undefined) {
    await db.delete(serviceReportPartsTable).where(eq(serviceReportPartsTable.reportId, id));
    if (parts.length > 0) {
      await db.insert(serviceReportPartsTable).values(
        parts.map((p) => ({ reportId: id, ...p, quantity: p.quantity ?? "1" }))
      );
    }
  }

  const full = await loadFullReport(id);
  if (!full) {
    res.status(404).json({ error: "Rapor bulunamadı" });
    return;
  }
  res.json(full);
});

router.delete("/service-reports/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]);
  const [deleted] = await db.delete(serviceReportsTable).where(eq(serviceReportsTable.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Rapor bulunamadı" });
    return;
  }
  res.sendStatus(204);
});

// ─── PDF URL save endpoint ────────────────────────────────────────────────────

router.post("/service-reports/:id/save-pdf-url", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]);
  const { pdfUrl } = z.object({ pdfUrl: z.string().min(1) }).parse(req.body);
  const [updated] = await db
    .update(serviceReportsTable)
    .set({ pdfUrl, updatedAt: new Date() })
    .where(eq(serviceReportsTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Rapor bulunamadı" });
    return;
  }
  res.json({ pdfUrl: updated.pdfUrl });
});

// ─── Routes: Public ───────────────────────────────────────────────────────────

router.get("/service-reports/public/device/:qrToken", async (req, res): Promise<void> => {
  const qrToken = req.params["qrToken"]!;
  const [device] = await db
    .select()
    .from(warrantyDevicesTable)
    .where(eq(warrantyDevicesTable.qrToken, qrToken));
  if (!device) {
    res.status(404).json({ error: "Cihaz bulunamadı" });
    return;
  }

  const reports = await db
    .select({
      id: serviceReportsTable.id,
      reportNo: serviceReportsTable.reportNo,
      serviceDate: serviceReportsTable.serviceDate,
      serviceType: serviceReportsTable.serviceType,
      priority: serviceReportsTable.priority,
      status: serviceReportsTable.status,
      pdfUrl: serviceReportsTable.pdfUrl,
      verificationToken: serviceReportsTable.verificationToken,
      createdBy: serviceReportsTable.createdBy,
    })
    .from(serviceReportsTable)
    .where(and(
      eq(serviceReportsTable.deviceId, device.id),
      eq(serviceReportsTable.status, "tamamlandi"),
    ))
    .orderBy(desc(serviceReportsTable.serviceDate));

  res.json({
    device: {
      id: device.id,
      productName: device.productName,
      model: device.model,
      serialNumber: device.serialNumber,
      customerFirm: device.customerFirm,
      status: device.status,
      warrantyEndDate: device.warrantyEndDate,
      lastMaintenanceDate: device.lastMaintenanceDate,
      nextMaintenanceDate: device.nextMaintenanceDate,
      installDate: device.installDate,
      imageUrl: device.imageUrl,
    },
    reports,
  });
});

router.get("/service-reports/public/verify/:verificationToken", async (req, res): Promise<void> => {
  const token = req.params["verificationToken"]!;
  const [report] = await db
    .select()
    .from(serviceReportsTable)
    .where(eq(serviceReportsTable.verificationToken, token));
  if (!report) {
    res.status(404).json({ error: "Rapor bulunamadı veya geçersiz doğrulama kodu" });
    return;
  }
  const [device] = await db
    .select({
      serialNumber: warrantyDevicesTable.serialNumber,
      productName: warrantyDevicesTable.productName,
      model: warrantyDevicesTable.model,
      customerFirm: warrantyDevicesTable.customerFirm,
    })
    .from(warrantyDevicesTable)
    .where(eq(warrantyDevicesTable.id, report.deviceId));

  res.json({
    reportNo: report.reportNo,
    serviceDate: report.serviceDate,
    serviceType: report.serviceType,
    status: report.status,
    pdfUrl: report.pdfUrl,
    verificationToken: report.verificationToken,
    device: device ?? null,
  });
});

export default router;
