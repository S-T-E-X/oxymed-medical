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

function chunkItems<T>(items: T[], firstPageCount = 6, nextPageCount = 5): T[][] {
  const pages: T[][] = [];
  let cursor = 0;
  pages.push(items.slice(cursor, cursor + firstPageCount));
  cursor += firstPageCount;
  while (cursor < items.length) {
    pages.push(items.slice(cursor, cursor + nextPageCount));
    cursor += nextPageCount;
  }
  return pages;
}

function ProductImageCell({ imageUrl, title }: { imageUrl?: string | null; title: string }) {
  if (imageUrl) {
    return (
      <div className="qt-product-image-slot" style={{ background: "none", border: "none" }}>
        <img
          src={imageUrl}
          alt={title}
          style={{ width: "100%", height: "100px", objectFit: "contain" }}
        />
      </div>
    );
  }
  return (
    <div className="qt-product-image-slot">
      <span>Ürün görseli</span>
      <strong>190 x 105 px</strong>
      <small>WEBP</small>
    </div>
  );
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
            <th>Ürün / Hizmet Açıklaması</th>
            <th>Model / Kod</th>
            <th>Ürün Görseli</th>
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
                  <td className="qt-description" colSpan={2}>
                    <strong style={{ textTransform: "uppercase", letterSpacing: "0.03em" }}>{item.title}</strong>
                  </td>
                  <td className="qt-image-cell">
                    {item.imageUrl ? (
                      <div className="qt-product-image-slot" style={{ background: "none", border: "none" }}>
                        <img src={item.imageUrl} alt={item.title} style={{ width: "100%", height: "100px", objectFit: "contain" }} />
                      </div>
                    ) : null}
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              );
            }

            const isChild = item.itemType === "child";
            const total = item.quantity * item.unitPrice;
            return (
              <tr key={item.no} className={isChild ? "qt-child-row" : ""}>
                <td className="qt-no">{item.no}</td>
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
                <td className="qt-code">{item.code}</td>
                <td className="qt-image-cell">
                  {isChild && !item.imageUrl ? null : (
                    <ProductImageCell imageUrl={item.imageUrl} title={item.title} />
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
            {data.kdv > 0 && (
              <div><dt>KDV (%{data.kdv})</dt><dd>{fmtPrice(kdvAmount, cur)}</dd></div>
            )}
            <div className="grand"><dt>Genel Toplam</dt><dd>{fmtPrice(genelTopam, cur)}</dd></div>
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
              <div className="qt-signature-image-slot" style={{ background: "none", border: "none", padding: 0 }}>
                <img
                  src={data.hazirlayanImzaUrl}
                  alt="İmza / Kaşe"
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
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
  const itemPages = chunkItems(data.items);
  const lastItemPage = itemPages[itemPages.length - 1] ?? [];
  const canAttachFooter = itemPages.length > 1 ? lastItemPage.length <= 4 : lastItemPage.length <= 2;
  const totalPages = itemPages.length + (canAttachFooter ? 0 : 1);

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
    <main className="qt-preview">
      {itemPages.map((items, index) => {
        const isFirst = index === 0;
        const isLastItemPage = index === itemPages.length - 1;
        return (
          <article
            className={`qt-page ${isFirst ? "first" : "continuation"} ${canAttachFooter && isLastItemPage ? "with-footer" : ""}`}
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
            {canAttachFooter && isLastItemPage ? <FooterBlocks data={data} /> : null}
          </article>
        );
      })}

      {!canAttachFooter ? (
        <article className="qt-page qt-footer-page">
          <FooterBlocks data={data} />
        </article>
      ) : null}
    </main>
  );
}
