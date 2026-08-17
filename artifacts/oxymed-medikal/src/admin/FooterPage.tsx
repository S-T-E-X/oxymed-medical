import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { getListSettingsQueryKey, useListSettings, useUpsertSetting } from "@workspace/api-client-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { LOCALES, LOCALE_META, type Locale } from "../i18n/config";
import { loadDictionary, TR_DICTIONARY, type DictionaryNode } from "../i18n/dictionary";
import {
  FOOTER_SETTING_KEY,
  createFooterContentFromDictionary,
  mergeFooterContent,
  parseFooterConfig,
  type FooterColumnContent,
  type FooterConfig,
  type FooterLinkContent,
  type FooterLocaleContent,
} from "../data/footer";

function updateColumn(
  content: FooterLocaleContent,
  index: number,
  field: "title" | "visible",
  value: string | boolean,
): FooterLocaleContent {
  return {
    ...content,
    columns: content.columns.map((column, columnIndex) =>
      columnIndex === index ? { ...column, [field]: value } : column,
    ),
  };
}

function updateLink(
  content: FooterLocaleContent,
  columnIndex: number,
  linkIndex: number,
  field: keyof Pick<FooterLinkContent, "label" | "href" | "visible">,
  value: string | boolean,
): FooterLocaleContent {
  return {
    ...content,
    columns: content.columns.map((column, currentColumnIndex) =>
      currentColumnIndex === columnIndex
        ? {
            ...column,
            links: column.links.map((link, currentLinkIndex) =>
              currentLinkIndex === linkIndex ? { ...link, [field]: value } : link,
            ),
          }
        : column,
    ),
  };
}

function addLink(content: FooterLocaleContent, columnIndex: number): FooterLocaleContent {
  const newLink: FooterLinkContent = {
    key: `custom-${crypto.randomUUID()}`,
    label: "Yeni bağlantı",
    href: "/",
    visible: true,
  };
  return {
    ...content,
    columns: content.columns.map((column, currentColumnIndex) =>
      currentColumnIndex === columnIndex
        ? { ...column, links: [...column.links, newLink] }
        : column,
    ),
  };
}

function removeLink(content: FooterLocaleContent, columnIndex: number, linkIndex: number): FooterLocaleContent {
  return {
    ...content,
    columns: content.columns.map((column, currentColumnIndex) =>
      currentColumnIndex === columnIndex
        ? { ...column, links: column.links.filter((_, currentLinkIndex) => currentLinkIndex !== linkIndex) }
        : column,
    ),
  };
}

function ColumnEditor({
  column,
  columnIndex,
  onChange,
  onLinkChange,
  onAddLink,
  onRemoveLink,
}: {
  column: FooterColumnContent;
  columnIndex: number;
  onChange: (field: "title" | "visible", value: string | boolean) => void;
  onLinkChange: (
    linkIndex: number,
    field: keyof Pick<FooterLinkContent, "label" | "href" | "visible">,
    value: string | boolean,
  ) => void;
  onAddLink: () => void;
  onRemoveLink: (linkIndex: number) => void;
}) {
  return (
    <div className={`rounded-xl border bg-white p-5 shadow-sm ${column.visible ? "border-slate-200" : "border-dashed border-slate-300 opacity-75"}`}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <label className="label">Sütun başlığı</label>
          <input
            className="input"
            value={column.title}
            onChange={(event) => onChange("title", event.target.value)}
            placeholder="Sütun başlığı"
          />
        </div>
        <button
          type="button"
          onClick={() => onChange("visible", !column.visible)}
          className={`mt-6 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition ${
            column.visible
              ? "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              : "border-slate-200 bg-slate-100 text-slate-400 hover:bg-slate-200"
          }`}
          title={column.visible ? "Sütunu gizle" : "Sütunu göster"}
          aria-label={column.visible ? "Sütunu gizle" : "Sütunu göster"}
        >
          {column.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Bağlantılar</p>
          <span className="text-[11px] text-slate-400">{column.links.length} bağlantı</span>
        </div>
        {column.links.map((link, linkIndex) => (
          <div key={link.key} className={`rounded-lg border p-3 ${link.visible ? "border-slate-200 bg-slate-50/60" : "border-dashed border-slate-300 bg-slate-50 opacity-70"}`}>
            <div className="grid gap-2 sm:grid-cols-[1fr_1.25fr_auto_auto]">
              <input
                className="input h-9 text-xs"
                value={link.label}
                onChange={(event) => onLinkChange(linkIndex, "label", event.target.value)}
                placeholder="Bağlantı adı"
                aria-label="Bağlantı adı"
              />
              <input
                className="input h-9 text-xs"
                value={link.href}
                onChange={(event) => onLinkChange(linkIndex, "href", event.target.value)}
                placeholder="/sayfa veya https://..."
                aria-label="Bağlantı adresi"
              />
              <button
                type="button"
                onClick={() => onLinkChange(linkIndex, "visible", !link.visible)}
                className="flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-slate-500 hover:bg-slate-100"
                title={link.visible ? "Bağlantıyı gizle" : "Bağlantıyı göster"}
                aria-label={link.visible ? "Bağlantıyı gizle" : "Bağlantıyı göster"}
              >
                {link.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => onRemoveLink(linkIndex)}
                className="flex h-9 items-center justify-center rounded-lg border border-red-100 bg-white px-2 text-red-400 hover:bg-red-50"
                title="Bağlantıyı sil"
                aria-label="Bağlantıyı sil"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {link.href && (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
              >
                Adresi aç <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={onAddLink}
          className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
        >
          <Plus className="h-3.5 w-3.5" /> Bağlantı ekle
        </button>
      </div>
    </div>
  );
}

export default function FooterPage() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useListSettings();
  const settingsMap = (settings as Record<string, string> | undefined) ?? {};
  const [selectedLocale, setSelectedLocale] = useState<Locale>("tr");
  const [dictionary, setDictionary] = useState<DictionaryNode>(TR_DICTIONARY);
  const [dictionaryLoading, setDictionaryLoading] = useState(false);
  const [config, setConfig] = useState<FooterConfig>({});
  const [draft, setDraft] = useState<FooterLocaleContent>(() => createFooterContentFromDictionary(TR_DICTIONARY));

  useEffect(() => {
    if (!isLoading) {
      setConfig(parseFooterConfig(settingsMap[FOOTER_SETTING_KEY]));
    }
  }, [isLoading, settingsMap[FOOTER_SETTING_KEY]]);

  useEffect(() => {
    let cancelled = false;
    setDictionaryLoading(true);
    void loadDictionary(selectedLocale)
      .then((next) => {
        if (!cancelled) setDictionary(next);
      })
      .finally(() => {
        if (!cancelled) setDictionaryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedLocale]);

  useEffect(() => {
    const defaults = createFooterContentFromDictionary(dictionary);
    setDraft(mergeFooterContent(defaults, config[selectedLocale]));
  }, [config, dictionary, selectedLocale]);

  const saveMut = useUpsertSetting({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getListSettingsQueryKey() });
        toast.success(`${LOCALE_META[selectedLocale].nativeName} footer içeriği kaydedildi`);
      },
      onError: () => toast.error("Footer kaydedilemedi"),
    },
  });

  function updateDraft(field: keyof Omit<FooterLocaleContent, "columns">, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function updateDraftColumn(columnIndex: number, field: "title" | "visible", value: string | boolean) {
    setDraft((current) => updateColumn(current, columnIndex, field, value));
  }

  function updateDraftLink(
    columnIndex: number,
    linkIndex: number,
    field: keyof Pick<FooterLinkContent, "label" | "href" | "visible">,
    value: string | boolean,
  ) {
    setDraft((current) => updateLink(current, columnIndex, linkIndex, field, value));
  }

  function save() {
    const nextConfig = { ...config, [selectedLocale]: draft };
    setConfig(nextConfig);
    saveMut.mutate({
      settingKey: FOOTER_SETTING_KEY,
      data: { settingValue: JSON.stringify(nextConfig) },
    });
  }

  return (
    <section className="px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Footer Yönetimi</h1>
          <p className="mt-1 text-sm text-slate-500">
            Footer metinlerini, sütunlarını ve bağlantılarını dil bazında düzenleyin
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="text-xs font-bold text-slate-500" htmlFor="footer-language">Düzenlenen dil</label>
          <select
            id="footer-language"
            className="input min-w-44"
            value={selectedLocale}
            onChange={(event) => setSelectedLocale(event.target.value as Locale)}
          >
            {LOCALES.map((locale) => (
              <option key={locale} value={locale}>{LOCALE_META[locale].nativeName}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={save}
            disabled={isLoading || dictionaryLoading || saveMut.isPending}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Kaydet
          </button>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm leading-6 text-blue-900">
        <p className="font-bold">Nasıl çalışır?</p>
        <p className="mt-1 text-blue-800">
          Seçtiğiniz dil için kaydedilen değerler yalnızca o dildeki public footerda gösterilir.
          Değiştirmediğiniz alanlar mevcut site çevirisinden otomatik alınır. İletişim telefonu,
          e-posta, adres ve sosyal medya adresleri <strong>Site Ayarları</strong> sayfasından yönetilir.
        </p>
      </div>

      {isLoading || dictionaryLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => <div key={item} className="h-44 animate-pulse rounded-xl bg-slate-100" />)}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-slate-900">Genel footer metinleri</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <label className="label">Açıklama / slogan</label>
                <textarea
                  className="input min-h-24 resize-y"
                  value={draft.tagline}
                  onChange={(event) => updateDraft("tagline", event.target.value)}
                  placeholder="Footer açıklaması"
                />
              </div>
              <div>
                <label className="label">İletişim başlığı</label>
                <input className="input" value={draft.contactTitle} onChange={(event) => updateDraft("contactTitle", event.target.value)} />
              </div>
              <div>
                <label className="label">Telif metni</label>
                <input className="input" value={draft.copyright} onChange={(event) => updateDraft("copyright", event.target.value)} />
              </div>
              <div>
                <label className="label">KVKK bağlantı adı</label>
                <input className="input" value={draft.kvkk} onChange={(event) => updateDraft("kvkk", event.target.value)} />
              </div>
              <div>
                <label className="label">Gizlilik bağlantı adı</label>
                <input className="input" value={draft.privacy} onChange={(event) => updateDraft("privacy", event.target.value)} />
              </div>
              <div>
                <label className="label">Kullanım şartları bağlantı adı</label>
                <input className="input" value={draft.terms} onChange={(event) => updateDraft("terms", event.target.value)} />
              </div>
            </div>
          </div>

          <div>
            <div className="mb-3">
              <h2 className="text-sm font-bold text-slate-900">Footer sütunları</h2>
              <p className="mt-1 text-xs text-slate-500">Sütunları veya tek tek bağlantıları gizleyebilir, adlarını ve adreslerini değiştirebilirsiniz.</p>
            </div>
            <div className="grid gap-5 xl:grid-cols-2">
              {draft.columns.map((column, columnIndex) => (
                <ColumnEditor
                  key={column.key}
                  column={column}
                  columnIndex={columnIndex}
                  onChange={(field, value) => updateDraftColumn(columnIndex, field, value)}
                  onLinkChange={(linkIndex, field, value) => updateDraftLink(columnIndex, linkIndex, field, value)}
                  onAddLink={() => setDraft((current) => addLink(current, columnIndex))}
                  onRemoveLink={(linkIndex) => setDraft((current) => removeLink(current, columnIndex, linkIndex))}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}