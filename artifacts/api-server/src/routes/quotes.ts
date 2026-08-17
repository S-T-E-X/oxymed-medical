import { Router, type IRouter } from "express";
import { db, quoteRequestsTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { publicSubmissionRateLimiter } from "../lib/security";
import { z } from "zod/v4";

const router: IRouter = Router();

// Public form input: cap every field so a scripted client cannot push
// megabytes of text into the quote table through one request.
const QuoteBody = z.object({
  fullName: z.string().min(1).max(160),
  email: z.string().email().max(254),
  phone: z.string().min(1).max(40),
  company: z.string().max(200).optional().nullable(),
  jobTitle: z.string().max(160).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

function parseId(raw: string | string[]): number | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = z.coerce.number().int().positive().safeParse(value);
  return parsed.success ? parsed.data : null;
}

function parsePagination(req: { query: Record<string, unknown> }): { limit: number; offset: number } {
  const pageRaw = Number.parseInt(String(req.query["page"] ?? "1"), 10);
  const limitRaw = Number.parseInt(String(req.query["limit"] ?? "20"), 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 100) : 20;
  return { limit, offset: (page - 1) * limit };
}

router.get("/quotes", requireAuth, async (req, res): Promise<void> => {
  const { limit, offset } = parsePagination(req);
  const status = req.query["status"] as string | undefined;

  let query = db.select().from(quoteRequestsTable).orderBy(desc(quoteRequestsTable.createdAt)).$dynamic();
  let countQuery = db.select({ count: count() }).from(quoteRequestsTable).$dynamic();

  if (status) {
    query = query.where(eq(quoteRequestsTable.status, status));
    countQuery = countQuery.where(eq(quoteRequestsTable.status, status));
  }

  const [items, [totalRow]] = await Promise.all([
    query.limit(limit).offset(offset),
    countQuery,
  ]);
  res.json({ items, total: totalRow?.count ?? 0 });
});

router.post("/quotes", publicSubmissionRateLimiter, async (req, res): Promise<void> => {
  const parsed = QuoteBody.safeParse(req.body);
  if (!parsed.success) {
    // Do not echo the parser output to an anonymous caller.
    res.status(400).json({ error: "Gönderilen bilgiler geçersiz. Lütfen formu kontrol edin." });
    return;
  }
  const [quote] = await db.insert(quoteRequestsTable).values(parsed.data).returning();
  req.log.info({ quoteId: quote.id }, "New quote request submitted");
  res.status(201).json(quote);
});

router.get("/quotes/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  if (id === null) {
    res.status(400).json({ error: "Geçersiz ID" });
    return;
  }
  const [quote] = await db.select().from(quoteRequestsTable).where(eq(quoteRequestsTable.id, id));
  if (!quote) {
    res.status(404).json({ error: "Quote not found" });
    return;
  }
  res.json(quote);
});

const QUOTE_STATUSES = ["new", "in_progress", "resolved", "archived"] as const;

router.patch("/quotes/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  if (id === null) {
    res.status(400).json({ error: "Geçersiz ID" });
    return;
  }
  const parsed = z.object({ status: z.enum(QUOTE_STATUSES) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [quote] = await db
    .update(quoteRequestsTable)
    .set({ status: parsed.data.status })
    .where(eq(quoteRequestsTable.id, id))
    .returning();
  if (!quote) {
    res.status(404).json({ error: "Quote not found" });
    return;
  }
  res.json(quote);
});

export default router;
