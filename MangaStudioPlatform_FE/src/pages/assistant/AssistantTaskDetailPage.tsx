import { useState } from "react";
import { Upload, Send, FileImage, ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { taskService } from "../../shared/services/taskService";

type LayerType = "LineArt" | "Color" | "Background";

export default function AssistantTaskDetailPage() {
  const { id } = useParams();

  const [layerType, setLayerType] = useState<LayerType>("LineArt");
  const [fileUrlOriginal, setFileUrlOriginal] = useState("");
  const [fileUrlOptimized, setFileUrlOptimized] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmitLayer = async () => {
    if (!id) {
      setMessage("Không tìm thấy pageTaskId.");
      return;
    }

    if (!fileUrlOriginal.trim()) {
      setMessage("Vui lòng nhập đầy đủ File URL Original và File URL Optimized.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      await taskService.submitLayer(id, {
        LayerType: layerType,
        FileUrlOriginal: fileUrlOriginal.trim(),
        FileUrlOptimized: fileUrlOptimized.trim() || null,
      });

      setMessage("Submit layer thành công.");
      setFileUrlOriginal("");
      setFileUrlOptimized("");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Submit layer thất bại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        to="/assistant/tasks"
        className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"
      >
        <ArrowLeft size={16} />
        Back to My Tasks
      </Link>

      <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Assistant Task Detail
        </p>

        <h1 className="mt-2 text-3xl font-black text-white">
          Upload Artwork Layer
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Assistant nộp layer đã hoàn thành cho task:
          <span className="ml-2 text-cyan-300">{id}</span>
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold text-white">
            Task Information
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <InfoItem label="Page Task ID" value={id ?? "N/A"} />
            <InfoItem label="Layer Type" value={layerType} />
            <InfoItem label="Status" value="Assigned / In Progress" />
            <InfoItem label="API" value="POST /api/v1/tasks/{pageTaskId}/layers" />
          </div>

          <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950 p-5">
            <div className="flex items-center gap-3 text-slate-300">
              <FileImage size={20} className="text-cyan-300" />
              Base page preview placeholder
            </div>

            <div className="mt-4 h-64 rounded-xl border border-dashed border-slate-700 bg-slate-900/70" />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold text-white">
            Submit Layer
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Payload: LayerType, FileUrlOriginal, FileUrlOptimized
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-sm text-slate-400">
                Layer Type
              </label>

              <select
                value={layerType}
                onChange={(event) =>
                  setLayerType(event.target.value as LayerType)
                }
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
              >
                <option value="LineArt">LineArt</option>
                <option value="Color">Color</option>
                <option value="Background">Background</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-400">
                File URL Original
              </label>

              <input
                value={fileUrlOriginal}
                onChange={(event) => setFileUrlOriginal(event.target.value)}
                placeholder="https://..."
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">
                File URL Optimized
              </label>

              <input
                value={fileUrlOptimized}
                onChange={(event) => setFileUrlOptimized(event.target.value)}
                placeholder="https://..."
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">
                Upload file demo
              </label>

              <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950 p-8 text-center hover:border-cyan-400">
                <Upload size={28} className="text-cyan-300" />

                <span className="mt-3 text-sm text-slate-300">
                  Click to upload artwork layer
                </span>

                <input type="file" className="hidden" />
              </label>
            </div>

            {message && (
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-sm text-cyan-200">
                {message}
              </div>
            )}

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitLayer}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={18} />
              {isSubmitting ? "Submitting..." : "Submit Layer"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 break-all font-semibold text-white">{value}</p>
    </div>
  );
}
