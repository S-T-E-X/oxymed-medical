import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const PRODUCTION_STATUSES = [
  "bekliyor",
  "stok_kontrolunde",
  "stoktan_karsilanabilir",
  "malzeme_kontrolunde",
  "malzeme_eksik",
  "uretime_hazir",
  "uretimde",
  "kalite_kontrolde",
  "tamamlandi",
  "stokta",
  "sevkiyata_hazir",
  "sevk_edildi",
  "kurulum_bekliyor",
  "garanti_baslatildi",
  "iptal",
] as const;

export type ProductionStatus = (typeof PRODUCTION_STATUSES)[number];

export const productionOrdersTable = pgTable("production_orders", {
  id: serial("id").primaryKey(),
  orderNo: text("order_no").notNull().unique(),
  productId: integer("product_id"),
  productTitle: text("product_title").notNull(),
  productCode: text("product_code"),
  quantity: integer("quantity").notNull().default(1),
  status: text("status").notNull().default("bekliyor"),
  quoteFormId: integer("quote_form_id"),
  customerName: text("customer_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type ProductionOrder = typeof productionOrdersTable.$inferSelect;
