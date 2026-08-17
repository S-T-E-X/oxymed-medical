import { Router, type IRouter } from "express";
import { db, catalogsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { z } from "zod/v4";

const router: IRouter = Router();

const CatalogBody = z.object({
  title: z.string().min(1),
  language: z.string().min(1).default("TR"),
  category: z.string().optional().nullable(),
  pdfUrl: z.string().min(1),
  coverUrl: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

const CatalogUpdateBody = CatalogBody.partial();

function parseId(raw: string | string[]): number {
  return parseInt(Array.isArray(raw) ? raw[0] : raw, 10);
}

router.get("/catalogs", async (req, res): Promise<void> => {
  const rows = await db.select().from(catalogsTable).orderBy(asc(catalogsTable.sortOrder));
  const activeOnly = req.query["activeOnly"] === "true";
  const language = req.query["language"] as string | undefined;
  const category = req.query["category"] as string | undefined;

  let result = rows;
  if (activeOnly) result = result.filter((r) => r.isActive);
  if (language) result = result.filter((r) => r.language === language);
  if (category) result = result.filter((r) => r.category === category);

  res.json(result);
});

router.post("/catalogs", requireAuth, async (req, res): Promise<void> => {
  const parsed = CatalogBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [catalog] = await db.insert(catalogsTable).values(parsed.data).returning();
  res.status(201).json(catalog);
});

router.get("/catalogs/:id", async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const [catalog] = await db.select().from(catalogsTable).where(eq(catalogsTable.id, id));
  if (!catalog) {
    res.status(404).json({ error: "Catalog not found" });
    return;
  }
  res.json(catalog);
});

router.patch("/catalogs/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const parsed = CatalogUpdateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [catalog] = await db.update(catalogsTable).set(parsed.data).where(eq(catalogsTable.id, id)).returning();
  if (!catalog) {
    res.status(404).json({ error: "Catalog not found" });
    return;
  }
  res.json(catalog);
});

router.delete("/catalogs/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const [deleted] = await db.delete(catalogsTable).where(eq(catalogsTable.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Catalog not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
