import { useEffect, useRef, useState } from "react";
import { useListSettings, useUpsertSetting, useGetSmtpStatus, useTestSmtpConnection } from "@workspace/api-client-react";
import { toast } from "sonner";
import { Save, Plus, Trash2, Upload, X, Loader2, Tag, Mail, CheckCircle, XCircle, AlertCircle, Send } from "lucide-react";
import { useImageUpload } from "./useImageUpload";

type Preparer = {
  id: string;
  ad: string;
  telefon: string;
  email: string;
  imzaUrl: string;
};

function parsePreparers(raw: string | undefined): Preparer[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((p) => p && typeof p === "object" && typeof p.ad === "string")
      .map((p) => ({
        id: String(p.id ?? crypto.randomUUID()),
        ad: String(p.ad ?? ""),
        telefon: String(p.telefon ?? ""),
        email: String(p.email ?? ""),
        imzaUrl: String(p.imzaUrl ?? ""),
      }));
  } catch {
    return [];
  }
}

function PreparersSection({ currentRaw }: { currentRaw: string }) {
  const [list, setList] = useState<Preparer[]>(() => parsePreparers(currentRaw));
  const [dirty, setDirty] = useState(false);
  const { uploadFile, uploading } = useImageUpload();
  const uploadIndexRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setList(parsePreparers(currentRaw));
    setDirty(false);
  }, [currentRaw]);

  const upsertMut = useUpsertSetting({
    mutation: {
      onSuccess: () => { toast.success("Hazırlayan kişiler kaydedildi"); setDirty(false); },
      onError: () => toast.error("Kayıt başarısız"),
    },
  });

  function update(idx: number, field: keyof Preparer, val: string) {
    setList((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: val } : p)));
    setDirty(true);
  }

  function add() {
    setList((prev) => [...prev, { id: crypto.randomUUID(), ad: "", telefon: "", email: "", imzaUrl: "" }]);
    setDirty(true);
  }

  function remove(idx: number) {
    setList((prev) => prev.filter((_, i) => i !== idx));
    setDirty(true);
  }

  function save() {
    upsertMut.mutate({ settingKey: "hazirlayan_kisiler", data: { settingValue: JSON.stringify(list) } });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Hazırlayan Kişiler</h2>
          <p className="mt-1 text-xs text-slate-500">Teklif formu düzenleme sayfasında dropdown'dan hızlıca seçilir; ad/telefon/e-posta/imza otomatik dolar.</p>
        </div>
        <button
          onClick={save}
          disabled={!dirty || upsertMut.isPending}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-40"
        >
          <Save className="h-4 w-4" /> Kaydet
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const idx = uploadIndexRef.current;
          const file = e.target.files?.[0];
          if (file == null || idx == null) return;
          try {
            const { publicUrl } = await uploadFile(file);
            update(idx, "imzaUrl", publicUrl);
            toast.success("İmza yüklendi");
          } catch {
            toast.error("Yükleme başarısız");
          } finally {
            uploadIndexRef.current = null;
            if (fileInputRef.current) fileInputRef.current.value = "";
          }
        }}
      />

      <div className="space-y-4">
        {list.length === 0 && (
          <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">Henüz kayıtlı kişi yok. "Yeni Kişi" ile ekleyin.</p>
        )}
        {list.map((p, idx) => (
          <div key={p.id} className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Kişi #{idx + 1}</span>
              <button
                onClick={() => remove(idx)}
                className="rounded p-1 text-red-500 hover:bg-red-50"
                title="Sil"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="label">Ad Soyad</label>
                <input value={p.ad} onChange={(e) => update(idx, "ad", e.target.value)} className="input w-full text-sm" placeholder="Ad Soyad" />
              </div>
              <div>
                <label className="label">Telefon</label>
                <input value={p.telefon} onChange={(e) => update(idx, "telefon", e.target.value)} className="input w-full text-sm" placeholder="+90 ..." />
              </div>
              <div>
                <label className="label">E-posta</label>
                <input type="email" value={p.email} onChange={(e) => update(idx, "email", e.target.value)} className="input w-full text-sm" placeholder="ornek@..." />
              </div>
            </div>
            <div className="mt-3">
              <label className="label">İmza / Kaşe</label>
              <div className="flex items-center gap-3">
                {p.imzaUrl ? (
                  <div className="relative">
                    <img src={p.imzaUrl} alt="İmza" className="h-16 w-auto rounded border border-slate-200 bg-white object-contain px-2" />
                    <button
                      type="button"
                      onClick={() => update(idx, "imzaUrl", "")}
                      className="absolute -top-2 -right-2 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600"
                      title="Kaldır"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-16 w-32 items-center justify-center rounded border border-dashed border-slate-300 text-xs text-slate-400">Görsel yok</div>
                )}
                <button
                  type="button"
                  onClick={() => { uploadIndexRef.current = idx; fileInputRef.current?.click(); }}
                  disabled={uploading}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  {uploading && uploadIndexRef.current === idx ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {p.imzaUrl ? "Değiştir" : "Yükle"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={add}
        className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
      >
        <Plus className="h-4 w-4" /> Yeni Kişi Ekle
      </button>
    </div>
  );
}

const DEFAULT_NEWS_CATEGORIES = ["Genel", "Sektör Haberleri", "Ürün Haberleri", "Duyuru", "Blog"];

function NewsCategoriesSection({ currentRaw }: { currentRaw: string }) {
  function parse(raw: string): string[] {
    if (!raw) return DEFAULT_NEWS_CATEGORIES;
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length > 0) return arr as string[];
    } catch {}
    return DEFAULT_NEWS_CATEGORIES;
  }

  const [cats, setCats] = useState<string[]>(() => parse(currentRaw));
  const [dirty, setDirty] = useState(false);
  const [newCat, setNewCat] = useState("");

  useEffect(() => {
    setCats(parse(currentRaw));
    setDirty(false);
  }, [currentRaw]);

  const upsertMut = useUpsertSetting({
    mutation: {
      onSuccess: () => { toast.success("Kategoriler kaydedildi"); setDirty(false); },
      onError: () => toast.error("Kayıt başarısız"),
    },
  });

  function add() {
    const trimmed = newCat.trim();
    if (!trimmed || cats.includes(trimmed)) return;
    setCats((prev) => [...prev, trimmed]);
    setNewCat("");
    setDirty(true);
  }

  function remove(idx: number) {
    setCats((prev) => prev.filter((_, i) => i !== idx));
    setDirty(true);
  }

  function save() {
    upsertMut.mutate({ settingKey: "news_categories", data: { settingValue: JSON.stringify(cats) } });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Haber Kategorileri</h2>
          <p className="mt-1 text-xs text-slate-500">
            Haberler sayfasında görünen kategori listesini yönetin. Kaydet butonuna tıklamayı unutmayın.
          </p>
        </div>
        <button
          onClick={save}
          disabled={!dirty || upsertMut.isPending}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-40"
        >
          {upsertMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Kaydet
        </button>
      </div>

      <div className="mb-4 space-y-2">
        {cats.length === 0 && (
          <p className="rounded-lg bg-slate-50 px-4 py-4 text-center text-sm text-slate-400">
            Kategori yok. Aşağıdan ekleyin.
          </p>
        )}
        {cats.map((cat, idx) => (
          <div key={idx} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <Tag className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="flex-1 text-sm font-medium text-slate-800">{cat}</span>
            <button
              onClick={() => remove(idx)}
              className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
              title="Sil"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="input flex-1 text-sm"
          placeholder="Yeni kategori adı (Enter ile ekle)"
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        />
        <button
          onClick={add}
          disabled={!newCat.trim()}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" /> Ekle
        </button>
      </div>
    </div>
  );
}

const SETTING_GROUPS: Array<{
  label: string;
  description?: string;
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
    description: "Ana sayfadaki istatistik kartlarının görünen değerlerini buradan güncelleyebilirsiniz.",
    keys: [
      { key: "yearsExperience", label: "Yıllık Tecrübe" },
      { key: "completedProjects", label: "Tamamlanan Proje" },
      { key: "exportCountries", label: "İhracat Ülkesi" },
      { key: "customerSatisfaction", label: "Müşteri Memnuniyeti" },
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

function SmtpSettingsSection() {
  const [testEmail, setTestEmail] = useState("");
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useGetSmtpStatus();

  const testMut = useTestSmtpConnection({
    mutation: {
      onSuccess: (data) => {
        setTestResult({ success: data.success, message: data.message ?? "" });
        if (data.success) {
          toast.success("Test e-postası gönderildi");
          void refetchStatus();
        } else {
          toast.error("Test başarısız");
        }
      },
      onError: (err: unknown) => {
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: unknown }).message)
            : "Bağlantı hatası";
        setTestResult({ success: false, message });
        toast.error("Test başarısız");
      },
    },
  });

  function handleTest() {
    if (!testEmail.trim()) {
      toast.error("Lütfen bir e-posta adresi girin");
      return;
    }
    setTestResult(null);
    testMut.mutate({ data: { to: testEmail.trim() } });
  }

  const configured = status?.configured ?? false;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
          <Mail className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">E-posta Ayarları (SMTP)</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Ortam değişkenleriyle yapılandırılır. Bağlantıyı test etmek için aşağıdaki butonu kullanın.
          </p>
        </div>
      </div>

      {statusLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Durum kontrol ediliyor…
        </div>
      ) : (
        <>
          <div className="mb-5 grid gap-2 sm:grid-cols-2">
            <StatusRow label="SMTP_HOST" ok={status?.host ?? false} />
            <StatusRow label="SMTP_PORT" ok={true} value={String(status?.port ?? 587)} />
            <StatusRow label="SMTP_USER" ok={status?.user ?? false} />
            <StatusRow label="SMTP_FROM" ok={status?.from ?? false} optional />
          </div>

          {!configured && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-sm text-amber-800">
                SMTP yapılandırması eksik. <strong>SMTP_HOST</strong>, <strong>SMTP_USER</strong> ve{" "}
                <strong>SMTP_PASS</strong> ortam değişkenleri tanımlanmalıdır.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-slate-700">
                Test e-postası alıcı adresi
              </label>
              <input
                type="email"
                className="input w-full"
                placeholder="ornek@firma.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTest()}
                disabled={testMut.isPending}
              />
            </div>
            <button
              onClick={handleTest}
              disabled={testMut.isPending || !testEmail.trim()}
              className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-40"
            >
              {testMut.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Test Gönder
            </button>
          </div>

          {testResult && (
            <div
              className={`mt-4 flex items-start gap-3 rounded-lg border p-4 ${
                testResult.success
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              )}
              <p
                className={`text-sm ${testResult.success ? "text-emerald-800" : "text-red-800"}`}
              >
                {testResult.message}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatusRow({
  label,
  ok,
  value,
  optional,
}: {
  label: string;
  ok: boolean;
  value?: string;
  optional?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
      {ok ? (
        <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
      ) : (
        <XCircle className={`h-4 w-4 shrink-0 ${optional ? "text-slate-300" : "text-red-400"}`} />
      )}
      <span className="flex-1 font-mono text-xs text-slate-700">{label}</span>
      {value ? (
        <span className="text-xs font-medium text-slate-500">{value}</span>
      ) : ok ? (
        <span className="text-xs text-emerald-600">Tanımlı</span>
      ) : (
        <span className={`text-xs ${optional ? "text-slate-400" : "text-red-500"}`}>
          {optional ? "Opsiyonel" : "Eksik"}
        </span>
      )}
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
            <div
              key={group.label}
              id={group.label === "İstatistikler" ? "istatistikler" : undefined}
              className="scroll-mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="mb-4 text-sm font-bold text-slate-900">{group.label}</h2>
              {group.description && <p className="-mt-2 mb-4 text-xs leading-5 text-slate-500">{group.description}</p>}
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
          <NewsCategoriesSection currentRaw={settingsMap["news_categories"] ?? ""} />
          <PreparersSection currentRaw={settingsMap["hazirlayan_kisiler"] ?? ""} />
          <div id="smtp"><SmtpSettingsSection /></div>
        </div>
      )}
    </section>
  );
}
