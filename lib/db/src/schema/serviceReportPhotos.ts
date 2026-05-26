import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { serviceReportsTable } from "./serviceReports";

export const serviceReportPhotosTable = pgTable("service_report_photos", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").notNull().references(() => serviceReportsTable.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  caption: text("caption"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertServiceReportPhotoSchema = createInsertSchema(serviceReportPhotosTable).omit({
  id: true, createdAt: true,
});
export type InsertServiceReportPhoto = z.infer<typeof insertServiceReportPhotoSchema>;
export type ServiceReportPhoto = typeof serviceReportPhotosTable.$inferSelect;
