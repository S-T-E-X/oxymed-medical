import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { warrantyDevicesTable } from "./warrantyDevices";

export const CLAIM_STATUSES = ["incelemede", "onaylandi", "reddedildi"] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export const warrantyClaimsTable = pgTable("warranty_claims", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").notNull().references(() => warrantyDevicesTable.id, { onDelete: "cascade" }),
  faultType: text("fault_type").notNull(),
  faultDescription: text("fault_description").notNull(),
  photoUrls: jsonb("photo_urls").$type<string[]>().default([]),
  workHours: text("work_hours"),
  personnelNote: text("personnel_note"),
  decisionStatus: text("decision_status").notNull().default("incelemede"),
  outOfWarrantyReason: text("out_of_warranty_reason"),
  adminApproval: boolean("admin_approval"),
  adminNote: text("admin_note"),
  claimantName: text("claimant_name"),
  claimantPhone: text("claimant_phone"),
  claimantEmail: text("claimant_email"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertWarrantyClaimSchema = createInsertSchema(warrantyClaimsTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertWarrantyClaim = z.infer<typeof insertWarrantyClaimSchema>;
export type WarrantyClaim = typeof warrantyClaimsTable.$inferSelect;
