import { Router, type IRouter } from "express";
import {
  db,
  productionOrdersTable,
  productionOrderItemsTable,
  productBomItemsTable,
  materialReservationsTable,
  serialSequencesTable,
  materialStock,
  productsTable,
  productStock,
  warrantyDevicesTable,
  quoteForms,
  quoteFormItems,
  DEFAULT_QUALITY_CHECKLIST,
  templateBomItemsTable,
} from "@workspace/db";
import { eq, and, desc, asc, sql, like, inArray, isNotNull } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { parseLimitOffset } from "../lib/security";
import { z } from "zod/v4";
import { randomUUID } from "crypto";

const router: IRouter = Router();

function parseId(raw: string | string[]): number {
  // Strict positive-integer parsing: malformed input yields 0, which matches
  // no serial primary key, so callers fall through to their normal 404 path
  // instead of passing NaN into a SQL query.
  const str = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number(str);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 0;
}

// ── Order number generation ────────────────────────────────────────────────────

async function generateOrderNo(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const prefix = `OXM-URT-${year}-${day}${month}`;

  const [last] = await db
    .select({ orderNo: productionOrdersTable.orderNo })
    .from(productionOrdersTable)
    .where(like(productionOrdersTable.orderNo, `${prefix}%`))
    .orderBy(desc(productionOrdersTable.orderNo))
    .limit(1);

  let seq = 1;
  if (last) {
    const lastSeq = parseInt(last.orderNo.slice(-2), 10);
    if (!isNaN(lastSeq)) seq = lastSeq + 1;
  }
  return `${prefix}${String(seq).padStart(2, "0")}`;
}

// ── Serial number generation (atomic) ─────────────────────────────────────────

async function nextSerial(productCode: string): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dateKey = `${yy}${dd}${mm}`;

  const [row] = await db
    .insert(serialSequencesTable)
    .values({ productCode, dateKey, lastSeq: 1 })
    .onConflictDoUpdate({
      target: [serialSequencesTable.productCode, serialSequencesTable.dateKey],
      set: { lastSeq: sql`${serialSequencesTable.lastSeq} + 1` },
    })
    .returning({ lastSeq: serialSequencesTable.lastSeq });

  return `${productCode}${dateKey}${String(row!.lastSeq).padStart(2, "0")}`;
}

// ── Dashboard ──────────────────────────────────────────────────────────────────

router.get("/production/dashboard", requireAuth, async (req, res): Promise<void> => {
  const orders = await db.select({ status: productionOrdersTable.status }).from(productionOrdersTable);

  const counts: Record<string, number> = {};
  for (const o of orders) {
    counts[o.status] = (counts[o.status] ?? 0) + 1;
  }

  const lowMaterials = await db
    .select({ id: materialStock.id, name: materialStock.name, quantity: materialStock.quantity, minStock: materialStock.minStock, unit: materialStock.unit })
    .from(materialStock)
    .where(sql`${materialStock.quantity} <= ${materialStock.minStock}`);

  res.json({ counts, total: orders.length, lowMaterials });
});

// ── List orders ────────────────────────────────────────────────────────────────

router.get("/production/orders", requireAuth, async (req, res): Promise<void> => {
  const status = req.query["status"] as string | undefined;
  const { limit, offset } = parseLimitOffset(req.query as Record<string, unknown>, 100);

  const rows = await db
    .select()
    .from(productionOrdersTable)
    .where(status ? eq(productionOrdersTable.status, status) : undefined)
    .orderBy(desc(productionOrdersTable.createdAt))
    .limit(limit)
    .offset(offset);

  const itemCounts = await db
    .select({ orderId: productionOrderItemsTable.orderId, count: sql<number>`cast(count(*) as int)` })
    .from(productionOrderItemsTable)
    .groupBy(productionOrderItemsTable.orderId);

  const countMap = new Map(itemCounts.map((r) => [r.orderId, r.count]));
  const result = rows.map((o) => ({ ...o, itemCount: countMap.get(o.id) ?? 0 }));

  res.json({ items: result });
});

// ── Create order ───────────────────────────────────────────────────────────────

const OrderBody = z.object({
  productId: z.coerce.number().int().optional().nullable(),
  productTitle: z.string().min(1),
  productCode: z.string().optional().nullable(),
  quantity: z.coerce.number().int().min(1).default(1),
  quoteFormId: z.coerce.number().int().optional().nullable(),
  customerName: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

router.post("/production/orders", requireAuth, async (req, res): Promise<void> => {
  const parsed = OrderBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const orderNo = await generateOrderNo();
  const [order] = await db.insert(productionOrdersTable).values({ ...parsed.data, orderNo }).returning();
  res.status(201).json(order);
});

// ── Get order with items ───────────────────────────────────────────────────────

router.get("/production/orders/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const [order] = await db.select().from(productionOrdersTable).where(eq(productionOrdersTable.id, id));
  if (!order) { res.status(404).json({ error: "Üretim emri bulunamadı" }); return; }

  const items = await db
    .select()
    .from(productionOrderItemsTable)
    .where(eq(productionOrderItemsTable.orderId, id))
    .orderBy(asc(productionOrderItemsTable.id));

  const reservations = await db
    .select({
      id: materialReservationsTable.id,
      materialId: materialReservationsTable.materialId,
      reservedQty: materialReservationsTable.reservedQty,
      materialName: materialStock.name,
      unit: materialStock.unit,
    })
    .from(materialReservationsTable)
    .leftJoin(materialStock, eq(materialReservationsTable.materialId, materialStock.id))
    .where(eq(materialReservationsTable.orderId, id));

  res.json({ ...order, items, reservations });
});

// ── Update order ───────────────────────────────────────────────────────────────

const OrderUpdateBody = z.object({
  productTitle: z.string().min(1).optional(),
  productCode: z.string().optional().nullable(),
  quantity: z.coerce.number().int().min(1).optional(),
  status: z.string().optional(),
  customerName: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const QUALITY_GATED_STATUSES = new Set([
  "tamamlandi", "stokta", "sevkiyata_hazir", "sevk_edildi", "kurulum_bekliyor", "garanti_baslatildi",
]);

router.patch("/production/orders/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const parsed = OrderUpdateBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  if (parsed.data.status && QUALITY_GATED_STATUSES.has(parsed.data.status)) {
    const items = await db
      .select({ qualityChecklist: productionOrderItemsTable.qualityChecklist })
      .from(productionOrderItemsTable)
      .where(eq(productionOrderItemsTable.orderId, id));

    if (items.length > 0) {
      const allPassed = items.every((item) => {
        const cl = item.qualityChecklist as Record<string, boolean> | null;
        return cl && Object.values(cl).length > 0 && Object.values(cl).every(Boolean);
      });
      if (!allPassed) {
        res.status(422).json({
          error: "Tüm ürünlerin kalite kontrol listesi tamamlanmadan bu statüye geçilemez.",
        });
        return;
      }
    }
  }

  const [updated] = await db
    .update(productionOrdersTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(productionOrdersTable.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Üretim emri bulunamadı" }); return; }
  res.json(updated);
});

// ── Delete order ───────────────────────────────────────────────────────────────

router.delete("/production/orders/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  await db.delete(materialReservationsTable).where(eq(materialReservationsTable.orderId, id));
  await db.delete(productionOrderItemsTable).where(eq(productionOrderItemsTable.orderId, id));
  const [deleted] = await db.delete(productionOrdersTable).where(eq(productionOrdersTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Üretim emri bulunamadı" }); return; }
  res.sendStatus(204);
});

// ── Bulk delete orders ─────────────────────────────────────────────────────────

router.delete("/production/orders", requireAuth, async (req, res): Promise<void> => {
  const parsed = z.object({ ids: z.array(z.number().int().positive()).min(1) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Geçerli bir ID listesi girin" });
    return;
  }
  const { ids } = parsed.data;
  await db.delete(materialReservationsTable).where(inArray(materialReservationsTable.orderId, ids));
  await db.delete(productionOrderItemsTable).where(inArray(productionOrderItemsTable.orderId, ids));
  await db.delete(productionOrdersTable).where(inArray(productionOrdersTable.id, ids));
  res.json({ deleted: ids.length });
});

// ── Check finished goods stock ─────────────────────────────────────────────────

router.post("/production/orders/:id/check-stock", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const [order] = await db.select().from(productionOrdersTable).where(eq(productionOrdersTable.id, id));
  if (!order) { res.status(404).json({ error: "Üretim emri bulunamadı" }); return; }

  if (!order.productId) {
    res.json({ available: false, stockQty: 0, needed: order.quantity, message: "Ürün bağlantısı yok" });
    return;
  }

  const [stock] = await db.select().from(productStock).where(eq(productStock.productId, order.productId));
  const stockQty = stock?.quantity ?? 0;
  res.json({ available: stockQty >= order.quantity, stockQty, needed: order.quantity });
});

// ── Check materials (BOM vs stock) ────────────────────────────────────────────

router.post("/production/orders/:id/check-materials", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const [order] = await db.select().from(productionOrdersTable).where(eq(productionOrdersTable.id, id));
  if (!order) { res.status(404).json({ error: "Üretim emri bulunamadı" }); return; }

  if (!order.productId) {
    res.json({ canProduce: false, items: [], message: "Ürün bağlantısı yok, BOM kontrolü yapılamaz" });
    return;
  }

  const bom = await db
    .select({
      materialId: productBomItemsTable.materialId,
      requiredQty: productBomItemsTable.requiredQty,
      materialName: materialStock.name,
      unit: materialStock.unit,
      inStock: materialStock.quantity,
    })
    .from(productBomItemsTable)
    .leftJoin(materialStock, eq(productBomItemsTable.materialId, materialStock.id))
    .where(eq(productBomItemsTable.productId, order.productId));

  if (bom.length === 0) {
    res.json({ canProduce: true, items: [], message: "Bu ürün için BOM tanımlanmamış" });
    return;
  }

  const items = bom.map((b) => {
    const needed = b.requiredQty * order.quantity;
    const inStock = b.inStock ?? 0;
    return {
      materialId: b.materialId,
      materialName: b.materialName,
      unit: b.unit,
      needed,
      inStock,
      sufficient: inStock >= needed,
      shortage: Math.max(0, needed - inStock),
    };
  });

  const canProduce = items.every((i) => i.sufficient);
  res.json({ canProduce, items });
});

// ── Start production (generate serials, create items, reserve materials) ───────

router.post("/production/orders/:id/start", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const [order] = await db.select().from(productionOrdersTable).where(eq(productionOrdersTable.id, id));
  if (!order) { res.status(404).json({ error: "Üretim emri bulunamadı" }); return; }

  const existingItems = await db
    .select({ id: productionOrderItemsTable.id })
    .from(productionOrderItemsTable)
    .where(eq(productionOrderItemsTable.orderId, id))
    .limit(1);

  if (existingItems.length > 0) {
    res.status(409).json({ error: "Üretim zaten başlatılmış. Ürünlere ait seri numaraları mevcut." });
    return;
  }

  const productCode = order.productCode ?? "UNK";

  // Check and reserve materials if BOM exists
  if (order.productId) {
    const bom = await db
      .select({
        materialId: productBomItemsTable.materialId,
        requiredQty: productBomItemsTable.requiredQty,
        inStock: materialStock.quantity,
      })
      .from(productBomItemsTable)
      .leftJoin(materialStock, eq(productBomItemsTable.materialId, materialStock.id))
      .where(eq(productBomItemsTable.productId, order.productId));

    for (const b of bom) {
      const needed = b.requiredQty * order.quantity;
      if ((b.inStock ?? 0) < needed) {
        res.status(422).json({ error: "Yetersiz malzeme stoku. Önce malzeme kontrolü yapın." });
        return;
      }
    }

    // Reserve materials
    for (const b of bom) {
      const needed = b.requiredQty * order.quantity;
      await db.insert(materialReservationsTable).values({ orderId: id, materialId: b.materialId, reservedQty: needed });
      await db
        .update(materialStock)
        .set({ quantity: sql`${materialStock.quantity} - ${needed}`, updatedAt: new Date() })
        .where(eq(materialStock.id, b.materialId));
    }
  }

  // Generate items
  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, "0")}.${(now.getMonth() + 1).toString().padStart(2, "0")}.${now.getFullYear()}`;

  for (let i = 0; i < order.quantity; i++) {
    const serialNumber = await nextSerial(productCode);
    const qrToken = randomUUID();

    // Insert production order item
    const [item] = await db
      .insert(productionOrderItemsTable)
      .values({
        orderId: id,
        serialNumber,
        qrToken,
        status: "uretimde",
        qualityChecklist: { ...DEFAULT_QUALITY_CHECKLIST },
        productionDate: dateStr,
      })
      .returning();

    // Create warranty device draft
    const [device] = await db
      .insert(warrantyDevicesTable)
      .values({
        productName: order.productTitle,
        model: productCode,
        serialNumber,
        qrToken,
        customerFirm: order.customerName ?? "Taslak",
        status: "taslak",
        productionOrderItemId: item!.id,
        notes: `Üretim emri: ${order.orderNo}`,
      })
      .returning();

    // Link warranty device back to item
    await db
      .update(productionOrderItemsTable)
      .set({ warrantyDeviceId: device!.id })
      .where(eq(productionOrderItemsTable.id, item!.id));
  }

  const [updated] = await db
    .update(productionOrdersTable)
    .set({ status: "uretimde", updatedAt: new Date() })
    .where(eq(productionOrdersTable.id, id))
    .returning();

  const items = await db
    .select()
    .from(productionOrderItemsTable)
    .where(eq(productionOrderItemsTable.orderId, id))
    .orderBy(asc(productionOrderItemsTable.id));

  res.json({ order: updated, items });
});

// ── Assign from finished goods stock ──────────────────────────────────────────

router.post("/production/orders/:id/assign-from-stock", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const [order] = await db.select().from(productionOrdersTable).where(eq(productionOrdersTable.id, id));
  if (!order) { res.status(404).json({ error: "Üretim emri bulunamadı" }); return; }

  if (!order.productId) {
    res.status(422).json({ error: "Ürün bağlantısı olmayan siparişler için stoktan ayırma yapılamaz" });
    return;
  }

  const [stock] = await db.select().from(productStock).where(eq(productStock.productId, order.productId));
  if (!stock || stock.quantity < order.quantity) {
    res.status(422).json({ error: "Yeterli ürün stoğu yok" });
    return;
  }

  await db
    .update(productStock)
    .set({ quantity: sql`${productStock.quantity} - ${order.quantity}`, updatedAt: new Date() })
    .where(eq(productStock.productId, order.productId));

  const productCode = order.productCode ?? "UNK";
  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, "0")}.${(now.getMonth() + 1).toString().padStart(2, "0")}.${now.getFullYear()}`;

  for (let i = 0; i < order.quantity; i++) {
    const serialNumber = await nextSerial(productCode);
    const qrToken = randomUUID();

    // Stoktan karşılanan ürünler zaten kalite kontrolden geçmiş; checklist otomatik tamamlanır
    const fullChecklist: Record<string, boolean> = Object.fromEntries(
      Object.keys(DEFAULT_QUALITY_CHECKLIST).map((k) => [k, true]),
    );

    const [item] = await db
      .insert(productionOrderItemsTable)
      .values({
        orderId: id,
        serialNumber,
        qrToken,
        status: "tamamlandi",
        qualityChecklist: fullChecklist,
        productionDate: dateStr,
        notes: "Stoktan karşılandı",
      })
      .returning();

    const [device] = await db
      .insert(warrantyDevicesTable)
      .values({
        productName: order.productTitle,
        model: productCode,
        serialNumber,
        qrToken,
        customerFirm: order.customerName ?? "Taslak",
        status: "taslak",
        productionOrderItemId: item!.id,
        notes: `Stoktan karşılanan. Sipariş: ${order.orderNo}`,
      })
      .returning();

    await db
      .update(productionOrderItemsTable)
      .set({ warrantyDeviceId: device!.id })
      .where(eq(productionOrderItemsTable.id, item!.id));
  }

  const [updated] = await db
    .update(productionOrdersTable)
    .set({ status: "tamamlandi", updatedAt: new Date() })
    .where(eq(productionOrdersTable.id, id))
    .returning();

  const items = await db
    .select()
    .from(productionOrderItemsTable)
    .where(eq(productionOrderItemsTable.orderId, id))
    .orderBy(asc(productionOrderItemsTable.id));

  res.json({ order: updated, items });
});

// ── Update item quality checklist ─────────────────────────────────────────────

router.patch("/production/orders/:id/items/:itemId/quality", requireAuth, async (req, res): Promise<void> => {
  const itemId = parseId(req.params["itemId"]!);
  const ChecklistBody = z.object({ checklist: z.record(z.string(), z.boolean()) });
  const parsed = ChecklistBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [updated] = await db
    .update(productionOrderItemsTable)
    .set({ qualityChecklist: parsed.data.checklist, updatedAt: new Date() })
    .where(eq(productionOrderItemsTable.id, itemId))
    .returning();

  if (!updated) { res.status(404).json({ error: "Kalem bulunamadı" }); return; }
  res.json(updated);
});

// ── Update item status ─────────────────────────────────────────────────────────

router.patch("/production/orders/:id/items/:itemId/status", requireAuth, async (req, res): Promise<void> => {
  const itemId = parseId(req.params["itemId"]!);
  const Body = z.object({ status: z.string(), notes: z.string().optional().nullable() });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [updated] = await db
    .update(productionOrderItemsTable)
    .set({ status: parsed.data.status, notes: parsed.data.notes ?? undefined, updatedAt: new Date() })
    .where(eq(productionOrderItemsTable.id, itemId))
    .returning();

  if (!updated) { res.status(404).json({ error: "Kalem bulunamadı" }); return; }
  res.json(updated);
});

// ── Template BOM: Get ────────────────────────────────────────────────────────

router.get("/template-bom/:templateId", requireAuth, async (req, res): Promise<void> => {
  const templateId = parseId(req.params["templateId"]!);
  const bom = await db
    .select({
      id: templateBomItemsTable.id,
      materialId: templateBomItemsTable.materialId,
      requiredQty: templateBomItemsTable.requiredQty,
      materialName: materialStock.name,
      unit: materialStock.unit,
      price: materialStock.price,
      inStock: materialStock.quantity,
      productCode: materialStock.productCode,
    })
    .from(templateBomItemsTable)
    .leftJoin(materialStock, eq(templateBomItemsTable.materialId, materialStock.id))
    .where(eq(templateBomItemsTable.templateId, templateId))
    .orderBy(asc(templateBomItemsTable.id));
  res.json(bom);
});

// ── Template BOM: Set (replace all) ──────────────────────────────────────────

const TemplateBomItemBody = z.object({
  materialId: z.coerce.number().int(),
  requiredQty: z.coerce.number().positive(),
});

router.put("/template-bom/:templateId", requireAuth, async (req, res): Promise<void> => {
  const templateId = parseId(req.params["templateId"]!);
  const parsed = z.array(TemplateBomItemBody).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  await db.delete(templateBomItemsTable).where(eq(templateBomItemsTable.templateId, templateId));

  if (parsed.data.length === 0) { res.json([]); return; }

  const rows = await db
    .insert(templateBomItemsTable)
    .values(parsed.data.map((item) => ({
      templateId,
      materialId: item.materialId,
      requiredQty: String(item.requiredQty),
    })))
    .returning();
  res.json(rows);
});

// ── Consolidated materials for all production orders in a quote ───────────────

router.get("/production/consolidated-materials", requireAuth, async (req, res): Promise<void> => {
  const rawId = req.query["quoteFormId"];
  if (!rawId) { res.status(400).json({ error: "quoteFormId zorunludur" }); return; }
  const quoteFormId = parseId(String(rawId));

  const orders = await db
    .select({
      id: productionOrdersTable.id,
      productId: productionOrdersTable.productId,
      productTitle: productionOrdersTable.productTitle,
      quantity: productionOrdersTable.quantity,
      status: productionOrdersTable.status,
    })
    .from(productionOrdersTable)
    .where(and(
      eq(productionOrdersTable.quoteFormId, quoteFormId),
      isNotNull(productionOrdersTable.productId),
    ));

  if (orders.length === 0) {
    res.json({ items: [], orders: [] });
    return;
  }

  const productIds = [...new Set(orders.map((o) => o.productId!))] as number[];

  const bom = await db
    .select({
      productId: productBomItemsTable.productId,
      materialId: productBomItemsTable.materialId,
      requiredQty: productBomItemsTable.requiredQty,
      materialName: materialStock.name,
      productCode: materialStock.productCode,
      unit: materialStock.unit,
      inStock: materialStock.quantity,
      price: materialStock.price,
    })
    .from(productBomItemsTable)
    .leftJoin(materialStock, eq(productBomItemsTable.materialId, materialStock.id))
    .where(inArray(productBomItemsTable.productId, productIds));

  type MaterialEntry = {
    materialId: number;
    materialName: string;
    productCode: string | null;
    unit: string;
    inStock: number;
    price: string | null;
    totalRequired: number;
    breakdown: Array<{ productTitle: string; orderQty: number; bomQty: number; lineQty: number }>;
  };
  const materialMap = new Map<number, MaterialEntry>();

  for (const bomItem of bom) {
    for (const order of orders) {
      if (order.productId !== bomItem.productId) continue;
      const lineQty = bomItem.requiredQty * order.quantity;
      const existing = materialMap.get(bomItem.materialId);
      if (existing) {
        existing.totalRequired += lineQty;
        existing.breakdown.push({
          productTitle: order.productTitle,
          orderQty: order.quantity,
          bomQty: bomItem.requiredQty,
          lineQty,
        });
      } else {
        materialMap.set(bomItem.materialId, {
          materialId: bomItem.materialId,
          materialName: bomItem.materialName ?? "Bilinmeyen",
          productCode: bomItem.productCode ?? null,
          unit: bomItem.unit ?? "adet",
          inStock: bomItem.inStock ?? 0,
          price: bomItem.price ?? null,
          totalRequired: lineQty,
          breakdown: [{
            productTitle: order.productTitle,
            orderQty: order.quantity,
            bomQty: bomItem.requiredQty,
            lineQty,
          }],
        });
      }
    }
  }

  const items = [...materialMap.values()].sort((a, b) =>
    a.materialName.localeCompare(b.materialName, "tr"),
  );
  res.json({
    items,
    orders: orders.map((o) => ({ id: o.id, productTitle: o.productTitle, quantity: o.quantity, status: o.status })),
  });
});

// ── Product BOM: Get ──────────────────────────────────────────────────────────

router.get("/production/bom/:productId", requireAuth, async (req, res): Promise<void> => {
  const productId = parseId(req.params["productId"]!);

  const bom = await db
    .select({
      id: productBomItemsTable.id,
      materialId: productBomItemsTable.materialId,
      requiredQty: productBomItemsTable.requiredQty,
      materialName: materialStock.name,
      unit: materialStock.unit,
      inStock: materialStock.quantity,
      productCode: materialStock.productCode,
    })
    .from(productBomItemsTable)
    .leftJoin(materialStock, eq(productBomItemsTable.materialId, materialStock.id))
    .where(eq(productBomItemsTable.productId, productId))
    .orderBy(asc(productBomItemsTable.id));

  res.json(bom);
});

// ── BOM: Set (replace all) ────────────────────────────────────────────────────

const BomItemBody = z.object({
  materialId: z.coerce.number().int(),
  requiredQty: z.coerce.number().int().min(1).default(1),
});

router.put("/production/bom/:productId", requireAuth, async (req, res): Promise<void> => {
  const productId = parseId(req.params["productId"]!);
  const parsed = z.array(BomItemBody).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  await db.delete(productBomItemsTable).where(eq(productBomItemsTable.productId, productId));

  if (parsed.data.length === 0) { res.json([]); return; }

  const rows = await db
    .insert(productBomItemsTable)
    .values(parsed.data.map((item) => ({ ...item, productId })))
    .returning();

  res.json(rows);
});

export default router;
