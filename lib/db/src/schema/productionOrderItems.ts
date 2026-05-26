import { integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const DEFAULT_QUALITY_CHECKLIST = {
  elektrik_baglantilari: false,
  vakum_testi: false,
  kacak_testi: false,
  pano_testi: false,
  hmi_kontrol: false,
  filtreler: false,
  seri_no_etiketi: false,
  qr_test: false,
  urun_fotografi: false,
  final_kontrol: false,
} as const;

export type QualityChecklist = Record<string, boolean>;

export const productionOrderItemsTable = pgTable("production_order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  serialNumber: text("serial_number").unique(),
  qrToken: text("qr_token").unique(),
  warrantyDeviceId: integer("warranty_device_id"),
  status: text("status").notNull().default("bekliyor"),
  qualityChecklist: jsonb("quality_checklist").$type<QualityChecklist>().default({}),
  productionDate: text("production_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type ProductionOrderItem = typeof productionOrderItemsTable.$inferSelect;
