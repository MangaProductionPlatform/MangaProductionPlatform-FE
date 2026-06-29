import { useEffect, useState } from "react";
import { ArrowRight, ClipboardList, Clock, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { taskService } from "../../shared/services/taskService";

type AssistantTask = {
  pageTaskId: string;
  chapterId?: string;
  chapterTitle?: string;
  chapterNumber?: number;
  pageNumber?: number;
  taskStatus?: string;
  currentLayerType?: string | null;
  currentLayerVersion?: number | null;
  updatedAt?: string;
};

const taskStatuses = [
  "All",
  "Incomplete",
  "Reviewing",
  "RevisionRequired",
  "Submitted",
];

export default function AssistantTasksPage() {
  const [status, setStatus] = useState("All");
  const [tasks, setTasks] = useState<AssistantTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTasks() {
      setIsLoading(true);
      setError("");

      try {
        const result =
          status === "All"
            ? await taskService.getAssignedTasks()
            : await taskService.getAssignedTasks(status);

        const list = Array.isArray(result)
          ? result
          : (result as { items?: AssistantTask[] }).items ?? [];

        setTasks(list as AssistantTask[]);
      } catch (err) {
        setTasks([]);
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải danh sách task"
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadTasks();
  }, [status]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Assistant
        </p>

        <h1 className="mt-2 text-3xl font-black text-white">
          My Assigned Tasks
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Danh sách task được phân công cho Assistant từ API GET
          /api/v1/tasks/assigned.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <Filter size={18} className="text-cyan-300" />

        {taskStatuses.map((statusItem) => (
          <button
            key={statusItem}
            type="button"
            onClick={() => setStatus(statusItem)}
            className={`rounded-xl border px-4 py-2 text-sm ${
              status === statusItem
                ? "border-cyan-400 bg-cyan-400/10 text-cyan-200"
                : "border-slate-700 text-slate-300 hover:border-cyan-400 hover:text-cyan-200"
            }`}
          >
            {statusItem}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="shimmer-box rounded-xl border border-slate-800 bg-slate-900 p-4 text-slate-300">
        Loading tasks...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      {!isLoading && !error && tasks.length === 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-slate-400">
          Không có task nào ở trạng thái {status}.
        </div>
      )}

      <div className="grid gap-4">
        {tasks.map((task) => {
          const taskId = task.pageTaskId;

          return (
            <div
              key={taskId}
              className="fade-slide-up glow-card rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ClipboardList size={18} className="text-cyan-300" />

                    <h2 className="font-bold text-white">
                      {task.chapterTitle ?? "Untitled Chapter"}
                    </h2>
                  </div>

                  <p className="mt-2 text-slate-400">
                    Chapter {task.chapterNumber ?? "N/A"} · Page{" "}
                    {task.pageNumber ?? "N/A"}
                  </p>

                  <p className="mt-1 text-slate-400">
                    Layer: {task.currentLayerType ?? "No layer submitted yet"}
                  </p>

                  <p className="mt-1 break-all text-xs text-slate-500">
                    Task ID: {task.pageTaskId}
                  </p>
                </div>

                <span className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/10 px-3 py-2 text-sm text-cyan-300">
                <span className="pulse-dot h-2 w-2 rounded-full bg-cyan-300" />
                   {task.taskStatus ?? "Unknown"}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock size={16} />
                  {task.updatedAt
                    ? new Date(task.updatedAt).toLocaleString()
                    : "No updated time"}
                </div>

                <Link
                  to={`/assistant/tasks/${taskId}`}
                  className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
                >
                  Open Task
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}