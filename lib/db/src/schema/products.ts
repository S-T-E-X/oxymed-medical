import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { productCategoriesTable } from "./productCategories";

export type PageFeature = { title: string; text: string };
export type DetailCard = { title: string; text: string; imageUrl?: string };
export type FeatureTile = { title: string; text: string };
export type FaqItem = { question: string; answer: string };
export type PageData = {
  heroSubtitle?: string;
  heroDescription?: string;
  features?: PageFeature[];
  detailCards?: DetailCard[];
  useCases?: string[];
  advantages?: string[];
  featureTiles?: FeatureTile[];
  faq?: FaqItem[];
};
export type PrivateData = {
  costPrice?: string;
  salePrice?: string;
  materials?: string[];
};

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => productCategoriesTable.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  specs: jsonb("specs").$type<Array<{ label: string; value: string }>>().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  pageSlug: text("page_slug"),
  pageData: jsonb("page_data").$type<PageData>().default({}),
  privateData: jsonb("private_data").$type<PrivateData>().default({}),
  quoteTitle: text("quote_title"),
  quoteBullets: jsonb("quote_bullets").$type<string[]>().default([]),
  quoteModelCode: text("quote_model_code"),
  quoteImageUrl: text("quote_image_url"),
  quoteUnit: text("quote_unit"),
  quoteUnitPrice: text("quote_unit_price"),
  // Locale-specific title fields (tr = default/base above)
  titleEn: text("title_en"),
  titleDe: text("title_de"),
  titleFr: text("title_fr"),
  titleIt: text("title_it"),
  titleAr: text("title_ar"),
  titleRu: text("title_ru"),
  titleFa: text("title_fa"),
  titleKa: text("title_ka"),
  titleBg: text("title_bg"),
  titleAz: text("title_az"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
