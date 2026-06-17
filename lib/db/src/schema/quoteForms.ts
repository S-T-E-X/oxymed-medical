import { boolean, integer, jsonb, numeric, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

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
  iskontoTipi: text("iskonto_tipi").notNull().default("yuzde"),
  kdv: text("kdv").default("20"),
  showKdv: boolean("show_kdv").notNull().default(true),
  showGenelToplam: boolean("show_genel_toplam").notNull().default(true),
  hazirlayan: text("hazirlayan"),
  hazirlayanTelefon: text("hazirlayan_telefon"),
  hazirlayanEmail: text("hazirlayan_email"),
  hazirlayanImzaUrl: text("hazirlayan_imza_url"),
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
  itemType: text("item_type").notNull().default("single"),
  parentItemId: integer("parent_item_id"),
  title: text("title").notNull(),
  bullets: jsonb("bullets").$type<string[]>().default([]),
  modelCode: text("model_code"),
  imageUrl: text("image_url"),
  quantity: integer("quantity").notNull().default(1),
  unit: text("unit").notNull().default("ADET"),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).default("0"),
  showInPdf: boolean("show_in_pdf").notNull().default(true),
  pageBreakBefore: boolean("page_break_before").notNull().default(false),
  keepWithPrevious: boolean("keep_with_previous").notNull().default(false),
  keepWithNext: boolean("keep_with_next").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const quoteGroupTemplates = pgTable("quote_group_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  modelCode: text("model_code"),
  imageUrl: text("image_url"),
  children: jsonb("children").$type<Array<{
    title: string;
    modelCode?: string;
    unit?: string;
    quantity?: number;
    unitPrice?: string;
    bullets?: string[];
    imageUrl?: string;
  }>>().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type QuoteForm = typeof quoteForms.$inferSelect;
export type QuoteFormItem = typeof quoteFormItems.$inferSelect;
export type QuoteGroupTemplate = typeof quoteGroupTemplates.$inferSelect;
