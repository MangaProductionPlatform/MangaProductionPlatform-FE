import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Layers3,
  Plus,
  RefreshCw,
  Send,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { WorkflowStatusBadge } from "../../shared/components/WorkflowStatusBadge";
import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type {
  ChapterDto,
  MangaSeriesDto,
  PageTaskDto,
} from "../../shared/types/mangaErp";
import { getWorkflowStatusMeta } from "../../shared/utils/workflowStatus";
import "./MangakaDashboardPage.css";

type ChapterWorkspace = {
  chapter: ChapterDto;
  series: MangaSeriesDto;
  tasks: PageTaskDto[];
};

const reviewStatuses = new Set(["submitted", "reviewing"]);
const qaStatuses = new Set(["submittedtoqa", "inqa", "pendingqa", "qapending"]);
const terminalChapterStatuses = new Set(["completed", "published", "rejected"]);

function normalizeStatus(status: string) {
  return status.replace(/[\s_-]/g, "").toLowerCase();
}

function activityTime(workspace: ChapterWorkspace) {
  const taskTimes = workspace.tasks.map((task) =>
    Date.parse(task.updatedAt ?? task.createdAt ?? ""),
  );
  const chapterTime = Date.parse(workspace.chapter.createdAt ?? "");

  return Math.max(chapterTime || 0, ...taskTimes.map((time) => time || 0));
}

export default function MangakaDashboardPage() {
  const toast = useToast();
  const [workspaces, setWorkspaces] = useState<ChapterWorkspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const load = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const seriesItems = await mangaErpApi.getMySeries();
      const chapterGroups = await Promise.all(
        seriesItems.map(async (series) => ({
          series,
          chapters: await mangaErpApi.getChaptersBySeries(series.id),
        })),
      );
      const chapterItems = chapterGroups.flatMap(({ series, chapters }) =>
        chapters.map((chapter) => ({ chapter, series })),
      );
      const workspaceItems = await Promise.all(
        chapterItems.map(async ({ chapter, series }) => ({
          chapter,
          series,
          tasks: await mangaErpApi.getChapterPageTasks(chapter.id),
        })),
      );

      setWorkspaces(workspaceItems);
    } catch (error) {
      const detail =
        error instanceof Error
          ? error.message
          : "Could not load production overview.";
      setWorkspaces([]);
      setErrorMessage(detail);
      toast.error("Could not load production dashboard", detail);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const overview = useMemo(() => {
    const tasks = workspaces.flatMap((workspace) => workspace.tasks);
    const activeTasks = tasks.filter(
      (task) =>
        !["approved", "completed", "rejected"].includes(
          normalizeStatus(task.status),
        ),
    );
    const assistants = new Set(
      activeTasks
        .map((task) => task.assignedAssistantId)
        .filter((id): id is string => Boolean(id)),
    );

    return {
      activeChapters: workspaces.filter(
        ({ chapter }) =>
          !terminalChapterStatuses.has(normalizeStatus(chapter.status)),
      ).length,
      waitingReview: tasks.filter((task) =>
        reviewStatuses.has(normalizeStatus(task.status)),
      ).length,
      pendingQa: workspaces.filter(({ chapter }) =>
        qaStatuses.has(normalizeStatus(chapter.status)),
      ).length,
      activeAssistants: assistants.size,
    };
  }, [workspaces]);

  const recentActivity = useMemo(
    () =>
      [...workspaces]
        .sort((first, second) => activityTime(second) - activityTime(first))
        .slice(0, 5),
    [workspaces],
  );

  const stats = [
    {
      label: "Active Chapters",
      value: overview.activeChapters,
      icon: BookOpen,
      tone: "cyan",
    },
    {
      label: "Tasks Waiting Review",
      value: overview.waitingReview,
      icon: ClipboardCheck,
      tone: "violet",
    },
    {
      label: "Pending QA",
      value: overview.pendingQa,
      icon: Send,
      tone: "blue",
    },
    {
      label: "Active Assistants",
      value: overview.activeAssistants,
      icon: Users,
      tone: "emerald",
    },
  ];

  const quickActions = [
    {
      label: "Create Chapter",
      description: "Set up the next chapter and its page scope.",
      to: "/mangaka/chapters",
      icon: Plus,
    },
    {
      label: "Assign Task",
      description: "Activate a page task for an Assistant.",
      to: "/mangaka/task-assignment",
      icon: Layers3,
    },
    {
      label: "Review Layers",
      description: "Approve submissions or request revisions.",
      to: "/mangaka/layer-review",
      icon: ClipboardCheck,
    },
    {
      label: "Submit QA",
      description: "Send a fully approved chapter to Editorial QA.",
      to: "/mangaka/qa-submission",
      icon: Send,
    },
  ];

  return (
    <div className="mangaka-dashboard-page space-y-6">
      <header className="rounded-2xl border border-white/10 bg-slate-900/75 p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
              Mangaka · MF2 Production
            </p>
            <h1 className="mt-2 text-3xl font-black text-white">
              Production Overview
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Monitor chapter progress, Assistant workload, layer reviews, and
              QA readiness from live workflow data.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={isLoading}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <RefreshCw
              size={16}
              className={isLoading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <article
            key={label}
            className={`production-stat-card stat-${tone} rounded-2xl border border-slate-800 bg-slate-900/80 p-5`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-400">{label}</p>
              <span className="rounded-lg bg-white/5 p-2">
                <Icon size={18} />
              </span>
            </div>
            <p className="mt-5 text-3xl font-black text-white">
              {isLoading ? "…" : value}
            </p>
          </article>
        ))}
      </section>

      {errorMessage ? (
        <section className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-6">
          <p className="font-semibold text-rose-100">
            Production data could not be loaded
          </p>
          <p className="mt-2 text-sm text-rose-200/70">{errorMessage}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-4 rounded-xl border border-rose-300/25 px-4 py-2 text-sm font-semibold text-rose-100"
          >
            Try again
          </button>
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
            Production shortcuts
          </p>
          <h2 className="mt-1 text-xl font-bold text-white">Quick Actions</h2>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map(({ label, description, to, icon: Icon }) => (
            <Link
              key={label}
              to={to}
              className="quick-action-card group rounded-xl border border-slate-800 bg-slate-950/70 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <Icon size={18} className="text-cyan-300" />
                <ArrowRight
                  size={16}
                  className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-cyan-300"
                />
              </div>
              <p className="mt-4 font-semibold text-white">{label}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Latest updates
            </p>
            <h2 className="mt-1 flex items-center gap-2 text-xl font-bold text-white">
              <Activity size={20} className="text-cyan-300" />
              Recent Chapter Activity
            </h2>
          </div>
          <Link
            to="/mangaka/chapters"
            className="text-sm font-semibold text-cyan-300"
          >
            View chapters
          </Link>
        </div>

        <div className="mt-5 space-y-3">
          {isLoading ? (
            <div className="dashboard-loading rounded-xl border border-slate-800 bg-slate-950 p-8 text-center text-sm text-slate-400">
              Loading chapter activity…
            </div>
          ) : null}

          {!isLoading && !errorMessage && recentActivity.length === 0 ? (
            <div className="dashboard-empty rounded-xl border border-dashed border-slate-700 bg-slate-950/70 p-10 text-center">
              <BookOpen className="mx-auto text-slate-600" size={30} />
              <p className="mt-3 font-semibold text-white">
                No chapter activity yet
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Create a chapter to begin the production workflow.
              </p>
            </div>
          ) : null}

          {recentActivity.map(({ chapter, series, tasks }) => {
            const completedTasks = tasks.filter(
              (task) => getWorkflowStatusMeta(task.status).progress >= 90,
            ).length;
            const progress = tasks.length
              ? Math.round((completedTasks / tasks.length) * 100)
              : 0;
            const lastActivity = activityTime({ chapter, series, tasks });

            return (
              <article
                key={chapter.id}
                className="chapter-activity-card rounded-xl border border-slate-800 bg-slate-950/70 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-500">{series.title}</p>
                    <h3 className="mt-1 font-semibold text-white">
                      Ch. {chapter.chapterNumber} — {chapter.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-500">
                      {tasks.length} page tasks
                      {lastActivity
                        ? ` · Updated ${new Date(lastActivity).toLocaleString()}`
                        : ""}
                    </p>
                  </div>
                  <WorkflowStatusBadge status={chapter.status} />
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Approved page tasks</span>
                    <span>
                      {completedTasks}/{tasks.length}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-emerald-400"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
