import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { serviceReportsTable } from "./serviceReports";

export const serviceReportPartsTable = pgTable("service_report_parts", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").notNull().references(() => serviceReportsTable.id, { onDelete: "cascade" }),
  partName: text("part_name").notNull(),
  partCode: text("part_code"),
  quantity: text("quantity").notNull().default("1"),
  condition: text("condition"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertServiceReportPartSchema = createInsertSchema(serviceReportPartsTable).omit({
  id: true, createdAt: true,
});
export type InsertServiceReportPart = z.infer<typeof insertServiceReportPartSchema>;
export type ServiceReportPart = typeof serviceReportPartsTable.$inferSelect;
