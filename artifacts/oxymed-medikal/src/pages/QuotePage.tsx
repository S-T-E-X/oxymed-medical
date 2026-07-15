import { useState } from "react";
import { ArrowRight, CheckCircle, Clock3, Headphones, Lock, Paperclip, ShieldCheck } from "lucide-react";
import { useCreateQuote } from "@workspace/api-client-react";
import ImageSlot from "../components/common/ImageSlot";
import { trackInteraction } from "../components/common/VisitorTracker";
import FeatureBar from "../components/home/FeatureBar";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import { applicationAreas, cities, projectTypes, quoteBenefits } from "../data/quote";

const benefitIconMap = {
  clock: Clock3,
  shield: ShieldCheck,
  support: Headphones
};

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  projectType: string;
  city: string;
  applicationArea: string;
  notes: string;
};

type FieldErrors = {
  fullName?: string;
  email?: string;
  phone?: string;
};

const EMPTY: FormState = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  jobTitle: "",
  projectType: "",
  city: "",
  applicationArea: "",
  notes: "",
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
    <section className="relative isolate overflow-hidden border-t border-steel-100 bg-steel-50">
      <ImageSlot
        tone="line"
        image="/assets/images/quote-medical-room.png"
        alt="Yatak başı ünitesi ve pendant sistemi bulunan hasta odası"
        className="absolute inset-y-0 left-0 hidden w-[58%] object-cover object-[60%_center] lg:block"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 from-[0%] via-white/55 via-[30%] to-white/15" />
      <div className="absolute inset-y-0 right-0 hidden w-[44%] bg-white/92 backdrop-blur-[2px] lg:block" />

      <div className="relative mx-auto grid max-w-[1312px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[540px_minmax(0,1fr)] lg:gap-14 lg:px-0 lg:py-12">
        <aside className="flex flex-col justify-center pt-2 lg:pt-4 lg:pb-4">
          <h1 className="text-[38px] font-extrabold leading-none tracking-tight text-oxynavy-950 sm:text-[46px]">
            TEKLİF AL
          </h1>
          <div className="mt-5 h-[2px] w-14 bg-oxynavy-950" />
          <p className="mt-6 max-w-[360px] text-[15px] leading-7 text-oxynavy-950/80">
            İhtiyacınıza en uygun çözümler için size özel teklifimizi hazırlayalım.
          </p>

          <div className="mt-10 space-y-8">
            {quoteBenefits.map((benefit) => {
              const Icon = benefitIconMap[benefit.icon as keyof typeof benefitIconMap];
              return (
                <article key={benefit.title} className="flex max-w-[400px] items-start gap-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-oxynavy-950 text-white shadow-[0_14px_35px_rgba(2,20,35,0.14)]">
                    <Icon className="h-5 w-5 stroke-[1.5]" aria-hidden="true" />
                  </span>
                  <div className="pt-1">
                    <h2 className="text-[13px] font-extrabold text-oxynavy-950">{benefit.title}</h2>
                    <p className="mt-1.5 text-[13px] leading-5.5 text-oxynavy-950/72">{benefit.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </aside>

        <div className="flex min-w-0 items-end mt-16 lg:mt-0">
          <div className="min-w-0 flex-1 relative">
            <div className="quote-manhead-mobile">
              <img
                src="/assets/brand/oxymedmanhead.webp"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute -top-[101px] right-3 h-28 w-auto select-none object-contain"
              />
            </div>
            <QuoteForm />
          </div>
          <div className="hidden shrink-0 items-end self-end lg:flex" style={{ height: 500 }}>
            <img
              src="/assets/brand/oxymedman.webp"
              alt=""
              aria-hidden="true"
              className="pointer-events-none h-full w-auto select-none object-contain object-bottom"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function QuoteForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState("");

  const createMut = useCreateQuote({
    mutation: {
      onSuccess: () => {
        trackInteraction("Teklif Formu Gönderildi");
        setSubmitted(true);
        setForm(EMPTY);
        setFieldErrors({});
      },
      onError: () => {
        setApiError("Teklif gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
      },
    },
  });

  function set(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (field in fieldErrors) {
      setFieldErrors((e) => ({ ...e, [field]: undefined }));
    }
    setApiError("");
  }

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (!form.fullName.trim()) errors.fullName = "Ad Soyad zorunludur.";
    if (!form.email.trim()) {
      errors.email = "E-posta zorunludur.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Geçerli bir e-posta adresi giriniz.";
    }
    if (!form.phone.trim()) errors.phone = "Telefon numarası zorunludur.";
    return errors;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    createMut.mutate({
      data: {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        company: form.company || undefined,
        jobTitle: form.jobTitle || undefined,
        projectType: form.projectType || undefined,
        city: form.city || undefined,
        applicationArea: form.applicationArea || undefined,
        notes: form.notes || undefined,
      },
    });
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-steel-100 bg-white px-8 py-16 shadow-[0_24px_56px_rgba(2,20,35,0.10)]">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-emerald-500" />
          <h2 className="mt-5 text-2xl font-extrabold text-oxynavy-950">Talebiniz Alındı!</h2>
          <p className="mt-3 max-w-[320px] text-sm leading-6 text-steel-600">
            Teklif talebiniz başarıyla iletildi. En kısa sürede uzman ekibimiz sizinle iletişime geçecektir.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-oxynavy-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-oxynavy-800"
          >
            Yeni Teklif Talebi
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="relative rounded-2xl border border-steel-100 bg-white px-4 py-6 shadow-[0_24px_56px_rgba(2,20,35,0.10)] sm:px-8 sm:py-8"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="border-b border-steel-100 pb-5">
        <h2 className="text-[22px] font-extrabold leading-tight text-oxynavy-950">Teklif Talep Formu</h2>
        <p className="mt-1.5 text-[13px] text-steel-600">Aşağıdaki formu doldurarak talebinizi bize iletebilirsiniz.</p>
      </div>

      <div className="mt-6 grid gap-x-5 gap-y-4 md:grid-cols-3">
        <Field
          label="Ad Soyad *"
          placeholder="Adınız ve soyadınız"
          value={form.fullName}
          onChange={(v) => set("fullName", v)}
          error={fieldErrors.fullName}
        />
        <Field
          label="E-posta *"
          placeholder="ornek@mail.com"
          type="email"
          value={form.email}
          onChange={(v) => set("email", v)}
          error={fieldErrors.email}
        />
        <Field
          label="Telefon *"
          placeholder="5XX XXX XX XX"
          type="tel"
          value={form.phone}
          onChange={(v) => set("phone", v)}
          error={fieldErrors.phone}
        />
      </div>

      <div className="mt-4 grid gap-x-5 gap-y-4 md:grid-cols-2">
        <Field label="Firma / Kurum" placeholder="Firma veya kurum adı" value={form.company} onChange={(v) => set("company", v)} />
        <Field label="Görev / Unvan" placeholder="Göreviniz veya unvanınız" value={form.jobTitle} onChange={(v) => set("jobTitle", v)} />
      </div>

      <div className="mt-4 grid gap-x-5 gap-y-4 md:grid-cols-3">
        <SelectField label="Proje Türü" options={projectTypes} value={form.projectType} onChange={(v) => set("projectType", v)} />
        <SelectField label="İl / İlçe" options={cities} value={form.city} onChange={(v) => set("city", v)} />
        <SelectField label="Uygulama Alanı" options={applicationAreas} value={form.applicationArea} onChange={(v) => set("applicationArea", v)} />
      </div>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-[12px] font-semibold text-oxynavy-950">Talep ve Notlarınız</span>
        <textarea
          rows={3}
          placeholder="Projeniz hakkında bilgi veriniz..."
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          className="w-full resize-none rounded-lg border border-steel-200 bg-white px-3.5 py-3 text-[13px] text-oxynavy-950 outline-none transition placeholder:text-steel-400 focus:border-oxynavy-500 focus:ring-4 focus:ring-oxynavy-100"
        />
      </label>

      {apiError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[12px] font-semibold text-red-700">
          {apiError}
        </div>
      )}

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-semibold text-oxynavy-950">Dosya Yükleyin (Opsiyonel)</span>
          <span className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-steel-200 bg-steel-50/60 px-4 text-[12px] text-steel-600 transition hover:border-oxynavy-400 hover:bg-oxynavy-50">
            <Paperclip className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Dosya seçin veya sürükleyin
            <input className="sr-only" type="file" accept=".pdf,.dwg,.jpg,.jpeg,.png" />
          </span>
          <span className="mt-1.5 block text-center text-[11px] text-steel-400">PDF, DWG, JPG, PNG (Maks. 100MB)</span>
        </label>

        <button
          type="submit"
          disabled={createMut.isPending}
          className="inline-flex h-11 items-center justify-center gap-2.5 rounded-lg bg-oxynavy-950 px-7 text-[13px] font-extrabold text-white transition hover:bg-oxynavy-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {createMut.isPending ? "GÖNDERİLİYOR…" : "TEKLİF TALEP ET"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <p className="mt-5 flex items-center gap-2 text-[12px] text-steel-500">
        <Lock className="h-3.5 w-3.5 shrink-0 text-steel-400" aria-hidden="true" />
        Gönderdiğiniz bilgiler güvenle saklanır ve üçüncü taraflarla paylaşılmaz.
      </p>
    </form>
  );
}

type FieldProps = {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

function Field({ label, placeholder, type = "text", value, onChange, error }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold text-oxynavy-950">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-9 w-full rounded-lg border bg-white px-3.5 text-[13px] text-oxynavy-950 outline-none transition placeholder:text-steel-400 focus:ring-4 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
            : "border-steel-200 focus:border-oxynavy-500 focus:ring-oxynavy-100"
        }`}
      />
      {error && <p className="mt-1 text-[11px] font-semibold text-red-600">{error}</p>}
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

function SelectField({ label, options, value, onChange }: SelectFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold text-oxynavy-950">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-lg border border-steel-200 bg-white px-3.5 text-[13px] text-steel-700 outline-none transition focus:border-oxynavy-500 focus:ring-4 focus:ring-oxynavy-100"
      >
        <option value="">Seçiniz</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
