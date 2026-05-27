import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { serviceReportsTable } from "./serviceReports";

export const serviceReportEmailLogsTable = pgTable("service_report_email_logs", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").notNull().references(() => serviceReportsTable.id, { onDelete: "cascade" }),
  sentTo: text("sent_to").notNull(),
  sentBy: text("sent_by"),
  status: text("status").notNull().default("success"),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertServiceReportEmailLogSchema = createInsertSchema(serviceReportEmailLogsTable).omit({
  id: true, sentAt: true,
});
export type InsertServiceReportEmailLog = z.infer<typeof insertServiceReportEmailLogSchema>;
export type ServiceReportEmailLog = typeof serviceReportEmailLogsTable.$inferSelect;
