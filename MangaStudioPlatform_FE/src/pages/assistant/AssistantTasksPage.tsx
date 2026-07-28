import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  ClipboardList,
  Clock,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { PageTaskDto } from "../../shared/types/mangaErp";
import WorkflowEmptyState from "../../shared/components/WorkflowEmptyState";

const filters = [
  "All",
  "Pending",
  "Incomplete",
  "Reviewing",
  "RevisionAlert",
  "Approved",
];

function formatTaskTitle(task: PageTaskDto) {
  const chapterName =
    task.chapterTitle ??
    (task.chapterNumber ? `Chapter ${task.chapterNumber}` : "Assigned chapter");
  const pageLabel = task.pageNumber ? `Page ${task.pageNumber}` : "Page task";
  const taskType = task.taskType ?? "General";

  return `${chapterName} - ${pageLabel} - ${taskType}`;
}

export default function AssistantTasksPage() {
  const toast = useToast();
  const [filter, setFilter] = useState("All");
  const [tasks, setTasks] = useState<PageTaskDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const assigned = await mangaErpApi.getAssignedPageTasks(
        filter === "All" ? undefined : filter,
      );
      const enriched = await Promise.all(
        assigned.map(async (task) => {
          try {
            const detail = await mangaErpApi.getPageTask(task.id);
            return {
              ...task,
              ...detail,
              chapterTitle: detail.chapterTitle ?? task.chapterTitle,
              chapterNumber: detail.chapterNumber ?? task.chapterNumber,
              currentLayerType:
                detail.currentLayerType ?? task.currentLayerType,
              currentLayerVersion:
                detail.currentLayerVersion ?? task.currentLayerVersion,
              rejectionNote: detail.rejectionNote ?? task.rejectionNote,
            };
          } catch {
            return task;
          }
        }),
      );
      setTasks(enriched);
    } catch (error) {
      setTasks([]);
      toast.error(
        "Could not load assigned tasks",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setIsLoading(false);
    }
  }, [filter, toast]);

  useEffect(() => {
    // Mỗi lần đổi filter cần tải lại từ backend để không lọc dựa trên dữ liệu cũ ở client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadTasks();
  }, [loadTasks]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Assistant workflow
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black text-white">My Page Tasks</h1>
            <p className="mt-2 text-sm text-slate-400">
              Open an assigned page, submit its layer artwork, and follow review
              feedback.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadTasks()}
            disabled={isLoading}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />{" "}
            Refresh
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <Filter size={18} className="mr-1 text-cyan-300" />
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-xl border px-3 py-2 text-sm transition ${filter === item ? "border-cyan-400 bg-cyan-400/10 text-cyan-200" : "border-slate-700 text-slate-300 hover:border-cyan-400/60"}`}
          >
            {item}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton-card">
              <div className="skeleton h-5 w-48" />
              <div className="skeleton mt-3 h-4 w-72 max-w-full" />
              <div className="flex justify-between gap-4">
                <div className="skeleton mt-5 h-4 w-40" />
                <div className="skeleton mt-5 h-10 w-28" />
              </div>
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <WorkflowEmptyState
          icon={ClipboardList}
          title={`No ${filter === "All" ? "assigned" : filter.toLowerCase()} tasks`}
          description="When a Mangaka assigns page work to you, it will appear here."
          actionLabel="View assigned chapters"
          actionTo="/assistant/chapters"
          onRefresh={() => void loadTasks()}
        />
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <article
              key={task.id}
              className="interactive-card rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ClipboardList size={18} className="text-cyan-300" />
                    <h2 className="font-bold text-white">
                      {formatTaskTitle(task)}
                    </h2>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    Page {task.pageNumber} · Task type:{" "}
                    {task.taskType ?? "General"}
                    {task.currentLayerVersion
                      ? ` · submitted v${task.currentLayerVersion}`
                      : ""}
                  </p>
                  {task.description ? (
                    <p className="mt-3 rounded-lg border border-cyan-400/20 bg-cyan-500/10 p-3 text-sm text-cyan-100">
                      <span className="font-semibold">Mangaka note:</span>{" "}
                      {task.description}
                    </p>
                  ) : null}
                  {task.rejectionNote ? (
                    <p className="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">
                      Changes requested: {task.rejectionNote}
                    </p>
                  ) : null}
                </div>
                <span className="rounded-lg bg-cyan-500/10 px-3 py-2 text-sm text-cyan-300">
                  {task.status}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock size={15} />
                  {task.updatedAt
                    ? new Date(task.updatedAt).toLocaleString()
                    : "Not updated yet"}
                </span>
                <Link
                  to={`/assistant/tasks/${task.id}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
                >
                  Open task <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
