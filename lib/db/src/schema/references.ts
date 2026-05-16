import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const referencesTable = pgTable("references", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  projectType: text("project_type").notNull(),
  capacity: text("capacity"),
  city: text("city"),
  imageUrl: text("image_url"),
  category: text("category").notNull().default("ŞEHİR HASTANELERİ"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertReferenceSchema = createInsertSchema(referencesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertReference = z.infer<typeof insertReferenceSchema>;
export type Reference = typeof referencesTable.$inferSelect;
