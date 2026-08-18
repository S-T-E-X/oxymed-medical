import { Router, type IRouter } from "express";
import { db, newsTable, newsTranslationsTable } from "@workspace/db";
import { and, eq, desc, count, sql, inArray, ne } from "drizzle-orm";
import { requireAuth, isAdminRequest } from "../lib/auth";
import { parsePageLimit } from "../lib/security";
import { writeAdminAuditLog } from "../lib/audit";
import { z } from "zod/v4";

const router: IRouter = Router();

/** Mirrors artifacts/oxymed-medikal/src/i18n/config.ts. */
const LOCALES = ["tr", "en", "de", "fr", "it", "ar", "ru", "fa", "ka", "bg", "az", "es"] as const;
type Locale = (typeof LOCALES)[number];
const DEFAULT_LOCALE: Locale = "tr";

function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

const NewsBody = z.object({
  title: z.string().min(1),
  excerpt: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  category: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  slug: z.string().min(1),
  published: z.boolean().optional(),
  publishedAt: z.string().optional(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});

const TranslationBody = z.object({
  title: z.string().min(1),
  excerpt: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  slug: z.string().min(1),
  published: z.boolean().optional(),
  publishedAt: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});

function parseId(raw: string | string[]): number {
  // Strict positive-integer parsing: malformed input yields 0, which matches
  // no serial primary key, so callers fall through to their normal 404 path
  // instead of passing NaN into a SQL query.
  const str = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number(str);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 0;
}

type NewsRow = typeof newsTable.$inferSelect;
type TranslationRow = typeof newsTranslationsTable.$inferSelect;

/**
 * Public shape of an article in one language. `id` stays the source article id
 * so existing admin links and detail lookups keep working; the translated
 * fields are already resolved so the client never has to merge rows itself.
 */
function toPublicItem(
  source: NewsRow,
  translation: TranslationRow | null,
  locale: Locale,
  alternates: Array<{ locale: Locale; slug: string }>,
) {
  const base = {
    id: source.id,
    newsId: source.id,
    locale,
    imageUrl: source.imageUrl,
    sourceSlug: source.slug,
    /** Published language versions and their URL segments, for hreflang + switcher. */
    alternates,
    createdAt: source.createdAt,
    updatedAt: translation?.updatedAt ?? source.updatedAt,
  };

  if (!translation) {
    return {
      ...base,
      title: source.title,
      excerpt: source.excerpt,
      content: source.content,
      category: source.category,
      slug: source.slug,
      published: source.published,
      publishedAt: source.publishedAt,
      seoTitle: source.seoTitle,
      seoDescription: source.seoDescription,
      translationId: null,
    };
  }

  return {
    ...base,
    title: translation.title,
    excerpt: translation.excerpt,
    content: translation.content,
    // Categories are optional per language. An untranslated category is omitted
    // rather than falling back to the Turkish label, so a foreign-language page
    // never renders Turkish text.
    category: translation.category?.trim() ? translation.category : null,
    slug: translation.slug,
    published: translation.published && source.published,
    publishedAt: translation.publishedAt ?? source.publishedAt,
    seoTitle: translation.seoTitle,
    seoDescription: translation.seoDescription,
    translationId: translation.id,
  };
}

/**
 * Languages a visitor can actually read an article in: Turkish when the source
 * is published, plus every published translation. Used for hreflang and for
 * the language switcher, so it must never include drafts.
 */
type Alternate = { locale: Locale; slug: string };

async function publishedAlternatesByNewsId(newsIds: number[]): Promise<Map<number, Alternate[]>> {
  const map = new Map<number, Alternate[]>();
  if (newsIds.length === 0) return map;

  const rows = await db
    .select({
      newsId: newsTranslationsTable.newsId,
      locale: newsTranslationsTable.locale,
      slug: newsTranslationsTable.slug,
      sourcePublished: newsTable.published,
    })
    .from(newsTranslationsTable)
    .innerJoin(newsTable, eq(newsTable.id, newsTranslationsTable.newsId))
    .where(and(inArray(newsTranslationsTable.newsId, newsIds), eq(newsTranslationsTable.published, true)));

  for (const row of rows) {
    if (!row.sourcePublished || !isLocale(row.locale)) continue;
    const list = map.get(row.newsId) ?? [];
    list.push({ locale: row.locale, slug: row.slug });
    map.set(row.newsId, list);
  }
  return map;
}

router.get("/news", async (req, res): Promise<void> => {
  const { limit, offset } = parsePageLimit(req.query as Record<string, unknown>, 20);
  const category = req.query["category"] as string | undefined;
  const publishedStr = req.query["published"] as string | undefined;
  const slug = req.query["slug"] as string | undefined;
  const rawLocale = req.query["locale"] as string | undefined;

  if (rawLocale !== undefined && !isLocale(rawLocale)) {
    res.status(400).json({ error: `Unsupported locale: ${rawLocale}` });
    return;
  }
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  // Drafts are admin-only: anonymous callers always get the published view,
  // whatever they ask for in the query string. The response therefore differs
  // by credentials, so it must never be served from a shared cache entry.
  res.setHeader("Vary", "Cookie");
  const publishedFilter = (await isAdminRequest(req)) ? publishedStr : "true";

  if (locale === DEFAULT_LOCALE) {
    const conditions = [];
    if (slug) conditions.push(eq(newsTable.slug, slug));
    if (category && category !== "TÜM HABERLER") conditions.push(eq(newsTable.category, category));
    if (publishedFilter !== undefined) conditions.push(eq(newsTable.published, publishedFilter === "true"));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const baseQuery = db.select().from(newsTable).orderBy(desc(newsTable.publishedAt));
    const baseCount = db.select({ count: count() }).from(newsTable);

    const [rows, [totalRow]] = await Promise.all([
      (whereClause ? baseQuery.where(whereClause) : baseQuery).limit(limit).offset(offset),
      whereClause ? baseCount.where(whereClause) : baseCount,
    ]);

    const alternatesByNews = await publishedAlternatesByNewsId(rows.map((row) => row.id));
    const items = rows.map((row) =>
      toPublicItem(row, null, DEFAULT_LOCALE, [
        ...(row.published ? [{ locale: DEFAULT_LOCALE, slug: row.slug }] : []),
        ...(alternatesByNews.get(row.id) ?? []),
      ]),
    );

    res.json({ items, total: totalRow?.count ?? 0 });
    return;
  }

  // Non-Turkish languages only exist where a translation row exists, so this is
  // an inner join: an untranslated article simply is not part of that language.
  // Filtering matches the rendered category, which is the translated one only —
  // an article with no localized category is not in any category in that language.
  const localizedCategory = sql<string>`nullif(btrim(${newsTranslationsTable.category}), '')`;

  const conditions = [eq(newsTranslationsTable.locale, locale)];
  if (slug) conditions.push(eq(newsTranslationsTable.slug, slug));
  if (category && category !== "TÜM HABERLER") conditions.push(eq(localizedCategory, category));
  if (publishedFilter !== undefined) {
    const wantPublished = publishedFilter === "true";
    // A language version counts as live only when both it and its source are live.
    const isLive = and(eq(newsTranslationsTable.published, true), eq(newsTable.published, true))!;
    conditions.push(wantPublished ? isLive : sql`not (${isLive})`);
  }

  const whereClause = and(...conditions);
  const effectiveDate = sql`coalesce(${newsTranslationsTable.publishedAt}, ${newsTable.publishedAt})`;

  const [rows, [totalRow]] = await Promise.all([
    db
      .select({ source: newsTable, translation: newsTranslationsTable })
      .from(newsTranslationsTable)
      .innerJoin(newsTable, eq(newsTable.id, newsTranslationsTable.newsId))
      .where(whereClause)
      .orderBy(desc(effectiveDate))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(newsTranslationsTable)
      .innerJoin(newsTable, eq(newsTable.id, newsTranslationsTable.newsId))
      .where(whereClause),
  ]);

  const alternatesByNews = await publishedAlternatesByNewsId(rows.map((row) => row.source.id));
  const items = rows.map(({ source, translation }) =>
    toPublicItem(source, translation, locale, [
      ...(source.published ? [{ locale: DEFAULT_LOCALE, slug: source.slug }] : []),
      ...(alternatesByNews.get(source.id) ?? []),
    ]),
  );

  res.json({ items, total: totalRow?.count ?? 0 });
});

/** Every translation row, for the admin editor's language tabs and status badges. */
router.get("/admin/news/translations", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db.select().from(newsTranslationsTable).orderBy(newsTranslationsTable.newsId);
  res.json(rows);
});

router.post("/news", requireAuth, async (req, res): Promise<void> => {
  const parsed = NewsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [clash] = await db.select({ id: newsTable.id }).from(newsTable).where(eq(newsTable.slug, parsed.data.slug));
  if (clash) {
    res.status(409).json({ error: `Bu URL uzantısı zaten kullanılıyor: ${parsed.data.slug}` });
    return;
  }

  const [item] = await db
    .insert(newsTable)
    .values({
      ...parsed.data,
      publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : new Date(),
    })
    .returning();
  res.status(201).json(item);
});

router.get("/news/:id", async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  // Admins see drafts here, anonymous callers do not, so the response varies
  // by credentials and must not be shared between them by a cache.
  res.setHeader("Vary", "Cookie");
  const [item] = await db.select().from(newsTable).where(eq(newsTable.id, id));
  if (!item) {
    res.status(404).json({ error: "News item not found" });
    return;
  }
  // An unpublished article is invisible to anyone but an admin.
  if (!item.published && !(await isAdminRequest(req))) {
    res.status(404).json({ error: "News item not found" });
    return;
  }
  res.json(item);
});

router.patch("/news/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const parsed = NewsBody.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (parsed.data.slug) {
    const [clash] = await db
      .select({ id: newsTable.id })
      .from(newsTable)
      .where(and(eq(newsTable.slug, parsed.data.slug), ne(newsTable.id, id)));
    if (clash) {
      res.status(409).json({ error: `Bu URL uzantısı zaten kullanılıyor: ${parsed.data.slug}` });
      return;
    }
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.publishedAt) {
    updateData["publishedAt"] = new Date(parsed.data.publishedAt);
  }
  const [item] = await db.update(newsTable).set(updateData).where(eq(newsTable.id, id)).returning();
  if (!item) {
    res.status(404).json({ error: "News item not found" });
    return;
  }
  res.json(item);
});

router.delete("/news/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const [deleted] = await db.delete(newsTable).where(eq(newsTable.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "News item not found" });
    return;
  }
  await writeAdminAuditLog(req, {
    action: "news.delete",
    targetType: "news",
    targetId: id,
    details: { title: deleted.title },
  });
  res.sendStatus(204);
});

/** All language versions of one article, including drafts (admin only). */
router.get("/news/:id/translations", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const [source] = await db.select({ id: newsTable.id }).from(newsTable).where(eq(newsTable.id, id));
  if (!source) {
    res.status(404).json({ error: "News item not found" });
    return;
  }
  const rows = await db
    .select()
    .from(newsTranslationsTable)
    .where(eq(newsTranslationsTable.newsId, id))
    .orderBy(newsTranslationsTable.locale);
  res.json(rows);
});

router.put("/news/:id/translations/:locale", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const locale = req.params["locale"]!;

  if (!isLocale(locale) || locale === DEFAULT_LOCALE) {
    res.status(400).json({ error: `Unsupported translation locale: ${locale}` });
    return;
  }

  const parsed = TranslationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [source] = await db.select({ id: newsTable.id }).from(newsTable).where(eq(newsTable.id, id));
  if (!source) {
    res.status(404).json({ error: "News item not found" });
    return;
  }

  // Slugs only have to be unique inside their own language.
  const [clash] = await db
    .select({ newsId: newsTranslationsTable.newsId })
    .from(newsTranslationsTable)
    .where(
      and(
        eq(newsTranslationsTable.locale, locale),
        eq(newsTranslationsTable.slug, parsed.data.slug),
        ne(newsTranslationsTable.newsId, id),
      ),
    );
  if (clash) {
    res.status(409).json({ error: `Bu dilde "${parsed.data.slug}" URL uzantısı başka bir haberde kullanılıyor.` });
    return;
  }

  const values = {
    newsId: id,
    locale,
    title: parsed.data.title,
    excerpt: parsed.data.excerpt ?? null,
    content: parsed.data.content ?? null,
    category: parsed.data.category ?? null,
    slug: parsed.data.slug,
    published: parsed.data.published ?? false,
    publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : null,
    seoTitle: parsed.data.seoTitle ?? null,
    seoDescription: parsed.data.seoDescription ?? null,
  };

  const [item] = await db
    .insert(newsTranslationsTable)
    .values(values)
    .onConflictDoUpdate({
      target: [newsTranslationsTable.newsId, newsTranslationsTable.locale],
      set: { ...values, updatedAt: new Date() },
    })
    .returning();

  res.json(item);
});

router.delete("/news/:id/translations/:locale", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params["id"]!);
  const locale = req.params["locale"]!;
  if (!isLocale(locale) || locale === DEFAULT_LOCALE) {
    res.status(400).json({ error: `Unsupported translation locale: ${locale}` });
    return;
  }

  const [deleted] = await db
    .delete(newsTranslationsTable)
    .where(and(eq(newsTranslationsTable.newsId, id), eq(newsTranslationsTable.locale, locale)))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Translation not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
