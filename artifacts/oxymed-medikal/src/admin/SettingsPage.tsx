import { useEffect, useState } from "react";
import { useListSettings, useUpsertSetting } from "@workspace/api-client-react";
import { toast } from "sonner";
import { Save } from "lucide-react";

const SETTING_GROUPS: Array<{
  label: string;
  keys: Array<{ key: string; label: string; type?: "text" | "url" | "email" | "tel" | "textarea" }>;
}> = [
  {
    label: "İletişim Bilgileri",
    keys: [
      { key: "phone", label: "Telefon", type: "tel" },
      { key: "email", label: "E-posta", type: "email" },
      { key: "address", label: "Adres", type: "textarea" },
      { key: "city", label: "Şehir" },
    ],
  },
  {
    label: "Sosyal Medya",
    keys: [
      { key: "facebook", label: "Facebook", type: "url" },
      { key: "twitter", label: "Twitter / X", type: "url" },
      { key: "instagram", label: "Instagram", type: "url" },
      { key: "linkedin", label: "LinkedIn", type: "url" },
      { key: "youtube", label: "YouTube", type: "url" },
    ],
  },
  {
    label: "Site Bilgileri",
    keys: [
      { key: "site_title", label: "Site Başlığı" },
      { key: "footer_text", label: "Footer Metni", type: "textarea" },
      { key: "meta_description", label: "Meta Açıklaması", type: "textarea" },
    ],
  },
  {
    label: "İstatistikler",
    keys: [
      { key: "stats_years", label: "Yıl (Tecrübe)" },
      { key: "stats_projects", label: "Proje Sayısı" },
      { key: "stats_countries", label: "Ülke Sayısı" },
      { key: "stats_products", label: "Ürün Sayısı" },
    ],
  },
];

function SettingField({ settingKey, label, type = "text", currentValue }: {
  settingKey: string;
  label: string;
  type?: "text" | "url" | "email" | "tel" | "textarea";
  currentValue: string;
}) {
  const [value, setValue] = useState(currentValue);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setValue(currentValue);
    setDirty(false);
  }, [currentValue]);

  const upsertMut = useUpsertSetting({
    mutation: {
      onSuccess: () => { toast.success(`${label} kaydedildi`); setDirty(false); },
      onError: () => toast.error("Kayıt başarısız"),
    },
  });

  function handleChange(val: string) {
    setValue(val);
    setDirty(true);
  }

  function handleSave() {
    upsertMut.mutate({ settingKey, data: { settingValue: value } });
  }

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex gap-2">
        {type === "textarea" ? (
          <textarea
            className="input min-h-[80px] flex-1 resize-y"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={label}
          />
        ) : (
          <input
            type={type}
            className="input flex-1"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={label}
          />
        )}
        <button
          onClick={handleSave}
          disabled={!dirty || upsertMut.isPending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm disabled:opacity-40 hover:bg-blue-700 self-start"
          title="Kaydet"
        >
          <Save className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { data: settings, isLoading } = useListSettings();
  const settingsMap: Record<string, string> = (settings as Record<string, string>) ?? {};

  return (
    <section className="px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-950">Site Ayarları</h1>
        <p className="mt-1 text-sm text-slate-500">İletişim bilgileri, sosyal medya ve site geneli ayarlar</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="h-48 animate-pulse rounded-xl bg-slate-100" />)}</div>
      ) : (
        <div className="space-y-6">
          {SETTING_GROUPS.map((group) => (
            <div key={group.label} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-bold text-slate-900">{group.label}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {group.keys.map((field) => (
                  <SettingField
                    key={field.key}
                    settingKey={field.key}
                    label={field.label}
                    type={field.type}
                    currentValue={settingsMap[field.key] ?? ""}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
