import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Factory, CheckCircle2, AlertCircle, Package,
  Play, Box, ClipboardCheck, QrCode, ShieldCheck, RefreshCw,
  Copy, ExternalLink, Trash2, Printer, Plus, X, Layers,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

const STATUS_LABELS: Record<string, string> = {
  bekliyor: "Bekliyor",
  stok_kontrolunde: "Stok Kontrolünde",
  stoktan_karsilanabilir: "Stoktan Karşılanabilir",
  malzeme_kontrolunde: "Malzeme Kontrolünde",
  malzeme_eksik: "Malzeme Eksik",
  uretime_hazir: "Üretime Hazır",
  uretimde: "Üretimde",
  kalite_kontrolde: "Kalite Kontrolde",
  tamamlandi: "Tamamlandı",
  stokta: "Stokta",
  sevkiyata_hazir: "Sevkiyata Hazır",
  sevk_edildi: "Sevk Edildi",
  kurulum_bekliyor: "Kurulum Bekliyor",
  garanti_baslatildi: "Garanti Başlatıldı",
  iptal: "İptal",
};

const STATUS_COLORS: Record<string, string> = {
  bekliyor: "bg-slate-100 text-slate-700",
  stok_kontrolunde: "bg-blue-100 text-blue-700",
  stoktan_karsilanabilir: "bg-amber-100 text-amber-700",
  malzeme_kontrolunde: "bg-blue-100 text-blue-700",
  malzeme_eksik: "bg-red-100 text-red-700",
  uretime_hazir: "bg-amber-100 text-amber-700",
  uretimde: "bg-purple-100 text-purple-700",
  kalite_kontrolde: "bg-indigo-100 text-indigo-700",
  tamamlandi: "bg-emerald-100 text-emerald-700",
  stokta: "bg-emerald-100 text-emerald-700",
  sevkiyata_hazir: "bg-teal-100 text-teal-700",
  sevk_edildi: "bg-teal-100 text-teal-700",
  kurulum_bekliyor: "bg-orange-100 text-orange-700",
  garanti_baslatildi: "bg-green-100 text-green-700",
  iptal: "bg-red-100 text-red-600",
};

const ALL_STATUSES = Object.keys(STATUS_LABELS);

const QUALITY_LABELS: Record<string, string> = {
  elektrik_baglantilari: "Elektrik Bağlantıları",
  vakum_testi: "Vakum Testi",
  kacak_testi: "Kaçak Testi",
  pano_testi: "Pano Testi",
  hmi_kontrol: "HMI Kontrol",
  filtreler: "Filtreler",
  seri_no_etiketi: "Seri No Etiketi",
  qr_test: "QR Test",
  urun_fotografi: "Ürün Fotoğrafı",
  final_kontrol: "Final Kontrol",
};

interface OrderItem {
  id: number;
  orderId: number;
  serialNumber: string | null;
  qrToken: string | null;
  warrantyDeviceId: number | null;
  status: string;
  qualityChecklist: Record<string, boolean> | null;
  productionDate: string | null;
  notes: string | null;
}

interface Reservation {
  id: number;
  materialId: number;
  reservedQty: number;
  materialName: string | null;
  unit: string | null;
}

interface Order {
  id: number;
  orderNo: string;
  productId: number | null;
  productTitle: string;
  productCode: string | null;
  quantity: number;
  status: string;
  quoteFormId: number | null;
  customerName: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  reservations: Reservation[];
}

interface StockCheckResult {
  available: boolean;
  stockQty: number;
  needed: number;
  message?: string;
}

interface MaterialCheckItem {
  materialId: number;
  materialName: string | null;
  unit: string | null;
  needed: number;
  inStock: number;
  sufficient: boolean;
  shortage: number;
}

interface MaterialCheckResult {
  canProduce: boolean;
  items: MaterialCheckItem[];
  message?: string;
}

interface BomItem {
  id: number;
  materialId: number;
  requiredQty: number;
  materialName: string | null;
  unit: string | null;
  inStock: number | null;
  productCode: string | null;
}

const TABS = [
  { id: "genel", label: "Genel Bilgiler", icon: Factory },
  { id: "stok", label: "Stok Kontrolü", icon: Package },
  { id: "malzeme", label: "Malzeme & BOM", icon: Box },
  { id: "seriler", label: "Seri Numaraları", icon: QrCode },
  { id: "kalite", label: "Kalite Kontrol", icon: ClipboardCheck },
  { id: "etiket", label: "QR & Etiketler", icon: Printer },
  { id: "garanti", label: "Garanti", icon: ShieldCheck },
];

export default function ProductionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authFetch } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("genel");

  const [stockCheck, setStockCheck] = useState<StockCheckResult | null>(null);
  const [materialCheck, setMaterialCheck] = useState<MaterialCheckResult | null>(null);
  const [bom, setBom] = useState<BomItem[] | null>(null);

  const [actionLoading, setActionLoading] = useState("");
  const [statusChanging, setStatusChanging] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  // BOM editing
  const [bomMaterials, setBomMaterials] = useState<{ id: number; name: string; unit: string }[]>([]);
  const [newBomMaterialId, setNewBomMaterialId] = useState<number | "">("");
  const [newBomQty, setNewBomQty] = useState(1);
  const [bomSaving, setBomSaving] = useState(false);

  // Consolidated materials (all orders for the same quote)
  type ConsolidatedItem = {
    materialId: number;
    materialName: string;
    productCode: string | null;
    unit: string;
    inStock: number;
    price: string | null;
    totalRequired: number;
    breakdown: Array<{ productTitle: string; orderQty: number; bomQty: number; lineQty: number }>;
  };
  const [consolidatedMaterials, setConsolidatedMaterials] = useState<ConsolidatedItem[] | null>(null);
  const [consolidatedLoading, setConsolidatedLoading] = useState(false);
  const [consolidatedExpanded, setConsolidatedExpanded] = useState<number | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await authFetch(`/api/production/orders/${id}`);
      if (!res.ok) { toast.error("Üretim emri bulunamadı"); navigate("/admin/uretim"); return; }
      const data = await res.json();
      setOrder(data);
      setSelectedStatus(data.status);
    } catch {
      toast.error("Yükleme hatası");
    } finally {
      setIsLoading(false);
    }
  }, [authFetch, id, navigate]);

  useEffect(() => { load(); }, [load]);

  async function loadBom() {
    if (!order?.productId) return;
    const res = await authFetch(`/api/production/bom/${order.productId}`);
    if (res.ok) setBom(await res.json());
  }

  async function loadMaterials() {
    const res = await authFetch("/api/stock/materials");
    if (res.ok) {
      const data = await res.json();
      setBomMaterials(data.items ?? data);
    }
  }

  async function saveBom(newBom: { materialId: number; requiredQty: number }[]) {
    if (!order?.productId) return;
    setBomSaving(true);
    try {
      const res = await authFetch(`/api/production/bom/${order.productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBom),
      });
      if (!res.ok) throw new Error();
      setBom(await res.json());
      toast.success("BOM güncellendi");
    } catch {
      toast.error("BOM kaydedilemedi");
    } finally {
      setBomSaving(false);
    }
  }

  async function addBomItem() {
    if (!newBomMaterialId || newBomQty < 1) return;
    const existing = bom ?? [];
    if (existing.some((b) => b.materialId === newBomMaterialId)) {
      toast.error("Bu malzeme zaten BOM'da var");
      return;
    }
    await saveBom([...existing.map((b) => ({ materialId: b.materialId, requiredQty: b.requiredQty })), { materialId: Number(newBomMaterialId), requiredQty: newBomQty }]);
    setNewBomMaterialId("");
    setNewBomQty(1);
  }

  async function removeBomItem(materialId: number) {
    const existing = bom ?? [];
    await saveBom(existing.filter((b) => b.materialId !== materialId).map((b) => ({ materialId: b.materialId, requiredQty: b.requiredQty })));
  }

  useEffect(() => {
    if (activeTab === "malzeme" && order?.productId) {
      if (bom === null) loadBom();
      if (bomMaterials.length === 0) loadMaterials();
    }
    if (activeTab === "siparis-malzeme" && order?.quoteFormId && consolidatedMaterials === null) {
      setConsolidatedLoading(true);
      authFetch(`/api/production/consolidated-materials?quoteFormId=${order.quoteFormId}`)
        .then((r) => r.json())
        .then((d: { items: ConsolidatedItem[] }) => setConsolidatedMaterials(d.items ?? []))
        .catch(() => toast.error("Konsolide malzeme listesi yüklenemedi"))
        .finally(() => setConsolidatedLoading(false));
    }
  }, [activeTab, order?.productId, order?.quoteFormId]);

  async function checkStock() {
    setActionLoading("stock");
    try {
      const res = await authFetch(`/api/production/orders/${id}/check-stock`, { method: "POST" });
      if (!res.ok) throw new Error();
      setStockCheck(await res.json());
    } catch {
      toast.error("Stok kontrolü başarısız");
    } finally {
      setActionLoading("");
    }
  }

  async function checkMaterials() {
    setActionLoading("materials");
    try {
      const res = await authFetch(`/api/production/orders/${id}/check-materials`, { method: "POST" });
      if (!res.ok) throw new Error();
      setMaterialCheck(await res.json());
    } catch {
      toast.error("Malzeme kontrolü başarısız");
    } finally {
      setActionLoading("");
    }
  }

  async function startProduction() {
    if (!confirm(`${order?.quantity} adet için üretim başlatılacak, malzemeler rezerve edilecek ve seri numaraları oluşturulacak. Onaylıyor musunuz?`)) return;
    setActionLoading("start");
    try {
      const res = await authFetch(`/api/production/orders/${id}/start`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Üretim başlatılamadı"); return; }
      toast.success(`${order?.quantity} adet için seri numaraları oluşturuldu`);
      load();
    } catch {
      toast.error("Üretim başlatılamadı");
    } finally {
      setActionLoading("");
    }
  }

  async function assignFromStock() {
    if (!confirm("Ürün stoğundan karşılanacak. Stok miktarı düşürülecek. Onaylıyor musunuz?")) return;
    setActionLoading("assign");
    try {
      const res = await authFetch(`/api/production/orders/${id}/assign-from-stock`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "İşlem başarısız"); return; }
      toast.success("Stoktan karşılandı, seri numaraları oluşturuldu");
      load();
    } catch {
      toast.error("İşlem başarısız");
    } finally {
      setActionLoading("");
    }
  }

  async function changeStatus() {
    if (!selectedStatus || selectedStatus === order?.status) return;
    setStatusChanging(true);
    try {
      const res = await authFetch(`/api/production/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success("Durum güncellendi");
      load();
    } catch {
      toast.error("Durum güncellenemedi");
    } finally {
      setStatusChanging(false);
    }
  }

  async function deleteOrder() {
    if (!confirm("Bu üretim emrini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) return;
    try {
      const res = await authFetch(`/api/production/orders/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Üretim emri silindi");
      navigate("/admin/uretim");
    } catch {
      toast.error("Silme başarısız");
    }
  }

  async function updateItemQuality(itemId: number, key: string, value: boolean) {
    const item = order?.items.find((i) => i.id === itemId);
    if (!item) return;
    const updated = { ...(item.qualityChecklist ?? {}), [key]: value };
    try {
      const res = await authFetch(`/api/production/orders/${id}/items/${itemId}/quality`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checklist: updated }),
      });
      if (!res.ok) throw new Error();
      setOrder((o) => o ? {
        ...o,
        items: o.items.map((i) => i.id === itemId ? { ...i, qualityChecklist: updated } : i),
      } : o);
    } catch {
      toast.error("Güncellenemedi");
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => toast.success("Kopyalandı"));
  }

  async function downloadLabelPdf() {
    if (!order || order.items.length === 0) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [60, 80] });
    toast.info("PDF hazırlanıyor...");
    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i];
      if (!item.qrToken) continue;
      if (i > 0) doc.addPage();
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(item.qrToken)}`;
      try {
        const resp = await fetch(qrUrl);
        const blob = await resp.blob();
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        doc.addImage(dataUrl, "PNG", 10, 8, 40, 40);
      } catch { /* skip QR image on error */ }
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(item.serialNumber ?? "", 30, 55, { align: "center" });
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(order.productTitle, 30, 61, { align: "center" });
      if (order.productCode) doc.text(order.productCode, 30, 67, { align: "center" });
      doc.setFontSize(6);
      doc.setTextColor(120);
      doc.text(`${order.orderNo} · #${i + 1}`, 30, 73, { align: "center" });
      doc.setTextColor(0);
    }
    doc.save(`${order.orderNo}-etiketler.pdf`);
    toast.success("PDF indirildi");
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}
        </div>
      </div>
    );
  }

  if (!order) return null;

  const allChecked = (checklist: Record<string, boolean> | null) =>
    checklist ? Object.values(checklist).every(Boolean) : false;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/admin/uretim"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Üretim Listesi
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-slate-900">{order.orderNo}</h1>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_COLORS[order.status] ?? "bg-slate-100 text-slate-600"}`}>
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
            <p className="text-slate-600 font-semibold">{order.productTitle}</p>
            {order.productCode && <p className="text-sm text-slate-500">{order.productCode} · {order.quantity} adet</p>}
            {order.customerName && <p className="text-sm text-slate-500">Müşteri: {order.customerName}</p>}
          </div>
          <button
            onClick={deleteOrder}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" /> Sil
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
        {[
          ...TABS,
          ...(order.quoteFormId
            ? [{ id: "siparis-malzeme", label: "Sipariş Malzemeleri", icon: Layers }]
            : []),
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab: Genel ─────────────────────────────────────────────────────── */}
      {activeTab === "genel" && (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-slate-700 uppercase tracking-wide">Emir Bilgileri</h2>
            <dl className="space-y-3 text-sm">
              {[
                ["Emir No", order.orderNo],
                ["Ürün", order.productTitle],
                ["Ürün Kodu", order.productCode ?? "—"],
                ["Miktar", `${order.quantity} adet`],
                ["Müşteri", order.customerName ?? "—"],
                ["Teklif Bağlantısı", order.quoteFormId ? `#${order.quoteFormId}` : "—"],
                ["Oluşturma", new Date(order.createdAt).toLocaleString("tr-TR")],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-slate-500 shrink-0">{label}</dt>
                  <dd className="font-semibold text-slate-900 text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-slate-700 uppercase tracking-wide">Durum Güncelle</h2>
            <div className="space-y-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-purple-500 focus:outline-none"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
              <button
                onClick={changeStatus}
                disabled={statusChanging || selectedStatus === order.status}
                className="w-full rounded-lg bg-purple-600 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
              >
                {statusChanging ? "Güncelleniyor..." : "Durumu Güncelle"}
              </button>
            </div>

            {order.notes && (
              <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3">
                <p className="text-xs font-semibold text-amber-700 mb-1">Notlar</p>
                <p className="text-sm text-amber-800">{order.notes}</p>
              </div>
            )}

            <div className="mt-4">
              <h3 className="mb-2 text-sm font-bold text-slate-700">Üretim Özeti</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-slate-50 p-3 text-center">
                  <p className="text-2xl font-bold text-slate-900">{order.items.length}</p>
                  <p className="text-xs text-slate-500">Oluşturulan</p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-700">
                    {order.items.filter((i) => allChecked(i.qualityChecklist)).length}
                  </p>
                  <p className="text-xs text-slate-500">Kalite Geçti</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Stok Kontrolü ─────────────────────────────────────────────── */}
      {activeTab === "stok" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-slate-900">Mamul Ürün Stok Kontrolü</h2>
            <p className="mb-5 text-sm text-slate-500">
              Bu sipariş için yeterli mamul ürün stokta var mı kontrol edin. Stok mevcutsa, üretime gerek kalmadan buradan karşılayabilirsiniz.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={checkStock}
                disabled={actionLoading === "stock"}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${actionLoading === "stock" ? "animate-spin" : ""}`} />
                Stok Kontrol Et
              </button>
              {stockCheck?.available && (
                <button
                  onClick={assignFromStock}
                  disabled={actionLoading === "assign"}
                  className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Stoktan Karşıla
                </button>
              )}
            </div>

            {stockCheck && (
              <div className={`mt-5 rounded-xl border p-5 ${stockCheck.available ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
                {stockCheck.message ? (
                  <p className="text-sm text-slate-600">{stockCheck.message}</p>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      {stockCheck.available
                        ? <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        : <AlertCircle className="h-5 w-5 text-red-600" />}
                      <p className={`font-bold ${stockCheck.available ? "text-emerald-700" : "text-red-700"}`}>
                        {stockCheck.available ? "Yeterli stok mevcut" : "Yetersiz stok"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Gereken</p>
                        <p className="text-xl font-bold text-slate-900">{stockCheck.needed} adet</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Mevcut Stok</p>
                        <p className={`text-xl font-bold ${stockCheck.available ? "text-emerald-700" : "text-red-700"}`}>
                          {stockCheck.stockQty} adet
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {order.reservations.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-slate-900">Rezerve Edilen Malzemeler</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="pb-2">Malzeme</th>
                    <th className="pb-2 text-right">Rezerve Miktar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.reservations.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2 font-semibold text-slate-800">{r.materialName ?? `#${r.materialId}`}</td>
                      <td className="py-2 text-right text-slate-700">{r.reservedQty} {r.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Malzeme & BOM ─────────────────────────────────────────────── */}
      {activeTab === "malzeme" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-base font-bold text-slate-900">Malzeme Listesi (BOM)</h2>
            {!order.productId ? (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">
                Bu üretim emrinde ürün bağlantısı yok. BOM kontrolü için ürün ID bağlantısı gereklidir.
              </div>
            ) : bom === null ? (
              <div className="animate-pulse h-20 rounded-xl bg-slate-100" />
            ) : (
              <>
                {bom.length === 0 ? (
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-sm text-slate-500">
                    Bu ürün için henüz BOM tanımlanmamış. Aşağıdan malzeme ekleyebilirsiniz.
                  </div>
                ) : (
                  <table className="w-full text-sm mt-3">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <th className="pb-2">Malzeme</th>
                        <th className="pb-2 text-center">Birim Gerek.</th>
                        <th className="pb-2 text-center">Toplam</th>
                        <th className="pb-2 text-right">Stok</th>
                        <th className="pb-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bom.map((b) => {
                        const totalNeeded = b.requiredQty * order.quantity;
                        const inStock = b.inStock ?? 0;
                        const ok = inStock >= totalNeeded;
                        return (
                          <tr key={b.id}>
                            <td className="py-2.5 font-semibold text-slate-800">{b.materialName ?? `#${b.materialId}`}</td>
                            <td className="py-2.5 text-center text-slate-600">{b.requiredQty} {b.unit}</td>
                            <td className="py-2.5 text-center font-bold text-slate-900">{totalNeeded} {b.unit}</td>
                            <td className="py-2.5 text-right">
                              <span className={`font-bold ${ok ? "text-emerald-600" : "text-red-600"}`}>
                                {inStock} {b.unit}
                              </span>
                            </td>
                            <td className="py-2.5 text-right">
                              <button
                                onClick={() => removeBomItem(b.materialId)}
                                disabled={bomSaving}
                                className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                                title="Kaldır"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                {/* BOM Add form */}
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Malzeme Ekle</p>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={newBomMaterialId}
                      onChange={(e) => setNewBomMaterialId(e.target.value ? Number(e.target.value) : "")}
                      className="flex-1 min-w-40 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                    >
                      <option value="">Malzeme seçin...</option>
                      {bomMaterials.map((m) => (
                        <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      value={newBomQty}
                      onChange={(e) => setNewBomQty(parseInt(e.target.value) || 1)}
                      className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm text-center focus:border-purple-500 focus:outline-none"
                      placeholder="Adet"
                    />
                    <button
                      onClick={addBomItem}
                      disabled={!newBomMaterialId || bomSaving}
                      className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" /> Ekle
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-slate-900">Malzeme Kontrolü & Üretim Başlatma</h2>
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={checkMaterials}
                disabled={actionLoading === "materials"}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${actionLoading === "materials" ? "animate-spin" : ""}`} />
                Malzeme Kontrol Et
              </button>

              {order.items.length === 0 && (
                <button
                  onClick={startProduction}
                  disabled={actionLoading === "start"}
                  className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  <Play className="h-4 w-4" />
                  {actionLoading === "start" ? "Başlatılıyor..." : "Üretime Al"}
                </button>
              )}
            </div>

            {materialCheck && (
              <div className={`rounded-xl border p-5 ${materialCheck.canProduce ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
                <div className="flex items-center gap-2 mb-3">
                  {materialCheck.canProduce
                    ? <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    : <AlertCircle className="h-5 w-5 text-red-600" />}
                  <p className={`font-bold ${materialCheck.canProduce ? "text-emerald-700" : "text-red-700"}`}>
                    {materialCheck.message ?? (materialCheck.canProduce ? "Yeterli malzeme mevcut, üretime başlanabilir" : "Yetersiz malzeme — üretim başlatılamaz")}
                  </p>
                </div>
                {materialCheck.items.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {materialCheck.items.map((item) => (
                      <div key={item.materialId} className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${item.sufficient ? "bg-emerald-100" : "bg-red-100"}`}>
                        <span className="font-semibold">{item.materialName}</span>
                        <span className={item.sufficient ? "text-emerald-700" : "text-red-700 font-bold"}>
                          {item.sufficient ? `✓ ${item.inStock}/${item.needed} ${item.unit}` : `✗ Eksik: ${item.shortage} ${item.unit}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Seri Numaraları ───────────────────────────────────────────── */}
      {activeTab === "seriler" && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-base font-bold text-slate-900">Seri Numaraları & QR Kodlar</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {order.items.length} / {order.quantity} adet oluşturuldu
            </p>
          </div>
          {order.items.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">
              Seri numaraları henüz oluşturulmadı. "Üretime Al" veya "Stoktan Karşıla" işlemini gerçekleştirin.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {order.items.map((item, idx) => (
                <div key={item.id} className="px-6 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">#{idx + 1}</p>
                      <p className="font-mono font-bold text-slate-900 text-base">{item.serialNumber ?? "—"}</p>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">{item.qrToken}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_COLORS[item.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {STATUS_LABELS[item.status] ?? item.status}
                      </span>
                      {item.serialNumber && (
                        <button
                          onClick={() => copyToClipboard(item.serialNumber!)}
                          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 hover:border-blue-300 hover:text-blue-600"
                        >
                          <Copy className="h-3 w-3" /> Seri No
                        </button>
                      )}
                      {item.qrToken && (
                        <a
                          href={`/servis/qr/${item.qrToken}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 hover:border-purple-300 hover:text-purple-600"
                        >
                          <ExternalLink className="h-3 w-3" /> QR Sayfa
                        </a>
                      )}
                    </div>
                  </div>
                  {item.productionDate && (
                    <p className="text-xs text-slate-400 mt-1.5">Üretim tarihi: {item.productionDate}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Kalite Kontrol ───────────────────────────────────────────── */}
      {activeTab === "kalite" && (
        <div className="space-y-4">
          {order.items.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
              Seri numaraları oluşturulmadan kalite kontrol yapılamaz.
            </div>
          ) : (
            order.items.map((item, idx) => {
              const checklist = item.qualityChecklist ?? {};
              const checkedCount = Object.values(checklist).filter(Boolean).length;
              const totalCount = Object.keys(QUALITY_LABELS).length;
              const pct = Math.round((checkedCount / totalCount) * 100);
              return (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <div>
                      <p className="font-bold text-slate-900">#{idx + 1} — {item.serialNumber ?? "Seri No Yok"}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="h-1.5 w-40 rounded-full bg-slate-200">
                          <div
                            className={`h-1.5 rounded-full transition-all ${pct === 100 ? "bg-emerald-500" : "bg-purple-500"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{checkedCount}/{totalCount}</span>
                      </div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${pct === 100 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {pct === 100 ? "✓ Geçti" : `%${pct}`}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 divide-slate-100">
                    {Object.entries(QUALITY_LABELS).map(([key, label]) => {
                      const checked = checklist[key] ?? false;
                      return (
                        <label
                          key={key}
                          className="flex cursor-pointer items-center gap-3 px-6 py-3 hover:bg-slate-50 border-b border-slate-100"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => updateItemQuality(item.id, key, e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 accent-purple-600"
                          />
                          <span className={`text-sm ${checked ? "font-semibold text-emerald-700" : "text-slate-700"}`}>
                            {label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Tab: QR & Etiketler ──────────────────────────────────────────── */}
      {activeTab === "etiket" && (
        <div className="space-y-4">
          {order.items.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
              Seri numaraları oluşturulmadan QR etiket görüntülenemez. Önce "Üretime Al" işlemini yapın.
            </div>
          ) : (
            <>
              {/* Print / PDF actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <div>
                  <p className="font-bold text-slate-900">{order.items.length} adet QR etiket</p>
                  <p className="text-sm text-slate-500">{order.productTitle} · {order.orderNo}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={downloadLabelPdf}
                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    <Printer className="h-4 w-4" /> PDF İndir (jsPDF)
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700"
                  >
                    <Printer className="h-4 w-4" /> Tarayıcıdan Yazdır
                  </button>
                </div>
              </div>

              {/* QR card grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3">
                {order.items.map((item, idx) => {
                  if (!item.qrToken) return null;
                  const qrData = encodeURIComponent(item.qrToken);
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;
                  const qrDownloadUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${qrData}`;
                  return (
                    <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col items-center gap-3 print:border print:shadow-none print:break-inside-avoid">
                      <p className="text-xs text-slate-400 font-semibold self-start">#{idx + 1}</p>
                      <img
                        src={qrUrl}
                        alt={`QR ${item.serialNumber}`}
                        className="w-32 h-32 rounded-lg border border-slate-100"
                      />
                      <div className="text-center">
                        <p className="font-mono font-bold text-slate-900 text-sm">{item.serialNumber}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{order.productTitle}</p>
                        {order.productCode && <p className="text-xs text-slate-400">{order.productCode}</p>}
                      </div>
                      <div className="flex gap-2 print:hidden">
                        <button
                          onClick={() => copyToClipboard(item.serialNumber!)}
                          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 hover:border-blue-300 hover:text-blue-600"
                        >
                          <Copy className="h-3 w-3" /> Kopyala
                        </button>
                        <a
                          href={qrDownloadUrl}
                          download={`qr-${item.serialNumber}.png`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 hover:border-emerald-300 hover:text-emerald-600"
                        >
                          <Printer className="h-3 w-3" /> PNG İndir
                        </a>
                        <a
                          href={`/servis/qr/${item.qrToken}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 hover:border-purple-300 hover:text-purple-600"
                        >
                          <ExternalLink className="h-3 w-3" /> QR Sayfa
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Tab: Sipariş Malzemeleri ──────────────────────────────────────── */}
      {activeTab === "siparis-malzeme" && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-base font-bold text-slate-900">Konsolide Malzeme Listesi</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Teklif #{order.quoteFormId} kapsamındaki tüm üretim emirlerinin toplam malzeme ihtiyacı
            </p>
          </div>
          {consolidatedLoading ? (
            <div className="flex h-40 items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-slate-300" />
            </div>
          ) : !consolidatedMaterials || consolidatedMaterials.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">
              Bu teklife bağlı ürünlerde BOM tanımlı değil veya malzeme bulunamadı.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-200">
                    <th className="px-5 py-3">Malzeme</th>
                    <th className="px-3 py-3">Kod</th>
                    <th className="px-3 py-3 text-center">Birim</th>
                    <th className="px-3 py-3 text-center">Stokta</th>
                    <th className="px-3 py-3 text-center">Toplam İhtiyaç</th>
                    <th className="px-3 py-3 text-center">Eksik</th>
                    <th className="px-3 py-3 text-right">Birim Fiyat</th>
                    <th className="px-3 py-3 text-right">Toplam Maliyet</th>
                    <th className="px-3 py-3 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {consolidatedMaterials.map((mat) => {
                    const shortage = Math.max(0, mat.totalRequired - mat.inStock);
                    const price = parseFloat(mat.price ?? "0") || 0;
                    const totalCost = price * mat.totalRequired;
                    const isExpanded = consolidatedExpanded === mat.materialId;
                    return (
                      <>
                        <tr
                          key={mat.materialId}
                          className={`hover:bg-slate-50 cursor-pointer ${shortage > 0 ? "bg-red-50/40" : ""}`}
                          onClick={() =>
                            setConsolidatedExpanded(isExpanded ? null : mat.materialId)
                          }
                        >
                          <td className="px-5 py-3 font-semibold text-slate-900">
                            {mat.materialName}
                          </td>
                          <td className="px-3 py-3 font-mono text-xs text-slate-400">
                            {mat.productCode ?? "—"}
                          </td>
                          <td className="px-3 py-3 text-center text-slate-600">{mat.unit}</td>
                          <td className="px-3 py-3 text-center">
                            <span className={mat.inStock < mat.totalRequired ? "text-red-600 font-bold" : "text-emerald-600 font-bold"}>
                              {mat.inStock}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center font-bold text-slate-900">
                            {mat.totalRequired % 1 === 0 ? mat.totalRequired : mat.totalRequired.toFixed(3)}
                          </td>
                          <td className="px-3 py-3 text-center">
                            {shortage > 0 ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                                <AlertCircle className="h-3 w-3" /> {shortage % 1 === 0 ? shortage : shortage.toFixed(3)} eksik
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                                <CheckCircle2 className="h-3 w-3" /> Yeterli
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-right text-slate-600">
                            {price > 0 ? price.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " ₺" : "—"}
                          </td>
                          <td className="px-3 py-3 text-right font-bold text-slate-900">
                            {totalCost > 0 ? totalCost.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " ₺" : "—"}
                          </td>
                          <td className="px-3 py-3 text-slate-400 text-xs">
                            {isExpanded ? "▲" : "▼"}
                          </td>
                        </tr>
                        {isExpanded && mat.breakdown.map((b, i) => (
                          <tr key={i} className="bg-blue-50/60">
                            <td className="pl-10 pr-3 py-2 text-xs text-slate-600 italic" colSpan={3}>
                              {b.productTitle}
                            </td>
                            <td />
                            <td className="py-2 text-center text-xs text-slate-600">
                              {b.bomQty} × {b.orderQty} = {b.lineQty % 1 === 0 ? b.lineQty : b.lineQty.toFixed(3)}
                            </td>
                            <td colSpan={4} />
                          </tr>
                        ))}
                      </>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                  <tr>
                    <td colSpan={7} className="px-5 py-3 text-right text-sm font-bold text-slate-600">
                      Toplam Malzeme Maliyeti
                    </td>
                    <td className="px-3 py-3 text-right text-base font-bold text-emerald-700">
                      {consolidatedMaterials
                        .reduce((sum, m) => sum + (parseFloat(m.price ?? "0") || 0) * m.totalRequired, 0)
                        .toLocaleString("tr-TR", { minimumFractionDigits: 2 })}{" "}₺
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Garanti ─────────────────────────────────────────────────── */}
      {activeTab === "garanti" && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-base font-bold text-slate-900">Garanti Taslakları</h2>
            <p className="text-sm text-slate-500 mt-0.5">Her seri numarasına otomatik oluşturulan garanti cihaz kayıtları</p>
          </div>
          {order.items.filter((i) => i.warrantyDeviceId).length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">
              Garanti cihazı henüz oluşturulmadı. Üretimi başlatın.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {order.items.filter((i) => i.warrantyDeviceId).map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-mono font-bold text-slate-900">{item.serialNumber}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Garanti Cihaz #{item.warrantyDeviceId} · Durum: Taslak</p>
                  </div>
                  <Link
                    to={`/admin/garanti/${item.warrantyDeviceId}`}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                  >
                    <ExternalLink className="h-3 w-3" /> Garanti Detayı
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
