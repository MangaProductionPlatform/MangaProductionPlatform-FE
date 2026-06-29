import { useEffect, useState } from "react";
import {
  Upload,
  Send,
  FileImage,
  ArrowLeft,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { taskService } from "../../shared/services/taskService";
import { qaService, type QaPin } from "../../shared/services/qaService";

type LayerType = "LineArt" | "Color" | "Background" | "Text";

type AssistantTask = {
  pageTaskId: string;
  chapterId?: string;
  chapterTitle?: string;
  chapterNumber?: number;
  pageNumber?: number;
  taskStatus?: string;
  currentLayerType?: string | null;
  updatedAt?: string;
};

export default function AssistantTaskDetailPage() {
  const { id } = useParams();

  const [task, setTask] = useState<AssistantTask | null>(null);
  const [pins, setPins] = useState<QaPin[]>([]);
  const [layerType, setLayerType] = useState<LayerType>("LineArt");
  const [fileUrlOriginal, setFileUrlOriginal] = useState("");
  const [fileUrlOptimized, setFileUrlOptimized] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadTaskAndPins() {
      if (!id) return;

      setIsLoading(true);
      setMessage("");

      try {
        const result = await taskService.getAssignedTasks();
        const list = Array.isArray(result)
          ? (result as AssistantTask[])
          : ((result as { items?: AssistantTask[] }).items ?? []);

        const currentTask =
          list.find((item) => item.pageTaskId === id) ?? null;

        setTask(currentTask);

        if (!currentTask?.chapterId) {
          setPins([]);
          return;
        }

        const pinResult = await qaService.getPins(currentTask.chapterId);
        const allPins = Array.isArray(pinResult) ? pinResult : [];

        setPins(
          allPins.filter(
            (pin) =>
              pin.pageTaskId === id ||
              pin.pageTaskId?.toLowerCase() === id.toLowerCase()
          )
        );
      } catch (err) {
        setTask(null);
        setPins([]);
        setMessage(
          err instanceof Error
            ? err.message
            : "Không thể tải thông tin task."
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadTaskAndPins();
  }, [id]);

  const handleSubmitLayer = async () => {
    if (!id) {
      setMessage("Không tìm thấy pageTaskId.");
      return;
    }

    if (!fileUrlOriginal.trim()) {
      setMessage("Vui lòng nhập File URL Original.");
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

      setMessage("Submit layer thành công. Task sẽ chuyển sang trạng thái Reviewing.");
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
          Assistant nộp layer đã hoàn thành hoặc layer sửa lỗi cho task:
          <span className="ml-2 text-cyan-300">{id}</span>
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-sm text-cyan-200">
          {message}
        </div>
      )}

      {isLoading && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-slate-300">
          Loading task detail...
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold text-white">Task Information</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <InfoItem label="Page Task ID" value={id ?? "N/A"} />
            <InfoItem label="Chapter" value={task?.chapterTitle ?? "N/A"} />
            <InfoItem
              label="Chapter Number"
              value={String(task?.chapterNumber ?? "N/A")}
            />
            <InfoItem
              label="Page Number"
              value={String(task?.pageNumber ?? "N/A")}
            />
            <InfoItem
              label="Status"
              value={task?.taskStatus ?? "Unknown"}
            />
            <InfoItem
              label="Current Layer"
              value={task?.currentLayerType ?? "No layer yet"}
            />
          </div>

          <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950 p-5">
            <div className="flex items-center gap-3 text-slate-300">
              <FileImage size={20} className="text-cyan-300" />
              Base page preview placeholder
            </div>

            <div className="relative mt-4 h-64 rounded-xl border border-dashed border-slate-700 bg-slate-900/70">
              {pins.map((pin) => (
                <div
                  key={pin.id ?? pin.pinId}
                  className="pulse-dot absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg shadow-red-500/40"
                  style={{
                    left: `${pin.coordinateX}%`,
                    top: `${pin.coordinateY}%`,
                  }}
                  title={pin.noteMessage}
                >
                  !
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
              <AlertCircle size={20} className="text-red-300" />
              QA Feedback Pins
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Các lỗi được Editor ghim trong MF3.
            </p>

            <div className="mt-4 space-y-3">
              {pins.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                  Không có bug pin nào cho task này.
                </div>
              ) : (
                pins.map((pin) => (
                  <div
                    key={pin.id ?? pin.pinId}
                    className="fade-slide-up glow-card rounded-xl border border-red-500/20 bg-slate-950 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">
                          {pin.issueType}
                        </p>
                        <p className="mt-2 text-sm text-slate-300">
                          {pin.noteMessage}
                        </p>
                        <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                          <MapPin size={14} />
                          X {pin.coordinateX}% · Y {pin.coordinateY}%
                        </p>
                      </div>

                      <span className="rounded-lg bg-red-500/10 px-3 py-1 text-xs text-red-300">
                        {pin.status ?? "Open"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold text-white">Submit Layer</h2>

          <p className="mt-2 text-sm text-slate-400">
            Payload: LayerType, FileUrlOriginal, FileUrlOptimized
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-sm text-slate-400">Layer Type</label>

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
                <option value="Text">Text</option>
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