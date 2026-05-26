import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";

export const productBomItemsTable = pgTable("product_bom_items", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  materialId: integer("material_id").notNull(),
  requiredQty: integer("required_qty").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ProductBomItem = typeof productBomItemsTable.$inferSelect;
