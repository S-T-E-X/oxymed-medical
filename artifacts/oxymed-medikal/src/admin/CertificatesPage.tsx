import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListAdminCertificatesQueryKey,
  useCreateCertificate,
  useDeleteCertificate,
  useListAdminCertificates,
  useUpdateCertificate,
  type Certificate,
} from "@workspace/api-client-react";
import { Check, Edit2, FileUp, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useImageUpload } from "./useImageUpload";
import { resolvePublicDocumentUrl } from "../lib/documentUrl";

type CertificateForm = {
  title: string;
  fileUrl: string;
  sortOrder: number;
  isActive: boolean;
};

const EMPTY_FORM: CertificateForm = { title: "", fileUrl: "", sortOrder: 0, isActive: true };

function CertificateModal({
  certificate,
  onClose,
}: {
  certificate: Certificate | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading } = useImageUpload();
  const [form, setForm] = useState<CertificateForm>(
    certificate
      ? { title: certificate.title, fileUrl: certificate.fileUrl, sortOrder: certificate.sortOrder, isActive: certificate.isActive }
      : EMPTY_FORM,
  );
  const createMutation = useCreateCertificate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAdminCertificatesQueryKey() });
        toast.success("Sertifika kaydedildi");
        onClose();
      },
      onError: () => toast.error("Sertifika kaydedilemedi"),
    },
  });
  const updateMutation = useUpdateCertificate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAdminCertificatesQueryKey() });
        toast.success("Sertifika güncellendi");
        onClose();
      },
      onError: () => toast.error("Sertifika güncellenemedi"),
    },
  });

  function set<K extends keyof CertificateForm>(field: K, value: CertificateForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function uploadCertificateFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const upload = await uploadFile(file);
      set("fileUrl", upload.publicUrl);
      toast.success("Sertifika dosyası yüklendi");
    } catch {
      toast.error("Dosya yüklenemedi");
    } finally {
      event.target.value = "";
    }
  }

  function save() {
    const data = {
      title: form.title.trim(),
      fileUrl: form.fileUrl.trim(),
      sortOrder: form.sortOrder,
      isActive: form.isActive,
    };
    if (certificate) {
      updateMutation.mutate({ id: certificate.id, data });
    } else {
      createMutation.mutate({ data });
    }
  }

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">{certificate ? "Sertifikayı Düzenle" : "Yeni Sertifika"}</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700" aria-label="Kapat">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="label">Sertifika adı *</label>
            <input className="input" value={form.title} onChange={(event) => set("title", event.target.value)} placeholder="ISO 13485 Sertifikası" />
          </div>
          <div>
            <label className="label">Sertifika dosyası *</label>
            <div className="flex gap-2">
              <input className="input min-w-0 flex-1" value={form.fileUrl} onChange={(event) => set("fileUrl", event.target.value)} placeholder="Dosya yükleyin veya URL yapıştırın" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                <FileUp className="h-4 w-4" />
                {uploading ? "Yükleniyor…" : "Dosya Yükle"}
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,application/pdf" className="hidden" onChange={uploadCertificateFile} />
            {form.fileUrl && <p className="mt-2 truncate text-xs text-emerald-700">Dosya hazır: {form.fileUrl}</p>}
          </div>
          <div className="grid grid-cols-[1fr_auto] items-end gap-4">
            <div>
              <label className="label">Sıralama</label>
              <input className="input" type="number" value={form.sortOrder} onChange={(event) => set("sortOrder", Number(event.target.value) || 0)} />
            </div>
            <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={form.isActive} onChange={(event) => set("isActive", event.target.checked)} className="h-4 w-4 rounded border-slate-300" />
              Aktif
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button type="button" onClick={onClose} className="btn-secondary">İptal</button>
          <button type="button" onClick={save} disabled={saving || !form.title.trim() || !form.fileUrl.trim()} className="btn-primary">
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CertificatesPage() {
  const queryClient = useQueryClient();
  const { data: certificates = [], isLoading } = useListAdminCertificates();
  const [editing, setEditing] = useState<Certificate | null | undefined>(undefined);
  const updateMutation = useUpdateCertificate({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAdminCertificatesQueryKey() }),
      onError: () => toast.error("Sertifika güncellenemedi"),
    },
  });
  const deleteMutation = useDeleteCertificate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAdminCertificatesQueryKey() });
        toast.success("Sertifika silindi");
      },
      onError: () => toast.error("Sertifika silinemedi"),
    },
  });

  function remove(certificate: Certificate) {
    if (confirm(`“${certificate.title}” sertifikasını silmek istediğinize emin misiniz?`)) {
      deleteMutation.mutate({ id: certificate.id });
    }
  }

  return (
    <section className="px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Sertifikalar</h1>
          <p className="mt-1 text-sm text-slate-500">Ziyaretçilerin indirebileceği sertifika dosyalarını yönetin.</p>
        </div>
        <button type="button" onClick={() => setEditing(null)} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Yeni Sertifika
        </button>
      </div>
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-slate-100" />)}</div>
      ) : certificates.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 px-6 py-16 text-center text-slate-500">
          Henüz sertifika eklenmedi.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {certificates.map((certificate, index) => (
            <div key={certificate.id} className={`flex flex-wrap items-center gap-4 px-5 py-4 ${index > 0 ? "border-t border-slate-100" : ""}`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><FileUp className="h-5 w-5" /></span>
              <div className="min-w-[200px] flex-1">
                <strong className="block text-sm text-slate-900">{certificate.title}</strong>
                <a href={resolvePublicDocumentUrl(certificate.fileUrl)} target="_blank" rel="noreferrer" className="mt-1 block max-w-md truncate text-xs text-blue-600 hover:underline">{certificate.fileUrl}</a>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${certificate.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                {certificate.isActive ? "Aktif" : "Pasif"}
              </span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => updateMutation.mutate({ id: certificate.id, data: { isActive: !certificate.isActive } })} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" title={certificate.isActive ? "Pasifleştir" : "Aktifleştir"}>
                  <Check className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setEditing(certificate)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" title="Düzenle"><Edit2 className="h-4 w-4" /></button>
                <button type="button" onClick={() => remove(certificate)} disabled={deleteMutation.isPending} className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50" title="Sil"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing !== undefined && <CertificateModal certificate={editing} onClose={() => setEditing(undefined)} />}
    </section>
  );
}