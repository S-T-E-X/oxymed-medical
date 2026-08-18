import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productCategoriesTable = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  /** Turkish blurb shown on the category card; other languages live below. */
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  /**
   * Card artwork for this category. Empty falls back to a neutral placeholder
   * rather than borrowing another category's image.
   */
  imageUrl: text("image_url"),
  /** Hidden categories disappear from the public site entirely. */
  visible: boolean("visible").notNull().default(true),
  /** Whether the category also appears in the home page's product groups. */
  showOnHome: boolean("show_on_home").notNull().default(true),
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
  nameEs: text("name_es"),
  // Locale-specific description fields (tr = `description` above)
  descriptionEn: text("description_en"),
  descriptionDe: text("description_de"),
  descriptionFr: text("description_fr"),
  descriptionIt: text("description_it"),
  descriptionAr: text("description_ar"),
  descriptionRu: text("description_ru"),
  descriptionFa: text("description_fa"),
  descriptionKa: text("description_ka"),
  descriptionBg: text("description_bg"),
  descriptionAz: text("description_az"),
  descriptionEs: text("description_es"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProductCategorySchema = createInsertSchema(productCategoriesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProductCategory = z.infer<typeof insertProductCategorySchema>;
export type ProductCategory = typeof productCategoriesTable.$inferSelect;
