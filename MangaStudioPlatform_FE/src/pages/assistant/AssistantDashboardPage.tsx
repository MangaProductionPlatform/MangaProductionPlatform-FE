import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Inbox,
  RefreshCw,
  RotateCcw,
  Send,
} from "lucide-react";
import { Link } from "react-router-dom";
import { WorkflowStatusBadge } from "../../shared/components/WorkflowStatusBadge";
import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type {
  PageTaskDto,
  StudioInvitationDto,
} from "../../shared/types/mangaErp";
import { getWorkflowStatusMeta } from "../../shared/utils/workflowStatus";
import "./AssistantDashboardPage.css";

function normalizeStatus(status: string) {
  return status.replace(/[\s_-]/g, "").toLowerCase();
}

function isToday(value?: string) {
  if (!value) return false;

  const date = new Date(value);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export default function AssistantDashboardPage() {
  const toast = useToast();
  const [tasks, setTasks] = useState<PageTaskDto[]>([]);
  const [invitations, setInvitations] = useState<StudioInvitationDto[]>([]);
  const [busyInvitationId, setBusyInvitationId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const load = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [taskItems, invitationItems] = await Promise.all([
        mangaErpApi.getAssignedPageTasks(),
        mangaErpApi.getPendingInvitations(),
      ]);
      setTasks(taskItems);
      setInvitations(invitationItems);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown error";
      setTasks([]);
      setInvitations([]);
      setErrorMessage(detail);
      toast.error("Could not load Assistant dashboard", detail);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const respond = async (
    invitationId: string,
    response: "accept" | "decline",
  ) => {
    setBusyInvitationId(invitationId);

    try {
      await mangaErpApi.respondToInvitation(invitationId, response);
      toast.success(
        response === "accept" ? "Invitation accepted" : "Invitation declined",
      );
      await load();
    } catch (error) {
      toast.error(
        "Response failed",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setBusyInvitationId("");
    }
  };

  const taskOverview = useMemo(() => {
    const count = (status: string) =>
      tasks.filter((task) => normalizeStatus(task.status) === status).length;

    return {
      incomplete: count("incomplete"),
      reviewing: count("reviewing"),
      revisionRequired: count("revisionrequired"),
      submitted: count("submitted"),
    };
  }, [tasks]);

  const todayTasks = useMemo(
    () =>
      tasks.filter((task) => isToday(task.updatedAt ?? task.createdAt)).slice(0, 5),
    [tasks],
  );
  const submissionTask =
    tasks.find((task) => normalizeStatus(task.status) === "revisionrequired") ??
    tasks.find((task) =>
      ["assigned", "incomplete"].includes(normalizeStatus(task.status)),
    ) ??
    tasks[0];

  const stats = [
    {
      label: "Incomplete",
      value: taskOverview.incomplete,
      icon: Clock3,
      tone: "amber",
    },
    {
      label: "Reviewing",
      value: taskOverview.reviewing,
      icon: ClipboardList,
      tone: "violet",
    },
    {
      label: "Revision Required",
      value: taskOverview.revisionRequired,
      icon: RotateCcw,
      tone: "rose",
    },
    {
      label: "Submitted",
      value: taskOverview.submitted,
      icon: CheckCircle2,
      tone: "blue",
    },
  ];

  return (
    <div className="assistant-dashboard-page space-y-6">
      <header>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-200">
              Assistant · MF2 Production
            </p>
            <h1 className="mt-2 text-3xl font-black text-white">
              My Production Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Track assigned pages, review progress, and revision work from your
              live task inbox.
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
            className={`assistant-stat-card stat-${tone} rounded-2xl border border-slate-800 p-5`}
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
        <section className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 shrink-0 text-rose-300" size={20} />
            <div>
              <p className="font-semibold text-rose-100">
                Production data could not be loaded
              </p>
              <p className="mt-1 text-sm text-rose-200/70">{errorMessage}</p>
              <button
                type="button"
                onClick={() => void load()}
                className="mt-4 rounded-lg border border-rose-300/25 px-3 py-2 text-sm font-semibold text-rose-100"
              >
                Try again
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          to="/assistant/tasks"
          className="assistant-quick-action group rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <ClipboardList className="text-cyan-300" size={22} />
            <ArrowRight
              className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-cyan-300"
              size={18}
            />
          </div>
          <h2 className="mt-4 font-bold text-white">Open My Tasks</h2>
          <p className="mt-1 text-sm text-slate-400">
            View the full assigned page-task queue and its filters.
          </p>
        </Link>

        <Link
          to={
            submissionTask
              ? `/assistant/tasks/${submissionTask.id}`
              : "/assistant/tasks"
          }
          className="assistant-quick-action group rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <Send className="text-emerald-300" size={22} />
            <ArrowRight
              className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-emerald-300"
              size={18}
            />
          </div>
          <h2 className="mt-4 font-bold text-white">Submit Layer</h2>
          <p className="mt-1 text-sm text-slate-400">
            {submissionTask
              ? `Continue page ${submissionTask.pageNumber} artwork.`
              : "Choose an assigned task before submitting artwork."}
          </p>
        </Link>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Daily focus
            </p>
            <h2 className="mt-1 text-xl font-bold text-white">Today's Tasks</h2>
          </div>
          <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">
            {todayTasks.length} tasks
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {isLoading ? (
            <div className="assistant-dashboard-loading rounded-xl border border-slate-800 bg-slate-950 p-8 text-center text-slate-400">
              <RefreshCw
                className="mx-auto animate-spin text-cyan-300"
                size={24}
              />
              <p className="mt-3 text-sm">Loading today's production work…</p>
            </div>
          ) : null}

          {!isLoading && !errorMessage && todayTasks.length === 0 ? (
            <div className="assistant-dashboard-empty rounded-xl border border-dashed border-slate-700 bg-slate-950/70 p-10 text-center">
              <Inbox className="mx-auto text-slate-600" size={30} />
              <p className="mt-3 font-semibold text-white">
                No task activity today
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Your assigned tasks remain available in My Tasks.
              </p>
            </div>
          ) : null}

          {todayTasks.map((task) => {
            const status = getWorkflowStatusMeta(task.status);

            return (
              <article
                key={task.id}
                className="today-task-card rounded-xl border border-slate-800 bg-slate-950/70 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">
                      {task.chapterTitle ??
                        `Chapter ${task.chapterNumber ?? ""}`} · Page{" "}
                      {task.pageNumber}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {task.currentLayerType ?? "Layer not submitted"}
                    </p>
                  </div>
                  <WorkflowStatusBadge status={task.status} />
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-300"
                      style={{ width: `${status.progress}%` }}
                    />
                  </div>
                  <Link
                    to={`/assistant/tasks/${task.id}`}
                    className="text-xs font-semibold text-cyan-300"
                  >
                    Open task
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-white">Studio Invitations</h2>
          <span className="text-sm text-slate-500">{invitations.length} pending</span>
        </div>

        <div className="mt-5 space-y-3">
          {!isLoading && invitations.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-700 bg-slate-950/70 p-5 text-sm text-slate-400">
              No pending studio invitations.
            </p>
          ) : null}

          {invitations.map((invitation) => (
            <article
              key={invitation.invitationId}
              className="rounded-xl border border-white/10 p-5"
            >
              <h3 className="font-bold text-white">
                Series {invitation.seriesId}
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                {invitation.message || "You were invited to join this studio."}
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  disabled={busyInvitationId === invitation.invitationId}
                  className="rounded-lg bg-cyan-300 px-4 py-2 font-bold text-slate-950"
                  onClick={() =>
                    void respond(invitation.invitationId, "accept")
                  }
                >
                  Accept
                </button>
                <button
                  type="button"
                  disabled={busyInvitationId === invitation.invitationId}
                  className="rounded-lg border border-rose-400/30 px-4 py-2 text-rose-200"
                  onClick={() =>
                    void respond(invitation.invitationId, "decline")
                  }
                >
                  Decline
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
