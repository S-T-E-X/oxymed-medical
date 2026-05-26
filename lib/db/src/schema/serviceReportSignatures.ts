import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { serviceReportsTable } from "./serviceReports";

export const SERVICE_SIGNATURE_ROLES = ["personel", "sorumlu", "yetkili"] as const;
export type ServiceSignatureRole = (typeof SERVICE_SIGNATURE_ROLES)[number];

export const serviceReportSignaturesTable = pgTable("service_report_signatures", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").notNull().references(() => serviceReportsTable.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  signerName: text("signer_name"),
  imageDataUrl: text("image_data_url").notNull(),
  signedAt: timestamp("signed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertServiceReportSignatureSchema = createInsertSchema(serviceReportSignaturesTable).omit({
  id: true, signedAt: true,
});
export type InsertServiceReportSignature = z.infer<typeof insertServiceReportSignatureSchema>;
export type ServiceReportSignature = typeof serviceReportSignaturesTable.$inferSelect;
