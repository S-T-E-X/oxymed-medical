import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const catalogsTable = pgTable("catalogs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  language: text("language").notNull().default("TR"),
  category: text("category"),
  pdfUrl: text("pdf_url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCatalogSchema = createInsertSchema(catalogsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCatalog = z.infer<typeof insertCatalogSchema>;
export type Catalog = typeof catalogsTable.$inferSelect;
