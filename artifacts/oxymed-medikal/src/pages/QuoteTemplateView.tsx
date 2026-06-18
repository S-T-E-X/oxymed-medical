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

export type QuoteViewData = {
  quoteNo: string;
  quoteDate: string;
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

const trustItems = [
  { icon: ShieldCheck, title: "Yerli Üretim", text: "Yerli Üretim Güçlü Altyapı" },
  { icon: BadgeCheck, title: "Kalite Güvencesi", text: "Yüksek Kalite Sertifikalı Ürünler" },
  { icon: Headphones, title: "7/24 Teknik Destek", text: "Kesintisiz Destek Hızlı Çözüm" },
  { icon: Users, title: "Müşteri Odaklı", text: "Güvenilir Hizmet Uzun Vadeli Çözümler" },
];

function fmtPrice(num: number, currency: string): string {
  return num.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " " + currency;
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
  const companyInfo = [
    ["Kurum / Firma Adı", data.firmaAdi],
    ["Adres", data.firmaAdres],
    ["Telefon", data.firmaTelefon],
    ["E-posta", data.firmaEmail],
    ["Vergi Dairesi", data.firmaVergiDairesi],
    ["Vergi No", data.firmaVergiNo],
  ].filter(([, v]) => v);

  const deliveryInfo = [
    ["Teslimat Adresi", data.teslimatAdresi],
    ["Teslimat Süresi", data.teslimatSuresi],
    ["Ödeme Şekli", data.odemeSekli],
  ].filter(([, v]) => v);

  return (
    <section className="qt-top-info" aria-label="Teklif üst bilgileri">
      <div className="qt-top-main">
        <img
          className="qt-logo-main"
          src="/assets/quote/oxymed-logoyesilmavi.webp"
          alt="Oxymed Medikal Gaz Sistemleri"
        />
        <h1>Teklif Formu</h1>
        <img
          className="qt-logo-client"
          src="/assets/brand/baskent-medikal-logo-125x90-1.webp"
          alt="Başkent Medikal"
        />
        <aside className="qt-offer-card" aria-label="Teklif bilgileri">
          <div>
            <strong>Teklif No</strong>
            <span>{data.quoteNo}</span>
          </div>
          <dl>
            <div>
              <dt><CalendarDays size={15} /> Teklif Tarihi</dt>
              <dd>{data.quoteDate}</dd>
            </div>
            <div>
              <dt>Geçerlilik Süresi</dt>
              <dd>30 Gün</dd>
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
          <h2>Teklif Verilen Kurum / Firma Bilgileri</h2>
          <div className="qt-info-card-body">
            {companyInfo.map(([label, value]) => (
              <p key={label}><span>{label}</span><b>:</b><em>{value}</em></p>
            ))}
            <Building2 className="qt-card-watermark" size={80} aria-hidden="true" />
          </div>
        </article>

        <article className="qt-delivery-card">
          <h2>Teslimat ve Ödeme Bilgileri</h2>
          <div className="qt-info-card-body">
            {deliveryInfo.map(([label, value]) => (
              <p key={label}><span>{label}</span><b>:</b><em>{value}</em></p>
            ))}
            <p><span>Para Birimi</span><b>:</b><strong>{data.paraBirimi}</strong></p>
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
}: {
  items: QuoteViewItem[];
  pageIndex: number;
  totalPages: number;
  currency: string;
}) {
  return (
    <section className="qt-items">
      <h2>Teklif Kalemleri</h2>
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Ürün Görseli</th>
            <th>Model / Kod</th>
            <th>Ürün / Hizmet Açıklaması</th>
            <th>Miktar</th>
            <th>Birim</th>
            <th>Birim Fiyat</th>
            <th>Toplam Fiyat</th>
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
                <td>{item.quantity > 0 ? fmtPrice(item.unitPrice, currency) : ""}</td>
                <td>{item.quantity > 0 ? fmtPrice(total, currency) : ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="qt-table-note">
        <span><Info size={13} /> Ürün görselleri temsilidir. Teknik özelliklerde değişiklik yapma hakkımız saklıdır.</span>
        <b>Sayfa {pageIndex + 1} / {totalPages}</b>
      </div>
    </section>
  );
}

function FooterBlocks({ data }: { data: QuoteViewData }) {
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
    ? "İskonto"
    : `İskonto (%${data.iskonto})`;
  const showKdvRow = data.showKdv && data.kdv > 0;
  const showGenelToplamRow = data.showGenelToplam;

  return (
    <section className="qt-footer-blocks">
      <div className="qt-summary-row">
        <article>
          <h2>Teklif Kapsamına Dahil Olan Hizmetler</h2>
          <ul className="qt-check-list">
            {data.hizmetler.map((item, i) => (
              <li key={i}><CheckCircle2 size={14} /> {item}</li>
            ))}
          </ul>
        </article>

        <article>
          <h2>Genel Şartlar</h2>
          <ul className="qt-dot-list">
            {data.sartlar.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="qt-total-box">
          <h2>Toplam</h2>
          <dl>
            <div><dt>Ara Toplam</dt><dd>{fmtPrice(araTopam, cur)}</dd></div>
            {iskontoAmount > 0 && (
              <div><dt>{iskontoLabel}</dt><dd>-{fmtPrice(iskontoAmount, cur)}</dd></div>
            )}
            {showKdvRow && (
              <div><dt>KDV (%{data.kdv})</dt><dd>{fmtPrice(kdvAmount, cur)}</dd></div>
            )}
            {showGenelToplamRow && (
              <div className="grand"><dt>Genel Toplam</dt><dd>{fmtPrice(genelTopam, cur)}</dd></div>
            )}
          </dl>
        </article>
      </div>

      {data.notlar && (
        <article className="qt-notes filled">
          <h2>Açıklamalar / Notlar</h2>
          <p>{data.notlar}</p>
        </article>
      )}

      <div className="qt-sign-row">
        <article>
          <h2>Teklifi Hazırlayan</h2>
          <div className="qt-sign-grid">
            <span>Ad Soyad</span><b>:</b><em>{data.hazirlayan}</em>
            <span>Telefon</span><b>:</b><em>{data.hazirlayanTelefon}</em>
            <span>E-posta</span><b>:</b><em>{data.hazirlayanEmail}</em>
          </div>
          {data.hazirlayanImzaUrl ? (
            <>
              <strong>İmza / Kaşe</strong>
              <div className="qt-signature-image-slot" style={{ background: "none", border: "none", padding: "1.5mm" }}>
                <img
                  src={data.hazirlayanImzaUrl}
                  alt="İmza / Kaşe"
                  style={{ display: "block", width: "auto", height: "auto", maxWidth: "100%", maxHeight: "45mm", objectFit: "contain" }}
                />
              </div>
            </>
          ) : null}
          <img className="qt-sign-watermark" src="/assets/brand/oxymed-logo.webp" alt="" aria-hidden="true" />
        </article>

        <article>
          <h2>Teklifi Onaylayan</h2>
          <div className="qt-sign-grid">
            <span>Ad Soyad</span><b>:</b><em>{data.onaylayan}</em>
            <span>Görev</span><b>:</b><em>{data.onaytayanGorev}</em>
            <span>Onay Tarihi</span><b>:</b><em>{data.onayTarihi}</em>
          </div>
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
  const rawPages = useMemo(() => chunkItems(data.items), [data.items]);
  const weightOf = (arr: QuoteViewItem[]) =>
    arr.reduce((s, it) => s + itemVisualWeight(it), 0);
  const lastRaw = rawPages[rawPages.length - 1] ?? [];

  // Weight-based fallback plan. The heuristic over/under-estimates real row
  // heights, so it is only used before the measured pass completes (first paint)
  // and for single-page documents. For multi-page documents, the measured plan
  // below replaces it using the true rendered pixel heights.
  // 1 budget unit ≈ 9mm; footer ≈ 70mm, continuation rows ≈ 219mm → items that
  // can share a page with the footer: continuation (219-70)/9 ≈ 16,
  // first page rows ≈ 165mm → (165-70)/9 ≈ 10
  const fallbackPlan = useMemo<{
    itemPages: QuoteViewItem[][];
    footerOwnItems: QuoteViewItem[] | null;
  }>(() => {
    const attachBudget = rawPages.length > 1 ? 16 : 10;
    let itemPages = rawPages;
    let footerOwnItems: QuoteViewItem[] | null = null; // null => attach under last item page
    if (weightOf(lastRaw) > attachBudget) {
      let start = lastRaw.length - 1;
      if (lastRaw[start]?.itemType === "child") {
        while (start > 0 && lastRaw[start]?.itemType === "child") start--;
      }
      const unit = lastRaw.slice(start);
      if (start > 0 && weightOf(unit) <= 16) {
        itemPages = [...rawPages.slice(0, -1), lastRaw.slice(0, start)];
        footerOwnItems = unit;
      } else {
        footerOwnItems = [];
      }
    }
    return { itemPages, footerOwnItems };
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

  useLayoutEffect(() => {
    setMeasuredPlan(null);
  }, [data]);

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

  const plan = rawPages.length > 1 && measuredPlan ? measuredPlan : fallbackPlan;
  const itemPages = plan.itemPages;
  const footerOwnItems = plan.footerOwnItems;
  const attachToLast = footerOwnItems === null;
  const totalPages = itemPages.length + (attachToLast ? 0 : 1);
  const ready = rawPages.length <= 1 || measuredPlan !== null;

  if (data.items.length === 0) {
    const totalPages0 = 1;
    return (
      <main className="qt-preview">
        <article className="qt-page first with-footer">
          <QuoteTopInfo data={data} />
          <ItemsTable items={[]} pageIndex={0} totalPages={totalPages0} currency={data.paraBirimi} />
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
          return (
            <article
              className={`qt-page ${isFirst ? "first" : "continuation"} ${attachToLast && isLastItemPage ? "with-footer" : ""}`}
              key={index}
            >
              {isFirst ? (
                <QuoteTopInfo data={data} />
              ) : (
                <header className="qt-repeat-header">
                  <img src="/assets/quote/oxymed-logoyesilmavi.webp" alt="Oxymed Medikal" />
                  <strong>Teklif Formu</strong>
                  <span>{data.quoteNo}</span>
                </header>
              )}
              <ItemsTable
                items={items}
                pageIndex={index}
                totalPages={totalPages}
                currency={data.paraBirimi}
              />
              {attachToLast && isLastItemPage ? <FooterBlocks data={data} /> : null}
            </article>
          );
        })}

        {!attachToLast ? (
          <article className="qt-page continuation with-footer qt-footer-page">
            <header className="qt-repeat-header">
              <img src="/assets/quote/oxymed-logoyesilmavi.webp" alt="Oxymed Medikal" />
              <strong>Teklif Formu</strong>
              <span>{data.quoteNo}</span>
            </header>
            {footerOwnItems && footerOwnItems.length > 0 ? (
              <ItemsTable
                items={footerOwnItems}
                pageIndex={itemPages.length}
                totalPages={totalPages}
                currency={data.paraBirimi}
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
              <strong>Teklif Formu</strong>
              <span>{data.quoteNo}</span>
            </header>
            <ItemsTable
              items={lastRaw}
              pageIndex={0}
              totalPages={1}
              currency={data.paraBirimi}
            />
            <FooterBlocks data={data} />
          </article>
        </div>
      ) : null}
    </>
  );
}
