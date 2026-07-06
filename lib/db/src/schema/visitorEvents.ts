import { pgTable, serial, text, timestamp, index } from "drizzle-orm/pg-core";

export const visitorEventsTable = pgTable(
  "visitor_events",
  {
    id: serial("id").primaryKey(),
    visitorId: text("visitor_id").notNull(),
    sessionId: text("session_id").notNull(),
    path: text("path").notNull(),
    eventType: text("event_type").notNull().default("pageview"),
    label: text("label"),
    referrerSource: text("referrer_source").notNull().default("direct"),
    deviceType: text("device_type").notNull().default("desktop"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("visitor_events_created_at_idx").on(table.createdAt),
    index("visitor_events_visitor_id_idx").on(table.visitorId),
    index("visitor_events_event_type_idx").on(table.eventType),
  ],
);

export type VisitorEvent = typeof visitorEventsTable.$inferSelect;
