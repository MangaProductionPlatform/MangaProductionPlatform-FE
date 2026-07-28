import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  Inbox,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type {
  PageTaskDto,
  StudioInvitationDto,
} from "../../shared/types/mangaErp";

type TaskSummary = {
  label: string;
  value: number;
  tone: string;
};

const getNormalizedStatus = (status: string) => status.toLowerCase();

const isRevisionTask = (task: PageTaskDto) => {
  const status = getNormalizedStatus(task.status);

  return (
    status === "revisionalert" ||
    status === "revisionrequired" ||
    status === "rejected"
  );
};

const formatDeadline = (deadline: string) =>
  new Date(deadline).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

const getDeadlineState = (deadline: string) => {
  const time = new Date(deadline).getTime();

  return time < Date.now() ? "Overdue" : "Due " + formatDeadline(deadline);
};

export default function AssistantDashboardPage() {
  const toast = useToast();
  const [invitations, setInvitations] = useState<StudioInvitationDto[]>([]);
  const [tasks, setTasks] = useState<PageTaskDto[]>([]);
  const [busyInvitationId, setBusyInvitationId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);

    try {
      const [pendingInvitations, assignedTasks] = await Promise.all([
        mangaErpApi.getPendingInvitations(),
        mangaErpApi.getAssignedPageTasks(),
      ]);

      setInvitations(pendingInvitations);
      setTasks(assignedTasks);
    } catch (error) {
      setInvitations([]);
      setTasks([]);
      toast.error(
        "Could not load Assistant dashboard",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // Trì hoãn lượt tải đầu để tránh cập nhật state ngay trong effect.
    const initialLoadTimer = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => window.clearTimeout(initialLoadTimer);
  }, [loadDashboard]);

  const taskSummary = useMemo<TaskSummary[]>(() => {
    const countByStatus = (statuses: string[]) =>
      tasks.filter((task) =>
        statuses.includes(getNormalizedStatus(task.status)),
      ).length;

    return [
      {
        label: "Pending",
        value: countByStatus(["pending"]),
        tone: "text-sky-200",
      },
      {
        label: "In progress",
        value: countByStatus(["incomplete", "inprogress"]),
        tone: "text-amber-200",
      },
      {
        label: "Under review",
        value: countByStatus(["reviewing"]),
        tone: "text-violet-200",
      },
      {
        label: "Needs revision",
        value: tasks.filter(isRevisionTask).length,
        tone: "text-rose-200",
      },
      {
        label: "Approved",
        value: countByStatus(["approved"]),
        tone: "text-emerald-200",
      },
    ];
  }, [tasks]);

  const priorityTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.deadline)
        .sort(
          (first, second) =>
            new Date(first.deadline ?? 0).getTime() -
            new Date(second.deadline ?? 0).getTime(),
        )
        .slice(0, 5),
    [tasks],
  );

  const revisionTasks = useMemo(
    () => tasks.filter(isRevisionTask).slice(0, 5),
    [tasks],
  );

  const respondToInvitation = async (
    invitationId: string,
    response: "accept" | "decline",
  ) => {
    setBusyInvitationId(invitationId);

    try {
      await mangaErpApi.respondToInvitation(invitationId, response);
      toast.success(
        response === "accept" ? "Invitation accepted" : "Invitation declined",
      );
      await loadDashboard();
    } catch (error) {
      toast.error(
        "Response failed",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setBusyInvitationId("");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.28em] text-cyan-200">
            Assistant workspace
          </p>
          <h1 className="mt-2 text-3xl font-black text-white">
            My work overview
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Review assigned page tasks, upcoming deadlines, revision requests,
            and series invitations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadDashboard()}
          disabled={isLoading}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      <section
        aria-label="Task status summary"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
      >
        {taskSummary.map((item) => (
          <article
            key={item.label}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-500">
              {item.label}
            </p>
            <p className={`mt-3 text-3xl font-black ${item.tone}`}>
              {isLoading ? "—" : item.value}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <DashboardTaskPanel
          title="Due soon"
          description="Tasks with the nearest delivery deadlines."
          icon={CalendarClock}
          tasks={priorityTasks}
          isLoading={isLoading}
          emptyMessage="No task deadlines are currently scheduled."
          renderMeta={(task) =>
            task.deadline ? getDeadlineState(task.deadline) : "No deadline"
          }
        />

        <DashboardTaskPanel
          title="Revision requests"
          description="Review Mangaka feedback and submit an updated layer."
          icon={RotateCcw}
          tasks={revisionTasks}
          isLoading={isLoading}
          emptyMessage="No revision requests need your attention."
          renderMeta={(task) =>
            task.rejectionNote ?? "Open task to view feedback."
          }
          tone="rose"
        />
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-violet-400/25 bg-violet-400/10 text-violet-200">
              <Inbox size={20} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-violet-200">
                Studio invitations
              </p>
              <h2 className="mt-1 text-xl font-black text-white">
                Pending invitations
              </h2>
            </div>
          </div>

          <span className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-300">
            {isLoading ? "Loading…" : `${invitations.length} pending`}
          </span>
        </div>

        {isLoading ? (
          <div className="mt-5 grid gap-3">
            <div className="skeleton h-20 w-full" />
            <div className="skeleton h-20 w-full" />
          </div>
        ) : invitations.length ? (
          <div className="mt-5 grid gap-3">
            {invitations.map((invitation) => (
              <article
                key={invitation.invitationId}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-white">Studio invitation</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {invitation.message ||
                      "A Mangaka invited you to join their studio."}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      void respondToInvitation(
                        invitation.invitationId,
                        "accept",
                      )
                    }
                    disabled={busyInvitationId === invitation.invitationId}
                    className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void respondToInvitation(
                        invitation.invitationId,
                        "decline",
                      )
                    }
                    disabled={busyInvitationId === invitation.invitationId}
                    className="rounded-lg border border-rose-400/30 px-4 py-2 text-sm font-semibold text-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Decline
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 p-4 text-sm text-slate-400">
            No pending invitations. New studio invitations will appear here.
          </div>
        )}
      </section>
    </div>
  );
}

type DashboardTaskPanelProps = {
  title: string;
  description: string;
  icon: typeof CalendarClock;
  tasks: PageTaskDto[];
  isLoading: boolean;
  emptyMessage: string;
  renderMeta: (task: PageTaskDto) => string;
  tone?: "rose";
};

function DashboardTaskPanel({
  title,
  description,
  icon: Icon,
  tasks,
  isLoading,
  emptyMessage,
  renderMeta,
  tone,
}: DashboardTaskPanelProps) {
  const iconClassName =
    tone === "rose"
      ? "border-rose-400/25 bg-rose-400/10 text-rose-200"
      : "border-cyan-400/25 bg-cyan-400/10 text-cyan-200";

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-start gap-3">
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${iconClassName}`}
        >
          <Icon size={20} />
        </span>
        <div>
          <h2 className="font-black text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-5 grid gap-3">
          <div className="skeleton h-16 w-full" />
          <div className="skeleton h-16 w-full" />
        </div>
      ) : tasks.length ? (
        <div className="mt-5 grid gap-3">
          {tasks.map((task) => (
            <article
              key={task.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4"
            >
              <div className="min-w-0">
                <p className="font-semibold text-white">
                  {task.chapterTitle ?? `Chapter ${task.chapterNumber ?? ""}`}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Page {task.pageNumber}
                  {task.taskType ? ` · ${task.taskType}` : ""}
                </p>
                <p
                  className={`mt-2 text-xs ${tone === "rose" ? "text-rose-200" : "text-amber-200"}`}
                >
                  {renderMeta(task)}
                </p>
              </div>

              <Link
                to={`/assistant/tasks/${task.id}`}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/60 hover:text-cyan-100"
              >
                Open task
                <ArrowRight size={15} />
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 p-4 text-sm text-slate-400">
          <AlertCircle size={18} className="shrink-0 text-slate-500" />
          {emptyMessage}
        </div>
      )}

      <Link
        to="/assistant/tasks"
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 hover:text-cyan-100"
      >
        View all tasks
        <ArrowRight size={15} />
      </Link>
    </section>
  );
}
