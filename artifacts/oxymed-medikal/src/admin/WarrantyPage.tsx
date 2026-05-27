import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  useListWarrantyDevices,
  useCreateWarrantyDevice,
  useUpdateWarrantyDevice,
  useDeleteWarrantyDevice,
  useListWarrantyAlerts,
  getListWarrantyDevicesQueryKey,
  getListWarrantyAlertsQueryKey,
} from "@workspace/api-client-react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Bell,
  Eye,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "aktif_garanti",     label: "Aktif Garanti",          cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  { value: "yakin_bitis",       label: "Yakında Bitecek",        cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  { value: "garanti_disi",      label: "Garanti Dışı",           cls: "bg-red-50 text-red-700 ring-red-200" },
  { value: "bakim_riskli",      label: "Bakım Riskli",           cls: "bg-orange-50 text-orange-700 ring-orange-200" },
  { value: "yetkisiz_askida",   label: "Yetkisiz — Askıda",      cls: "bg-purple-50 text-purple-700 ring-purple-200" },
  { value: "uzatilmis_garanti", label: "Uzatılmış Garanti",      cls: "bg-blue-50 text-blue-700 ring-blue-200" },
  { value: "bakim_anlasmasi",   label: "Bakım Anlaşması",        cls: "bg-teal-50 text-teal-700 ring-teal-200" },
  { value: "talep_incelemede",  label: "Talep İncelemede",       cls: "bg-yellow-50 text-yellow-700 ring-yellow-200" },
  { value: "talep_onaylandi",   label: "Talep Onaylandı",        cls: "bg-green-50 text-green-700 ring-green-200" },
  { value: "talep_reddedildi",  label: "Talep Reddedildi",       cls: "bg-rose-50 text-rose-700 ring-rose-200" },
];

const ALERT_TYPE_LABELS: Record<string, string> = {
  warranty_expiring:  "Garanti bitimine yakın",
  warranty_expired:   "Garanti sona erdi",
  maintenance_overdue:"Bakım gecikti",
  maintenance_due:    "Bakım zamanı geldi",
};

const ALERT_COLORS: Record<string, string> = {
  warranty_expiring:  "text-amber-600 bg-amber-50",
  warranty_expired:   "text-red-600 bg-red-50",
  maintenance_overdue:"text-rose-600 bg-rose-50",
  maintenance_due:    "text-orange-600 bg-orange-50",
};

function statusLabel(v: string) {
  return STATUS_OPTIONS.find((o) => o.value === v)?.label ?? v;
}
function statusCls(v: string) {
  return STATUS_OPTIONS.find((o) => o.value === v)?.cls ?? "bg-slate-100 text-slate-500 ring-slate-200";
}

// ─── Device form modal ────────────────────────────────────────────────────────

const EMPTY_FORM = {
  productName: "", model: "", serialNumber: "", customerFirm: "",
  deviceType: "", plcSystem: "", hmiModel: "", productionDate: "",
  customerDepartment: "", customerLocation: "",
  customerContact: "", customerPhone: "", customerEmail: "",
  installDate: "", warrantyStartDate: "", warrantyEndDate: "",
  warrantyType: "", maintenanceContractStatus: "", lastMaintenanceDate: "",
  nextMaintenanceDate: "", status: "aktif_garanti", notes: "", imageUrl: "",
};

function DeviceFormModal({
  initial,
  onClose,
  onSave,
  saving,
}: {
  initial?: typeof EMPTY_FORM & { id?: number };
  onClose: () => void;
  onSave: (data: typeof EMPTY_FORM) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<typeof EMPTY_FORM>(initial ?? EMPTY_FORM);
  const set = (k: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">{initial?.id ? "Cihazı Düzenle" : "Yeni Cihaz Ekle"}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ürün Adı *"><input className="input" value={form.productName} onChange={set("productName")} placeholder="Medikal Vakum Santrali" /></Field>
            <Field label="Model *"><input className="input" value={form.model} onChange={set("model")} placeholder="OXY-VAC PRO 3x250" /></Field>
            <Field label="Seri Numarası *"><input className="input" value={form.serialNumber} onChange={set("serialNumber")} placeholder="OXM-VAC-250-0148" /></Field>
            <Field label="Cihaz Türü"><input className="input" value={form.deviceType} onChange={set("deviceType")} placeholder="Gaz Merkezi Paneli" /></Field>
            <Field label="PLC Sistemi"><input className="input" value={form.plcSystem} onChange={set("plcSystem")} placeholder="Siemens S7-1200" /></Field>
            <Field label="HMI Modeli"><input className="input" value={form.hmiModel} onChange={set("hmiModel")} placeholder="KTP700 Basic" /></Field>
            <Field label="Üretim Tarihi"><input className="input" value={form.productionDate} onChange={set("productionDate")} placeholder="15.03.2024" /></Field>
            <Field label="Devreye Alma"><input className="input" type="date" value={form.installDate} onChange={set("installDate")} /></Field>
            <Field label="Müşteri Firma *"><input className="input" value={form.customerFirm} onChange={set("customerFirm")} placeholder="Ankara Şehir Hastanesi" /></Field>
            <Field label="Bölüm"><input className="input" value={form.customerDepartment} onChange={set("customerDepartment")} placeholder="Sterilizasyon" /></Field>
            <Field label="Lokasyon"><input className="input" value={form.customerLocation} onChange={set("customerLocation")} placeholder="Kat 3 / Teknik Oda" /></Field>
            <Field label="Sorumlu Kişi"><input className="input" value={form.customerContact} onChange={set("customerContact")} placeholder="Ad Soyad" /></Field>
            <Field label="İletişim / Tel"><input className="input" value={form.customerPhone} onChange={set("customerPhone")} placeholder="0312 000 00 00" /></Field>
            <Field label="E-posta"><input className="input" value={form.customerEmail} onChange={set("customerEmail")} placeholder="sorumlu@hastane.gov.tr" /></Field>
            <Field label="Garanti Başlangıç"><input className="input" type="date" value={form.warrantyStartDate} onChange={set("warrantyStartDate")} /></Field>
            <Field label="Garanti Bitiş"><input className="input" type="date" value={form.warrantyEndDate} onChange={set("warrantyEndDate")} /></Field>
            <Field label="Garanti Tipi"><input className="input" value={form.warrantyType} onChange={set("warrantyType")} placeholder="Standart 2 Yıl" /></Field>
            <Field label="Bakım Sözleşmesi"><input className="input" value={form.maintenanceContractStatus} onChange={set("maintenanceContractStatus")} placeholder="Aktif / Pasif" /></Field>
            <Field label="Son Bakım Tarihi"><input className="input" type="date" value={form.lastMaintenanceDate} onChange={set("lastMaintenanceDate")} /></Field>
            <Field label="Sonraki Bakım Tarihi"><input className="input" type="date" value={form.nextMaintenanceDate} onChange={set("nextMaintenanceDate")} /></Field>
            <Field label="Garanti Durumu">
              <select className="input" value={form.status} onChange={set("status")}>
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Görsel URL"><input className="input" value={form.imageUrl} onChange={set("imageUrl")} placeholder="https://..." /></Field>
          </div>
          <Field label="Notlar" className="mt-4">
            <textarea className="input min-h-[72px] resize-y" value={form.notes} onChange={set("notes")} placeholder="İlave notlar..." />
          </Field>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button className="btn-secondary" onClick={onClose}>İptal</button>
          <button className="btn-primary" disabled={saving || !form.productName || !form.model || !form.serialNumber || !form.customerFirm} onClick={() => onSave(form)}>
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-bold text-slate-500">{label}</label>
      {children}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function WarrantyPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"devices" | "alerts">("devices");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: devicesData, isLoading: devicesLoading } = useListWarrantyDevices({ limit: 200 });
  const { data: alertsData } = useListWarrantyAlerts();

  const devices = useMemo(() => {
    const all = devicesData?.items ?? [];
    const byStatus = statusFilter ? all.filter((d) => d.status === statusFilter) : all;
    if (!search.trim()) return byStatus;
    const q = search.toLowerCase();
    return byStatus.filter(
      (d) =>
        d.productName.toLowerCase().includes(q) ||
        d.serialNumber.toLowerCase().includes(q) ||
        d.customerFirm.toLowerCase().includes(q) ||
        d.model.toLowerCase().includes(q),
    );
  }, [devicesData, statusFilter, search]);

  const alerts = alertsData?.items ?? [];

  const createMut = useCreateWarrantyDevice({
    mutation: {
      onSuccess: () => {
        toast.success("Cihaz eklendi");
        setAddOpen(false);
        qc.invalidateQueries({ queryKey: getListWarrantyDevicesQueryKey() });
        qc.invalidateQueries({ queryKey: getListWarrantyAlertsQueryKey() });
      },
      onError: () => toast.error("Eklenemedi"),
    },
  });

  const updateMut = useUpdateWarrantyDevice({
    mutation: {
      onSuccess: () => {
        toast.success("Durum güncellendi");
        qc.invalidateQueries({ queryKey: getListWarrantyDevicesQueryKey() });
      },
      onError: () => toast.error("Güncelleme başarısız"),
    },
  });

  const deleteMut = useDeleteWarrantyDevice({
    mutation: {
      onSuccess: () => {
        toast.success("Cihaz silindi");
        setDeleteId(null);
        qc.invalidateQueries({ queryKey: getListWarrantyDevicesQueryKey() });
        qc.invalidateQueries({ queryKey: getListWarrantyAlertsQueryKey() });
      },
      onError: () => toast.error("Silinemedi"),
    },
  });

  return (
    <section className="px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Garanti Yönetimi</h1>
          <p className="mt-1 text-sm text-slate-500">Cihaz garanti ve servis takip sistemi</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Yeni Cihaz Ekle
        </button>
      </div>

      {/* Alert summary cards */}
      {alerts.length > 0 && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(["warranty_expiring", "warranty_expired", "maintenance_overdue", "maintenance_due"] as const).map((type) => {
            const count = alerts.filter((a) => a.type === type).length;
            if (count === 0) return null;
            return (
              <button
                key={type}
                onClick={() => setTab("alerts")}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left shadow-sm transition hover:brightness-95 ${ALERT_COLORS[type]} border-current/10`}
              >
                <Bell className="h-5 w-5 shrink-0" />
                <div>
                  <p className="text-xs font-bold">{ALERT_TYPE_LABELS[type]}</p>
                  <p className="text-2xl font-black">{count}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Tab nav */}
      <div className="mb-4 flex gap-1 border-b border-slate-200">
        {([["devices", "Cihazlar", ShieldCheck], ["alerts", "Uyarılar", AlertTriangle]] as const).map(([t, lbl, Icon]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-bold transition ${tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            <Icon className="h-4 w-4" />
            {lbl}
            {t === "alerts" && alerts.length > 0 && (
              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-black text-white">{alerts.length}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "devices" && (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Ürün adı, seri no, firma veya model…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input h-9 w-full pl-9 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setStatusFilter(undefined)}
                className={`rounded-full px-3 py-1 text-[11px] font-bold ring-1 transition ${!statusFilter ? "bg-slate-700 text-white ring-slate-700" : "bg-slate-100 text-slate-500 ring-slate-200 hover:opacity-80"}`}
              >
                Tümü
              </button>
              {STATUS_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setStatusFilter(statusFilter === o.value ? undefined : o.value)}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold ring-1 transition ${o.cls} ${statusFilter === o.value ? "ring-2" : "opacity-70 hover:opacity-100"}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {devicesLoading ? (
            <div className="space-y-3">{[1,2,3,4].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />)}</div>
          ) : devices.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
              <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="text-slate-400">{statusFilter || search ? "Bu filtreye uyan cihaz yok" : "Henüz cihaz kaydı yok"}</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">Ürün / Model</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-bold text-slate-500 md:table-cell">Seri No</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-bold text-slate-500 lg:table-cell">Müşteri Firma</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-bold text-slate-500 xl:table-cell">Garanti Bitiş</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">Durum</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-500">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {devices.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{d.productName}</p>
                        <p className="text-xs text-slate-400">{d.model}</p>
                      </td>
                      <td className="hidden px-4 py-3 font-mono text-sm text-slate-600 md:table-cell">{d.serialNumber}</td>
                      <td className="hidden px-4 py-3 text-sm text-slate-600 lg:table-cell">{d.customerFirm}</td>
                      <td className="hidden px-4 py-3 text-sm text-slate-500 xl:table-cell">{d.warrantyEndDate ?? "—"}</td>
                      <td className="px-4 py-3">
                        <select
                          value={d.status}
                          disabled={updateMut.isPending}
                          onChange={(e) => updateMut.mutate({ id: d.id, data: { status: e.target.value } })}
                          className={`cursor-pointer rounded-full border-0 py-0.5 pl-2.5 pr-6 text-[11px] font-bold ring-1 outline-none focus:ring-2 ${statusCls(d.status)}`}
                        >
                          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/admin/garanti/${d.id}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            onClick={() => setDeleteId(d.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === "alerts" && (
        <div>
          {alerts.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
              <Bell className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="text-slate-400">Şu an aktif uyarı yok</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((a, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-4 rounded-xl border p-4 ${ALERT_COLORS[a.type] ?? "bg-slate-50 text-slate-600"}`}
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wide opacity-70">{ALERT_TYPE_LABELS[a.type] ?? a.type}</p>
                    <p className="font-semibold">{a.productName} — <span className="font-mono">{a.serialNumber}</span></p>
                    <p className="text-sm opacity-80">{a.customerFirm}</p>
                    <p className="mt-1 text-sm font-bold">{a.message}</p>
                  </div>
                  <Link
                    to={`/admin/garanti/${a.deviceId}`}
                    className="shrink-0 rounded-lg border border-current/20 bg-white/60 px-3 py-1.5 text-xs font-bold hover:bg-white/90"
                  >
                    Detay
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {addOpen && (
        <DeviceFormModal
          onClose={() => setAddOpen(false)}
          saving={createMut.isPending}
          onSave={(data) => createMut.mutate({ data })}
        />
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="mb-2 text-base font-bold text-slate-900">Cihazı sil?</h3>
            <p className="mb-5 text-sm text-slate-500">Bu cihaz ve ilgili tüm servis kayıtları / garanti talepleri silinecek.</p>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setDeleteId(null)}>İptal</button>
              <button
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                disabled={deleteMut.isPending}
                onClick={() => deleteMut.mutate({ id: deleteId })}
              >
                {deleteMut.isPending ? "Siliniyor…" : "Evet, Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
