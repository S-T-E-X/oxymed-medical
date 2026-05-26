import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";

export const materialReservationsTable = pgTable("material_reservations", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  materialId: integer("material_id").notNull(),
  reservedQty: integer("reserved_qty").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type MaterialReservation = typeof materialReservationsTable.$inferSelect;
