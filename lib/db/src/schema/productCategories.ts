import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productCategoriesTable = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  // Locale-specific name fields (tr = default/base above)
  nameEn: text("name_en"),
  nameDe: text("name_de"),
  nameFr: text("name_fr"),
  nameIt: text("name_it"),
  nameAr: text("name_ar"),
  nameRu: text("name_ru"),
  nameFa: text("name_fa"),
  nameKa: text("name_ka"),
  nameBg: text("name_bg"),
  nameAz: text("name_az"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProductCategorySchema = createInsertSchema(productCategoriesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProductCategory = z.infer<typeof insertProductCategorySchema>;
export type ProductCategory = typeof productCategoriesTable.$inferSelect;
