import { useEffect } from "react";
import { useListCatalogs } from "@workspace/api-client-react";
import { BookOpen, ExternalLink, X } from "lucide-react";
import { trackInteraction } from "../common/VisitorTracker";
import { useI18n } from "../../i18n/I18nProvider";
import { resolvePublicDocumentUrl } from "../../lib/documentUrl";

const LANG_LABELS: Record<string, string> = {
  TR: "Türkçe",
  EN: "English",
  DE: "Deutsch",
  FR: "Français",
  AR: "عربي",
};

export default function CatalogModal({ onClose }: { onClose: () => void }) {
  const { data: allCatalogs = [] } = useListCatalogs({ activeOnly: true });
  const { t } = useI18n();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const grouped = allCatalogs.reduce<Record<string, typeof allCatalogs>>((acc, c) => {
    if (!acc[c.language]) acc[c.language] = [];
    acc[c.language].push(c);
    return acc;
  }, {});

  const languages = Object.keys(grouped).sort();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-steel-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-oxynavy-950">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-oxynavy-950">{t("common.catalog.title")}</h2>
              <p className="text-xs text-steel-500">{t("common.catalog.subtitle")}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-steel-400 hover:bg-steel-100 hover:text-steel-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6">
          {allCatalogs.length === 0 ? (
            <p className="text-center text-sm text-steel-400 py-8">{t("common.catalog.empty")}</p>
          ) : (
            <div className="space-y-6">
              {languages.map((lang) => (
                <div key={lang}>
                  <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.2em] text-steel-400">
                    {LANG_LABELS[lang] ?? lang}
                  </p>
                  <div className="space-y-2">
                    {grouped[lang]
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((catalog) => (
                        <a
                          key={catalog.id}
                          href={resolvePublicDocumentUrl(catalog.pdfUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackInteraction(`Katalog İndir: ${catalog.title}`)}
                          className="flex items-center gap-3 rounded-xl border border-steel-100 bg-steel-50 px-4 py-3 transition hover:border-oxynavy-200 hover:bg-oxynavy-50 group"
                        >
                          <BookOpen className="h-5 w-5 shrink-0 text-oxynavy-700" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-oxynavy-950">{catalog.title}</p>
                            {catalog.category && (
                              <p className="text-[11px] text-steel-500">{catalog.category}</p>
                            )}
                          </div>
                          <ExternalLink className="h-4 w-4 shrink-0 text-steel-400 group-hover:text-oxynavy-700 transition" />
                        </a>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-steel-100 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-steel-200 py-2.5 text-sm font-semibold text-steel-600 hover:bg-steel-50 transition"
          >
            {t("common.cta.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
