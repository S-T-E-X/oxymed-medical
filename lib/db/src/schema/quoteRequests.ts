import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const quoteRequestsTable = pgTable("quote_requests", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  company: text("company"),
  jobTitle: text("job_title"),
  // Legacy lead details are retained for existing requests. New public
  // submissions no longer collect or accept these values.
  projectType: text("project_type"),
  city: text("city"),
  applicationArea: text("application_area"),
  notes: text("notes"),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertQuoteRequestSchema = createInsertSchema(quoteRequestsTable).omit({ id: true, status: true, createdAt: true, updatedAt: true });
export type InsertQuoteRequest = z.infer<typeof insertQuoteRequestSchema>;
export type QuoteRequest = typeof quoteRequestsTable.$inferSelect;
