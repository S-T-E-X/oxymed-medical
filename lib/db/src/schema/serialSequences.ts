import { integer, pgTable, serial, text, timestamp, unique } from "drizzle-orm/pg-core";

export const serialSequencesTable = pgTable("serial_sequences", {
  id: serial("id").primaryKey(),
  productCode: text("product_code").notNull(),
  dateKey: text("date_key").notNull(),
  lastSeq: integer("last_seq").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique("serial_seq_unique").on(t.productCode, t.dateKey),
]);

export type SerialSequence = typeof serialSequencesTable.$inferSelect;
