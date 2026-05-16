import { ArrowRight, Clock3, Headphones, Lock, Paperclip, ShieldCheck } from "lucide-react";
import ImageSlot from "../components/common/ImageSlot";
import FeatureBar from "../components/home/FeatureBar";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import { applicationAreas, cities, projectTypes, quoteBenefits } from "../data/quote";

const benefitIconMap = {
  clock: Clock3,
  shield: ShieldCheck,
  support: Headphones
};

export default function QuotePage() {
  return (
    <div className="min-h-screen bg-white text-oxynavy-950">
      <Header />
      <main>
        <QuoteRequestSection />
        <FeatureBar variant="light" compact />
      </main>
      <Footer compact />
    </div>
  );
}

function QuoteRequestSection() {
  return (
    <section className="relative isolate overflow-hidden border-t border-steel-100 bg-steel-50 lg:h-[520px]">
      <ImageSlot
        tone="line"
        image="/assets/images/quote-medical-room.png"
        alt="Yatak başı ünitesi ve pendant sistemi bulunan hasta odası"
        className="absolute inset-y-0 left-0 hidden w-[58%] object-cover object-[60%_center] opacity-[0.86] lg:block"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white from-[0%] via-white/88 via-[28%] to-white/42" />
      <div className="absolute inset-y-0 right-0 hidden w-[45%] bg-white/78 lg:block" />

      <div className="relative mx-auto grid h-full max-w-[1312px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[572px_minmax(0,1fr)] lg:gap-12 lg:px-0 lg:py-5">
        <aside className="pt-2 lg:pt-10">
          <h1 className="text-[36px] font-extrabold leading-none tracking-tight text-oxynavy-950 sm:text-[42px]">
            TEKLİF AL
          </h1>
          <div className="mt-5 h-[2px] w-14 bg-oxynavy-950" />
          <p className="mt-6 max-w-[340px] text-base leading-7 text-oxynavy-950/84">
            İhtiyacınıza en uygun çözümler için size özel teklifimizi hazırlayalım.
          </p>

          <div className="mt-10 space-y-7">
            {quoteBenefits.map((benefit) => {
              const Icon = benefitIconMap[benefit.icon as keyof typeof benefitIconMap];
              return (
                <article key={benefit.title} className="flex max-w-[420px] items-start gap-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-oxynavy-950 text-white shadow-[0_14px_35px_rgba(2,20,35,0.08)]">
                    <Icon className="h-5 w-5 stroke-[1.5]" aria-hidden="true" />
                  </span>
                  <div className="pt-1">
                    <h2 className="text-[13px] font-extrabold text-oxynavy-950">{benefit.title}</h2>
                    <p className="mt-1.5 text-[12px] leading-5 text-oxynavy-950/78">{benefit.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </aside>

        <QuoteForm />
      </div>
    </section>
  );
}

function QuoteForm() {
  return (
    <form
      className="rounded-lg border border-steel-100 bg-white px-8 py-5 shadow-[0_20px_45px_rgba(2,20,35,0.12)]"
      onSubmit={(event) => event.preventDefault()}
    >
      <div>
        <h2 className="text-[22px] font-extrabold leading-tight text-oxynavy-950">Teklif Talep Formu</h2>
        <p className="mt-1.5 text-[12px] text-steel-700">Aşağıdaki formu doldurarak talebinizi bize iletebilirsiniz.</p>
      </div>

      <div className="mt-6 grid gap-x-5 gap-y-3 md:grid-cols-3">
        <Field label="Ad Soyad *" placeholder="Adınız ve soyadınız" />
        <Field label="E-posta *" placeholder="ornek@mail.com" type="email" />
        <Field label="Telefon *" placeholder="5XX XXX XX XX" type="tel" />
      </div>

      <div className="mt-3 grid gap-x-5 gap-y-3 md:grid-cols-2">
        <Field label="Firma / Kurum" placeholder="Firma veya kurum adı" />
        <Field label="Görev / Unvan" placeholder="Göreviniz veya unvanınız" />
      </div>

      <div className="mt-3 grid gap-x-5 gap-y-3 md:grid-cols-3">
        <SelectField label="Proje Türü *" options={projectTypes} />
        <SelectField label="İl / İlçe *" options={cities} />
        <SelectField label="Uygulama Alanı *" options={applicationAreas} />
      </div>

      <label className="mt-3 block">
        <span className="mb-1.5 block text-[12px] font-semibold text-oxynavy-950">Talep ve Notlarınız</span>
        <textarea
          rows={2}
          placeholder="Projeniz hakkında bilgi veriniz..."
          className="h-[54px] w-full resize-none rounded border border-steel-200 bg-white px-3.5 py-2.5 text-[12px] text-oxynavy-950 outline-none transition placeholder:text-steel-500 focus:border-oxynavy-500 focus:ring-4 focus:ring-oxynavy-100"
        />
      </label>

      <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_0.78fr] lg:items-end">
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-semibold text-oxynavy-950">Dosya Yükleyin (Opsiyonel)</span>
          <span className="flex h-[42px] cursor-pointer items-center justify-center rounded border border-dashed border-steel-200 bg-white px-4 text-center text-[12px] text-steel-700 transition hover:border-oxynavy-400 hover:bg-oxynavy-50">
            <Paperclip className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
            Dosya seçin veya sürükleyin
            <input className="sr-only" type="file" />
          </span>
          <span className="mt-1 block text-center text-[10px] text-steel-500">PDF, DWG, JPG, PNG (Maks. 10MB)</span>
        </label>

        <button
          type="submit"
          className="inline-flex h-[58px] items-center justify-center gap-3 rounded bg-oxynavy-950 px-8 text-[13px] font-extrabold text-white transition hover:bg-oxynavy-800"
        >
          TEKLİF TALEP ET
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <p className="mt-4 flex items-center gap-2 text-[12px] text-steel-700">
        <Lock className="h-4 w-4 shrink-0 text-steel-500" aria-hidden="true" />
        Gönderdiğiniz bilgiler güvenle saklanır ve üçüncü taraflarla paylaşılmaz.
      </p>
    </form>
  );
}

type FieldProps = {
  label: string;
  placeholder: string;
  type?: string;
};

function Field({ label, placeholder, type = "text" }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold text-oxynavy-950">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="h-8 w-full rounded border border-steel-200 bg-white px-3.5 text-[12px] text-oxynavy-950 outline-none transition placeholder:text-steel-500 focus:border-oxynavy-500 focus:ring-4 focus:ring-oxynavy-100"
      />
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  options: string[];
};

function SelectField({ label, options }: SelectFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold text-oxynavy-950">{label}</span>
      <select className="h-8 w-full rounded border border-steel-200 bg-white px-3.5 text-[12px] text-steel-700 outline-none transition focus:border-oxynavy-500 focus:ring-4 focus:ring-oxynavy-100">
        <option>Seçiniz</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
