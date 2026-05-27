import { Router, type IRouter } from "express";
import { db, quoteForms, quoteFormItems, productionOrdersTable, emailLogsTable } from "@workspace/db";
import { eq, desc, like } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { sendQuoteFormEmail } from "../lib/mailer";
import { z } from "zod/v4";
import path from "path";
import { readFile } from "fs/promises";

const router: IRouter = Router();

function parseId(raw: string | string[]): number {
  return parseInt(Array.isArray(raw) ? raw[0] : raw, 10);
}

function buildQuoteHtmlForPdf(
  form: { quoteNo: string; firmaAdi: string | null; paraBirimi: string; hazirlayan: string | null; hazirlayanTelefon: string | null; hazirlayanEmail: string | null; notlar: string | null; teslimatSuresi: string | null; odemeSekli: string | null; iskonto: string | null; iskontoTipi: string | null; kdv: string | null },
  items: Array<{ title: string; modelCode: string | null; quantity: number | null; unit: string | null; unitPrice: string | null }>,
  logoBase64: string,
): string {
  const currency = form.paraBirimi ?? "EUR";
  const fmt = (v: string | number | null | undefined) =>
    v != null ? parseFloat(String(v)).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

  let subtotal = 0;
  for (const item of items) {
    const price = parseFloat(item.unitPrice ?? "0") || 0;
    subtotal += price * (item.quantity ?? 1);
  }
  const iskontoVal = parseFloat(form.iskonto ?? "0") || 0;
  const iskontoAmount = form.iskontoTipi === "yuzde" ? subtotal * (iskontoVal / 100) : iskontoVal;
  const afterDiscount = subtotal - iskontoAmount;
  const kdvRate = parseFloat(form.kdv ?? "0") || 0;
  const kdvAmount = afterDiscount * (kdvRate / 100);
  const total = afterDiscount + kdvAmount;
  const dateStr = new Date().toLocaleDateString("tr-TR");

  const itemRows = items.map((item, i) => `
    <tr style="background:${i % 2 === 0 ? "#ffffff" : "#f8fafc"}">
      <td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:11px;color:#1e293b">${item.title}${item.modelCode ? `<br><span style="font-size:10px;color:#94a3b8">${item.modelCode}</span>` : ""}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:11px;text-align:center;color:#475569">${item.quantity ?? 1} ${item.unit ?? "ADET"}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:11px;text-align:right;color:#1e293b">${fmt(item.unitPrice)} ${currency}</td>
      <td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:11px;text-align:right;font-weight:600;color:#1e293b">${fmt(String((parseFloat(item.unitPrice ?? "0") || 0) * (item.quantity ?? 1)))} ${currency}</td>
    </tr>`).join("");

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#1e293b; background:#fff; }
  @page { size:A4; margin:18mm 14mm; }
</style>
</head>
<body>
  <!-- Header -->
  <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:3px solid #08265f;padding-bottom:14px;margin-bottom:20px">
    <tr>
      <td>
        ${logoBase64 ? `<img src="${logoBase64}" alt="Oxymed Medikal" style="height:46px;display:block;object-fit:contain">` : `<div style="font-size:20px;font-weight:800;color:#08265f">OXYMED MEDİKAL</div>`}
        <div style="font-size:10px;color:#64748b;margin-top:4px">Medikal Gaz Sistemleri &amp; Hastane Ekipmanları</div>
      </td>
      <td align="right">
        <div style="background:#08265f;color:#fff;padding:8px 14px;border-radius:6px;display:inline-block;text-align:right">
          <div style="font-size:9px;letter-spacing:1px;text-transform:uppercase;opacity:0.7">Teklif No</div>
          <div style="font-size:15px;font-weight:800;margin-top:2px">${form.quoteNo}</div>
          <div style="font-size:9px;opacity:0.7;margin-top:2px">${dateStr}</div>
        </div>
      </td>
    </tr>
  </table>

  <!-- Client + Terms -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px">
    <tr>
      <td width="50%" style="vertical-align:top;padding-right:10px">
        <div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px">Sayın</div>
        <div style="font-size:13px;font-weight:700;color:#1e293b">${form.firmaAdi ?? "İlgili Kişi"}</div>
      </td>
      <td width="50%" style="vertical-align:top;padding-left:10px">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${form.teslimatSuresi ? `<tr><td style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;padding-bottom:2px">Teslimat Süresi</td><td style="font-size:11px;font-weight:600;text-align:right">${form.teslimatSuresi}</td></tr>` : ""}
          ${form.odemeSekli ? `<tr><td style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;padding-bottom:2px">Ödeme Şekli</td><td style="font-size:11px;font-weight:600;text-align:right">${form.odemeSekli}</td></tr>` : ""}
        </table>
      </td>
    </tr>
  </table>

  <!-- Items table -->
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;margin-bottom:16px">
    <thead>
      <tr style="background:#f1f5f9">
        <th style="padding:8px 10px;text-align:left;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:2px solid #e2e8f0">Ürün / Hizmet</th>
        <th style="padding:8px 10px;text-align:center;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:2px solid #e2e8f0">Miktar</th>
        <th style="padding:8px 10px;text-align:right;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:2px solid #e2e8f0">Birim Fiyat</th>
        <th style="padding:8px 10px;text-align:right;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:2px solid #e2e8f0">Toplam</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <!-- Totals -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px">
    <tr>
      <td width="55%"></td>
      <td width="45%">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:6px;overflow:hidden">
          <tr style="background:#f8fafc">
            <td style="padding:7px 10px;font-size:11px;color:#64748b">Ara Toplam</td>
            <td style="padding:7px 10px;font-size:11px;text-align:right;font-weight:600">${fmt(String(subtotal))} ${currency}</td>
          </tr>
          ${iskontoVal > 0 ? `<tr><td style="padding:7px 10px;font-size:11px;color:#64748b">İskonto (${form.iskontoTipi === "yuzde" ? `%${iskontoVal}` : `${fmt(String(iskontoVal))} ${currency}`})</td><td style="padding:7px 10px;font-size:11px;text-align:right;color:#dc2626;font-weight:600">-${fmt(String(iskontoAmount))} ${currency}</td></tr>` : ""}
          ${kdvRate > 0 ? `<tr><td style="padding:7px 10px;font-size:11px;color:#64748b">KDV (%${kdvRate})</td><td style="padding:7px 10px;font-size:11px;text-align:right;font-weight:600">${fmt(String(kdvAmount))} ${currency}</td></tr>` : ""}
          <tr style="background:#08265f">
            <td style="padding:9px 10px;font-size:12px;font-weight:700;color:#fff">Genel Toplam</td>
            <td style="padding:9px 10px;font-size:13px;font-weight:800;text-align:right;color:#fff">${fmt(String(total))} ${currency}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  ${form.notlar ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:12px 14px;margin-bottom:16px"><div style="font-size:10px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px">Notlar</div><div style="font-size:11px;color:#78350f;white-space:pre-line">${form.notlar}</div></div>` : ""}

  <!-- Preparer + Footer -->
  <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e2e8f0;padding-top:14px;margin-top:auto">
    <tr>
      <td>
        ${form.hazirlayan ? `<div style="font-size:11px;font-weight:700;color:#1e293b">${form.hazirlayan}</div>${form.hazirlayanTelefon ? `<div style="font-size:10px;color:#64748b;margin-top:2px">${form.hazirlayanTelefon}</div>` : ""}${form.hazirlayanEmail ? `<div style="font-size:10px;color:#3b82f6;margin-top:2px">${form.hazirlayanEmail}</div>` : ""}` : ""}
      </td>
      <td align="right" style="font-size:10px;color:#94a3b8;text-align:right">
        Bu e-posta Oxymed Medikal Gaz Sistemleri tarafından otomatik olarak gönderilmiştir.<br>
        <a href="https://www.oxymedmedical.com" style="color:#64748b">www.oxymedmedical.com</a>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function generateQuoteNo(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const prefix = `OXM-TFL-${year}-${day}${month}`;

  const [last] = await db
    .select({ quoteNo: quoteForms.quoteNo })
    .from(quoteForms)
    .where(like(quoteForms.quoteNo, `${prefix}%`))
    .orderBy(desc(quoteForms.quoteNo))
    .limit(1);

  let seq = 1;
  if (last) {
    const lastSeq = parseInt(last.quoteNo.slice(-2), 10);
    if (!isNaN(lastSeq)) seq = lastSeq + 1;
  }

  return `${prefix}${String(seq).padStart(2, "0")}`;
}

const QuoteFormBody = z.object({
  firmaAdi: z.string().optional().nullable(),
  firmaAdres: z.string().optional().nullable(),
  firmaTelefon: z.string().optional().nullable(),
  firmaEmail: z.string().optional().nullable(),
  firmaVergiDairesi: z.string().optional().nullable(),
  firmaVergiNo: z.string().optional().nullable(),
  teslimatAdresi: z.string().optional().nullable(),
  teslimatSuresi: z.string().optional().nullable(),
  odemeSekli: z.string().optional().nullable(),
  status: z.string().optional(),
  paraBirimi: z.string().optional(),
  hizmetler: z.array(z.string()).optional(),
  sartlar: z.array(z.string()).optional(),
  notlar: z.string().optional().nullable(),
  iskonto: z.string().optional().nullable(),
  iskontoTipi: z.enum(["yuzde", "tutar"]).optional(),
  kdv: z.string().optional().nullable(),
  hazirlayan: z.string().optional().nullable(),
  hazirlayanTelefon: z.string().optional().nullable(),
  hazirlayanEmail: z.string().optional().nullable(),
  hazirlayanImzaUrl: z.string().optional().nullable(),
  onaylayan: z.string().optional().nullable(),
  onaytayanGorev: z.string().optional().nullable(),
  onayTarihi: z.string().optional().nullable(),
});

const QuoteFormItemBody = z.object({
  productId: z.coerce.number().int().optional().nullable(),
  title: z.string().min(1),
  bullets: z.array(z.string()).optional(),
  modelCode: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  quantity: z.coerce.number().int().min(1).optional(),
  unit: z.string().optional(),
  unitPrice: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().optional(),
});

// List quote forms
router.get("/quote-forms", requireAuth, async (req, res): Promise<void> => {
  const limit = parseInt((req.query["limit"] as string) ?? "50", 10);
  const offset = parseInt((req.query["offset"] as string) ?? "0", 10);

  const rows = await db
    .select()
    .from(quoteForms)
    .orderBy(desc(quoteForms.createdAt))
    .limit(limit)
    .offset(offset);

  res.json({ items: rows });
});

// Get single quote form with items
router.get("/quote-forms/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const [form] = await db.select().from(quoteForms).where(eq(quoteForms.id, id));
  if (!form) {
    res.status(404).json({ error: "Quote form not found" });
    return;
  }
  const items = await db
    .select()
    .from(quoteFormItems)
    .where(eq(quoteFormItems.formId, id))
    .orderBy(quoteFormItems.sortOrder);
  res.json({ ...form, items });
});

// Create quote form
router.post("/quote-forms", requireAuth, async (req, res): Promise<void> => {
  const parsed = QuoteFormBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const quoteNo = await generateQuoteNo();
  const [form] = await db
    .insert(quoteForms)
    .values({ ...parsed.data, quoteNo })
    .returning();
  res.status(201).json(form);
});

async function generateProductionOrderNo(): Promise<string> {
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

// Update quote form
router.patch("/quote-forms/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const parsed = QuoteFormBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Detect approval transition → auto-create production orders
  if (parsed.data.status === "approved") {
    const [existing] = await db.select({ status: quoteForms.status }).from(quoteForms).where(eq(quoteForms.id, id));
    if (existing && existing.status !== "approved") {
      const items = await db
        .select()
        .from(quoteFormItems)
        .where(eq(quoteFormItems.formId, id));

      const [formRow] = await db.select({ firmaAdi: quoteForms.firmaAdi }).from(quoteForms).where(eq(quoteForms.id, id));

      // Consolidate same-product lines into one production order each
      const grouped = new Map<string, { productId: number | null; title: string; modelCode: string | null; quantity: number }>();
      for (const item of items) {
        if ((item.quantity ?? 0) < 1) continue;
        const key = item.productId ? `pid:${item.productId}` : `title:${item.title}:${item.modelCode ?? ""}`;
        const existing = grouped.get(key);
        if (existing) {
          existing.quantity += item.quantity ?? 1;
        } else {
          grouped.set(key, { productId: item.productId ?? null, title: item.title, modelCode: item.modelCode ?? null, quantity: item.quantity ?? 1 });
        }
      }
      for (const [, group] of grouped) {
        const orderNo = await generateProductionOrderNo();
        await db.insert(productionOrdersTable).values({
          orderNo,
          productId: group.productId ?? undefined,
          productTitle: group.title,
          productCode: group.modelCode ?? undefined,
          quantity: group.quantity,
          quoteFormId: id,
          customerName: formRow?.firmaAdi ?? undefined,
          status: "bekliyor",
          notes: `Otomatik oluşturuldu. Teklif No: ${id}`,
        });
      }
    }
  }

  const [form] = await db
    .update(quoteForms)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(quoteForms.id, id))
    .returning();
  if (!form) {
    res.status(404).json({ error: "Quote form not found" });
    return;
  }
  res.json(form);
});

// Delete quote form
router.delete("/quote-forms/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  await db.delete(quoteFormItems).where(eq(quoteFormItems.formId, id));
  const [deleted] = await db.delete(quoteForms).where(eq(quoteForms.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Quote form not found" });
    return;
  }
  res.sendStatus(204);
});

// List items for a form
router.get("/quote-forms/:id/items", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const items = await db
    .select()
    .from(quoteFormItems)
    .where(eq(quoteFormItems.formId, id))
    .orderBy(quoteFormItems.sortOrder);
  res.json(items);
});

// Add item
router.post("/quote-forms/:id/items", requireAuth, async (req, res): Promise<void> => {
  const formId = parseId(req.params["id"]!);
  const parsed = QuoteFormItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db
    .insert(quoteFormItems)
    .values({ ...parsed.data, formId })
    .returning();
  res.status(201).json(item);
});

// Update item
router.patch("/quote-forms/:id/items/:itemId", requireAuth, async (req, res): Promise<void> => {
  const itemId = parseId(req.params["itemId"]!);
  const parsed = QuoteFormItemBody.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db
    .update(quoteFormItems)
    .set(parsed.data)
    .where(eq(quoteFormItems.id, itemId))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  res.json(item);
});

// Delete item
router.delete("/quote-forms/:id/items/:itemId", requireAuth, async (req, res): Promise<void> => {
  const itemId = parseId(req.params["itemId"]!);
  const [deleted] = await db
    .delete(quoteFormItems)
    .where(eq(quoteFormItems.id, itemId))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  res.sendStatus(204);
});

// Send quote form via email
router.post("/quote-forms/:id/send-email", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const bodyParsed = z.object({
    email: z.string().email("Geçerli bir e-posta adresi girin"),
  }).safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.issues[0]?.message ?? "Geçersiz istek" });
    return;
  }
  const { email } = bodyParsed.data;

  const [form] = await db.select().from(quoteForms).where(eq(quoteForms.id, id));
  if (!form) { res.status(404).json({ error: "Teklif formu bulunamadı" }); return; }

  const items = await db
    .select()
    .from(quoteFormItems)
    .where(eq(quoteFormItems.formId, id))
    .orderBy(quoteFormItems.sortOrder);

  const sentBy = (req as typeof req & { adminPayload?: { email?: string } }).adminPayload?.email ?? null;

  // Generate PDF attachment
  let pdfBuffer: Buffer | undefined;
  let pdfBrowser: import("puppeteer-core").Browser | undefined;
  try {
    let logoBase64 = "";
    try {
      const logoPath = path.resolve(process.cwd(), "artifacts/oxymed-medikal/public/assets/brand/oxymed-service-logo.webp");
      const logoData = await readFile(logoPath);
      logoBase64 = `data:image/webp;base64,${logoData.toString("base64")}`;
    } catch {
      // proceed without logo
    }
    const pdfHtml = buildQuoteHtmlForPdf(
      {
        quoteNo: form.quoteNo,
        firmaAdi: form.firmaAdi ?? null,
        paraBirimi: form.paraBirimi,
        hazirlayan: form.hazirlayan ?? null,
        hazirlayanTelefon: form.hazirlayanTelefon ?? null,
        hazirlayanEmail: form.hazirlayanEmail ?? null,
        notlar: form.notlar ?? null,
        teslimatSuresi: form.teslimatSuresi ?? null,
        odemeSekli: form.odemeSekli ?? null,
        iskonto: form.iskonto ?? "0",
        iskontoTipi: form.iskontoTipi ?? "yuzde",
        kdv: form.kdv ?? "0",
      },
      items.map((item) => ({
        title: item.title,
        modelCode: item.modelCode ?? null,
        quantity: item.quantity ?? 1,
        unit: item.unit ?? "ADET",
        unitPrice: item.unitPrice ?? null,
      })),
      logoBase64,
    );
    const puppeteer = await import("puppeteer-core");
    const executablePath = process.env["CHROMIUM_PATH"] ?? "/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium";
    pdfBrowser = await puppeteer.default.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--no-zygote"],
      defaultViewport: { width: 794, height: 1123 },
      executablePath,
      headless: true,
    });
    const pdfPage = await pdfBrowser.newPage();
    await pdfPage.setContent(pdfHtml, { waitUntil: "load", timeout: 45_000 });
    const rawPdf = await pdfPage.pdf({
      format: "A4",
      landscape: false,
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    await pdfBrowser.close();
    pdfBrowser = undefined;
    pdfBuffer = Buffer.from(rawPdf);
  } catch (pdfErr) {
    if (pdfBrowser) { try { await pdfBrowser.close(); } catch { /* ignore */ } pdfBrowser = undefined; }
    req.log.warn({ err: pdfErr }, "Quote PDF generation failed, sending email without attachment");
  }

  try {
    await sendQuoteFormEmail({
      to: email,
      quoteNo: form.quoteNo,
      firmaAdi: form.firmaAdi ?? null,
      paraBirimi: form.paraBirimi,
      hazirlayan: form.hazirlayan ?? null,
      hazirlayanTelefon: form.hazirlayanTelefon ?? null,
      hazirlayanEmail: form.hazirlayanEmail ?? null,
      notlar: form.notlar ?? null,
      teslimatSuresi: form.teslimatSuresi ?? null,
      odemeSekli: form.odemeSekli ?? null,
      iskonto: form.iskonto ?? "0",
      iskontoTipi: form.iskontoTipi ?? "yuzde",
      kdv: form.kdv ?? "0",
      items: items.map((item) => ({
        title: item.title,
        modelCode: item.modelCode ?? null,
        quantity: item.quantity ?? 1,
        unit: item.unit ?? "ADET",
        unitPrice: item.unitPrice ?? null,
      })),
      pdfBuffer,
    });

    await db.insert(emailLogsTable).values({
      emailType: "quote_form",
      recipientEmail: email,
      subject: `Teklif - ${form.quoteNo}`,
      relatedId: id,
      relatedRef: form.quoteNo,
      status: "success",
      sentBy,
    });

    req.log.info({ formId: id, email }, "Quote form email sent");
    res.json({ success: true, email });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await db.insert(emailLogsTable).values({
      emailType: "quote_form",
      recipientEmail: email,
      subject: `Teklif - ${form.quoteNo}`,
      relatedId: id,
      relatedRef: form.quoteNo,
      status: "failed",
      errorMessage: msg,
      sentBy,
    }).catch(() => { /* best-effort */ });
    req.log.error({ err }, "Quote form email send failed");
    res.status(500).json({ error: "E-posta gönderilemedi", detail: msg });
  }
});

// Replace all items for a form (bulk set)
router.put("/quote-forms/:id/items", requireAuth, async (req, res): Promise<void> => {
  const formId = parseId(req.params["id"]!);
  const parsed = z.array(QuoteFormItemBody).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  await db.delete(quoteFormItems).where(eq(quoteFormItems.formId, formId));
  if (parsed.data.length === 0) {
    res.json([]);
    return;
  }
  const items = await db
    .insert(quoteFormItems)
    .values(parsed.data.map((item, i) => ({ ...item, formId, sortOrder: item.sortOrder ?? i })))
    .returning();
  res.json(items);
});

export default router;
