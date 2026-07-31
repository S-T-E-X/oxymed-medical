import {
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  Globe2,
  Headphones,
  Info,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./QuoteTemplatePage.css";

export type QuoteViewItem = {
  no: string;
  itemType: "single" | "group" | "child";
  title: string;
  bullets: string[];
  code: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  imageUrl?: string | null;
  pageBreakBefore?: boolean;
  keepWithPrevious?: boolean;
  keepWithNext?: boolean;
};

export type QuoteLanguage = "tr" | "en";

export type QuoteViewData = {
  quoteNo: string;
  quoteDate: string;
  language?: QuoteLanguage;
  firmaAdi: string;
  firmaAdres: string;
  firmaTelefon: string;
  firmaEmail: string;
  firmaVergiDairesi: string;
  firmaVergiNo: string;
  teslimatAdresi: string;
  teslimatSuresi: string;
  odemeSekli: string;
  paraBirimi: string;
  hizmetler: string[];
  sartlar: string[];
  notlar: string;
  iskonto: number;
  iskontoTipi: "yuzde" | "tutar";
  kdv: number;
  showKdv: boolean;
  showGenelToplam: boolean;
  hazirlayan: string;
  hazirlayanTelefon: string;
  hazirlayanEmail: string;
  hazirlayanImzaUrl: string;
  onaylayan: string;
  onaytayanGorev: string;
  onayTarihi: string;
  items: QuoteViewItem[];
};

const trustItemsByLang = {
  tr: [
    { icon: ShieldCheck, title: "Yerli Üretim", text: "Yerli Üretim Güçlü Altyapı" },
    { icon: BadgeCheck, title: "Kalite Güvencesi", text: "Yüksek Kalite Sertifikalı Ürünler" },
    { icon: Headphones, title: "7/24 Teknik Destek", text: "Kesintisiz Destek Hızlı Çözüm" },
    { icon: Users, title: "Müşteri Odaklı", text: "Güvenilir Hizmet Uzun Vadeli Çözümler" },
  ],
  en: [
    { icon: ShieldCheck, title: "Local Manufacturing", text: "Local Manufacturing Strong Infrastructure" },
    { icon: BadgeCheck, title: "Quality Assurance", text: "High Quality Certified Products" },
    { icon: Headphones, title: "24/7 Technical Support", text: "Uninterrupted Support Fast Solutions" },
    { icon: Users, title: "Customer Focused", text: "Reliable Service Long-term Solutions" },
  ],
} as const;

// ── Static UI chrome translations. Item content (title/bullets) is stored as
// typed by the admin and passes through unchanged; only the fixed document
// labels are translated here based on the form's language.
const STRINGS = {
  tr: {
    docTitle: "Teklif Formu",
    topInfoLabel: "Teklif üst bilgileri",
    offerCardLabel: "Teklif bilgileri",
    quoteNo: "Teklif No",
    quoteDate: "Teklif Tarihi",
    validity: "Geçerlilik Süresi",
    validityValue: "30 Gün",
    companyInfoTitle: "Teklif Verilen Kurum / Firma Bilgileri",
    companyName: "Kurum / Firma Adı",
    address: "Adres",
    phone: "Telefon",
    email: "E-posta",
    taxOffice: "Vergi Dairesi",
    taxNo: "Vergi No",
    deliveryInfoTitle: "Teslimat ve Ödeme Bilgileri",
    deliveryAddress: "Teslimat Adresi",
    deliveryTime: "Teslimat Süresi",
    paymentTerms: "Ödeme Şekli",
    currency: "Para Birimi",
    itemsTitle: "Teklif Kalemleri",
    colNo: "No",
    colImage: "Ürün Görseli",
    colModel: "Model / Kod",
    colDescription: "Ürün / Hizmet Açıklaması",
    colQty: "Miktar",
    colUnit: "Birim",
    colUnitPrice: "Birim Fiyat",
    colTotalPrice: "Toplam Fiyat",
    tableNote: "Ürün görselleri temsilidir. Teknik özelliklerde değişiklik yapma hakkımız saklıdır.",
    page: (i: number, total: number) => `Sayfa ${i} / ${total}`,
    servicesTitle: "Teklif Kapsamına Dahil Olan Hizmetler",
    termsTitle: "Genel Şartlar",
    totalTitle: "Toplam",
    subtotal: "Ara Toplam",
    discount: "İskonto",
    discountPct: (pct: string | number) => `İskonto (%${pct})`,
    vatPct: (pct: string | number) => `KDV (%${pct})`,
    grandTotal: "Genel Toplam",
    notes: "Açıklamalar / Notlar",
    preparedBy: "Teklifi Hazırlayan",
    nameSurname: "Ad Soyad",
    signature: "İmza / Kaşe",
    approvedBy: "Teklifi Onaylayan",
    position: "Görev",
    approvalDate: "Onay Tarihi",
  },
  en: {
    docTitle: "Quotation",
    topInfoLabel: "Quotation header information",
    offerCardLabel: "Quotation details",
    quoteNo: "Quote No",
    quoteDate: "Quote Date",
    validity: "Validity Period",
    validityValue: "30 Days",
    companyInfoTitle: "Client / Company Information",
    companyName: "Company Name",
    address: "Address",
    phone: "Phone",
    email: "Email",
    taxOffice: "Tax Office",
    taxNo: "Tax No",
    deliveryInfoTitle: "Delivery and Payment Information",
    deliveryAddress: "Delivery Address",
    deliveryTime: "Delivery Time",
    paymentTerms: "Payment Terms",
    currency: "Currency",
    itemsTitle: "Quotation Items",
    colNo: "No",
    colImage: "Product Image",
    colModel: "Model / Code",
    colDescription: "Product / Service Description",
    colQty: "Quantity",
    colUnit: "Unit",
    colUnitPrice: "Unit Price",
    colTotalPrice: "Total Price",
    tableNote: "Product images are for illustration purposes only. We reserve the right to make changes to technical specifications.",
    page: (i: number, total: number) => `Page ${i} / ${total}`,
    servicesTitle: "Services Included in This Quotation",
    termsTitle: "General Terms",
    totalTitle: "Total",
    subtotal: "Subtotal",
    discount: "Discount",
    discountPct: (pct: string | number) => `Discount (%${pct})`,
    vatPct: (pct: string | number) => `VAT (%${pct})`,
    grandTotal: "Grand Total",
    notes: "Remarks / Notes",
    preparedBy: "Prepared By",
    nameSurname: "Name Surname",
    signature: "Signature / Stamp",
    approvedBy: "Approved By",
    position: "Position",
    approvalDate: "Approval Date",
  },
} as const;

function getStrings(lang?: QuoteLanguage) {
  return STRINGS[lang === "en" ? "en" : "tr"];
}

function fmtPrice(num: number, currency: string, lang?: QuoteLanguage): string {
  const locale = lang === "en" ? "en-US" : "tr-TR";
  return num.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " " + currency;
}

function itemVisualWeight(it: QuoteViewItem): number {
  // Children are always one standard row (~9mm)
  if (it.itemType === "child") return 1;
  // Group headers with an image have a 110px slot (~29mm) → ~3 budget units
  if (it.itemType === "group") return it.imageUrl ? 3 : 1;
  // Single items: each bullet ≈ 4.5mm; base row ≈ 9mm → 0.5 budget units per bullet
  // Image adds ~12mm over baseline → +2 units; no-image items that have many bullets
  // can easily be 5–6× taller than a plain row
  const bulletBonus = Math.round(it.bullets.length * 0.5);
  const imageBonus = it.imageUrl ? 2 : 0;
  return 1 + bulletBonus + imageBonus;
}

function chunkItems(items: QuoteViewItem[], firstBudget = 19, nextBudget = 25): QuoteViewItem[][] {
  const pages: QuoteViewItem[][] = [];
  let budget = firstBudget;
  let page: QuoteViewItem[] = [];
  let used = 0;
  let i = 0;

  const flush = () => {
    if (page.length === 0) {
      budget = nextBudget;
      return;
    }
    pages.push(page);
    page = [];
    used = 0;
    budget = nextBudget;
  };

  while (i < items.length) {
    const it = items[i]!;

    if (it.itemType === "group") {
      // Collect the full group (header + children)
      let j = i + 1;
      while (j < items.length && items[j]!.itemType === "child") j++;
      const group = items.slice(i, j);
      const groupWeight = group.reduce((s, g) => s + itemVisualWeight(g), 0);

      // Minimum weight to start a group meaningfully: header + first child (if any)
      const headerW = itemVisualWeight(group[0]!);
      const firstChildW = group.length > 1 ? itemVisualWeight(group[1]!) : 0;
      const minStart = headerW + firstChildW;

      // Manual push-down: "alt sayfaya taşı" (pageBreakBefore) and "alt sayfaya
      // indir" (keepWithNext) both move this group onto a fresh (lower) page.
      if (page.length > 0 && (it.pageBreakBefore || it.keepWithNext)) flush();

      // Manual keep-with-previous: user forced this group onto the previous
      // (upper) page, so we skip the automatic overflow flush below.
      const forceKeep = it.keepWithPrevious && !it.pageBreakBefore;

      // Flush if: (a) the whole group doesn't fit, OR
      //           (b) remaining budget can't even hold header + first child
      //           — prevents orphan group headers at the bottom of a page
      if (!forceKeep && page.length > 0 && (used + groupWeight > budget || budget - used < minStart)) flush();

      // Add group items one by one.
      // The header (k=0) and first child (k=1) are always kept together.
      // From the second child onwards (k>=2) we allow page breaks if budget is exceeded.
      for (let k = 0; k < group.length; k++) {
        const gi = group[k]!;
        const w = itemVisualWeight(gi);
        if (!forceKeep && k >= 2 && used + w > budget && page.length > 0) flush();
        page.push(gi);
        used += w;
      }
      i = j;
    } else {
      const w = itemVisualWeight(it);
      // Manual push-down: "alt sayfaya taşı" (pageBreakBefore) and "alt sayfaya
      // indir" (keepWithNext) both move this item onto a fresh (lower) page.
      if (page.length > 0 && (it.pageBreakBefore || it.keepWithNext)) flush();
      // Manual keep-with-previous: user forced this item onto the previous
      // (upper) page, so skip the automatic overflow flush.
      const forceKeep = it.keepWithPrevious && !it.pageBreakBefore;
      if (!forceKeep && used + w > budget && page.length > 0) flush();
      page.push(it);
      used += w;
      i++;
    }
  }

  if (page.length > 0) pages.push(page);
  return pages;
}

function QuoteTopInfo({ data }: { data: QuoteViewData }) {
  const t = getStrings(data.language);
  const companyInfo = [
    [t.companyName, data.firmaAdi],
    [t.address, data.firmaAdres],
    [t.phone, data.firmaTelefon],
    [t.email, data.firmaEmail],
    [t.taxOffice, data.firmaVergiDairesi],
    [t.taxNo, data.firmaVergiNo],
  ].filter(([, v]) => v);

  const deliveryInfo = [
    [t.deliveryAddress, data.teslimatAdresi],
    [t.deliveryTime, data.teslimatSuresi],
    [t.paymentTerms, data.odemeSekli],
  ].filter(([, v]) => v);

  return (
    <section className="qt-top-info" aria-label={t.topInfoLabel}>
      <div className="qt-top-main">
        <img
          className="qt-logo-main"
          src="/assets/quote/oxymed-logoyesilmavi.webp"
          alt="Oxymed Medikal Gaz Sistemleri"
        />
        <h1>{t.docTitle}</h1>
        <img
          className="qt-logo-client"
          src="/assets/brand/baskent-medikal-logo-125x90-1.webp"
          alt="Başkent Medikal"
        />
        <aside className="qt-offer-card" aria-label={t.offerCardLabel}>
          <div>
            <strong>{t.quoteNo}</strong>
            <span>{data.quoteNo}</span>
          </div>
          <dl>
            <div>
              <dt><CalendarDays size={15} /> {t.quoteDate}</dt>
              <dd>{data.quoteDate}</dd>
            </div>
            <div>
              <dt>{t.validity}</dt>
              <dd>{t.validityValue}</dd>
            </div>
          </dl>
        </aside>
      </div>

      <div className="qt-contact-strip">
        <span><Phone size={14} /> 0(312)385 49 12</span>
        <span><Globe2 size={14} /> www.oxymedmedical.com</span>
        <span><Mail size={14} /> info@oxymedmedical.com</span>
        <span><MapPin size={15} /> İvedik OSB Mah. Süleyman Şah Cad.<br />No: 47 Yenimahalle / ANKARA</span>
      </div>

      <div className="qt-info-cards">
        <article className="qt-company-card">
          <h2>{t.companyInfoTitle}</h2>
          <div className="qt-info-card-body">
            {companyInfo.map(([label, value]) => (
              <p key={label}><span>{label}</span><b>:</b><em>{value}</em></p>
            ))}
            <Building2 className="qt-card-watermark" size={80} aria-hidden="true" />
          </div>
        </article>

        <article className="qt-delivery-card">
          <h2>{t.deliveryInfoTitle}</h2>
          <div className="qt-info-card-body">
            {deliveryInfo.map(([label, value]) => (
              <p key={label}><span>{label}</span><b>:</b><em>{value}</em></p>
            ))}
            <p><span>{t.currency}</span><b>:</b><strong>{data.paraBirimi}</strong></p>
          </div>
        </article>
      </div>
    </section>
  );
}

function ItemsTable({
  items,
  pageIndex,
  totalPages,
  currency,
  language,
}: {
  items: QuoteViewItem[];
  pageIndex: number;
  totalPages: number;
  currency: string;
  language?: QuoteLanguage;
}) {
  const t = getStrings(language);
  return (
    <section className="qt-items">
      <h2>{t.itemsTitle}</h2>
      <table>
        <thead>
          <tr>
            <th>{t.colNo}</th>
            <th>{t.colImage}</th>
            <th>{t.colModel}</th>
            <th>{t.colDescription}</th>
            <th>{t.colQty}</th>
            <th>{t.colUnit}</th>
            <th>{t.colUnitPrice}</th>
            <th>{t.colTotalPrice}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            if (item.itemType === "group") {
              return (
                <tr key={item.no} className="qt-group-row">
                  <td className="qt-no">{item.no}</td>
                  <td className="qt-image-cell">
                    {item.imageUrl ? (
                      <div className="qt-product-image-slot" style={{ background: "none", border: "none" }}>
                        <img src={item.imageUrl} alt={item.title} style={{ maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto", objectFit: "contain" }} />
                      </div>
                    ) : null}
                  </td>
                  <td className="qt-code"></td>
                  <td colSpan={5} className="qt-description">
                    <strong style={{ textTransform: "uppercase", letterSpacing: "0.03em" }}>{item.title}</strong>
                    {item.code && (
                      <span style={{ display: "block", fontSize: "2.5mm", fontWeight: 800, color: "#2c4a8a", marginTop: "0.4mm", marginBottom: "0.5mm" }}>
                        {item.code}
                      </span>
                    )}
                    {item.bullets && item.bullets.length > 0 && (
                      <div className="qt-group-description">
                        {item.bullets.map((b, bi) => <span key={bi}>{b}</span>)}
                      </div>
                    )}
                  </td>
                </tr>
              );
            }

            const isChild = item.itemType === "child";
            const total = item.quantity * item.unitPrice;
            return (
              <tr key={item.no} className={isChild ? "qt-child-row" : ""}>
                <td className="qt-no">{item.no}</td>
                <td className="qt-image-cell">
                  {!isChild && item.imageUrl ? (
                    <div className="qt-product-image-slot" style={{ background: "none", border: "none" }}>
                      <img src={item.imageUrl} alt={item.title} style={{ maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto", objectFit: "contain" }} />
                    </div>
                  ) : null}
                </td>
                <td className="qt-code">{item.code}</td>
                <td className="qt-description">
                  <strong>{item.title}</strong>
                  {item.bullets.length > 0 && (
                    <ul>
                      {item.bullets.map((bullet, i) => (
                        <li key={i}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </td>
                <td>{item.quantity > 0 ? item.quantity : ""}</td>
                <td>{item.unit}</td>
                <td>{item.quantity > 0 ? fmtPrice(item.unitPrice, currency, language) : ""}</td>
                <td>{item.quantity > 0 ? fmtPrice(total, currency, language) : ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="qt-table-note">
        <span><Info size={13} /> {t.tableNote}</span>
        <b>{t.page(pageIndex + 1, totalPages)}</b>
      </div>
    </section>
  );
}

function FooterBlocks({ data }: { data: QuoteViewData }) {
  const t = getStrings(data.language);
  const trustItems = trustItemsByLang[data.language === "en" ? "en" : "tr"];
  // Group items have quantity=0 and unitPrice=0, so they don't affect totals
  const araTopam = data.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
  const iskontoAmount = data.iskontoTipi === "tutar"
    ? Math.min(data.iskonto, araTopam)
    : araTopam * data.iskonto / 100;
  const kdvBase = araTopam - iskontoAmount;
  const kdvAmount = kdvBase * data.kdv / 100;
  const genelTopam = kdvBase + kdvAmount;
  const cur = data.paraBirimi;
  const iskontoLabel = data.iskontoTipi === "tutar"
    ? t.discount
    : t.discountPct(data.iskonto);
  const showKdvRow = data.showKdv && data.kdv > 0;
  const showGenelToplamRow = data.showGenelToplam;

  return (
    <section className="qt-footer-blocks">
      <div className="qt-summary-row">
        <article>
          <h2>{t.servicesTitle}</h2>
          <ul className="qt-check-list">
            {data.hizmetler.map((item, i) => (
              <li key={i}><CheckCircle2 size={14} /> {item}</li>
            ))}
          </ul>
        </article>

        <article>
          <h2>{t.termsTitle}</h2>
          <ul className="qt-dot-list">
            {data.sartlar.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="qt-total-box">
          <h2>{t.totalTitle}</h2>
          <dl>
            <div><dt>{t.subtotal}</dt><dd>{fmtPrice(araTopam, cur, data.language)}</dd></div>
            {iskontoAmount > 0 && (
              <div><dt>{iskontoLabel}</dt><dd>-{fmtPrice(iskontoAmount, cur, data.language)}</dd></div>
            )}
            {showKdvRow && (
              <div><dt>{t.vatPct(data.kdv)}</dt><dd>{fmtPrice(kdvAmount, cur, data.language)}</dd></div>
            )}
            {showGenelToplamRow && (
              <div className="grand"><dt>{t.grandTotal}</dt><dd>{fmtPrice(genelTopam, cur, data.language)}</dd></div>
            )}
          </dl>
        </article>
      </div>

      {data.notlar && (
        <article className="qt-notes filled">
          <h2>{t.notes}</h2>
          <p>{data.notlar}</p>
        </article>
      )}

      <div className="qt-sign-row">
        <article>
          <h2>{t.preparedBy}</h2>
          <div className="qt-sign-grid">
            <span>{t.nameSurname}</span><b>:</b><em>{data.hazirlayan}</em>
            <span>{t.phone}</span><b>:</b><em>{data.hazirlayanTelefon}</em>
            <span>{t.email}</span><b>:</b><em>{data.hazirlayanEmail}</em>
          </div>
          {data.hazirlayanImzaUrl ? (
            <>
              <strong>{t.signature}</strong>
              <div className="qt-signature-image-slot" style={{ background: "none", border: "none", padding: "1.5mm" }}>
                <img
                  src={data.hazirlayanImzaUrl}
                  alt={t.signature}
                  style={{ display: "block", width: "auto", height: "auto", maxWidth: "100%", maxHeight: "20mm", objectFit: "contain" }}
                />
              </div>
            </>
          ) : null}
          <img className="qt-sign-watermark" src="/assets/brand/oxymed-logo.webp" alt="" aria-hidden="true" />
        </article>

        <article>
          <h2>{t.approvedBy}</h2>
          <div className="qt-sign-grid">
            <span>{t.nameSurname}</span><b>:</b><em>{data.onaylayan}</em>
            <span>{t.position}</span><b>:</b><em>{data.onaytayanGorev}</em>
            <span>{t.approvalDate}</span><b>:</b><em>{data.onayTarihi}</em>
          </div>
          <strong>{t.signature}</strong>
        </article>
      </div>

      <div className="qt-trust-row">
        {trustItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title}>
              <Icon size={28} />
              <span><strong>{item.title}</strong><small>{item.text}</small></span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function QuoteTemplateView({ data }: { data: QuoteViewData }) {
  const repeatT = getStrings(data.language);
  const rawPages = useMemo(() => chunkItems(data.items), [data.items]);
  const weightOf = (arr: QuoteViewItem[]) =>
    arr.reduce((s, it) => s + itemVisualWeight(it), 0);
  const lastRaw = rawPages[rawPages.length - 1] ?? [];

  // Weight-based fallback plan. Used as the first-render estimate (before the
  // measured pass completes) and as the final answer for multi-page documents.
  // For single-page documents the footer is always attached — the shrink-to-fit
  // pass (below) zooms the content down so everything fits on one page.
  const fallbackPlan = useMemo<{
    itemPages: QuoteViewItem[][];
    footerOwnItems: QuoteViewItem[] | null;
  }>(() => {
    if (rawPages.length <= 1) {
      // Single-page: always attach footer. Shrink-to-fit handles overflow.
      return { itemPages: rawPages, footerOwnItems: null };
    }
    // Multi-page: heuristic — footer attaches unless last page is too heavy.
    const footerOwnItems: QuoteViewItem[] | null =
      weightOf(lastRaw) > 16 ? [] : null;
    return { itemPages: rawPages, footerOwnItems };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawPages]);

  // Measurement-based footer placement (multi-page only). We render a hidden
  // copy of the last item page + footer, measure the true rendered heights
  // (after images load), and decide whether the footer fits under the whole
  // last page or how many trailing rows can share the footer page. This is the
  // source of truth — heuristics are unreliable for items whose visual height
  // does not track bullet/image counts.
  const measureRef = useRef<HTMLDivElement>(null);
  const [measuredPlan, setMeasuredPlan] = useState<{
    itemPages: QuoteViewItem[][];
    footerOwnItems: QuoteViewItem[] | null;
  } | null>(null);

  // Shrink-to-fit state (single-page only). pageScale < 1 means content is
  // zoomed down so the full first page fits within the 297mm page height.
  const shrinkRef = useRef<HTMLDivElement>(null);
  const firstPageRef = useRef<HTMLElement>(null);
  const [pageScale, setPageScale] = useState<number>(1);
  const [pageScaleReady, setPageScaleReady] = useState<boolean>(
    rawPages.length !== 1,
  );

  useLayoutEffect(() => {
    setMeasuredPlan(null);
    setPageScale(1);
    setPageScaleReady(rawPages.length !== 1);
  }, [data, rawPages.length]);

  useEffect(() => {
    if (rawPages.length <= 1) return;
    const root = measureRef.current;
    if (!root) return;
    let cancelled = false;

    const compute = () => {
      if (cancelled) return;
      const pageEl = root.querySelector<HTMLElement>(".qt-page");
      const headerEl = root.querySelector<HTMLElement>(".qt-repeat-header");
      const sectionEl = root.querySelector<HTMLElement>(".qt-items");
      const footerEl = root.querySelector<HTMLElement>(".qt-footer-blocks");
      if (!pageEl || !sectionEl || !footerEl) return;
      const rowEls = [...sectionEl.querySelectorAll<HTMLElement>("tbody tr")];
      const rowHeights = rowEls.map((r) => r.offsetHeight);
      const sumRows = rowHeights.reduce((a, b) => a + b, 0);
      const pageH = pageEl.clientHeight;
      const repeatHeaderH = headerEl?.offsetHeight ?? 0;
      const tableOverhead = Math.max(0, sectionEl.offsetHeight - sumRows);
      const footerH = footerEl.offsetHeight;
      const SAFE = 24; // px guard against measurement variance / sub-pixel rounding
      const contentSpace = pageH - repeatHeaderH - tableOverhead - SAFE;

      let itemPages = rawPages;
      let footerOwnItems: QuoteViewItem[] | null = null;

      if (sumRows + footerH <= contentSpace) {
        // The whole last page + footer fit together — attach, no extra page.
        footerOwnItems = null;
      } else {
        // Move as many trailing rows as truly fit onto the footer page.
        const footerRowSpace =
          pageH - repeatHeaderH - tableOverhead - footerH - SAFE;
        let acc = 0;
        let cut = lastRaw.length;
        for (let k = lastRaw.length - 1; k >= 0; k--) {
          const h = rowHeights[k] ?? 0;
          if (acc + h > footerRowSpace) break;
          acc += h;
          cut = k;
        }
        // Never split a group header from its children: if the cut lands on a
        // child row, push it forward so the child travels with its header.
        while (cut < lastRaw.length && lastRaw[cut]?.itemType === "child") cut++;
        if (cut > 0 && cut < lastRaw.length) {
          itemPages = [...rawPages.slice(0, -1), lastRaw.slice(0, cut)];
          footerOwnItems = lastRaw.slice(cut);
        } else if (cut <= 0) {
          // Everything actually fits with the footer — attach.
          footerOwnItems = null;
        } else {
          // Nothing safe to peel — footer stands on its own page.
          footerOwnItems = [];
        }
      }
      if (!cancelled) setMeasuredPlan({ itemPages, footerOwnItems });
    };

    // Heights depend on images (product images + signature), so measure only
    // once every image in the hidden container has settled.
    const imgs = [...root.querySelectorAll("img")];
    const pending = imgs.filter((img) => !img.complete);
    if (pending.length === 0) {
      compute();
      return () => {
        cancelled = true;
      };
    }
    let left = pending.length;
    const done = () => {
      if (--left <= 0) compute();
    };
    pending.forEach((img) => {
      img.addEventListener("load", done);
      img.addEventListener("error", done);
    });
    const timer = window.setTimeout(compute, 1500);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      pending.forEach((img) => {
        img.removeEventListener("load", done);
        img.removeEventListener("error", done);
      });
    };
  }, [data, rawPages, lastRaw]);

  // Shrink-to-fit measurement (single-page only).
  // Renders a hidden clone of the full first page with height:auto, measures
  // its natural height, and sets a CSS zoom factor so content fits in 297mm.
  useEffect(() => {
    if (rawPages.length !== 1) return;
    const shrinkEl = shrinkRef.current;
    if (!shrinkEl) return;
    let cancelled = false;

    const compute = () => {
      if (cancelled) return;
      const cloneArticle = shrinkEl.querySelector<HTMLElement>(".qt-page");
      const realPage = firstPageRef.current;
      if (!cloneArticle || !realPage) return;
      const naturalH = cloneArticle.offsetHeight;
      const pageH = realPage.clientHeight;
      const scale = naturalH > pageH ? pageH / naturalH : 1;
      if (!cancelled) {
        setPageScale(scale);
        setPageScaleReady(true);
      }
    };

    const imgs = [...shrinkEl.querySelectorAll<HTMLImageElement>("img")];
    const pending = imgs.filter((img) => !img.complete);
    if (pending.length === 0) {
      compute();
      return () => {
        cancelled = true;
      };
    }
    let left = pending.length;
    const done = () => {
      if (--left <= 0) compute();
    };
    pending.forEach((img) => {
      img.addEventListener("load", done);
      img.addEventListener("error", done);
    });
    const timer = window.setTimeout(compute, 1500);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      pending.forEach((img) => {
        img.removeEventListener("load", done);
        img.removeEventListener("error", done);
      });
    };
  }, [data, rawPages]);

  const plan = rawPages.length > 1 && measuredPlan ? measuredPlan : fallbackPlan;
  const itemPages = plan.itemPages;
  const footerOwnItems = plan.footerOwnItems;
  const attachToLast = footerOwnItems === null;
  const totalPages = itemPages.length + (attachToLast ? 0 : 1);
  const ready = rawPages.length <= 1 ? pageScaleReady : measuredPlan !== null;

  if (data.items.length === 0) {
    const totalPages0 = 1;
    return (
      <main className="qt-preview">
        <article className="qt-page first with-footer">
          <QuoteTopInfo data={data} />
          <ItemsTable items={[]} pageIndex={0} totalPages={totalPages0} currency={data.paraBirimi} language={data.language} />
          <FooterBlocks data={data} />
        </article>
      </main>
    );
  }

  return (
    <>
      <main className="qt-preview" data-quote-ready={ready ? "1" : undefined}>
        {itemPages.map((items, index) => {
          const isFirst = index === 0;
          const isLastItemPage = index === itemPages.length - 1;
          // Single-page shrink: wrap inner content in a zoom div so everything
          // fits within the 297mm page height without overflowing.
          const isSinglePageShrink =
            isFirst && rawPages.length === 1 && pageScale < 1;
          return (
            <article
              ref={isFirst ? firstPageRef : undefined}
              className={`qt-page ${isFirst ? "first" : "continuation"} ${attachToLast && isLastItemPage ? "with-footer" : ""}`}
              key={index}
            >
              {isSinglePageShrink ? (
                <div style={{ zoom: pageScale }}>
                  <QuoteTopInfo data={data} />
                  <ItemsTable
                    items={items}
                    pageIndex={index}
                    totalPages={totalPages}
                    currency={data.paraBirimi}
                    language={data.language}
                  />
                  <FooterBlocks data={data} />
                </div>
              ) : (
                <>
                  {isFirst ? (
                    <QuoteTopInfo data={data} />
                  ) : (
                    <header className="qt-repeat-header">
                      <img src="/assets/quote/oxymed-logoyesilmavi.webp" alt="Oxymed Medikal" />
                      <strong>{repeatT.docTitle}</strong>
                      <span>{data.quoteNo}</span>
                    </header>
                  )}
                  <ItemsTable
                    items={items}
                    pageIndex={index}
                    totalPages={totalPages}
                    currency={data.paraBirimi}
                    language={data.language}
                  />
                  {attachToLast && isLastItemPage ? <FooterBlocks data={data} /> : null}
                </>
              )}
            </article>
          );
        })}

        {!attachToLast ? (
          <article className="qt-page continuation with-footer qt-footer-page">
            <header className="qt-repeat-header">
              <img src="/assets/quote/oxymed-logoyesilmavi.webp" alt="Oxymed Medikal" />
              <strong>{repeatT.docTitle}</strong>
              <span>{data.quoteNo}</span>
            </header>
            {footerOwnItems && footerOwnItems.length > 0 ? (
              <ItemsTable
                items={footerOwnItems}
                pageIndex={itemPages.length}
                totalPages={totalPages}
                currency={data.paraBirimi}
                language={data.language}
              />
            ) : null}
            <FooterBlocks data={data} />
          </article>
        ) : null}
      </main>

      {/* Hidden measuring container: a copy of the last item page + footer used
          to measure true rendered heights for footer placement. Never visible
          and excluded from print. */}
      {rawPages.length > 1 ? (
        <div
          ref={measureRef}
          aria-hidden="true"
          className="qt-measure-host"
          style={{
            position: "absolute",
            left: "-99999px",
            top: 0,
            visibility: "hidden",
            pointerEvents: "none",
          }}
        >
          <article className="qt-page continuation">
            <header className="qt-repeat-header">
              <img src="/assets/quote/oxymed-logoyesilmavi.webp" alt="Oxymed Medikal" />
              <strong>{repeatT.docTitle}</strong>
              <span>{data.quoteNo}</span>
            </header>
            <ItemsTable
              items={lastRaw}
              pageIndex={0}
              totalPages={1}
              currency={data.paraBirimi}
              language={data.language}
            />
            <FooterBlocks data={data} />
          </article>
        </div>
      ) : null}

      {/* Hidden shrink-measure container: full first page with height:auto so
          we can measure the natural content height and compute a zoom factor.
          Only needed for single-page documents. Excluded from print. */}
      {rawPages.length === 1 ? (
        <div
          ref={shrinkRef}
          aria-hidden="true"
          className="qt-measure-host"
          style={{
            position: "absolute",
            left: "-99999px",
            top: 0,
            visibility: "hidden",
            pointerEvents: "none",
          }}
        >
          <article
            className="qt-page first with-footer"
            style={{ height: "auto", overflow: "visible" }}
          >
            <QuoteTopInfo data={data} />
            <ItemsTable
              items={lastRaw}
              pageIndex={0}
              totalPages={1}
              currency={data.paraBirimi}
              language={data.language}
            />
            <FooterBlocks data={data} />
          </article>
        </div>
      ) : null}
    </>
  );
}
