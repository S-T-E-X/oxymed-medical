import { boolean, index, integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * The Turkish source article. Turkish is the site's source language, so its
 * copy stays on this row (rather than in a translation row) — that keeps every
 * pre-existing article, URL and API response working exactly as before.
 */
export const newsTable = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  content: text("content"),
  category: text("category").notNull().default("GENEL"),
  imageUrl: text("image_url"),
  slug: text("slug").notNull().unique(),
  published: boolean("published").notNull().default(true),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  /** Optional search-result overrides; the article title/excerpt is used when empty. */
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

/**
 * One row per non-Turkish language of an article. A language is only ever
 * served when its own row exists and is published, so a missing translation
 * shows nothing instead of leaking Turkish copy onto a foreign-language URL.
 */
export const newsTranslationsTable = pgTable(
  "news_translations",
  {
    id: serial("id").primaryKey(),
    newsId: integer("news_id")
      .notNull()
      .references(() => newsTable.id, { onDelete: "cascade" }),
    /** Locale code from the site's supported set, e.g. "en", "de". Never "tr". */
    locale: text("locale").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    content: text("content"),
    /** Category label in this language; the Turkish label is shown when empty. */
    category: text("category"),
    /** URL segment within this language only, so slugs may repeat across languages. */
    slug: text("slug").notNull(),
    published: boolean("published").notNull().default(false),
    /** Falls back to the source article's date when not set. */
    publishedAt: timestamp("published_at", { withTimezone: true }),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("news_translations_news_locale_key").on(table.newsId, table.locale),
    uniqueIndex("news_translations_locale_slug_key").on(table.locale, table.slug),
    index("news_translations_locale_idx").on(table.locale),
  ],
);

export const insertNewsSchema = createInsertSchema(newsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof newsTable.$inferSelect;

export const insertNewsTranslationSchema = createInsertSchema(newsTranslationsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertNewsTranslation = z.infer<typeof insertNewsTranslationSchema>;
export type NewsTranslation = typeof newsTranslationsTable.$inferSelect;
