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

type QuoteItem = {
  no: number;
  title: string;
  bullets: string[];
  code: string;
  quantity: number;
  unit: string;
  unitPrice: string;
  totalPrice: string;
  imageSize: string;
};

const quoteItems: QuoteItem[] = [
  {
    no: 1,
    title: "OXY-DVS Dental Vakum Sistemi",
    bullets: ["Yağsız, sessiz çalışan vakum pompaları", "Otomatik çalışma panosu", "300 L vakum tankı", "Basınç şalteri ve emniyet valfleri", "CE uygunluk"],
    code: "OXM-DVS-300",
    quantity: 1,
    unit: "ADET",
    unitPrice: "4.850 EUR",
    totalPrice: "4.850 EUR",
    imageSize: "190 x 105 px",
  },
  {
    no: 2,
    title: "OXY-MGS Medikal Gaz Santrali",
    bullets: ["Oksijen, Azot ve Hava üretim sistemi", "PSA teknolojisi ile yüksek saflıkta gaz üretimi", "Otomatik kontrol ve izleme sistemi", "CE uygunluk"],
    code: "OXM-MGS-20",
    quantity: 1,
    unit: "ADET",
    unitPrice: "7.900 EUR",
    totalPrice: "7.900 EUR",
    imageSize: "190 x 105 px",
  },
  {
    no: 3,
    title: "Yatak Başı Ünitesi",
    bullets: ["O2, Vakum, Hava çıkışları", "LED aydınlatma", "Çağrı sistemi uyumu", "Alüminyum gövde"],
    code: "OXM-YBU-01",
    quantity: 5,
    unit: "ADET",
    unitPrice: "620 EUR",
    totalPrice: "3.100 EUR",
    imageSize: "190 x 105 px",
  },
  {
    no: 4,
    title: "Pendant Sistemi (Çift Kollu)",
    bullets: ["Motorize hareketli kol sistemi", "Gaz, elektrik ve data çıkışları", "360° döner yapı", "LED çalışma lambası"],
    code: "OXM-PND-02",
    quantity: 2,
    unit: "ADET",
    unitPrice: "2.350 EUR",
    totalPrice: "4.700 EUR",
    imageSize: "190 x 105 px",
  },
  {
    no: 5,
    title: "Medikal Gaz Alarm Paneli",
    bullets: ["Anlık basınç izleme", "Sesli ve görsel alarm", "Modüler sensör girişi", "Kolay servis erişimi"],
    code: "OXM-ALR-06",
    quantity: 3,
    unit: "ADET",
    unitPrice: "410 EUR",
    totalPrice: "1.230 EUR",
    imageSize: "190 x 105 px",
  },
  {
    no: 6,
    title: "Gaz Prizi Seti",
    bullets: ["Oksijen, vakum ve hava uyumlu", "DIN standardına uygun bağlantı", "Paslanmaz iç mekanizma", "Renk kodlu kullanım"],
    code: "OXM-GPS-03",
    quantity: 12,
    unit: "ADET",
    unitPrice: "85 EUR",
    totalPrice: "1.020 EUR",
    imageSize: "190 x 105 px",
  },
  {
    no: 7,
    title: "Medikal Gaz Bakir Boru Tesisati",
    bullets: ["Antibakteriyel temizlenmis bakir boru", "Lehimli baglanti sistemi", "Hat etiketleme ve test raporu", "Montaja hazir sevkiyat"],
    code: "OXM-COP-22",
    quantity: 1,
    unit: "SET",
    unitPrice: "1.680 EUR",
    totalPrice: "1.680 EUR",
    imageSize: "190 x 105 px",
  },
  {
    no: 8,
    title: "Vakum Regulatoru",
    bullets: ["Hassas vakum ayari", "Kolay okunabilir gosterge", "Duvar tipi kullanim", "Medikal standartlara uygun"],
    code: "OXM-VRG-01",
    quantity: 6,
    unit: "ADET",
    unitPrice: "145 EUR",
    totalPrice: "870 EUR",
    imageSize: "190 x 105 px",
  },
];

const services = [
  "Projeye özel teknik keşif ve mühendislik desteği",
  "Montaj ve devreye alma hizmeti",
  "Kullanıcı eğitimi",
  "Garanti kapsamındaki yedek parça ve işçilik",
  "Periyodik bakım ve teknik destek",
  "7/24 teknik destek ve danışmanlık",
];

const terms = [
  "Bu teklif formu 30 gün süreyle geçerlidir.",
  "Fiyatlara KDV dahil değildir.",
  "Teslimat süresi, sipariş onayının ardından belirtilecektir.",
  "Ödeme, belirtilen vade ve koşullarda yapılacaktır.",
  "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.",
  "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır.",
];

const trustItems = [
  { icon: ShieldCheck, title: "Yerli Üretim", text: "Yerli Üretim Güçlü Altyapı" },
  { icon: BadgeCheck, title: "Kalite Güvencesi", text: "Yüksek Kalite Sertifikalı Ürünler" },
  { icon: Headphones, title: "7/24 Teknik Destek", text: "Kesintisiz Destek Hızlı Çözüm" },
  { icon: Users, title: "Müşteri Odaklı", text: "Güvenilir Hizmet Uzun Vadeli Çözümler" },
];

function chunkItems(items: QuoteItem[], firstPageCount = 6, nextPageCount = 5) {
  const pages: QuoteItem[][] = [];
  let cursor = 0;
  pages.push(items.slice(cursor, cursor + firstPageCount));
  cursor += firstPageCount;

  while (cursor < items.length) {
    pages.push(items.slice(cursor, cursor + nextPageCount));
    cursor += nextPageCount;
  }

  return pages;
}

function ProductImageSlot({ size }: { size: string }) {
  return (
    <div className="qt-product-image-slot">
      <span>Ürün görseli</span>
      <strong>{size}</strong>
      <small>WEBP</small>
    </div>
  );
}

function QuoteTopInfo() {
  const companyInfo = [
    ["Kurum / Firma Adı", "Ankara Şehir Hastanesi"],
    ["Adres", "Bilkent Mah. Üniversiteler Cad. No: 1 Çankaya / Ankara"],
    ["Telefon", "0(312) 552 60 00"],
    ["E-posta", "satinalma@ankarahastane.gov.tr"],
    ["Vergi Dairesi", "Çankaya"],
    ["Vergi No", "062 145 7890"],
  ];

  const deliveryInfo = [
    ["Teslimat Adresi", "Ankara Şehir Hastanesi Teknik Depo"],
    ["Teslimat Süresi", "Sipariş onayından sonra 21 iş günü"],
    ["Ödeme Şekli", "%40 sipariş, %60 teslimat öncesi"],
  ];

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
            <span>OXM-TFL-2026-00001</span>
          </div>
          <dl>
            <div>
              <dt><CalendarDays size={15} /> Teklif Tarihi</dt>
              <dd>19.05.2026</dd>
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
            <p><span>Para Birimi</span><b>:</b><strong>EUR</strong></p>
            <label>
              <span>Teklif Notu</span>
              <i>Teklif fiyatları proje keşfi sonrası netleştirilecek olup ürün görselleri temsilidir.</i>
              <i>Montaj, devreye alma ve kullanıcı eğitimi teklif kapsamına dahildir.</i>
              <i>Sevkiyat planı sipariş onayı sonrasında müşteri ile paylaşılacaktır.</i>
            </label>
          </div>
        </article>
      </div>
    </section>
  );
}

function ItemsTable({ items, pageIndex, totalPages }: { items: QuoteItem[]; pageIndex: number; totalPages: number }) {
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
          {items.map((item) => (
            <tr key={item.no}>
              <td className="qt-no">{item.no}</td>
              <td className="qt-description">
                <strong>{item.title}</strong>
                <ul>
                  {item.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </td>
              <td className="qt-code">{item.code}</td>
              <td className="qt-image-cell"><ProductImageSlot size={item.imageSize} /></td>
              <td>{item.quantity}</td>
              <td>{item.unit}</td>
              <td>{item.unitPrice}</td>
              <td>{item.totalPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="qt-table-note">
        <span><Info size={13} /> Ürün görselleri temsilidir. Teknik özelliklerde değişiklik yapma hakkımız saklıdır.</span>
        <b>Sayfa {pageIndex + 1} / {totalPages}</b>
      </div>
    </section>
  );
}

function FooterBlocks() {
  return (
    <section className="qt-footer-blocks">
      <div className="qt-summary-row">
        <article>
          <h2>Teklif Kapsamına Dahil Olan Hizmetler</h2>
          <ul className="qt-check-list">
            {services.map((item) => (
              <li key={item}><CheckCircle2 size={14} /> {item}</li>
            ))}
          </ul>
        </article>

        <article>
          <h2>Genel Şartlar</h2>
          <ul className="qt-dot-list">
            {terms.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="qt-total-box">
          <h2>Toplam</h2>
          <dl>
            <div><dt>Ara Toplam</dt><dd>25.350 EUR</dd></div>
            <div><dt>İskonto</dt><dd>1.350 EUR</dd></div>
            <div><dt>KDV (%)</dt><dd>4.800 EUR</dd></div>
            <div className="grand"><dt>Genel Toplam</dt><dd>28.800 EUR</dd></div>
          </dl>
        </article>
      </div>

      <article className="qt-notes filled">
        <h2>Açıklamalar / Notlar</h2>
        <p>
          Bu teklif, medikal gaz sistemleri kapsamında belirtilen ürünlerin temini, montaj hazırlığı ve teknik destek süreçleri için hazırlanmıştır.
          Nihai ölçülendirme saha keşfi ve proje onayı sonrasında kesinleştirilecektir.
        </p>
      </article>

      <div className="qt-sign-row">
        <article>
          <h2>Teklifi Hazırlayan</h2>
          <div className="qt-sign-grid">
            <span>Ad Soyad</span><b>:</b><em>Ahmet Yılmaz</em>
            <span>Telefon</span><b>:</b><em>0(312) 385 49 12</em>
            <span>E-posta</span><b>:</b><em>ahmet.yilmaz@oxymedmedical.com</em>
          </div>
          <strong>İmza / Kaşe</strong>
          <div className="qt-signature-image-slot">
            <span>WEBP imza / kaşe görsel alanı</span>
            <small>150 x 45 px</small>
          </div>
          <img className="qt-sign-watermark" src="/assets/brand/oxymed-logo.webp" alt="" aria-hidden="true" />
        </article>

        <article>
          <h2>Teklifi Onaylayan</h2>
          <div className="qt-sign-grid">
            <span>Ad Soyad</span><b>:</b><em>Mehmet Kaya</em>
            <span>Görev</span><b>:</b><em>Proje Müdürü</em>
            <span>Onay Tarihi</span><b>:</b><em>20.05.2026</em>
          </div>
          <strong>İmza / Kaşe</strong>
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

export default function QuoteTemplatePage() {
  const itemPages = chunkItems(quoteItems);
  const lastItemPage = itemPages[itemPages.length - 1] ?? [];
  const canAttachFooter = itemPages.length > 1 ? lastItemPage.length <= 4 : lastItemPage.length <= 2;
  const totalPages = itemPages.length + (canAttachFooter ? 0 : 1);

  return (
    <main className="qt-preview">
      {itemPages.map((items, index) => {
        const isFirst = index === 0;
        const isLastItemPage = index === itemPages.length - 1;

        return (
          <article className={`qt-page ${isFirst ? "first" : "continuation"} ${canAttachFooter && isLastItemPage ? "with-footer" : ""}`} key={index}>
            {isFirst ? (
              <QuoteTopInfo />
            ) : (
              <header className="qt-repeat-header">
                <img src="/assets/quote/oxymed-logoyesilmavi.webp" alt="Oxymed Medikal" />
                <strong>Teklif Formu</strong>
                <span>OXM-TFL-2026-00001</span>
              </header>
            )}

            <ItemsTable items={items} pageIndex={index} totalPages={totalPages} />
            {canAttachFooter && isLastItemPage ? <FooterBlocks /> : null}
          </article>
        );
      })}

      {!canAttachFooter ? (
        <article className="qt-page qt-footer-page">
          <FooterBlocks />
        </article>
      ) : null}
    </main>
  );
}
