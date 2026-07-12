import { useEffect, useState, type ChangeEvent } from "react";
import { HardDrive, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { MediaUploadResult } from "../../shared/types/mangaErp";

// Inventory và quota được tải độc lập với upload để Admin vẫn xem được trạng thái Cloud khi không chọn file.
export default function AdminStoragePage() {
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [lastUpload, setLastUpload] = useState<MediaUploadResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [media, setMedia] = useState<Record<string, unknown>[]>([]);
  const [quota, setQuota] = useState<Record<string, unknown> | null>(null);

  const loadStorage = async () => {
    try {
      const [items, quotaInfo] = await Promise.all([
        mangaErpApi.getMediaItems(),
        mangaErpApi.getMediaQuota(),
      ]);
      setMedia(items);
      setQuota(quotaInfo);
    } catch (error) {
      toast.error(
        "Could not load storage",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };
  useEffect(() => {
    // Trì hoãn lần tải đầu tiên để effect không cập nhật state đồng bộ ngay khi render.
    const timer = window.setTimeout(() => {
      void loadStorage();
    }, 0);

    return () => window.clearTimeout(timer);
    // Chỉ tải inventory khi mở trang; các lần tiếp theo do người dùng Refresh hoặc upload/xóa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
    setLastUpload(null);
  };

  const upload = async () => {
    if (!file) {
      toast.error(
        "No file selected",
        "Choose a PNG, JPG, JPEG, or WEBP image.",
      );
      return;
    }
    setIsUploading(true);
    try {
      const result = await mangaErpApi.uploadImage(file);
      setLastUpload(result);
      void loadStorage();
      toast.success("File uploaded", result.fileKey);
    } catch (error) {
      toast.error(
        "Upload failed",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const remove = async (item: Record<string, unknown>) => {
    const publicId = String(item.publicId ?? item.fileKey ?? item.id ?? "");
    if (!publicId) return;
    try {
      await mangaErpApi.deleteMedia(publicId);
      toast.success("Asset deleted", publicId);
      void loadStorage();
    } catch (error) {
      toast.error(
        "Could not delete asset",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Admin
        </p>
        <h2 className="mt-2 text-3xl font-black text-white">Storage</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Upload, review storage use, and remove Cloud media assets.
        </p>
      </header>

      <section className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-200">
            <HardDrive size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white">Media upload</h3>
            <p className="text-sm text-slate-400">
              Upload and manage media shared across the workspace.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto]">
          <input
            className="input file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-300 file:px-3 file:py-2 file:text-sm file:font-bold file:text-slate-950"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={chooseFile}
          />
          <button
            type="button"
            onClick={() => void upload()}
            disabled={!file || isUploading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 disabled:opacity-50"
          >
            <UploadCloud size={16} />
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {lastUpload ? (
          <div className="mt-5 rounded-lg border border-emerald-300/20 bg-emerald-500/10 p-4">
            <p className="text-sm font-semibold text-emerald-100">
              Uploaded asset
            </p>
            <p className="mt-2 break-all text-xs text-slate-300">
              File key: {lastUpload.fileKey}
            </p>
            <a
              className="mt-2 block break-all text-sm font-semibold text-cyan-200 hover:text-cyan-100"
              href={lastUpload.url}
              target="_blank"
              rel="noreferrer"
            >
              {lastUpload.url}
            </a>
          </div>
        ) : null}
      </section>

      <section className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-white">Storage inventory</h3>
            <p className="mt-1 text-sm text-slate-400">
              {quota
                ? Object.entries(quota)
                    .map(([key, value]) => `${key}: ${String(value)}`)
                    .join(" · ")
                : "Quota information is unavailable."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadStorage()}
            className="icon-button"
            title="Refresh storage"
          >
            <RefreshCw size={16} />
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {media.map((item, index) => (
            <div
              key={String(item.publicId ?? item.fileKey ?? item.id ?? index)}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3"
            >
              <p className="min-w-0 break-all text-sm text-slate-200">
                {String(
                  item.url ??
                    item.secureUrl ??
                    item.fileKey ??
                    item.publicId ??
                    "Media asset",
                )}
              </p>
              <button
                type="button"
                onClick={() => void remove(item)}
                className="inline-flex items-center gap-2 rounded-lg border border-rose-300/20 px-3 py-2 text-sm font-semibold text-rose-100"
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          ))}
          {!media.length ? (
            <p className="py-5 text-center text-sm text-slate-400">
              No media assets returned.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
