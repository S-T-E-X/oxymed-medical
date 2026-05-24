import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  Save,
  Plus,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

type Product = {
  id: number;
  title: string;
  imageUrl?: string | null;
  quoteTitle?: string | null;
  quoteBullets?: string[];
  quoteModelCode?: string | null;
  quoteImageUrl?: string | null;
  quoteUnit?: string | null;
  quoteUnitPrice?: string | null;
};

type ItemDraft = {
  id?: number;
  productId?: number | null;
  title: string;
  bulletsText: string;
  modelCode: string;
  imageUrl: string;
  quantity: number;
  unit: string;
  unitPrice: string;
  sortOrder: number;
  expanded: boolean;
};

type FormDraft = {
  firmaAdi: string;
  firmaAdres: string;
  firmaTelefon: string;
  firmaEmail: string;
  firmaVergiDairesi: string;
  firmaVergiNo: string;
  teslimatAdresi: string;
  teslimatSuresi: string;
  odemeSekli: string;
  paraBirimi: string;
  iskonto: string;
  kdv: string;
  hizmetlerText: string;
  sartlarText: string;
  notlar: string;
  hazirlayan: string;
  hazirlayanTelefon: string;
  hazirlayanEmail: string;
  onaylayan: string;
  onaytayanGorev: string;
  onayTarihi: string;
};

const DEFAULT_HIZMETLER = [
  "Projeye özel teknik keşif ve mühendislik desteği",
  "Montaj ve devreye alma hizmeti",
  "Kullanıcı eğitimi",
  "Garanti kapsamındaki yedek parça ve işçilik",
  "Periyodik bakım ve teknik destek",
  "7/24 teknik destek ve danışmanlık",
].join("\n");

const DEFAULT_SARTLAR = [
  "Bu teklif formu 30 gün süreyle geçerlidir.",
  "Fiyatlara KDV dahil değildir.",
  "Teslimat süresi, sipariş onayının ardından belirtilecektir.",
  "Ödeme, belirtilen vade ve koşullarda yapılacaktır.",
  "Oxymed Medikal, teklif içeriğinde değişiklik yapma hakkını saklı tutar.",
  "Detaylı teknik şartname ve çizimler talep halinde sunulacaktır.",
].join("\n");

function newItem(sortOrder: number): ItemDraft {
  return {
    title: "",
    bulletsText: "",
    modelCode: "",
    imageUrl: "",
    quantity: 1,
    unit: "ADET",
    unitPrice: "0",
    sortOrder,
    expanded: true,
  };
}

function apiItemToDraft(it: {
  id: number;
  productId?: number | null;
  title: string;
  bullets?: string[];
  modelCode?: string | null;
  imageUrl?: string | null;
  quantity: number;
  unit: string;
  unitPrice?: string | null;
  sortOrder: number;
}): ItemDraft {
  return {
    id: it.id,
    productId: it.productId,
    title: it.title,
    bulletsText: (it.bullets ?? []).join("\n"),
    modelCode: it.modelCode ?? "",
    imageUrl: it.imageUrl ?? "",
    quantity: it.quantity,
    unit: it.unit,
    unitPrice: it.unitPrice ?? "0",
    sortOrder: it.sortOrder,
    expanded: false,
  };
}

function ProductSelectorModal({
  token,
  onSelect,
  onClose,
}: {
  token: string | null;
  onSelect: (p: Product) => void;
  onClose: () => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/products?limit=200&published=true", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((d: { items: Product[] }) => {
        setProducts(d.items ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const filtered = products.filter((p) =>
    (p.quoteTitle ?? p.title).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[80vh] w-full max-w-xl flex-col rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">Ürün Seç</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
        </div>
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ürün adı ara…"
              className="input w-full pl-9 text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Ürün bulunamadı</p>
          ) : (
            <div className="space-y-1">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelect(p)}
                  className="flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left transition hover:border-blue-200 hover:bg-blue-50"
                >
                  {p.imageUrl && (
                    <img src={p.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded object-contain" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {p.quoteTitle ?? p.title}
                    </p>
                    {p.quoteModelCode && (
                      <p className="text-xs text-slate-400">{p.quoteModelCode}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ItemRow({
  item,
  index,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  item: ItemDraft;
  index: number;
  onChange: (field: keyof ItemDraft, value: ItemDraft[keyof ItemDraft]) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const total = item.quantity * parseFloat(item.unitPrice || "0");

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div
        className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-slate-50"
        onClick={() => onChange("expanded", !item.expanded)}
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
          {index + 1}
        </span>
        <p className="flex-1 truncate text-sm font-semibold text-slate-800">
          {item.title || <span className="italic text-slate-300">Başlıksız kalem</span>}
        </p>
        <span className="text-xs font-bold text-slate-500">
          {total.toLocaleString("tr-TR")} {item.unitPrice ? "" : ""}
        </span>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 disabled:opacity-30"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 disabled:opacity-30"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onRemove}
            className="flex h-6 w-6 items-center justify-center rounded text-red-400 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        {item.expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        )}
      </div>

      {item.expanded && (
        <div className="border-t border-slate-100 px-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Ürün / Hizmet Başlığı *</label>
              <input
                value={item.title}
                onChange={(e) => onChange("title", e.target.value)}
                className="input w-full text-sm"
                placeholder="Ürün adı"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label">Özellikler (her satır bir madde)</label>
              <textarea
                value={item.bulletsText}
                onChange={(e) => onChange("bulletsText", e.target.value)}
                className="input w-full text-sm"
                rows={4}
                placeholder="CE sertifikalı&#10;Sesli alarm sistemi&#10;..."
              />
            </div>

            <div>
              <label className="label">Model / Kod</label>
              <input
                value={item.modelCode}
                onChange={(e) => onChange("modelCode", e.target.value)}
                className="input w-full text-sm"
                placeholder="OXM-XXX-00"
              />
            </div>

            <div>
              <label className="label">Görsel URL</label>
              <input
                value={item.imageUrl}
                onChange={(e) => onChange("imageUrl", e.target.value)}
                className="input w-full text-sm"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="label">Miktar</label>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => onChange("quantity", parseInt(e.target.value) || 1)}
                className="input w-full text-sm"
              />
            </div>

            <div>
              <label className="label">Birim</label>
              <select
                value={item.unit}
                onChange={(e) => onChange("unit", e.target.value)}
                className="input w-full text-sm"
              >
                {["ADET", "SET", "METRE", "KG", "PAKET", "KUTU", "TAKIM"].map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Birim Fiyat</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={item.unitPrice}
                onChange={(e) => onChange("unitPrice", e.target.value)}
                className="input w-full text-sm"
                placeholder="0"
              />
            </div>

            <div>
              <label className="label">Toplam Fiyat</label>
              <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700">
                {total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuoteFormEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [quoteNo, setQuoteNo] = useState("");
  const [tab, setTab] = useState<"items" | "info">("items");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<ItemDraft[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [form, setForm] = useState<FormDraft>({
    firmaAdi: "",
    firmaAdres: "",
    firmaTelefon: "",
    firmaEmail: "",
    firmaVergiDairesi: "",
    firmaVergiNo: "",
    teslimatAdresi: "",
    teslimatSuresi: "Sipariş onayından sonra 21 iş günü",
    odemeSekli: "%40 sipariş, %60 teslimat öncesi",
    paraBirimi: "EUR",
    iskonto: "0",
    kdv: "20",
    hizmetlerText: DEFAULT_HIZMETLER,
    sartlarText: DEFAULT_SARTLAR,
    notlar: "",
    hazirlayan: "",
    hazirlayanTelefon: "",
    hazirlayanEmail: "",
    onaylayan: "",
    onaytayanGorev: "",
    onayTarihi: "",
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/quote-forms/${id}`, {
      headers: { Authorization: `Bearer ${token ?? ""}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setQuoteNo(data.quoteNo ?? "");
        setItems((data.items ?? []).map(apiItemToDraft));
        setForm((prev) => ({
          ...prev,
          firmaAdi: data.firmaAdi ?? "",
          firmaAdres: data.firmaAdres ?? "",
          firmaTelefon: data.firmaTelefon ?? "",
          firmaEmail: data.firmaEmail ?? "",
          firmaVergiDairesi: data.firmaVergiDairesi ?? "",
          firmaVergiNo: data.firmaVergiNo ?? "",
          teslimatAdresi: data.teslimatAdresi ?? "",
          teslimatSuresi: data.teslimatSuresi ?? prev.teslimatSuresi,
          odemeSekli: data.odemeSekli ?? prev.odemeSekli,
          paraBirimi: data.paraBirimi ?? "EUR",
          iskonto: data.iskonto ?? "0",
          kdv: data.kdv ?? "20",
          hizmetlerText:
            (data.hizmetler ?? []).length > 0
              ? (data.hizmetler as string[]).join("\n")
              : DEFAULT_HIZMETLER,
          sartlarText:
            (data.sartlar ?? []).length > 0
              ? (data.sartlar as string[]).join("\n")
              : DEFAULT_SARTLAR,
          notlar: data.notlar ?? "",
          hazirlayan: data.hazirlayan ?? "",
          hazirlayanTelefon: data.hazirlayanTelefon ?? "",
          hazirlayanEmail: data.hazirlayanEmail ?? "",
          onaylayan: data.onaylayan ?? "",
          onaytayanGorev: data.onaytayanGorev ?? "",
          onayTarihi: data.onayTarihi ?? "",
        }));
      })
      .catch(() => toast.error("Yüklenemedi"))
      .finally(() => setLoading(false));
  }, [id, token]);

  const updateItem = useCallback((index: number, field: keyof ItemDraft, value: ItemDraft[keyof ItemDraft]) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it))
    );
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const moveItem = useCallback((index: number, dir: -1 | 1) => {
    setItems((prev) => {
      const arr = [...prev];
      const target = index + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target]!, arr[index]!];
      return arr;
    });
  }, []);

  const addBlankItem = () => {
    setItems((prev) => [...prev, newItem(prev.length)]);
  };

  const addFromProduct = (p: Product) => {
    const draft: ItemDraft = {
      productId: p.id,
      title: p.quoteTitle ?? p.title,
      bulletsText: (p.quoteBullets ?? []).join("\n"),
      modelCode: p.quoteModelCode ?? "",
      imageUrl: p.quoteImageUrl ?? p.imageUrl ?? "",
      quantity: 1,
      unit: p.quoteUnit ?? "ADET",
      unitPrice: p.quoteUnitPrice ?? "0",
      sortOrder: items.length,
      expanded: false,
    };
    setItems((prev) => [...prev, draft]);
    setShowProductModal(false);
    toast.success(`"${draft.title}" eklendi`);
  };

  const saveItems = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const body = items.map((it, i) => ({
        productId: it.productId ?? null,
        title: it.title,
        bullets: it.bulletsText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        modelCode: it.modelCode || null,
        imageUrl: it.imageUrl || null,
        quantity: it.quantity,
        unit: it.unit,
        unitPrice: it.unitPrice,
        sortOrder: i,
      }));
      const r = await fetch(`/api/quote-forms/${id}/items`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error();
      const saved = (await r.json()) as Array<{ id: number; sortOrder: number }>;
      setItems((prev) =>
        prev.map((it, i) => ({ ...it, id: saved[i]?.id }))
      );
      toast.success("Kalemler kaydedildi");
    } catch {
      toast.error("Kalemler kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  const saveInfo = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const body = {
        firmaAdi: form.firmaAdi || null,
        firmaAdres: form.firmaAdres || null,
        firmaTelefon: form.firmaTelefon || null,
        firmaEmail: form.firmaEmail || null,
        firmaVergiDairesi: form.firmaVergiDairesi || null,
        firmaVergiNo: form.firmaVergiNo || null,
        teslimatAdresi: form.teslimatAdresi || null,
        teslimatSuresi: form.teslimatSuresi || null,
        odemeSekli: form.odemeSekli || null,
        paraBirimi: form.paraBirimi,
        iskonto: form.iskonto,
        kdv: form.kdv,
        hizmetler: form.hizmetlerText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        sartlar: form.sartlarText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        notlar: form.notlar || null,
        hazirlayan: form.hazirlayan || null,
        hazirlayanTelefon: form.hazirlayanTelefon || null,
        hazirlayanEmail: form.hazirlayanEmail || null,
        onaylayan: form.onaylayan || null,
        onaytayanGorev: form.onaytayanGorev || null,
        onayTarihi: form.onayTarihi || null,
      };
      const r = await fetch(`/api/quote-forms/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error();
      toast.success("Bilgiler kaydedildi");
    } catch {
      toast.error("Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  const setField = (key: keyof FormDraft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
      </div>
    );
  }

  const araTopam = items.reduce(
    (s, it) => s + it.quantity * parseFloat(it.unitPrice || "0"),
    0
  );

  return (
    <div className="flex flex-col">
      <div className="sticky top-[60px] z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6">
        <button
          onClick={() => navigate("/admin/teklif-formlari")}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Geri
        </button>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-700">{quoteNo}</p>
          <p className="text-xs text-slate-400">Teklif Formu Düzenle</p>
        </div>
        <a
          href={`/teklif-goruntule/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          <Eye className="h-3.5 w-3.5" />
          PDF Önizleme
        </a>
        <button
          onClick={tab === "items" ? saveItems : saveInfo}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Kaydet
        </button>
      </div>

      <div className="px-4 pt-5 sm:px-6">
        <div className="flex gap-1 border-b border-slate-200">
          {(["items", "info"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-t-lg px-5 py-2.5 text-sm font-bold transition ${
                tab === t
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t === "items" ? "Kalemler" : "Bilgiler"}
            </button>
          ))}
        </div>
      </div>

      {tab === "items" && (
        <div className="px-4 py-5 sm:px-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-slate-700">{items.length} kalem</span>
              {items.length > 0 && (
                <span className="ml-3 text-sm text-slate-500">
                  Ara Toplam: {araTopam.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} {form.paraBirimi}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowProductModal(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Search className="h-3.5 w-3.5" />
                Ürün Seç
              </button>
              <button
                onClick={addBlankItem}
                className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Kalem Ekle
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
              <p className="text-slate-400">Henüz kalem yok. Ürün seç veya manuel ekle.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, i) => (
                <ItemRow
                  key={i}
                  item={item}
                  index={i}
                  onChange={(field, value) => updateItem(i, field, value)}
                  onRemove={() => removeItem(i)}
                  onMoveUp={() => moveItem(i, -1)}
                  onMoveDown={() => moveItem(i, 1)}
                  isFirst={i === 0}
                  isLast={i === items.length - 1}
                />
              ))}
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={saveItems}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Kalemleri Kaydet
            </button>
          </div>
        </div>
      )}

      {tab === "info" && (
        <div className="px-4 py-5 sm:px-6">
          <div className="space-y-6 max-w-3xl">
            <section>
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-widest text-slate-400">Firma Bilgileri</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label">Kurum / Firma Adı</label>
                  <input value={form.firmaAdi} onChange={setField("firmaAdi")} className="input w-full text-sm" placeholder="Ankara Şehir Hastanesi" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Adres</label>
                  <input value={form.firmaAdres} onChange={setField("firmaAdres")} className="input w-full text-sm" />
                </div>
                <div>
                  <label className="label">Telefon</label>
                  <input value={form.firmaTelefon} onChange={setField("firmaTelefon")} className="input w-full text-sm" />
                </div>
                <div>
                  <label className="label">E-posta</label>
                  <input value={form.firmaEmail} onChange={setField("firmaEmail")} className="input w-full text-sm" />
                </div>
                <div>
                  <label className="label">Vergi Dairesi</label>
                  <input value={form.firmaVergiDairesi} onChange={setField("firmaVergiDairesi")} className="input w-full text-sm" />
                </div>
                <div>
                  <label className="label">Vergi No</label>
                  <input value={form.firmaVergiNo} onChange={setField("firmaVergiNo")} className="input w-full text-sm" />
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-widest text-slate-400">Teslimat ve Ödeme</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label">Teslimat Adresi</label>
                  <input value={form.teslimatAdresi} onChange={setField("teslimatAdresi")} className="input w-full text-sm" />
                </div>
                <div>
                  <label className="label">Teslimat Süresi</label>
                  <input value={form.teslimatSuresi} onChange={setField("teslimatSuresi")} className="input w-full text-sm" />
                </div>
                <div>
                  <label className="label">Ödeme Şekli</label>
                  <input value={form.odemeSekli} onChange={setField("odemeSekli")} className="input w-full text-sm" />
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-widest text-slate-400">Fiyatlandırma</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="label">Para Birimi</label>
                  <select value={form.paraBirimi} onChange={setField("paraBirimi")} className="input w-full text-sm">
                    {["EUR", "USD", "TRY", "GBP"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">İskonto (%)</label>
                  <input type="number" min={0} max={100} value={form.iskonto} onChange={setField("iskonto")} className="input w-full text-sm" />
                </div>
                <div>
                  <label className="label">KDV (%)</label>
                  <input type="number" min={0} max={100} value={form.kdv} onChange={setField("kdv")} className="input w-full text-sm" />
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-widest text-slate-400">Dahil Hizmetler</h2>
              <textarea
                value={form.hizmetlerText}
                onChange={setField("hizmetlerText")}
                className="input w-full text-sm"
                rows={7}
                placeholder="Her satır bir hizmet maddesi"
              />
              <p className="mt-1 text-xs text-slate-400">Her satır PDF'te ayrı madde olarak görünür</p>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-widest text-slate-400">Genel Şartlar</h2>
              <textarea
                value={form.sartlarText}
                onChange={setField("sartlarText")}
                className="input w-full text-sm"
                rows={7}
                placeholder="Her satır bir şart maddesi"
              />
            </section>

            <section>
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-widest text-slate-400">Notlar</h2>
              <textarea
                value={form.notlar}
                onChange={setField("notlar")}
                className="input w-full text-sm"
                rows={3}
                placeholder="Ek açıklamalar..."
              />
            </section>

            <section>
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-widest text-slate-400">Teklifi Hazırlayan</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="label">Ad Soyad</label>
                  <input value={form.hazirlayan} onChange={setField("hazirlayan")} className="input w-full text-sm" />
                </div>
                <div>
                  <label className="label">Telefon</label>
                  <input value={form.hazirlayanTelefon} onChange={setField("hazirlayanTelefon")} className="input w-full text-sm" />
                </div>
                <div>
                  <label className="label">E-posta</label>
                  <input value={form.hazirlayanEmail} onChange={setField("hazirlayanEmail")} className="input w-full text-sm" />
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-widest text-slate-400">Teklifi Onaylayan</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="label">Ad Soyad</label>
                  <input value={form.onaylayan} onChange={setField("onaylayan")} className="input w-full text-sm" />
                </div>
                <div>
                  <label className="label">Görev</label>
                  <input value={form.onaytayanGorev} onChange={setField("onaytayanGorev")} className="input w-full text-sm" />
                </div>
                <div>
                  <label className="label">Onay Tarihi</label>
                  <input value={form.onayTarihi} onChange={setField("onayTarihi")} className="input w-full text-sm" placeholder="24.05.2026" />
                </div>
              </div>
            </section>

            <div className="flex justify-end pb-6">
              <button
                onClick={saveInfo}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Bilgileri Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {showProductModal && (
        <ProductSelectorModal
          token={token}
          onSelect={addFromProduct}
          onClose={() => setShowProductModal(false)}
        />
      )}
    </div>
  );
}
