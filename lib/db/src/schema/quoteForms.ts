import { integer, jsonb, numeric, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const quoteForms = pgTable("quote_forms", {
  id: serial("id").primaryKey(),
  quoteNo: text("quote_no").notNull().unique(),
  status: text("status").notNull().default("draft"),
  firmaAdi: text("firma_adi"),
  firmaAdres: text("firma_adres"),
  firmaTelefon: text("firma_telefon"),
  firmaEmail: text("firma_email"),
  firmaVergiDairesi: text("firma_vergi_dairesi"),
  firmaVergiNo: text("firma_vergi_no"),
  teslimatAdresi: text("teslimat_adresi"),
  teslimatSuresi: text("teslimat_suresi"),
  odemeSekli: text("odeme_sekli"),
  paraBirimi: text("para_birimi").notNull().default("EUR"),
  hizmetler: jsonb("hizmetler").$type<string[]>().default([]),
  sartlar: jsonb("sartlar").$type<string[]>().default([]),
  notlar: text("notlar"),
  iskonto: text("iskonto").default("0"),
  kdv: text("kdv").default("20"),
  hazirlayan: text("hazirlayan"),
  hazirlayanTelefon: text("hazirlayan_telefon"),
  hazirlayanEmail: text("hazirlayan_email"),
  onaylayan: text("onaylayan"),
  onaytayanGorev: text("onaylayan_gorev"),
  onayTarihi: text("onay_tarihi"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const quoteFormItems = pgTable("quote_form_items", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").notNull().references(() => quoteForms.id, { onDelete: "cascade" }),
  productId: integer("product_id"),
  title: text("title").notNull(),
  bullets: jsonb("bullets").$type<string[]>().default([]),
  modelCode: text("model_code"),
  imageUrl: text("image_url"),
  quantity: integer("quantity").notNull().default(1),
  unit: text("unit").notNull().default("ADET"),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).default("0"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export type QuoteForm = typeof quoteForms.$inferSelect;
export type QuoteFormItem = typeof quoteFormItems.$inferSelect;
