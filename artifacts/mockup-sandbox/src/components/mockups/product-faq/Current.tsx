import { HelpCircle } from "lucide-react";
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

export function Current() {
  return (
    <main className="faq-preview-shell">
      <section className="faq-preview-panel">
        <header className="faq-preview-heading">
          <span className="faq-preview-heading__icon"><HelpCircle /></span>
          <div>
            <h1>S.S.S.</h1>
            <p>Sıkça sorulan sorular</p>
          </div>
        </header>
        <div className="faq-preview-current-list">
          {items.map((item, index) => (
            <details key={item.question} open={index === 0}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}