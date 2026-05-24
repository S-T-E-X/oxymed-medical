import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const productStock = pgTable("product_stock", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(0),
  location: text("location"),
  notes: text("notes"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
