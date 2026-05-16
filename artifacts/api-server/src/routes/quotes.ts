import { Router, type IRouter } from "express";
import { db, quoteRequestsTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { z } from "zod/v4";

const router: IRouter = Router();

const QuoteBody = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  company: z.string().optional().nullable(),
  jobTitle: z.string().optional().nullable(),
  projectType: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  applicationArea: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

function parseId(raw: string | string[]): number {
  return parseInt(Array.isArray(raw) ? raw[0] : raw, 10);
}

router.get("/quotes", requireAuth, async (req, res): Promise<void> => {
  const page = parseInt((req.query["page"] as string) ?? "1", 10);
  const limit = parseInt((req.query["limit"] as string) ?? "20", 10);
  const offset = (page - 1) * limit;
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

router.post("/quotes", async (req, res): Promise<void> => {
  const parsed = QuoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [quote] = await db.insert(quoteRequestsTable).values(parsed.data).returning();
  req.log.info({ quoteId: quote.id }, "New quote request submitted");
  res.status(201).json(quote);
});

router.get("/quotes/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
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
