import { integer, numeric, pgTable, serial, timestamp } from "drizzle-orm/pg-core";

export const templateBomItemsTable = pgTable("template_bom_items", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull(),
  materialId: integer("material_id").notNull(),
  requiredQty: numeric("required_qty", { precision: 10, scale: 3 }).notNull().default("1"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type TemplateBomItem = typeof templateBomItemsTable.$inferSelect;
