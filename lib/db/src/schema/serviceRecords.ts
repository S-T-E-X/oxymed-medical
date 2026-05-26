import { integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { warrantyDevicesTable } from "./warrantyDevices";

export const SERVICE_TYPES = [
  "periyodik_bakim",
  "ariza_mudahalesi",
  "yedek_parca",
  "genel_kontrol",
  "devreye_alma",
  "garanti_servisi",
] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const serviceRecordsTable = pgTable("service_records", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").notNull().references(() => warrantyDevicesTable.id, { onDelete: "cascade" }),
  serviceDate: text("service_date").notNull(),
  serviceType: text("service_type").notNull().default("periyodik_bakim"),
  servicePersonnel: text("service_personnel"),
  description: text("description"),
  workHours: text("work_hours"),
  notes: text("notes"),
  photoUrls: jsonb("photo_urls").$type<string[]>().default([]),
  reportNo: text("report_no"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertServiceRecordSchema = createInsertSchema(serviceRecordsTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertServiceRecord = z.infer<typeof insertServiceRecordSchema>;
export type ServiceRecord = typeof serviceRecordsTable.$inferSelect;
