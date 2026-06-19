import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const slidersTable = pgTable("sliders", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  imageUrl: text("image_url"),
  ctaPrimaryText: text("cta_primary_text"),
  ctaPrimaryHref: text("cta_primary_href"),
  ctaSecondaryText: text("cta_secondary_text"),
  ctaSecondaryHref: text("cta_secondary_href"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  showCatalogButton: boolean("show_catalog_button").notNull().default(false),
  overlayEnabled: boolean("overlay_enabled").notNull().default(true),
  overlayColor: text("overlay_color").default("#021423"),
  overlayFromOpacity: integer("overlay_from_opacity").notNull().default(92),
  overlayToOpacity: integer("overlay_to_opacity").notNull().default(12),
  textColor: text("text_color").default("#ffffff"),
  ctaPrimaryBg: text("cta_primary_bg").default("#021423"),
  ctaSecondaryBg: text("cta_secondary_bg").default("rgba(255,255,255,0.06)"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSliderSchema = createInsertSchema(slidersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSlider = z.infer<typeof insertSliderSchema>;
export type Slider = typeof slidersTable.$inferSelect;
