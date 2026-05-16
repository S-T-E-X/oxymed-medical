import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const mediaFilesTable = pgTable("media_files", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  objectPath: text("object_path").notNull(),
  mimeType: text("mime_type"),
  size: integer("size"),
  alt: text("alt"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMediaFileSchema = createInsertSchema(mediaFilesTable).omit({ id: true, createdAt: true });
export type InsertMediaFile = z.infer<typeof insertMediaFileSchema>;
export type MediaFile = typeof mediaFilesTable.$inferSelect;
