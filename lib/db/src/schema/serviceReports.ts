import { integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { warrantyDevicesTable } from "./warrantyDevices";

export const SERVICE_REPORT_STATUSES = [
  "taslak",
  "tamamlandi",
  "iptal",
] as const;
export type ServiceReportStatus = (typeof SERVICE_REPORT_STATUSES)[number];

export const SERVICE_REPORT_TYPES = [
  "periyodik_bakim",
  "ariza_mudahalesi",
  "yedek_parca",
  "genel_kontrol",
  "devreye_alma",
  "garanti_servisi",
] as const;

export const SERVICE_REPORT_PRIORITIES = [
  "acil",
  "yuksek",
  "normal",
  "dusuk",
] as const;

export const serviceReportsTable = pgTable("service_reports", {
  id: serial("id").primaryKey(),
  reportNo: text("report_no").notNull().unique(),
  deviceId: integer("device_id").notNull().references(() => warrantyDevicesTable.id, { onDelete: "cascade" }),
  serviceDate: text("service_date").notNull(),
  serviceTime: text("service_time"),
  serviceType: text("service_type").notNull().default("periyodik_bakim"),
  priority: text("priority").notNull().default("normal"),
  status: text("status").notNull().default("taslak"),
  serviceCode: text("service_code"),
  reportDataJson: jsonb("report_data_json").$type<Record<string, unknown>>().default({}),
  pdfUrl: text("pdf_url"),
  verificationToken: text("verification_token").notNull().unique(),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertServiceReportSchema = createInsertSchema(serviceReportsTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertServiceReport = z.infer<typeof insertServiceReportSchema>;
export type ServiceReport = typeof serviceReportsTable.$inferSelect;
