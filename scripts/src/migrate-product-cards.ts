/**
 * One-off, idempotent data migration for the product cards rework.
 *
 *   pnpm --filter @workspace/scripts run migrate-product-cards
 *
 * Before this change, two things were hardcoded in the frontend:
 *
 *   1. Home page category cards took their image and blurb from a fixed array
 *      indexed by the category's position in the list. Adding, reordering or
 *      hiding a category silently shifted every card's artwork and text onto
 *      the wrong category.
 *   2. The three dental products existed only as hardcoded JSX cards keyed off
 *      site-settings image keys, so they could not be recategorised, reordered,
 *      unpublished or renamed from the admin panel.
 *
 * This script moves that content into the database so the admin panel is the
 * single source of truth. It is safe to re-run: categories are matched by slug
 * and products by page slug, and existing values are never overwritten with
 * blanks.
 *
 * The dental products keep their existing detail pages, which are still driven
 * by site settings — only the card (title, image, category, order) moves here.
 */

import { db, productCategoriesTable, productsTable, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

/**
 * Blurbs and artwork previously hardcoded on the home page, now attached to the
 * category they actually describe rather than to a list position.
 */
const CATEGORY_CONTENT: Record<
  string,
  { imageUrl: string; descriptions: Record<string, string> }
> = {
  "yatak-basi-uniteleri": {
    imageUrl: "/assets/images/product-bed-head-unit.png",
    descriptions: {
      description: "Elektrik, medikal gaz ve data üniteleri ile güvenli ve konforlu çözümler.",
      descriptionEn: "Safe and comfortable solutions with electrical, medical gas and data units.",
      descriptionDe: "Sichere und komfortable Lösungen mit Strom-, Medizin-, Gas- und Dateneinheiten.",
      descriptionFr:
        "Des solutions sûres et confortables avec unités électriques, de gaz médicaux et de données.",
      descriptionIt: "Soluzioni sicure e confortevoli con unità elettriche, di gas medicali e dati.",
      descriptionAr: "حلول آمنة ومريحة مزودة بوحدات الكهرباء والغازات الطبية والبيانات.",
      descriptionRu:
        "Безопасные и комфортные решения с электрическими, медицинскими газовыми и информационными модулями.",
      descriptionFa: "راهکارهای ایمن و راحت با یونیت‌های برق، گازهای طبی و دیتا.",
      descriptionKa:
        "უსაფრთხო და კომფორტული გადაწყვეტილებები ელექტროენერგიის, სამედიცინო გაზისა და მონაცემთა ბლოკებით.",
      descriptionBg:
        "Безопасни и комфортни решения с електрически, медицински газови и информационни модули.",
      descriptionAz: "Elektrik, tibbi qaz və data blokları ilə təhlükəsiz və komfortlu həllər.",
    },
  },
  "pendant-sistemleri": {
    imageUrl: "/assets/images/product-pendant-system.png",
    descriptions: {
      description: "Ameliyathane, yoğun bakım ve acil üniteler için esnek pendant çözümleri.",
      descriptionEn:
        "Flexible pendant solutions for operating rooms, intensive care and emergency units.",
      descriptionDe: "Flexible Pendantsysteme für OP, Intensivstation und Notaufnahme.",
      descriptionFr:
        "Des solutions de bras plafonniers flexibles pour les salles d’opération, les soins intensifs et les urgences.",
      descriptionIt:
        "Soluzioni pensili flessibili per sale operatorie, terapie intensive e pronto soccorso.",
      descriptionAr: "حلول بندانت مرنة لغرف العمليات ووحدات العناية المركزة والطوارئ.",
      descriptionRu:
        "Гибкие решения с медицинскими консолями для операционных, отделений интенсивной терапии и неотложной помощи.",
      descriptionFa: "راهکارهای پندانت انعطاف‌پذیر برای اتاق عمل، مراقبت‌های ویژه و اورژانس.",
      descriptionKa:
        "მოქნილი პენდანტ გადაწყვეტილებები საოპერაციო, ინტენსიური თერაპიისა და გადაუდებელი დახმარების განყოფილებებისთვის.",
      descriptionBg: "Гъвкави конзолни решения за операционни, интензивни отделения и спешни звена.",
      descriptionAz: "Əməliyyatxana, intensiv terapiya və təcili yardım bölmələri üçün çevik pendant həlləri.",
    },
  },
  "medikal-gaz-sistemleri": {
    imageUrl: "/assets/images/product-medical-gas.png",
    descriptions: {
      description: "Oksijen, vakum, hava, AGS ve azot gaz sistemleri.",
      descriptionEn: "Oxygen, vacuum, air, AGS and nitrogen gas systems.",
      descriptionDe: "Sauerstoff-, Vakuum-, Druckluft-, AGS- und Stickstoffgassysteme.",
      descriptionFr: "Systèmes de distribution d’oxygène, de vide, d’air, d’AGS et d’azote.",
      descriptionIt: "Sistemi di ossigeno, vuoto, aria, AGS e azoto.",
      descriptionAr: "أنظمة غازات الأكسجين والشفط والهواء وAGS والنيتروجين.",
      descriptionRu: "Системы подачи кислорода, вакуума, сжатого воздуха, AGS и азота.",
      descriptionFa: "سیستم‌های گاز اکسیژن، وکیوم، هوا، AGS و نیتروژن.",
      descriptionKa: "ჟანგბადის, ვაკუუმის, ჰაერის, AGS-ისა და აზოტის გაზის სისტემები.",
      descriptionBg: "Системи за кислород, вакуум, въздух, AGS и азот.",
      descriptionAz: "Oksigen, vakuum, hava, AGS və azot qaz sistemləri.",
    },
  },
  // Seeded databases call this category "elektrik-data-sistemleri"; it was
  // later renamed to "alarm-izleme-sistemleri" in some installs. Both slugs
  // describe the same card, so both must receive the content — otherwise the
  // seeded install silently falls back to the neutral placeholder.
  "elektrik-data-sistemleri": {
    imageUrl: "/assets/images/product-electrical-data.png",
    descriptions: {
      description: "Elektrik, zayıf akım ve data sistemleri ile kesintisiz iletişim.",
      descriptionEn: "Uninterrupted communication with electrical, low-current and data systems.",
      descriptionDe: "Unterbrechungsfreie Kommunikation mit Strom-, Schwachstrom- und Datensystemen.",
      descriptionFr:
        "Communication ininterrompue grâce aux systèmes électriques, de courants faibles et de données.",
      descriptionIt: "Comunicazione ininterrotta con sistemi elettrici, a corrente debole e dati.",
      descriptionAr: "اتصال مستمر عبر أنظمة الكهرباء والتيار الضعيف والبيانات.",
      descriptionRu: "Бесперебойная связь с системами электроснабжения, слаботочными и информационными системами.",
      descriptionFa: "ارتباط بدون وقفه با سیستم‌های برق، جریان ضعیف و دیتا.",
      descriptionKa: "უწყვეტი კომუნიკაცია ელექტროენერგიის, სუსტი დენისა და მონაცემთა სისტემებით.",
      descriptionBg: "Непрекъсната комуникация чрез електрически, слаботокови и информационни системи.",
      descriptionAz: "Elektrik, zəif cərəyan və data sistemləri ilə fasiləsiz rabitə.",
    },
  },
  "dental-sistemler": {
    // No dedicated asset existed; the amalgam separator card image is applied
    // below from site settings when this key is still empty.
    imageUrl: "",
    descriptions: {
      description: "Diş klinikleri için amalgam separatörü ve dental vakum çözümleri.",
      descriptionEn: "Amalgam separator and dental vacuum solutions for dental clinics.",
      descriptionDe: "Amalgamabscheider- und Dentalvakuumlösungen für Zahnkliniken.",
      descriptionFr: "Solutions de séparateur d’amalgame et d’aspiration dentaire pour cliniques dentaires.",
      descriptionIt: "Soluzioni di separatore di amalgama e aspirazione dentale per cliniche odontoiatriche.",
      descriptionAr: "حلول فاصل الأملغم وأنظمة التفريغ لعيادات الأسنان.",
      descriptionRu: "Сепараторы амальгамы и стоматологические вакуумные решения для клиник.",
      descriptionFa: "راهکارهای جداکننده آمالگام و وکیوم دندان‌پزشکی برای کلینیک‌ها.",
      descriptionKa: "ამალგამის სეპარატორი და დენტალური ვაკუუმ-გადაწყვეტილებები კლინიკებისთვის.",
      descriptionBg: "Сепаратори за амалгама и дентални вакуумни решения за клиники.",
      descriptionAz: "Diş klinikaları üçün amalqam separatoru və dental vakuum həlləri.",
    },
  },
};

// The electrical/data category was renamed in some installs. Keep both slugs
// pointing at the same card content instead of duplicating the block.
CATEGORY_CONTENT["alarm-izleme-sistemleri"] = CATEGORY_CONTENT["elektrik-data-sistemleri"]!;

/**
 * The dental cards that used to be hardcoded JSX. Their detail pages remain
 * settings-driven; only the catalog card becomes a real product row.
 */
const DENTAL_PRODUCTS: Array<{
  pageSlug: string;
  cardImageSettingKey: string;
  sortOrder: number;
  titles: Record<string, string>;
}> = [
  {
    pageSlug: "amalgam-separator",
    cardImageSettingKey: "ams_card_image",
    sortOrder: 20,
    titles: {
      title: "Amalgam Separatörü",
      titleEn: "Amalgam Separator",
      titleDe: "Amalgamabscheider",
      titleFr: "Séparateur d’amalgame",
      titleIt: "Separatore di amalgama",
      titleAr: "فاصل الأملغم",
      titleRu: "Сепаратор амальгамы",
      titleFa: "جداکننده آمالگام",
      titleKa: "ამალგამის სეპარატორი",
      titleBg: "Сепаратор за амалгама",
      titleAz: "Amalqam Separatoru",
    },
  },
  {
    pageSlug: "dental-vakum-pompasi",
    cardImageSettingKey: "dvp_card_image",
    sortOrder: 21,
    titles: {
      title: "Dental Vakum Pompası",
      titleEn: "Dental Vacuum Pump",
      titleDe: "Dental-Vakuumpumpe",
      titleFr: "Pompe à vide dentaire",
      titleIt: "Pompa per vuoto dentale",
      titleAr: "مضخة تفريغ للأسنان",
      titleRu: "Стоматологический вакуумный насос",
      titleFa: "پمپ وکیوم دندان‌پزشکی",
      titleKa: "დენტალური ვაკუუმ-ტუმბო",
      titleBg: "Дентална вакуумна помпа",
      titleAz: "Dental Vakuum Pompası",
    },
  },
  {
    pageSlug: "dental-vakum-sistemi",
    cardImageSettingKey: "dvs_card_image",
    sortOrder: 22,
    titles: {
      title: "Dental Vakum Sistemi",
      titleEn: "Dental Vacuum System",
      titleDe: "Dental-Vakuumsystem",
      titleFr: "Système d’aspiration dentaire",
      titleIt: "Sistema di aspirazione dentale",
      titleAr: "نظام تفريغ للأسنان",
      titleRu: "Стоматологическая вакуумная система",
      titleFa: "سیستم وکیوم دندان‌پزشکی",
      titleKa: "დენტალური ვაკუუმ-სისტემა",
      titleBg: "Дентална вакуумна система",
      titleAz: "Dental Vakuum Sistemi",
    },
  },
];

/**
 * Locale names for products that already existed in the seeded/admin database.
 * Only empty locale columns are filled so a later admin translation always wins.
 */
const EXISTING_PRODUCT_TITLES: Record<string, Record<string, string>> = {
  "Standart Yatak Başı Ünitesi": {
    titleEn: "Standard Bed Head Unit",
    titleDe: "Standard-Bettkopfeinheit",
    titleFr: "Unité de tête de lit standard",
    titleIt: "Unità testaletto standard",
    titleAr: "وحدة رأس سرير قياسية",
    titleRu: "Стандартная прикроватная панель",
    titleFa: "یونیت هدبورد تخت استاندارد",
    titleKa: "სტანდარტული საწოლთანა ბლოკი",
    titleBg: "Стандартен болничен панел",
    titleAz: "Standart yataq başı bloku",
  },
  "Kat Kontrol Panosu": {
    titleEn: "Gas Control Panel",
    titleDe: "Gassteuerungspanel",
    titleFr: "Panneau de contrôle des gaz",
    titleIt: "Pannello di controllo dei gas",
    titleAr: "لوحة التحكم بالغاز",
    titleRu: "Панель управления медицинскими газами",
    titleFa: "پنل کنترل گاز",
    titleKa: "გაზის კონტროლის პანელი",
    titleBg: "Панел за управление на газа",
    titleAz: "Qaz idarəetmə paneli",
  },
  "Anestezi Pendant Ünitesi": {
    titleEn: "Anesthesia Pendant Unit",
    titleDe: "Anästhesie-Pendantsystem",
    titleFr: "Système de pendant d’anesthésie",
    titleIt: "Sistema pensile per anestesia",
    titleAr: "وحدة بندانت التخدير",
    titleRu: "Анестезиологическая консоль",
    titleFa: "پندانت بیهوشی",
    titleKa: "ანესთეზიის პენდანტი",
    titleBg: "Анестезиологична конзола",
    titleAz: "Anesteziya pendant sistemi",
  },
  "Cerrahi Pendant Ünitesi": {
    titleEn: "Surgical Pendant Unit",
    titleDe: "Chirurgie-Pendantsystem",
    titleFr: "Système de pendant chirurgical",
    titleIt: "Sistema pensile chirurgico",
    titleAr: "وحدة بندانت جراحية",
    titleRu: "Хирургическая консоль",
    titleFa: "پندانت جراحی",
    titleKa: "ქირურგიული პენდანტი",
    titleBg: "Хирургична конзола",
    titleAz: "Cərrahi pendant sistemi",
  },
  "Yoğun Bakım Pendant Ünitesi": {
    titleEn: "ICU Pendant Unit",
    titleDe: "Intensivpflege-Pendantsystem",
    titleFr: "Système de pendant de réanimation",
    titleIt: "Sistema pensile per terapia intensiva",
    titleAr: "وحدة بندانت العناية المركزة",
    titleRu: "Консоль для реанимации",
    titleFa: "پندانت بخش مراقبت ویژه",
    titleKa: "ინტენსიური თერაპიის პენდანტი",
    titleBg: "Конзола за интензивно отделение",
    titleAz: "Reanimasiya pendant sistemi",
  },
};

const DENTAL_CATEGORY_SLUG = "dental-sistemler";

const BED_HEAD_REPLACEMENT_TITLES = {
  title: "Yatak Başı Ünitesi",
  titleEn: "Bed Head Unit",
  titleDe: "Bettkopfeinheit",
  titleFr: "Unité de tête de lit",
  titleIt: "Unità testaletto",
  titleAr: "وحدة رأس السرير",
  titleRu: "Прикроватная панель",
  titleFa: "یونیت هدبورد تخت",
  titleKa: "საწოლთანა ბლოკი",
  titleBg: "Болничен панел",
  titleAz: "Yataq başı bloku",
} as const;

async function getSetting(key: string): Promise<string | null> {
  const [row] = await db
    .select()
    .from(siteSettingsTable)
    .where(eq(siteSettingsTable.settingKey, key));
  return row?.settingValue ?? null;
}

async function replaceLegacyBedHeadProduct(): Promise<boolean> {
  const [legacy] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.title, "Standart Yatak Başı Ünitesi"));
  if (!legacy) return false;

  const [replacement] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.title, BED_HEAD_REPLACEMENT_TITLES.title));

  if (replacement) {
    if (legacy.showOnHome && !replacement.showOnHome) {
      await db
        .update(productsTable)
        .set({ showOnHome: true, homeSortOrder: legacy.homeSortOrder })
        .where(eq(productsTable.id, replacement.id));
    }
    await db.delete(productsTable).where(eq(productsTable.id, legacy.id));
    console.log(`  product "${legacy.title}" deleted; existing replacement kept`);
    return true;
  }

  const [created] = await db
    .insert(productsTable)
    .values({
      ...BED_HEAD_REPLACEMENT_TITLES,
      categoryId: legacy.categoryId,
      description: legacy.description,
      imageUrl: legacy.imageUrl,
      specs: legacy.specs,
      sortOrder: legacy.sortOrder,
      showOnHome: legacy.showOnHome,
      homeSortOrder: legacy.homeSortOrder,
      published: legacy.published,
      pageSlug: legacy.pageSlug,
      pageData: legacy.pageData,
      privateData: legacy.privateData,
      quoteTitle: legacy.quoteTitle,
      quoteBullets: legacy.quoteBullets,
      quoteModelCode: legacy.quoteModelCode,
      quoteImageUrl: legacy.quoteImageUrl,
      quoteUnit: legacy.quoteUnit,
      quoteUnitPrice: legacy.quoteUnitPrice,
    })
    .returning();
  await db.delete(productsTable).where(eq(productsTable.id, legacy.id));
  console.log(`  product "${legacy.title}" deleted; "${created?.title}" created`);
  return true;
}

async function main() {
  let categoriesUpdated = 0;
  let productsInserted = 0;
  let productsUpdated = 0;

  if (await replaceLegacyBedHeadProduct()) productsUpdated += 1;

  const categories = await db.select().from(productCategoriesTable);

  for (const category of categories) {
    const content = CATEGORY_CONTENT[category.slug];
    if (!content) continue;

    const patch: Record<string, string> = {};

    // Only fill blanks — an admin edit always wins over this migration.
    for (const [field, value] of Object.entries(content.descriptions)) {
      const current = (category as unknown as Record<string, string | null>)[field];
      if (!current?.trim()) patch[field] = value;
    }

    if (!category.imageUrl?.trim()) {
      const image =
        content.imageUrl ||
        (category.slug === DENTAL_CATEGORY_SLUG ? ((await getSetting("ams_card_image")) ?? "") : "");
      if (image) patch["imageUrl"] = image;
    }

    if (Object.keys(patch).length === 0) continue;

    await db
      .update(productCategoriesTable)
      .set(patch)
      .where(eq(productCategoriesTable.id, category.id));
    categoriesUpdated += 1;
    console.log(`  category "${category.name}" ← ${Object.keys(patch).join(", ")}`);
  }

  // A freshly seeded database has no dental category, so create it rather than
  // aborting: this script runs unattended from post-merge.sh, and throwing here
  // would leave the (no longer hardcoded) dental cards missing from the site.
  let dentalCategory = categories.find((c) => c.slug === DENTAL_CATEGORY_SLUG);
  if (!dentalCategory) {
    const content = CATEGORY_CONTENT[DENTAL_CATEGORY_SLUG]!;
    const maxSortOrder = categories.reduce((max, c) => Math.max(max, c.sortOrder), 0);
    const [created] = await db
      .insert(productCategoriesTable)
      .values({
        name: "Dental Sistemler",
        slug: DENTAL_CATEGORY_SLUG,
        sortOrder: maxSortOrder + 1,
        imageUrl: (await getSetting("ams_card_image")) || null,
        ...content.descriptions,
      })
      .returning();
    dentalCategory = created!;
    categoriesUpdated += 1;
    console.log(`  category "Dental Sistemler" created (${DENTAL_CATEGORY_SLUG})`);
  }

  for (const spec of DENTAL_PRODUCTS) {
    const cardImage = (await getSetting(spec.cardImageSettingKey)) ?? "";
    const [existing] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.pageSlug, spec.pageSlug));

    if (existing) {
      const patch: Record<string, string | number | null> = {};
      // Backfill only what is missing, so later admin edits survive a re-run.
      for (const [field, value] of Object.entries(spec.titles)) {
        if (field === "title") continue;
        const current = (existing as unknown as Record<string, string | null>)[field];
        if (!current?.trim()) patch[field] = value;
      }
      if (!existing.imageUrl?.trim() && cardImage) patch["imageUrl"] = cardImage;
      if (existing.categoryId === null) patch["categoryId"] = dentalCategory.id;

      if (Object.keys(patch).length > 0) {
        await db.update(productsTable).set(patch).where(eq(productsTable.id, existing.id));
        productsUpdated += 1;
        console.log(`  product "${existing.title}" ← ${Object.keys(patch).join(", ")}`);
      }
      continue;
    }

    await db.insert(productsTable).values({
      ...spec.titles,
      title: spec.titles["title"]!,
      categoryId: dentalCategory.id,
      pageSlug: spec.pageSlug,
      imageUrl: cardImage || null,
      sortOrder: spec.sortOrder,
      published: true,
    });
    productsInserted += 1;
    console.log(`  product "${spec.titles["title"]}" created (${spec.pageSlug})`);
  }

  const existingProducts = await db.select().from(productsTable);
  for (const product of existingProducts) {
    const translations = EXISTING_PRODUCT_TITLES[product.title];
    if (!translations) continue;

    const patch: Record<string, string> = {};
    for (const [field, value] of Object.entries(translations)) {
      const current = (product as unknown as Record<string, string | null>)[field];
      if (!current?.trim()) patch[field] = value;
    }
    if (Object.keys(patch).length === 0) continue;

    await db.update(productsTable).set(patch).where(eq(productsTable.id, product.id));
    productsUpdated += 1;
    console.log(`  product "${product.title}" ← ${Object.keys(patch).join(", ")}`);
  }

  // Existing installations had four home cards before product-level curation
  // existed. Initialize those cards from the first four published products
  // only when no admin selection exists yet; never overwrite a selection.
  const [existingHomeProduct] = await db
    .select({ id: productsTable.id })
    .from(productsTable)
    .where(eq(productsTable.showOnHome, true))
    .limit(1);
  if (!existingHomeProduct) {
    const initialHomeProducts = await db
      .select({ id: productsTable.id })
      .from(productsTable)
      .where(eq(productsTable.published, true))
      .orderBy(productsTable.sortOrder, productsTable.id)
      .limit(4);
    for (const [index, product] of initialHomeProducts.entries()) {
      await db
        .update(productsTable)
        .set({ showOnHome: true, homeSortOrder: index + 1 })
        .where(eq(productsTable.id, product.id));
    }
    if (initialHomeProducts.length > 0) {
      console.log(`  initialized ${initialHomeProducts.length} home product cards`);
    }
  }

  console.log(
    `\nDone: ${categoriesUpdated} categories updated, ${productsInserted} products created, ${productsUpdated} products backfilled.`,
  );
  process.exit(0);
}

main().catch((error) => {
  console.error("migrate-product-cards failed:", error);
  process.exit(1);
});
