import { useState } from "react";
import { Languages } from "lucide-react";
import { toast } from "sonner";
import { LOCALES, LOCALE_META, type Locale } from "../i18n/config";
import { useAuth } from "./AuthContext";

type Locales = Record<string, Record<string, string | undefined>>;

export function LocaleOverlayFields({
  locales,
  fields,
  source,
  endpoint,
  onChange,
}: {
  locales: Locales;
  fields: Array<{ key: string; label: string; multiline?: boolean }>;
  source: Record<string, string>;
  endpoint: string;
  onChange: (locales: Locales) => void;
}) {
  const [locale, setLocale] = useState<Exclude<Locale, "tr">>("en");
  const [translating, setTranslating] = useState(false);
  const { authFetch } = useAuth();
  const targets = LOCALES.filter((code): code is Exclude<Locale, "tr"> => code !== "tr");

  async function translate() {
    setTranslating(true);
    try {
      const response = await authFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(source),
      });
      if (!response.ok) throw new Error();
      const data = await response.json() as { locales?: Locales };
      if (!data.locales) throw new Error();
      onChange(data.locales);
      toast.success("11 dil için çeviriler hazırlandı");
    } catch {
      toast.error("Çeviriler oluşturulamadı");
    } finally {
      setTranslating(false);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <select className="input max-w-44" value={locale} onChange={(event) => setLocale(event.target.value as Exclude<Locale, "tr">)}>
          {targets.map((code) => <option key={code} value={code}>{LOCALE_META[code].nativeName}</option>)}
        </select>
        <button type="button" onClick={translate} disabled={translating} className="btn-secondary flex items-center gap-2 text-xs">
          <Languages className="h-4 w-4" /> {translating ? "Çevriliyor…" : "AI ile 11 dile çevir"}
        </button>
      </div>
      {fields.map((field) => {
        const value = locales[locale]?.[field.key] ?? "";
        const update = (next: string) => onChange({
          ...locales,
          [locale]: { ...locales[locale], [field.key]: next },
        });
        return (
          <div key={field.key}>
            <label className="label">{field.label} ({locale.toUpperCase()})</label>
            {field.multiline
              ? <textarea className="input min-h-[120px]" value={value} onChange={(event) => update(event.target.value)} />
              : <input className="input" value={value} onChange={(event) => update(event.target.value)} />}
          </div>
        );
      })}
    </div>
  );
}