import { useRef, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
  getListMediaFilesQueryKey,
  listMediaFiles,
  useDeleteMediaFile,
} from "@workspace/api-client-react";
import { toast } from "sonner";
import { Check, Copy, ImageIcon, Trash2, Upload } from "lucide-react";
import { useImageUpload } from "./useImageUpload";

function formatSize(bytes?: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR");
}

const MEDIA_PAGE_SIZE = 100;

export default function MediaPage() {
  const qc = useQueryClient();
  const {
    data: mediaData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["/api/media", "admin-library"],
    queryFn: ({ pageParam, signal }) =>
      listMediaFiles({ page: pageParam, limit: MEDIA_PAGE_SIZE }, { signal }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((total, page) => total + page.items.length, 0);
      return loaded < lastPage.total ? allPages.length + 1 : undefined;
    },
  });
  const files = mediaData?.pages.flatMap((page) => page.items) ?? [];
  const totalFiles = mediaData?.pages[0]?.total ?? 0;
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const dropRef = useRef<HTMLLabelElement>(null);
  const [dragging, setDragging] = useState(false);

  const { uploadFile, uploading } = useImageUpload();

  const deleteMut = useDeleteMediaFile({
    mutation: {
      onSuccess: () => { toast.success("Dosya silindi"); qc.invalidateQueries({ queryKey: getListMediaFilesQueryKey() }); },
      onError: () => toast.error("Silme başarısız"),
    },
  });

  function invalidate() {
    qc.invalidateQueries({ queryKey: getListMediaFilesQueryKey() });
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    let success = 0;
    for (const file of Array.from(fileList)) {
      try {
        await uploadFile(file);
        success++;
      } catch {
        toast.error(`${file.name} yüklenemedi`);
      }
    }
    if (success > 0) {
      toast.success(`${success} dosya yüklendi`);
      invalidate();
    }
  }

  async function copyUrl(url: string, id: number) {
    await navigator.clipboard.writeText(window.location.origin + url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleDelete(id: number) {
    if (confirm("Bu dosyayı silmek istediğinizden emin misiniz?")) deleteMut.mutate({ id });
  }

  const publicUrlOf = (objectPath: string) => `/api/storage/public-objects/${objectPath}`;

  return (
    <section className="px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Medya Kütüphanesi</h1>
          <p className="mt-1 text-sm text-slate-500">
            {totalFiles} dosya yüklü{files.length < totalFiles ? ` · ${files.length} gösteriliyor` : ""}
          </p>
        </div>
      </div>

      <label
        ref={dropRef}
        className={`mb-6 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition ${dragging ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-300"}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Upload className="h-6 w-6" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-900">
            {uploading ? "Yükleniyor…" : "Görselleri buraya sürükleyin veya tıklayın"}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">PNG, JPG, GIF, WebP desteklenir</p>
        </div>
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {isLoading ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {[1,2,3,4,5,6,7,8].map((i) => <div key={i} className="aspect-square animate-pulse rounded-xl bg-slate-100" />)}
        </div>
      ) : files.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
          <ImageIcon className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-slate-400">Henüz dosya yüklenmedi</p>
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {files.map((f) => {
            const url = publicUrlOf(f.objectPath);
            return (
              <div key={f.id} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="aspect-square overflow-hidden bg-slate-50">
                  {f.mimeType?.startsWith("image/") ? (
                    <img src={url} alt={f.alt ?? f.filename} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="truncate text-[11px] font-semibold text-slate-700">{f.filename}</p>
                  <p className="text-[10px] text-slate-400">{formatSize(f.size)} · {formatDate(f.createdAt)}</p>
                  <div className="mt-2 flex gap-1">
                    <button
                      onClick={() => copyUrl(url, f.id)}
                      className="flex h-7 flex-1 items-center justify-center gap-1 rounded border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      {copiedId === f.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      {copiedId === f.id ? "Kopyalandı" : "URL"}
                    </button>
                    <button
                      onClick={() => handleDelete(f.id)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-red-100 text-red-400 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasNextPage && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60"
          >
            {isFetchingNextPage ? "Yükleniyor…" : "Daha fazla göster"}
          </button>
        </div>
      )}
    </section>
  );
}
