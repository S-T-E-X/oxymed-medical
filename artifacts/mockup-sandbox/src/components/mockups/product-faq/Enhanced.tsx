import { useId, useState } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";
import "./_group.css";

const items = [
  {
    question: "Bu ürün hangi klinik ve hastane alanlarında kullanılabilir?",
    answer: "Ürün, klinikler, ameliyathaneler, laboratuvarlar ve merkezi medikal gaz altyapısına sahip sağlık tesisleri için tasarlanmıştır.",
  },
  {
    question: "Kurulum ve devreye alma hizmeti sağlıyor musunuz?",
    answer: "Proje ihtiyaçlarına göre keşif, montaj, test, devreye alma ve kullanıcı eğitimi adımlarını birlikte planlayabiliyoruz.",
  },
  {
    question: "Teknik özellikleri projeye göre değiştirilebilir mi?",
    answer: "Debi, bağlantı tipi, kapasite ve kullanılan ekipmanlar proje gereksinimlerine göre birlikte netleştirilebilir.",
  },
  {
    question: "Garanti ve servis desteği nasıl ilerliyor?",
    answer: "Garanti kapsamı ürün ve proje şartlarına göre belirlenir. Satış sonrası servis ekibimiz bakım ve teknik destek sunar.",
  },
];

export function Enhanced() {
  const idPrefix = useId().replace(/:/g, "");
  const [open, setOpen] = useState(0);

  return (
    <main className="faq-preview-shell faq-preview-shell--enhanced">
      <section className="faq-preview-panel faq-preview-panel--enhanced">
        <div className="faq-enhanced-intro">
          <div className="faq-enhanced-intro__eyebrow"><Sparkles /> ÜRÜN BİLGİ BANKASI</div>
          <div className="faq-enhanced-intro__heading">
            <div className="faq-preview-heading__icon"><HelpCircle /></div>
            <h1>S.S.S.</h1>
          </div>
          <p>İhtiyacınız olan cevabı hızlıca bulun. Her soru, ürünün kurulumu ve kullanımı hakkında net bir başlangıç sunar.</p>
          <div className="faq-enhanced-intro__meta">
            <span><strong>{String(items.length).padStart(2, "0")}</strong> soru</span>
            <span className="faq-enhanced-intro__dot" />
            <span>Teknik destek ekibimiz yanınızda</span>
          </div>
        </div>

        <div className="faq-enhanced-list">
          {items.map((item, index) => {
            const isOpen = open === index;
            const triggerId = `${idPrefix}-trigger-${index}`;
            const panelId = `${idPrefix}-panel-${index}`;
            return (
              <article className={`faq-enhanced-item${isOpen ? " is-open" : ""}`} key={item.question}>
                <button
                  aria-controls={panelId}
                  aria-expanded={isOpen}
                  aria-labelledby={triggerId}
                  className="faq-enhanced-trigger"
                  onClick={() => setOpen(isOpen ? -1 : index)}
                  type="button"
                >
                  <span className="faq-enhanced-number">0{index + 1}</span>
                  <span className="faq-enhanced-question" id={triggerId}>{item.question}</span>
                  <span className="faq-enhanced-icon" aria-hidden="true"><ChevronDown /></span>
                </button>
                <div className="faq-enhanced-panel" id={panelId} role="region" aria-labelledby={triggerId}>
                  <div><p>{item.answer}</p></div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <style>{`
        .faq-preview-shell--enhanced {
          background:
            radial-gradient(circle at 13% 0%, rgba(44,127,215,.12), transparent 31%),
            #f5f8fc;
        }
        .faq-preview-panel--enhanced {
          display: grid;
          grid-template-columns: minmax(190px, .72fr) minmax(0, 1.55fr);
          gap: 42px;
          padding: 34px;
          border-radius: 20px;
          box-shadow: 0 22px 55px rgba(8,38,83,.1);
        }
        .faq-enhanced-intro {
          align-self: start;
          position: sticky;
          top: 24px;
          padding: 4px 0;
        }
        .faq-enhanced-intro__eyebrow {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #2c7fd7;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .14em;
        }
        .faq-enhanced-intro__eyebrow svg {
          width: 14px;
          height: 14px;
        }
        .faq-enhanced-intro__heading {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-top: 22px;
        }
        .faq-enhanced-intro h1 {
          margin: 0;
          color: #082653;
          font-size: 36px;
          font-weight: 900;
          letter-spacing: -.06em;
        }
        .faq-enhanced-intro > p {
          max-width: 250px;
          margin: 18px 0 0;
          color: #657890;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.7;
        }
        .faq-enhanced-intro__meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 9px;
          margin-top: 25px;
          color: #657890;
          font-size: 10px;
          font-weight: 700;
          line-height: 1.4;
        }
        .faq-enhanced-intro__meta strong {
          color: #082653;
          font-size: 18px;
          font-weight: 900;
        }
        .faq-enhanced-intro__dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #c98943;
        }
        .faq-enhanced-list {
          display: grid;
          gap: 12px;
        }
        .faq-enhanced-item {
          position: relative;
          overflow: hidden;
          border: 1px solid #dbe5f0;
          border-radius: 15px;
          background: linear-gradient(135deg, #fff, #fafdff);
          box-shadow: 0 8px 22px rgba(8,38,83,.035);
          animation: faq-enhanced-rise .55s cubic-bezier(.2,.75,.25,1) both;
          animation-delay: calc(var(--faq-index, 0) * 60ms);
          transition: border-color .22s ease, box-shadow .22s ease, transform .22s ease;
        }
        .faq-enhanced-item:nth-child(1) { --faq-index: 0; }
        .faq-enhanced-item:nth-child(2) { --faq-index: 1; }
        .faq-enhanced-item:nth-child(3) { --faq-index: 2; }
        .faq-enhanced-item:nth-child(4) { --faq-index: 3; }
        .faq-enhanced-item::before {
          position: absolute;
          inset: 13px auto 13px 0;
          width: 3px;
          border-radius: 0 99px 99px 0;
          background: #2c7fd7;
          content: "";
          opacity: 0;
          transform: scaleY(.3);
          transition: opacity .22s ease, transform .32s cubic-bezier(.2,.8,.2,1);
        }
        .faq-enhanced-item:hover,
        .faq-enhanced-item.is-open {
          border-color: rgba(44,127,215,.48);
          box-shadow: 0 16px 32px rgba(8,38,83,.085);
          transform: translateY(-2px);
        }
        .faq-enhanced-item.is-open::before {
          opacity: 1;
          transform: scaleY(1);
        }
        .faq-enhanced-trigger {
          display: grid;
          grid-template-columns: 38px minmax(0,1fr) 34px;
          align-items: center;
          width: 100%;
          min-height: 78px;
          gap: 14px;
          padding: 14px 18px;
          border: 0;
          background: transparent;
          color: #082653;
          text-align: left;
          cursor: pointer;
        }
        .faq-enhanced-trigger:focus-visible {
          outline: 3px solid rgba(44,127,215,.3);
          outline-offset: -3px;
        }
        .faq-enhanced-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border: 1px solid rgba(44,127,215,.28);
          border-radius: 50%;
          color: #2c7fd7;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .08em;
          transition: color .22s ease, background-color .22s ease;
        }
        .faq-enhanced-item.is-open .faq-enhanced-number {
          background: #2c7fd7;
          color: #fff;
        }
        .faq-enhanced-question {
          font-size: 13px;
          font-weight: 900;
          line-height: 1.45;
        }
        .faq-enhanced-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(44,127,215,.1);
          color: #2c7fd7;
          transition: color .22s ease, background-color .22s ease, transform .32s cubic-bezier(.2,.8,.2,1);
        }
        .faq-enhanced-icon svg {
          width: 17px;
          height: 17px;
        }
        .faq-enhanced-item.is-open .faq-enhanced-icon {
          background: #2c7fd7;
          color: #fff;
          transform: rotate(180deg);
        }
        .faq-enhanced-panel {
          display: grid;
          grid-template-rows: 0fr;
          opacity: 0;
          transition: grid-template-rows .42s cubic-bezier(.2,.8,.2,1), opacity .22s ease;
        }
        .faq-enhanced-item.is-open .faq-enhanced-panel {
          grid-template-rows: 1fr;
          opacity: 1;
        }
        .faq-enhanced-panel > div {
          min-height: 0;
          overflow: hidden;
          padding: 0 18px 0 70px;
          transform: translateY(-7px);
          transition: padding .42s cubic-bezier(.2,.8,.2,1), transform .42s cubic-bezier(.2,.8,.2,1);
        }
        .faq-enhanced-item.is-open .faq-enhanced-panel > div {
          padding-bottom: 23px;
          transform: translateY(0);
        }
        .faq-enhanced-panel p {
          margin: 0;
          color: #344960;
          font-size: 12px;
          font-weight: 600;
          line-height: 1.65;
        }
        @keyframes faq-enhanced-rise {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 760px) {
          .faq-preview-panel--enhanced {
            display: block;
            padding: 20px 15px;
          }
          .faq-enhanced-intro {
            position: static;
            margin-bottom: 24px;
          }
          .faq-enhanced-intro > p {
            max-width: 460px;
          }
          .faq-enhanced-trigger {
            grid-template-columns: 31px minmax(0,1fr) 31px;
            min-height: 70px;
            gap: 10px;
            padding: 12px 13px;
          }
          .faq-enhanced-number,
          .faq-enhanced-icon {
            width: 29px;
            height: 29px;
          }
          .faq-enhanced-question {
            font-size: 12px;
          }
          .faq-enhanced-panel > div {
            padding-right: 13px;
            padding-left: 53px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .faq-enhanced-item,
          .faq-enhanced-item::before,
          .faq-enhanced-number,
          .faq-enhanced-icon,
          .faq-enhanced-panel,
          .faq-enhanced-panel > div {
            animation: none;
            transition: none;
          }
        }
      `}</style>
    </main>
  );
}