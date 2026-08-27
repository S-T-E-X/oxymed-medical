import { boolean, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import type { NonTrLocale } from "./corporateSections";

export type ReferenceLocaleContent = {
  projectType?: string;
  capacity?: string;
  category?: string;
};
export type ReferenceLocales = Partial<Record<NonTrLocale, ReferenceLocaleContent>>;

export const referencesTable = pgTable("references", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  projectType: text("project_type").notNull(),
  capacity: text("capacity"),
  city: text("city"),
  imageUrl: text("image_url"),
  logoUrl: text("logo_url"),
  showInMarquee: boolean("show_in_marquee").notNull().default(false),
  category: text("category").notNull().default("ŞEHİR HASTANELERİ"),
  locales: jsonb("locales").$type<ReferenceLocales>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertReferenceSchema = createInsertSchema(referencesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertReference = z.infer<typeof insertReferenceSchema>;
export type Reference = typeof referencesTable.$inferSelect;
