import { useState, type ChangeEvent } from "react";
import { HardDrive, UploadCloud } from "lucide-react";
import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { MediaUploadResult } from "../../shared/types/mangaErp";

export default function AdminStoragePage() {
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [lastUpload, setLastUpload] = useState<MediaUploadResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
    setLastUpload(null);
  };

  const upload = async () => {
    if (!file) {
      toast.error("No file selected", "Choose a PNG, JPG, JPEG, or WEBP image.");
      return;
    }
    setIsUploading(true);
    try {
      const result = await mangaErpApi.uploadImage(file);
      setLastUpload(result);
      toast.success("File uploaded", result.fileKey);
    } catch (error) {
      toast.error("Upload failed", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Admin</p>
        <h2 className="mt-2 text-3xl font-black text-white">Storage</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Upload image assets through the backend media API. Storage browsing and deletion are not exposed yet.
        </p>
      </header>

      <section className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-200">
            <HardDrive size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white">Media upload</h3>
            <p className="text-sm text-slate-400">Backend endpoint: POST /api/v1/media/upload</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto]">
          <input className="input file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-300 file:px-3 file:py-2 file:text-sm file:font-bold file:text-slate-950" type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseFile} />
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
            <p className="text-sm font-semibold text-emerald-100">Uploaded asset</p>
            <p className="mt-2 break-all text-xs text-slate-300">File key: {lastUpload.fileKey}</p>
            <a className="mt-2 block break-all text-sm font-semibold text-cyan-200 hover:text-cyan-100" href={lastUpload.url} target="_blank" rel="noreferrer">
              {lastUpload.url}
            </a>
          </div>
        ) : null}
      </section>

      <p className="rounded-lg border border-amber-300/20 bg-amber-500/10 p-4 text-sm text-amber-100">
        The backend currently validates and uploads images, but does not expose storage inventory, quota, delete, or archive APIs.
      </p>
    </div>
  );
}
