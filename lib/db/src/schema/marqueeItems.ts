import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const marqueeItemsTable = pgTable("marquee_items", {
  id: serial("id").primaryKey(),
  logoUrl: text("logo_url"),
  text: text("text"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type MarqueeItem = typeof marqueeItemsTable.$inferSelect;
