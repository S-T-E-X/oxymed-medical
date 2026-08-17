import { Router, type IRouter } from "express";
import { db, quoteForms, quoteFormItems, quoteGroupTemplates, productionOrdersTable, emailLogsTable, templateBomItemsTable } from "@workspace/db";
import { eq, desc, like } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { parseLimitOffset } from "../lib/security";
import { sendQuoteFormEmail } from "../lib/mailer";
import { openai } from "@workspace/integrations-openai-ai-server";
import { z } from "zod/v4";
import path from "path";
import { readFile } from "fs/promises";
import { QUOTE_LANGUAGE_CODES, quoteLanguageEnglishName, translateQuoteUnit } from "../lib/quoteLanguages";

const router: IRouter = Router();

function parseId(raw: string | string[]): number {
  // Strict positive-integer parsing: malformed input yields 0, which matches
  // no serial primary key, so callers fall through to their normal 404 path
  // instead of passing NaN into a SQL query.
  const str = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number(str);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 0;
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
  language: z.enum(QUOTE_LANGUAGE_CODES).optional(),
  hizmetler: z.array(z.string()).optional(),
  sartlar: z.array(z.string()).optional(),
  notlar: z.string().optional().nullable(),
  iskonto: z.string().optional().nullable(),
  iskontoTipi: z.enum(["yuzde", "tutar"]).optional(),
  kdv: z.string().optional().nullable(),
  showKdv: z.boolean().optional(),
  showGenelToplam: z.boolean().optional(),
  hazirlayan: z.string().optional().nullable(),
  hazirlayanTelefon: z.string().optional().nullable(),
  hazirlayanEmail: z.string().optional().nullable(),
  hazirlayanImzaUrl: z.string().optional().nullable(),
  onaylayan: z.string().optional().nullable(),
  onaytayanGorev: z.string().optional().nullable(),
  onayTarihi: z.string().optional().nullable(),
  karsiFirmaLogoUrl: z.string().optional().nullable(),
});

const QuoteFormItemBody = z.object({
  productId: z.coerce.number().int().optional().nullable(),
  itemType: z.enum(["single", "group", "child"]).optional().default("single"),
  parentItemId: z.coerce.number().int().optional().nullable(),
  title: z.string().min(1),
  bullets: z.array(z.string()).optional(),
  modelCode: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  quantity: z.coerce.number().int().min(0).optional(),
  unit: z.string().optional(),
  unitPrice: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().optional(),
  showInPdf: z.boolean().optional().default(true),
  pageBreakBefore: z.boolean().optional().default(false),
  keepWithPrevious: z.boolean().optional().default(false),
  keepWithNext: z.boolean().optional().default(false),
});

// pageBreakBefore (push to new page) and keepWithPrevious (pull onto previous
// page) are mutually exclusive; pageBreakBefore wins.
function normalizePageFlags<T extends { pageBreakBefore?: boolean; keepWithPrevious?: boolean }>(
  item: T,
): T {
  return item.pageBreakBefore ? { ...item, keepWithPrevious: false } : item;
}

// List quote forms
router.get("/quote-forms", requireAuth, async (req, res): Promise<void> => {
  const { limit, offset } = parseLimitOffset(req.query as Record<string, unknown>, 50);

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
      // Skip group headers (itemType=group) — only process single and child items
      const grouped = new Map<string, { productId: number | null; title: string; modelCode: string | null; quantity: number }>();
      for (const item of items) {
        if (item.itemType === "group") continue;
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

// Copies a form's fields and items into a brand-new draft (new quoteNo,
// status reset). Shared by /duplicate and /translate. Returns the new form,
// the new items, and an oldItemId → newItemId map for follow-up updates
// (e.g. writing translated text back onto the copy).
async function copyQuoteFormWithItems(
  original: typeof quoteForms.$inferSelect,
  originalItems: (typeof quoteFormItems.$inferSelect)[],
  overrides: Partial<typeof quoteForms.$inferInsert> = {},
) {
  const quoteNo = await generateQuoteNo();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, quoteNo: _qn, createdAt: _ca, updatedAt: _ua, ...formFields } = original;
  const [newForm] = await db
    .insert(quoteForms)
    .values({ ...formFields, quoteNo, status: "draft", ...overrides })
    .returning();

  // Insert items: parents first, then children with remapped parentItemId
  const idMap = new Map<number, number>(); // oldId → newId

  const parents = originalItems.filter((it) => it.itemType !== "child");
  const children = originalItems.filter((it) => it.itemType === "child");

  for (const item of parents) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _iid, formId: _fid, ...itemFields } = item;
    const [inserted] = await db
      .insert(quoteFormItems)
      .values({ ...itemFields, formId: newForm!.id, parentItemId: null })
      .returning();
    idMap.set(item.id, inserted!.id);
  }

  for (const item of children) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _iid, formId: _fid, ...itemFields } = item;
    const newParentId = item.parentItemId ? (idMap.get(item.parentItemId) ?? null) : null;
    const [inserted] = await db
      .insert(quoteFormItems)
      .values({ ...itemFields, formId: newForm!.id, parentItemId: newParentId })
      .returning();
    idMap.set(item.id, inserted!.id);
  }

  const newItems = await db
    .select()
    .from(quoteFormItems)
    .where(eq(quoteFormItems.formId, newForm!.id))
    .orderBy(quoteFormItems.sortOrder);

  return { newForm: newForm!, newItems, idMap };
}

// Duplicate quote form — copies all fields and items, generates new quoteNo and timestamp
router.post("/quote-forms/:id/duplicate", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);

  const [original] = await db.select().from(quoteForms).where(eq(quoteForms.id, id));
  if (!original) {
    res.status(404).json({ error: "Quote form not found" });
    return;
  }

  const originalItems = await db
    .select()
    .from(quoteFormItems)
    .where(eq(quoteFormItems.formId, id))
    .orderBy(quoteFormItems.sortOrder);

  const { newForm } = await copyQuoteFormWithItems(original, originalItems);
  res.status(201).json(newForm);
});

// Translate a quote form into another language — duplicates the form (new
// quoteNo, draft status, source form untouched) and uses OpenAI to translate
// the free-text fields (delivery/payment terms, notes, services, terms,
// approver title, item titles/bullets) into the target language.
const TranslateBody = z.object({
  targetLanguage: z.enum(QUOTE_LANGUAGE_CODES),
});

type TranslatableManifest = {
  teslimatSuresi: string;
  odemeSekli: string;
  notlar: string;
  onaytayanGorev: string;
  hizmetler: string[];
  sartlar: string[];
  items: Record<string, { title: string; bullets: string[]; modelCode: string }>;
};

async function translateManifest(
  manifest: TranslatableManifest,
  sourceLanguage: string,
  targetLanguage: string,
): Promise<TranslatableManifest> {
  const sourceName = quoteLanguageEnglishName(sourceLanguage);
  const targetName = quoteLanguageEnglishName(targetLanguage);

  const completion = await openai.chat.completions.create({
    model: "gpt-5.6-terra",
    max_completion_tokens: 8192,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          `You are a professional B2B translator for a medical equipment manufacturer's sales quotations. ` +
          `Translate every string value in the given JSON from ${sourceName} to ${targetName}. ` +
          `Keep the exact same JSON keys and structure — only translate the string VALUES. ` +
          `Preserve numbers, percentages, and currency codes unchanged. ` +
          `Each item has a "modelCode" field: if it is a genuine product/part code (short alphanumeric string with no ` +
          `natural-language words, e.g. "OXM-1234"), leave it completely unchanged; if it is instead a natural-language ` +
          `descriptive phrase (e.g. a variant label like "1 Gaz İçin" meaning "For 1 gas outlet"), translate it like any ` +
          `other text. ` +
          `Use natural, professional, native-sounding business language appropriate for a formal price quotation. ` +
          `If a value is an empty string, keep it as an empty string. ` +
          `Respond with ONLY a JSON object matching the input shape, no commentary.`,
      },
      {
        role: "user",
        content: JSON.stringify(manifest),
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Çeviri servisinden yanıt alınamadı");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Çeviri servisi geçersiz bir yanıt döndürdü");
  }
  return parsed as TranslatableManifest;
}

router.post("/quote-forms/:id/translate", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const parsedBody = TranslateBody.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: parsedBody.error.issues[0]?.message ?? "Geçersiz istek" });
    return;
  }
  const { targetLanguage } = parsedBody.data;

  const [original] = await db.select().from(quoteForms).where(eq(quoteForms.id, id));
  if (!original) {
    res.status(404).json({ error: "Teklif formu bulunamadı" });
    return;
  }

  const sourceLanguage = (QUOTE_LANGUAGE_CODES as readonly string[]).includes(original.language ?? "")
    ? (original.language as string)
    : "tr";

  if (sourceLanguage === targetLanguage) {
    res.status(400).json({ error: "Kaynak dil ile hedef dil aynı olamaz" });
    return;
  }

  const originalItems = await db
    .select()
    .from(quoteFormItems)
    .where(eq(quoteFormItems.formId, id))
    .orderBy(quoteFormItems.sortOrder);

  const { newForm, newItems, idMap } = await copyQuoteFormWithItems(original, originalItems, {
    language: targetLanguage,
  });

  try {
    const manifest: TranslatableManifest = {
      teslimatSuresi: original.teslimatSuresi ?? "",
      odemeSekli: original.odemeSekli ?? "",
      notlar: original.notlar ?? "",
      onaytayanGorev: original.onaytayanGorev ?? "",
      hizmetler: original.hizmetler ?? [],
      sartlar: original.sartlar ?? [],
      items: Object.fromEntries(
        originalItems.map((it) => [
          String(idMap.get(it.id) ?? it.id),
          { title: it.title ?? "", bullets: it.bullets ?? [], modelCode: it.modelCode ?? "" },
        ]),
      ),
    };

    const translated = await translateManifest(manifest, sourceLanguage, targetLanguage);

    await db
      .update(quoteForms)
      .set({
        teslimatSuresi: translated.teslimatSuresi ?? original.teslimatSuresi,
        odemeSekli: translated.odemeSekli ?? original.odemeSekli,
        notlar: translated.notlar ?? original.notlar,
        onaytayanGorev: translated.onaytayanGorev ?? original.onaytayanGorev,
        hizmetler: Array.isArray(translated.hizmetler) ? translated.hizmetler : original.hizmetler,
        sartlar: Array.isArray(translated.sartlar) ? translated.sartlar : original.sartlar,
        updatedAt: new Date(),
      })
      .where(eq(quoteForms.id, newForm.id));

    for (const item of newItems) {
      const t = translated.items?.[String(item.id)];
      if (!t) continue;
      await db
        .update(quoteFormItems)
        .set({
          title: t.title || item.title,
          bullets: Array.isArray(t.bullets) ? t.bullets : item.bullets,
          modelCode: t.modelCode || item.modelCode,
          unit: translateQuoteUnit(item.unit, targetLanguage),
        })
        .where(eq(quoteFormItems.id, item.id));
    }

    const [finalForm] = await db.select().from(quoteForms).where(eq(quoteForms.id, newForm.id));
    res.status(201).json(finalForm);
  } catch (err) {
    // Roll back the partially-created duplicate so a failed translation
    // doesn't leave an untranslated orphan draft behind.
    await db.delete(quoteFormItems).where(eq(quoteFormItems.formId, newForm.id)).catch(() => { /* best-effort */ });
    await db.delete(quoteForms).where(eq(quoteForms.id, newForm.id)).catch(() => { /* best-effort */ });
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err, formId: id, targetLanguage }, "Quote form translation failed");
    res.status(500).json({ error: "Çeviri başarısız", detail: msg });
  }
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
    .values({ ...normalizePageFlags(parsed.data), formId })
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
    .set(normalizePageFlags(parsed.data))
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
    subject: z.string().max(300).optional(),
    bodyText: z.string().max(3000).optional(),
  }).safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.issues[0]?.message ?? "Geçersiz istek" });
    return;
  }
  const { email, subject, bodyText } = bodyParsed.data;

  const [form] = await db.select().from(quoteForms).where(eq(quoteForms.id, id));
  if (!form) { res.status(404).json({ error: "Teklif formu bulunamadı" }); return; }

  if (form.status !== "sent" && form.status !== "approved") {
    res.status(409).json({ error: "Yalnızca gönderilmiş veya onaylanmış teklif formları e-posta ile gönderilebilir" });
    return;
  }

  const sentBy = (req as typeof req & { adminPayload?: { email?: string } }).adminPayload?.email ?? null;

  let logoBase64 = "";
  try {
    const logoPath = path.resolve(process.cwd(), "artifacts/oxymed-medikal/public/assets/brand/oxymed-service-logo.webp");
    const logoData = await readFile(logoPath);
    logoBase64 = `data:image/webp;base64,${logoData.toString("base64")}`;
  } catch {
    // proceed without logo
  }

  const rawJwt = (req.headers["authorization"] as string | undefined)?.replace(/^Bearer\s+/i, "") ?? "";

  let pdfBuffer: Buffer | undefined;
  let pdfBrowser: import("puppeteer-core").Browser | undefined;
  try {
    const puppeteer = await import("puppeteer-core");
    const executablePath = process.env["CHROMIUM_PATH"] ?? "/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium";
    pdfBrowser = await puppeteer.default.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--no-zygote"],
      defaultViewport: { width: 1240, height: 1754 },
      executablePath,
      headless: true,
    });
    const pdfPage = await pdfBrowser.newPage();
    await pdfPage.evaluateOnNewDocument(
      (tokenKey: string, token: string) => { localStorage.setItem(tokenKey, token); },
      "admin_token",
      rawJwt,
    );
    await pdfPage.goto(`http://localhost:80/teklif-goruntule/${id}`, {
      waitUntil: "networkidle2",
      timeout: 60_000,
    });
    await pdfPage.waitForSelector(".qt-page", { timeout: 20_000 }).catch(() => { /* render anyway */ });
    // Wait for the measured pagination pass to settle so trailing items pack
    // onto the footer page correctly. Falls through if it never sets the flag.
    await pdfPage.waitForSelector("main.qt-preview[data-quote-ready='1']", { timeout: 10_000 }).catch(() => { /* render anyway */ });
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
      logoBase64,
      pdfBuffer,
      subject,
      bodyText,
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
    .values(
      parsed.data.map((item, i) => ({
        ...normalizePageFlags(item),
        formId,
        sortOrder: item.sortOrder ?? i,
      })),
    )
    .returning();
  res.json(items);
});

// ─── Group Template Routes ──────────────────────────────────────────────────

// List templates
router.get("/quote-group-templates", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(quoteGroupTemplates)
    .orderBy(quoteGroupTemplates.sortOrder, quoteGroupTemplates.createdAt);
  res.json(rows);
});

const GroupTemplateBody = z.object({
  name: z.string().min(1),
  nameEn: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  modelCode: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  adminNotes: z.string().optional().nullable(),
  children: z.array(z.object({
    title: z.string().min(1),
    titleEn: z.string().optional(),
    modelCode: z.string().optional(),
    unit: z.string().optional(),
    quantity: z.number().optional(),
    unitPrice: z.string().optional(),
    bullets: z.array(z.string()).optional(),
    bulletsEn: z.array(z.string()).optional(),
    imageUrl: z.string().optional(),
  })).optional().default([]),
  sortOrder: z.coerce.number().int().optional().default(0),
});

// Create template
router.post("/quote-group-templates", requireAuth, async (req, res): Promise<void> => {
  const parsed = GroupTemplateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(quoteGroupTemplates).values(parsed.data).returning();
  res.status(201).json(row);
});

// Update template
router.put("/quote-group-templates/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const parsed = GroupTemplateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(quoteGroupTemplates)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(quoteGroupTemplates.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Template not found" }); return; }
  res.json(row);
});

// Delete template
router.delete("/quote-group-templates/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  await db.delete(templateBomItemsTable).where(eq(templateBomItemsTable.templateId, id));
  const [deleted] = await db.delete(quoteGroupTemplates).where(eq(quoteGroupTemplates.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Template not found" }); return; }
  res.sendStatus(204);
});

export default router;
