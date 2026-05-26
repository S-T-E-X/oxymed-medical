import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { serviceRecordsTable } from "./serviceRecords";

export const maintenanceKitsTable = pgTable("maintenance_kits", {
  id: serial("id").primaryKey(),
  serviceRecordId: integer("service_record_id").notNull().references(() => serviceRecordsTable.id, { onDelete: "cascade" }),
  kitName: text("kit_name").notNull(),
  kitCode: text("kit_code"),
  quantity: text("quantity"),
  unit: text("unit"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMaintenanceKitSchema = createInsertSchema(maintenanceKitsTable).omit({
  id: true, createdAt: true,
});
export type InsertMaintenanceKit = z.infer<typeof insertMaintenanceKitSchema>;
export type MaintenanceKit = typeof maintenanceKitsTable.$inferSelect;
