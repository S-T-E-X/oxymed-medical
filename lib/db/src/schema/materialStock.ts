import { numeric, pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const materialStock = pgTable("material_stock", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  supplier: text("supplier"),
  price: numeric("price", { precision: 12, scale: 2 }),
  quantity: integer("quantity").notNull().default(0),
  unit: text("unit").notNull().default("adet"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
