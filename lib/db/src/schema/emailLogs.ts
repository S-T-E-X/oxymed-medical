import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const emailLogsTable = pgTable("email_logs", {
  id: serial("id").primaryKey(),
  emailType: text("email_type").notNull(),
  recipientEmail: text("recipient_email").notNull(),
  subject: text("subject"),
  relatedId: integer("related_id"),
  relatedRef: text("related_ref"),
  status: text("status").notNull().default("success"),
  errorMessage: text("error_message"),
  sentBy: text("sent_by"),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
});

export type EmailLog = typeof emailLogsTable.$inferSelect;
