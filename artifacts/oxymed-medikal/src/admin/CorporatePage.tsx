import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListCorporateSectionsQueryKey,
  useListCorporateSections,
  useUpsertCorporateSection,
} from "@workspace/api-client-react";
import { toast } from "sonner";
import { Save } from "lucide-react";

const SECTION_LABELS: Record<string, string> = {
  about: "Hakkımızda",
  mission: "Misyon",
  vision: "Vizyon",
  values: "Değerlerimiz",
  history: "Tarihçemiz",
  team: "Ekibimiz",
};

type SectionForm = {
  title: string;
  subtitle: string;
  content: string;
};

function SectionCard({ sectionKey, initialData }: { sectionKey: string; initialData: SectionForm }) {
  const [form, setForm] = useState<SectionForm>(initialData);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setForm(initialData);
    setDirty(false);
  }, [initialData.title, initialData.subtitle, initialData.content]);

  function set<K extends keyof SectionForm>(field: K, val: string) {
    setForm((f) => ({ ...f, [field]: val }));
    setDirty(true);
  }

  const upsertMut = useUpsertCorporateSection({
    mutation: {
      onSuccess: () => { toast.success(`${SECTION_LABELS[sectionKey] ?? sectionKey} kaydedildi`); setDirty(false); },
      onError: () => toast.error("Kayıt başarısız"),
    },
  });

  function handleSave() {
    upsertMut.mutate({
      sectionKey,
      data: {
        title: form.title || undefined,
        subtitle: form.subtitle || undefined,
        content: form.content || undefined,
      },
    });
  }

  const label = SECTION_LABELS[sectionKey] ?? sectionKey;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">{label}</h2>
        <button
          onClick={handleSave}
          disabled={!dirty || upsertMut.isPending}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm disabled:opacity-40 hover:bg-blue-700"
        >
          <Save className="h-3.5 w-3.5" />
          {upsertMut.isPending ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="label">Başlık</label>
          <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder={`${label} başlığı`} />
        </div>
        <div>
          <label className="label">Alt Başlık</label>
          <input className="input" value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="Alt başlık" />
        </div>
        <div>
          <label className="label">İçerik</label>
          <textarea
            className="input min-h-[120px] resize-y"
            value={form.content}
            onChange={(e) => set("content", e.target.value)}
            placeholder={`${label} içerik metni`}
          />
        </div>
      </div>
      {dirty && <p className="mt-2 text-[11px] text-amber-600 font-medium">Kaydedilmemiş değişiklikler var</p>}
    </div>
  );
}

export default function CorporatePage() {
  const { data: sections = [], isLoading } = useListCorporateSections();

  const KNOWN_KEYS = ["about", "mission", "vision", "values", "history", "team"];

  const allKeys = [...new Set([...KNOWN_KEYS, ...sections.map((s) => s.sectionKey)])];

  const sectionMap = Object.fromEntries(sections.map((s) => [s.sectionKey, s]));

  return (
    <section className="px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-950">Kurumsal İçerik</h1>
        <p className="mt-1 text-sm text-slate-500">Hakkımızda, misyon, vizyon ve değerler bölümlerini düzenleyin</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">{[1,2,3,4].map((i) => <div key={i} className="h-48 animate-pulse rounded-xl bg-slate-100" />)}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {allKeys.map((key) => {
            const sec = sectionMap[key];
            return (
              <SectionCard
                key={key}
                sectionKey={key}
                initialData={{
                  title: sec?.title ?? "",
                  subtitle: sec?.subtitle ?? "",
                  content: sec?.content ?? "",
                }}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
