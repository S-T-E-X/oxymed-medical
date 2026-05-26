import { Router, type IRouter } from "express";
import { db, warrantyDevicesTable, serviceRecordsTable, warrantyClaimsTable, maintenanceKitsTable } from "@workspace/db";
import { eq, desc, ilike, or, and, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { z } from "zod/v4";
import { randomUUID } from "crypto";

const router: IRouter = Router();

function parseId(raw: string | undefined): number {
  return parseInt(raw ?? "", 10);
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const DeviceBody = z.object({
  productName: z.string().min(1),
  model: z.string().min(1),
  serialNumber: z.string().min(1),
  qrToken: z.string().optional(),
  customerFirm: z.string().min(1),
  customerContact: z.string().optional().nullable(),
  customerPhone: z.string().optional().nullable(),
  customerEmail: z.string().optional().nullable(),
  installDate: z.string().optional().nullable(),
  warrantyStartDate: z.string().optional().nullable(),
  warrantyEndDate: z.string().optional().nullable(),
  warrantyType: z.string().optional().nullable(),
  maintenanceContractStatus: z.string().optional().nullable(),
  lastMaintenanceDate: z.string().optional().nullable(),
  nextMaintenanceDate: z.string().optional().nullable(),
  status: z.string().optional(),
  notes: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});

const ServiceRecordBody = z.object({
  serviceDate: z.string().min(1),
  serviceType: z.string().min(1),
  servicePersonnel: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  workHours: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  photoUrls: z.array(z.string()).optional(),
  reportNo: z.string().optional().nullable(),
  kits: z.array(z.object({
    kitName: z.string().min(1),
    kitCode: z.string().optional().nullable(),
    quantity: z.string().optional().nullable(),
    unit: z.string().optional().nullable(),
  })).optional(),
});

const ClaimPublicBody = z.object({
  faultType: z.string().min(1),
  faultDescription: z.string().min(1),
  photoUrls: z.array(z.string()).optional(),
  workHours: z.string().optional().nullable(),
  claimantName: z.string().optional().nullable(),
  claimantPhone: z.string().optional().nullable(),
  claimantEmail: z.string().optional().nullable(),
});

const ClaimDecisionBody = z.object({
  decisionStatus: z.string().optional(),
  outOfWarrantyReason: z.string().optional().nullable(),
  adminApproval: z.boolean().optional().nullable(),
  adminNote: z.string().optional().nullable(),
  personnelNote: z.string().optional().nullable(),
  workHours: z.string().optional().nullable(),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeAlerts(devices: typeof warrantyDevicesTable.$inferSelect[]) {
  const today = new Date();
  const alerts: Array<{
    type: string;
    deviceId: number;
    serialNumber: string;
    productName: string;
    customerFirm: string;
    message: string;
    daysRemaining: number | null;
    warrantyEndDate: string | null;
    nextMaintenanceDate: string | null;
  }> = [];

  for (const d of devices) {
    if (d.warrantyEndDate) {
      const end = new Date(d.warrantyEndDate);
      const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff <= 30) {
        alerts.push({
          type: "warranty_expiring",
          deviceId: d.id,
          serialNumber: d.serialNumber,
          productName: d.productName,
          customerFirm: d.customerFirm,
          message: `Garanti bitimine ${diff} gün kaldı`,
          daysRemaining: diff,
          warrantyEndDate: d.warrantyEndDate,
          nextMaintenanceDate: null,
        });
      }
      if (diff < 0) {
        alerts.push({
          type: "warranty_expired",
          deviceId: d.id,
          serialNumber: d.serialNumber,
          productName: d.productName,
          customerFirm: d.customerFirm,
          message: `Garanti ${Math.abs(diff)} gün önce sona erdi`,
          daysRemaining: diff,
          warrantyEndDate: d.warrantyEndDate,
          nextMaintenanceDate: null,
        });
      }
    }
    if (d.nextMaintenanceDate) {
      const next = new Date(d.nextMaintenanceDate);
      const diff = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diff < 0) {
        alerts.push({
          type: "maintenance_overdue",
          deviceId: d.id,
          serialNumber: d.serialNumber,
          productName: d.productName,
          customerFirm: d.customerFirm,
          message: `Bakım ${Math.abs(diff)} gün gecikti`,
          daysRemaining: diff,
          warrantyEndDate: null,
          nextMaintenanceDate: d.nextMaintenanceDate,
        });
      } else if (diff <= 14) {
        alerts.push({
          type: "maintenance_due",
          deviceId: d.id,
          serialNumber: d.serialNumber,
          productName: d.productName,
          customerFirm: d.customerFirm,
          message: `Bakım zamanı ${diff === 0 ? "bugün" : `${diff} gün sonra`} geldi`,
          daysRemaining: diff,
          warrantyEndDate: null,
          nextMaintenanceDate: d.nextMaintenanceDate,
        });
      }
    }
  }
  return alerts;
}

// ─── Routes: Devices (public) ─────────────────────────────────────────────────

router.get("/warranty/devices/by-serial/:serialNo", async (req, res): Promise<void> => {
  const serialNo = req.params["serialNo"]!;
  const [device] = await db
    .select()
    .from(warrantyDevicesTable)
    .where(eq(warrantyDevicesTable.serialNumber, serialNo));
  if (!device) {
    res.status(404).json({ error: "Cihaz bulunamadı" });
    return;
  }
  const records = await db
    .select()
    .from(serviceRecordsTable)
    .where(eq(serviceRecordsTable.deviceId, device.id))
    .orderBy(desc(serviceRecordsTable.serviceDate));
  res.json({
    id: device.id,
    productName: device.productName,
    model: device.model,
    serialNumber: device.serialNumber,
    qrToken: device.qrToken,
    customerFirm: device.customerFirm,
    status: device.status,
    warrantyEndDate: device.warrantyEndDate,
    lastMaintenanceDate: device.lastMaintenanceDate,
    nextMaintenanceDate: device.nextMaintenanceDate,
    installDate: device.installDate,
    imageUrl: device.imageUrl,
    serviceRecords: records.map((r) => ({
      id: r.id,
      serviceDate: r.serviceDate,
      serviceType: r.serviceType,
      servicePersonnel: r.servicePersonnel,
    })),
  });
});

router.get("/warranty/devices/by-qr/:qrToken", async (req, res): Promise<void> => {
  const qrToken = req.params["qrToken"]!;
  const [device] = await db
    .select()
    .from(warrantyDevicesTable)
    .where(eq(warrantyDevicesTable.qrToken, qrToken));
  if (!device) {
    res.status(404).json({ error: "Cihaz bulunamadı" });
    return;
  }
  const records = await db
    .select()
    .from(serviceRecordsTable)
    .where(eq(serviceRecordsTable.deviceId, device.id))
    .orderBy(desc(serviceRecordsTable.serviceDate));
  res.json({
    id: device.id,
    productName: device.productName,
    model: device.model,
    serialNumber: device.serialNumber,
    qrToken: device.qrToken,
    customerFirm: device.customerFirm,
    status: device.status,
    warrantyEndDate: device.warrantyEndDate,
    lastMaintenanceDate: device.lastMaintenanceDate,
    nextMaintenanceDate: device.nextMaintenanceDate,
    installDate: device.installDate,
    imageUrl: device.imageUrl,
    serviceRecords: records.map((r) => ({
      id: r.id,
      serviceDate: r.serviceDate,
      serviceType: r.serviceType,
      servicePersonnel: r.servicePersonnel,
    })),
  });
});

// ─── Public: Get service record report by recordId ────────────────────────────

router.get("/warranty/records/:recordId", async (req, res): Promise<void> => {
  const recordId = parseId(req.params["recordId"]);
  const [record] = await db
    .select()
    .from(serviceRecordsTable)
    .where(eq(serviceRecordsTable.id, recordId));
  if (!record) {
    res.status(404).json({ error: "Servis kaydı bulunamadı" });
    return;
  }
  const [device] = await db
    .select()
    .from(warrantyDevicesTable)
    .where(eq(warrantyDevicesTable.id, record.deviceId));
  if (!device) {
    res.status(404).json({ error: "Cihaz bulunamadı" });
    return;
  }
  const kits = await db
    .select()
    .from(maintenanceKitsTable)
    .where(eq(maintenanceKitsTable.serviceRecordId, recordId));
  res.json({
    id: record.id,
    serviceDate: record.serviceDate,
    serviceType: record.serviceType,
    servicePersonnel: record.servicePersonnel,
    description: record.description,
    workHours: record.workHours,
    reportNo: record.reportNo,
    photoUrls: record.photoUrls,
    notes: record.notes,
    kits,
    deviceProductName: device.productName,
    deviceModel: device.model,
    deviceSerialNumber: device.serialNumber,
    deviceCustomerFirm: device.customerFirm,
    deviceStatus: device.status,
    deviceWarrantyEndDate: device.warrantyEndDate,
    deviceInstallDate: device.installDate,
    deviceImageUrl: device.imageUrl,
  });
});

// ─── Routes: Devices (admin) ──────────────────────────────────────────────────

router.get("/warranty/devices", requireAuth, async (req, res): Promise<void> => {
  const status = req.query["status"] as string | undefined;
  const search = req.query["search"] as string | undefined;
  const limit = parseInt((req.query["limit"] as string) ?? "100", 10);
  const offset = parseInt((req.query["offset"] as string) ?? "0", 10);

  const conditions = [];
  if (status) conditions.push(eq(warrantyDevicesTable.status, status));
  if (search) {
    const q = `%${search}%`;
    conditions.push(
      or(
        ilike(warrantyDevicesTable.productName, q),
        ilike(warrantyDevicesTable.serialNumber, q),
        ilike(warrantyDevicesTable.customerFirm, q),
        ilike(warrantyDevicesTable.model, q),
      ),
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [items, countRes] = await Promise.all([
    db.select().from(warrantyDevicesTable).where(where).orderBy(desc(warrantyDevicesTable.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(warrantyDevicesTable).where(where),
  ]);
  res.json({ items, total: Number(countRes[0]?.count ?? 0) });
});

router.post("/warranty/devices", requireAuth, async (req, res): Promise<void> => {
  const parsed = DeviceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const qrToken = parsed.data.qrToken || randomUUID();
  const [device] = await db
    .insert(warrantyDevicesTable)
    .values({ ...parsed.data, qrToken })
    .returning();
  res.status(201).json(device);
});

router.get("/warranty/devices/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]);
  const [device] = await db.select().from(warrantyDevicesTable).where(eq(warrantyDevicesTable.id, id));
  if (!device) {
    res.status(404).json({ error: "Cihaz bulunamadı" });
    return;
  }
  res.json(device);
});

router.patch("/warranty/devices/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]);
  const parsed = DeviceBody.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [device] = await db
    .update(warrantyDevicesTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(warrantyDevicesTable.id, id))
    .returning();
  if (!device) {
    res.status(404).json({ error: "Cihaz bulunamadı" });
    return;
  }
  res.json(device);
});

router.delete("/warranty/devices/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]);
  const [deleted] = await db.delete(warrantyDevicesTable).where(eq(warrantyDevicesTable.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Cihaz bulunamadı" });
    return;
  }
  res.sendStatus(204);
});

// ─── Routes: Service Records ──────────────────────────────────────────────────

router.get("/warranty/devices/:id/service-records", requireAuth, async (req, res): Promise<void> => {
  const deviceId = parseId(req.params["id"]);
  const records = await db
    .select()
    .from(serviceRecordsTable)
    .where(eq(serviceRecordsTable.deviceId, deviceId))
    .orderBy(desc(serviceRecordsTable.serviceDate));

  const kitsMap: Record<number, typeof maintenanceKitsTable.$inferSelect[]> = {};
  if (records.length > 0) {
    const recordIds = records.map((r) => r.id);
    const allKits = await db
      .select()
      .from(maintenanceKitsTable)
      .where(sql`${maintenanceKitsTable.serviceRecordId} = ANY(${sql.raw(`ARRAY[${recordIds.join(",")}]::int[]`)})`);
    for (const kit of allKits) {
      if (!kitsMap[kit.serviceRecordId]) kitsMap[kit.serviceRecordId] = [];
      kitsMap[kit.serviceRecordId]!.push(kit);
    }
  }

  res.json({ items: records.map((r) => ({ ...r, kits: kitsMap[r.id] ?? [] })) });
});

router.post("/warranty/devices/:id/service-records", requireAuth, async (req, res): Promise<void> => {
  const deviceId = parseId(req.params["id"]);
  const parsed = ServiceRecordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { kits, ...recordData } = parsed.data;
  const [record] = await db
    .insert(serviceRecordsTable)
    .values({ ...recordData, deviceId })
    .returning();
  let insertedKits: typeof maintenanceKitsTable.$inferSelect[] = [];
  if (kits && kits.length > 0) {
    insertedKits = await db
      .insert(maintenanceKitsTable)
      .values(kits.map((k) => ({ ...k, serviceRecordId: record!.id })))
      .returning();
  }
  res.status(201).json({ ...record, kits: insertedKits });
});

router.patch("/warranty/devices/:id/service-records/:recordId", requireAuth, async (req, res): Promise<void> => {
  const recordId = parseId(req.params["recordId"]);
  const parsed = ServiceRecordBody.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { kits, ...recordData } = parsed.data;
  const [record] = await db
    .update(serviceRecordsTable)
    .set({ ...recordData, updatedAt: new Date() })
    .where(eq(serviceRecordsTable.id, recordId))
    .returning();
  if (!record) {
    res.status(404).json({ error: "Servis kaydı bulunamadı" });
    return;
  }
  if (kits !== undefined) {
    await db.delete(maintenanceKitsTable).where(eq(maintenanceKitsTable.serviceRecordId, recordId));
    if (kits.length > 0) {
      await db.insert(maintenanceKitsTable).values(kits.map((k) => ({ ...k, serviceRecordId: recordId })));
    }
  }
  const updatedKits = await db.select().from(maintenanceKitsTable).where(eq(maintenanceKitsTable.serviceRecordId, recordId));
  res.json({ ...record, kits: updatedKits });
});

router.delete("/warranty/devices/:id/service-records/:recordId", requireAuth, async (req, res): Promise<void> => {
  const recordId = parseId(req.params["recordId"]);
  const [deleted] = await db.delete(serviceRecordsTable).where(eq(serviceRecordsTable.id, recordId)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Servis kaydı bulunamadı" });
    return;
  }
  res.sendStatus(204);
});

// ─── Routes: Warranty Claims ──────────────────────────────────────────────────

router.get("/warranty/devices/:id/claims", requireAuth, async (req, res): Promise<void> => {
  const deviceId = parseId(req.params["id"]);
  const claims = await db
    .select()
    .from(warrantyClaimsTable)
    .where(eq(warrantyClaimsTable.deviceId, deviceId))
    .orderBy(desc(warrantyClaimsTable.createdAt));
  res.json({ items: claims });
});

router.post("/warranty/devices/:id/claims", async (req, res): Promise<void> => {
  const deviceId = parseId(req.params["id"]);
  const parsed = ClaimPublicBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [claim] = await db
    .insert(warrantyClaimsTable)
    .values({ ...parsed.data, deviceId, decisionStatus: "incelemede" })
    .returning();
  res.status(201).json(claim);
});

router.patch("/warranty/devices/:id/claims/:claimId", requireAuth, async (req, res): Promise<void> => {
  const claimId = parseId(req.params["claimId"]);
  const parsed = ClaimDecisionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [claim] = await db
    .update(warrantyClaimsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(warrantyClaimsTable.id, claimId))
    .returning();
  if (!claim) {
    res.status(404).json({ error: "Talep bulunamadı" });
    return;
  }
  res.json(claim);
});

// ─── Routes: Alerts ───────────────────────────────────────────────────────────

router.get("/warranty/alerts", requireAuth, async (req, res): Promise<void> => {
  const devices = await db.select().from(warrantyDevicesTable);
  const alerts = computeAlerts(devices);
  res.json({ items: alerts });
});

export default router;
