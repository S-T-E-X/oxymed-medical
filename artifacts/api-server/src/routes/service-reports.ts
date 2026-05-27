import { Router, type IRouter } from "express";
import {
  db,
  warrantyDevicesTable,
  serviceReportsTable,
  serviceReportPhotosTable,
  serviceReportSignaturesTable,
  serviceReportPartsTable,
  serialSequencesTable,
} from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { z } from "zod/v4";
import { randomUUID } from "crypto";
import { objectStorageClient as _objectStorageClient, ObjectStorageService } from "../lib/objectStorage";
import { buildReportHtml } from "../lib/serviceReportHtml";
import { sendServiceReportEmail } from "../lib/mailer";

const router: IRouter = Router();

function parseId(raw: string | string[] | undefined): number {
  const s = Array.isArray(raw) ? raw[0] : raw;
  return parseInt(s ?? "", 10);
}

// ─── Report number generation (atomic, race-safe via sequence table) ──────────

async function generateReportNo(): Promise<string> {
  const year = String(new Date().getFullYear());
  const [row] = await db
    .insert(serialSequencesTable)
    .values({ productCode: "SRV", dateKey: year, lastSeq: 1 })
    .onConflictDoUpdate({
      target: [serialSequencesTable.productCode, serialSequencesTable.dateKey],
      set: { lastSeq: sql`${serialSequencesTable.lastSeq} + 1` },
    })
    .returning({ lastSeq: serialSequencesTable.lastSeq });
  return `OXM-SRV-${year}-${String(row!.lastSeq).padStart(6, "0")}`;
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

// ─── Server-side PDF generation (puppeteer-core + chromium-min) ───────────────

router.post("/service-reports/:id/generate-pdf", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]);
  if (isNaN(id)) { res.status(400).json({ error: "Geçersiz ID" }); return; }

  const full = await loadFullReport(id);
  if (!full) { res.status(404).json({ error: "Rapor bulunamadı" }); return; }

  const html = buildReportHtml({
    reportNo: full.reportNo,
    serviceDate: full.serviceDate,
    serviceTime: full.serviceTime,
    serviceType: full.serviceType,
    priority: full.priority,
    status: full.status,
    serviceCode: full.serviceCode,
    createdBy: full.createdBy,
    device: full.device
      ? {
          productName: full.device.productName,
          model: full.device.model,
          serialNumber: full.device.serialNumber,
          customerFirm: full.device.customerFirm,
          installDate: full.device.installDate,
          warrantyEndDate: full.device.warrantyEndDate,
          lastMaintenanceDate: full.device.lastMaintenanceDate,
          nextMaintenanceDate: full.device.nextMaintenanceDate,
        }
      : { productName: "", model: "", serialNumber: "", customerFirm: "" },
    reportDataJson: (full.reportDataJson ?? {}) as Record<string, unknown>,
    photos: full.photos.map((p) => ({ url: (p as Record<string, unknown>)["url"] as string, caption: (p as Record<string, unknown>)["caption"] as string | null })),
    signatures: full.signatures.map((s) => ({
      role: (s as Record<string, unknown>)["role"] as string,
      signerName: (s as Record<string, unknown>)["signerName"] as string | null,
      imageDataUrl: (s as Record<string, unknown>)["imageDataUrl"] as string,
    })),
    parts: full.parts.map((p) => ({
      partName: (p as Record<string, unknown>)["partName"] as string,
      partCode: (p as Record<string, unknown>)["partCode"] as string | null,
      quantity: ((p as Record<string, unknown>)["quantity"] as string) ?? "1",
      condition: (p as Record<string, unknown>)["condition"] as string | null,
    })),
  });

  let browser: import("puppeteer-core").Browser | undefined;
  try {
    const chromium = await import("@sparticuz/chromium-min");
    const puppeteer = await import("puppeteer-core");

    const executablePath = await chromium.default.executablePath();

    browser = await puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: { width: 794, height: 1123 },
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 30_000 });

    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: false,
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    await browser.close();
    browser = undefined;

    // Upload via presigned URL
    const storageService = new ObjectStorageService();
    const uploadURL = await storageService.getObjectEntityUploadURL();
    const objectPath = storageService.normalizeObjectEntityPath(uploadURL);

    const uploadRes = await fetch(uploadURL, {
      method: "PUT",
      body: pdfBuffer,
      headers: { "Content-Type": "application/pdf" },
    });
    if (!uploadRes.ok) {
      throw new Error(`GCS upload failed: ${uploadRes.status}`);
    }

    // Store pdfUrl as a browser-accessible public URL
    const pdfUrl = `/api/storage/public-objects/${objectPath}`;
    await db
      .update(serviceReportsTable)
      .set({ pdfUrl, updatedAt: new Date() })
      .where(eq(serviceReportsTable.id, id));

    req.log.info({ reportId: id, pdfUrl }, "PDF generated and uploaded");
    res.json({ pdfUrl });
  } catch (err) {
    if (browser) { try { await browser.close(); } catch { /* ignore */ } }
    req.log.error({ err }, "PDF generation failed");
    res.status(500).json({ error: "PDF oluşturulamadı", detail: err instanceof Error ? err.message : String(err) });
  }
});

// ─── Send report PDF via email ────────────────────────────────────────────────

router.post("/service-reports/:id/send-email", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]);
  if (isNaN(id)) { res.status(400).json({ error: "Geçersiz ID" }); return; }

  const bodyParsed = z.object({
    email: z.string().email("Geçerli bir e-posta adresi girin"),
  }).safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.issues[0]?.message ?? "Geçersiz istek" });
    return;
  }
  const { email } = bodyParsed.data;

  const full = await loadFullReport(id);
  if (!full) { res.status(404).json({ error: "Rapor bulunamadı" }); return; }

  const html = buildReportHtml({
    reportNo: full.reportNo,
    serviceDate: full.serviceDate,
    serviceTime: full.serviceTime,
    serviceType: full.serviceType,
    priority: full.priority,
    status: full.status,
    serviceCode: full.serviceCode,
    createdBy: full.createdBy,
    device: full.device
      ? {
          productName: full.device.productName,
          model: full.device.model,
          serialNumber: full.device.serialNumber,
          customerFirm: full.device.customerFirm,
          installDate: full.device.installDate,
          warrantyEndDate: full.device.warrantyEndDate,
          lastMaintenanceDate: full.device.lastMaintenanceDate,
          nextMaintenanceDate: full.device.nextMaintenanceDate,
        }
      : { productName: "", model: "", serialNumber: "", customerFirm: "" },
    reportDataJson: (full.reportDataJson ?? {}) as Record<string, unknown>,
    photos: full.photos.map((p) => ({ url: (p as Record<string, unknown>)["url"] as string, caption: (p as Record<string, unknown>)["caption"] as string | null })),
    signatures: full.signatures.map((s) => ({
      role: (s as Record<string, unknown>)["role"] as string,
      signerName: (s as Record<string, unknown>)["signerName"] as string | null,
      imageDataUrl: (s as Record<string, unknown>)["imageDataUrl"] as string,
    })),
    parts: full.parts.map((p) => ({
      partName: (p as Record<string, unknown>)["partName"] as string,
      partCode: (p as Record<string, unknown>)["partCode"] as string | null,
      quantity: ((p as Record<string, unknown>)["quantity"] as string) ?? "1",
      condition: (p as Record<string, unknown>)["condition"] as string | null,
    })),
  });

  let browser: import("puppeteer-core").Browser | undefined;
  try {
    const chromium = await import("@sparticuz/chromium-min");
    const puppeteer = await import("puppeteer-core");

    const executablePath = await chromium.default.executablePath();
    browser = await puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: { width: 794, height: 1123 },
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 30_000 });

    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: false,
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    await browser.close();
    browser = undefined;

    const rd = (full.reportDataJson ?? {}) as Record<string, unknown>;
    const hospitalName = (rd["hospitalName"] as string | undefined) || full.device?.customerFirm || "";

    await sendServiceReportEmail({
      to: email,
      reportNo: full.reportNo,
      hospitalName,
      serviceDate: full.serviceDate,
      pdfBuffer: Buffer.from(pdfBuffer),
    });

    req.log.info({ reportId: id, email }, "Service report email sent");
    res.json({ success: true, email });
  } catch (err) {
    if (browser) { try { await browser.close(); } catch { /* ignore */ } }
    req.log.error({ err }, "Send email failed");
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: "E-posta gönderilemedi", detail: msg });
  }
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
