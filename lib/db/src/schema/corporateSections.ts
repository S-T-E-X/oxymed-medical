import { jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export type NonTrLocale = "en" | "de" | "fr" | "it" | "ar" | "ru" | "fa" | "ka" | "bg" | "az" | "es";
export type CorporateSectionLocaleContent = {
  title?: string;
  subtitle?: string;
  content?: string;
};
export type CorporateSectionLocales = Partial<Record<NonTrLocale, CorporateSectionLocaleContent>>;

export const corporateSectionsTable = pgTable("corporate_sections", {
  id: serial("id").primaryKey(),
  sectionKey: text("section_key").notNull().unique(),
  title: text("title"),
  subtitle: text("subtitle"),
  content: text("content"),
  imageUrl: text("image_url"),
  locales: jsonb("locales").$type<CorporateSectionLocales>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCorporateSectionSchema = createInsertSchema(corporateSectionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCorporateSection = z.infer<typeof insertCorporateSectionSchema>;
export type CorporateSection = typeof corporateSectionsTable.$inferSelect;
