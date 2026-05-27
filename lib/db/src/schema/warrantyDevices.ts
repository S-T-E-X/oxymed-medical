import { integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const WARRANTY_STATUSES = [
  "taslak",
  "aktif_garanti",
  "yakin_bitis",
  "garanti_disi",
  "bakim_riskli",
  "yetkisiz_askida",
  "uzatilmis_garanti",
  "bakim_anlasmasi",
  "talep_incelemede",
  "talep_onaylandi",
  "talep_reddedildi",
] as const;
export type WarrantyStatus = (typeof WARRANTY_STATUSES)[number];

export const warrantyDevicesTable = pgTable("warranty_devices", {
  id: serial("id").primaryKey(),
  productName: text("product_name").notNull(),
  model: text("model").notNull(),
  serialNumber: text("serial_number").notNull().unique(),
  qrToken: text("qr_token").notNull().unique(),
  deviceType: text("device_type"),
  plcSystem: text("plc_system"),
  hmiModel: text("hmi_model"),
  productionDate: text("production_date"),
  customerFirm: text("customer_firm").notNull().default("Taslak"),
  customerDepartment: text("customer_department"),
  customerLocation: text("customer_location"),
  customerContact: text("customer_contact"),
  customerPhone: text("customer_phone"),
  customerEmail: text("customer_email"),
  installDate: text("install_date"),
  warrantyStartDate: text("warranty_start_date"),
  warrantyEndDate: text("warranty_end_date"),
  warrantyType: text("warranty_type"),
  maintenanceContractStatus: text("maintenance_contract_status"),
  lastMaintenanceDate: text("last_maintenance_date"),
  nextMaintenanceDate: text("next_maintenance_date"),
  status: text("status").notNull().default("taslak"),
  notes: text("notes"),
  imageUrl: text("image_url"),
  productionOrderItemId: integer("production_order_item_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertWarrantyDeviceSchema = createInsertSchema(warrantyDevicesTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertWarrantyDevice = z.infer<typeof insertWarrantyDeviceSchema>;
export type WarrantyDevice = typeof warrantyDevicesTable.$inferSelect;
