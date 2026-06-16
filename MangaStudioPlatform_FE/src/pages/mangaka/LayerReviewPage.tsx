import { useEffect, useState } from "react";
import {
  CheckCircle,
  Eye,
  MessageSquare,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { taskService } from "../../shared/services/taskService";

type ChapterTask = {
  id: string;
  pageTaskId?: string;
  chapter?: string;
  chapterTitle?: string;
  page?: number;
  pageNumber?: number;
  layerType?: string;
  assistant?: string;
  assistantName?: string;
  status?: string;
  fileUrlOriginal?: string;
  fileUrlOptimized?: string;
};

export default function LayerReviewPage() {
  const [chapterId, setChapterId] = useState("chapter-001");
  const [tasks, setTasks] = useState<ChapterTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [rejectionNote, setRejectionNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [message, setMessage] = useState("");

  const selectedTask = tasks.find(
    (task) => (task.pageTaskId ?? task.id) === selectedTaskId
  );

  async function loadChapterTasks() {
    if (!chapterId.trim()) {
      setMessage("Vui lòng nhập Chapter ID.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const result = await taskService.getChapterTasks(chapterId.trim());

      const list = Array.isArray(result)
        ? result
        : (result as { items?: ChapterTask[] }).items ?? [];

      setTasks(list as ChapterTask[]);

      if (list.length > 0) {
        const firstTask = list[0] as ChapterTask;
        setSelectedTaskId(firstTask.pageTaskId ?? firstTask.id);
      } else {
        setSelectedTaskId("");
      }
    } catch (err) {
      setTasks([]);
      setSelectedTaskId("");
      setMessage(
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách task của chapter."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadChapterTasks();
  }, []);

  async function handleReview(isAccepted: boolean) {
    if (!selectedTask) {
      setMessage("Vui lòng chọn task cần review.");
      return;
    }

    if (!isAccepted && !rejectionNote.trim()) {
      setMessage("Vui lòng nhập lý do từ chối.");
      return;
    }

    const pageTaskId = selectedTask.pageTaskId ?? selectedTask.id;

    setIsReviewing(true);
    setMessage("");

    try {
      await taskService.reviewLayer(pageTaskId, {
        IsAccepted: isAccepted,
        RejectionNote: isAccepted ? "" : rejectionNote.trim(),
      });

      setMessage(
        isAccepted
          ? "Layer đã được duyệt thành công."
          : "Đã yêu cầu Assistant chỉnh sửa layer."
      );

      setRejectionNote("");
      await loadChapterTasks();
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Review layer thất bại."
      );
    } finally {
      setIsReviewing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Mangaka Workflow
        </p>

        <h1 className="mt-2 text-3xl font-black text-white">
          Layer Review
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Mangaka xem các layer Assistant đã gửi và duyệt hoặc yêu cầu chỉnh sửa.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div>
            <label className="text-sm text-slate-400">Chapter ID</label>
            <input
              value={chapterId}
              onChange={(event) => setChapterId(event.target.value)}
              placeholder="Nhập chapterId"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
            />
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => void loadChapterTasks()}
            className="self-end inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={18} />
            {isLoading ? "Loading..." : "Load Tasks"}
          </button>
        </div>
      </section>

      {message && (
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-200">
          {message}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold text-white">
            Chapter Tasks
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            API: GET /api/v1/tasks/chapter/{"{chapterId}"}
          </p>

          <div className="mt-5 space-y-3">
            {isLoading && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-300">
                Loading tasks...
              </div>
            )}

            {!isLoading && tasks.length === 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-400">
                Không có task nào cho chapter này.
              </div>
            )}

            {tasks.map((task) => {
              const taskId = task.pageTaskId ?? task.id;
              const isSelected = selectedTaskId === taskId;

              return (
                <button
                  key={taskId}
                  type="button"
                  onClick={() => setSelectedTaskId(taskId)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    isSelected
                      ? "border-cyan-400 bg-cyan-400/10"
                      : "border-slate-800 bg-slate-950 hover:border-cyan-400/50"
                  }`}
                >
                  <h3 className="font-semibold text-white">
                    {task.chapterTitle ?? task.chapter ?? "Untitled Chapter"}
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    Page {task.pageNumber ?? task.page ?? "N/A"}
                  </p>

                  <p className="text-sm text-slate-400">
                    Layer: {task.layerType ?? "N/A"}
                  </p>

                  <p className="text-sm text-slate-500">
                    Assistant: {task.assistantName ?? task.assistant ?? "N/A"}
                  </p>

                  <span className="mt-3 inline-flex rounded-lg bg-yellow-500/10 px-3 py-1 text-xs text-yellow-300">
                    {task.status ?? "Waiting Review"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold text-white">
            Review Selected Layer
          </h2>

          {selectedTask ? (
            <div className="mt-5 space-y-5">
              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950 p-8">
                <div className="flex items-center gap-2 text-slate-300">
                  <Eye size={18} />
                  Artwork Preview
                </div>

                {selectedTask.fileUrlOptimized || selectedTask.fileUrlOriginal ? (
                  <img
                    src={selectedTask.fileUrlOptimized ?? selectedTask.fileUrlOriginal}
                    alt="Artwork layer preview"
                    className="mt-4 max-h-80 w-full rounded-xl object-contain"
                  />
                ) : (
                  <div className="mt-4 h-56 rounded-xl border border-slate-700 bg-slate-900" />
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-slate-400">
                  <MessageSquare size={16} />
                  Rejection Note
                </label>

                <textarea
                  value={rejectionNote}
                  onChange={(event) => setRejectionNote(event.target.value)}
                  placeholder="Nhập lý do nếu từ chối..."
                  className="mt-2 h-28 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={isReviewing}
                  onClick={() => void handleReview(true)}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CheckCircle size={18} />
                  {isReviewing ? "Sending..." : "Approve Layer"}
                </button>

                <button
                  type="button"
                  disabled={isReviewing}
                  onClick={() => void handleReview(false)}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <XCircle size={18} />
                  {isReviewing ? "Sending..." : "Reject Layer"}
                </button>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-500">
                API: POST /api/v1/tasks/{"{pageTaskId}"}/review
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-400">
              Chọn một task ở bên trái để review.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}