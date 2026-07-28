import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  TimerReset,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type {
  BoardDashboardDto,
  EditorialSubmissionListItemDto,
} from "../../shared/types/mangaErp";

const getTimeValue = (value?: string | null) => {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const formatDateTime = (value?: string | null) => {
  const time = getTimeValue(value);
  if (!time) return "No created time";
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(time));
};

const ageInDays = (value: string | null | undefined, nowTimestamp: number) => {
  const time = getTimeValue(value);
  if (!time) return null;
  return Math.floor((nowTimestamp - time) / (24 * 60 * 60 * 1000));
};

const priorityRank = (item: EditorialSubmissionListItemDto) => {
  if (item.status === "Pending_EB_Review") return 0;
  if (item.status === "Conflict_Escalated") return 1;
  if (item.status === "Pending_Tantou_Review") return 2;
  if (item.status === "EB_Rejected") return 3;
  if (item.status === "EB_Approved") return 4;
  return 5;
};

export default function BoardDashboardPage() {
  const toast = useToast();
  const [data, setData] = useState<BoardDashboardDto | null>(null);
  const [submissions, setSubmissions] = useState<EditorialSubmissionListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsNow] = useState(() => Date.now());

  const load = async () => {
    setLoading(true);
    try {
      const [dashboardResult, submissionsResult] = await Promise.allSettled([
        mangaErpApi.getBoardDashboard(),
        mangaErpApi.getEditorialAllSubmissions(),
      ]);

      if (dashboardResult.status === "fulfilled") {
        setData(dashboardResult.value);
      } else {
        toast.error(
          "Could not load Board metrics",
          dashboardResult.reason instanceof Error
            ? dashboardResult.reason.message
            : "Unknown error",
        );
      }

      if (submissionsResult.status === "fulfilled") {
        setSubmissions(submissionsResult.value);
      } else {
        toast.error(
          "Could not load submissions",
          submissionsResult.reason instanceof Error
            ? submissionsResult.reason.message
            : "Unknown error",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const todayStart = new Date(statsNow);
    todayStart.setHours(0, 0, 0, 0);
    const weekAgo = statsNow - 7 * 24 * 60 * 60 * 1000;
    return {
      needsVote: submissions.filter((item) => item.status === "Pending_EB_Review").length,
      newToday: submissions.filter((item) => getTimeValue(item.createdAt) >= todayStart.getTime()).length,
      stale: submissions.filter((item) => item.status === "Pending_EB_Review" && (ageInDays(item.createdAt, statsNow) ?? 0) >= 7).length,
      approvedWeek: submissions.filter((item) => item.status === "EB_Approved" && getTimeValue(item.createdAt) >= weekAgo).length,
      rejectedWeek: submissions.filter((item) => item.status === "EB_Rejected" && getTimeValue(item.createdAt) >= weekAgo).length,
      conflicts: submissions.filter((item) => item.status === "Conflict_Escalated").length,
    };
  }, [statsNow, submissions]);

  const priorityQueue = useMemo(
    () =>
      submissions
        .filter((item) =>
          ["Pending_EB_Review", "Conflict_Escalated", "Pending_Tantou_Review"].includes(item.status),
        )
        .sort((left, right) => {
          const rankDiff = priorityRank(left) - priorityRank(right);
          if (rankDiff !== 0) return rankDiff;
          return getTimeValue(right.createdAt) - getTimeValue(left.createdAt);
        })
        .slice(0, 8),
    [submissions],
  );

  const recentDecisions = useMemo(
    () =>
      submissions
        .filter((item) => item.status === "EB_Approved" || item.status === "EB_Rejected")
        .sort((left, right) => getTimeValue(right.createdAt) - getTimeValue(left.createdAt))
        .slice(0, 6),
    [submissions],
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.28em] text-fuchsia-200">
            Editorial Board · MF1
          </p>
          <h1 className="mt-2 text-3xl font-black text-white">
            Decision workspace
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Prioritized series submissions, fresh proposals, and recent board decisions.
          </p>
        </div>
        <button
          type="button"
          title="Refresh dashboard"
          onClick={() => void load()}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-4 text-sm font-bold text-slate-950 hover:bg-cyan-100"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={<FileText size={18} />} label="Needs vote" value={stats.needsVote} tone="cyan" loading={loading} />
        <MetricCard icon={<Clock3 size={18} />} label="New today" value={stats.newToday} tone="emerald" loading={loading} />
        <MetricCard icon={<TimerReset size={18} />} label="Stale 7d+" value={stats.stale} tone="amber" loading={loading} />
        <MetricCard icon={<CheckCircle2 size={18} />} label="Approved 7d" value={stats.approvedWeek} tone="violet" loading={loading} />
        <MetricCard icon={<XCircle size={18} />} label="Rejected 7d" value={stats.rejectedWeek} tone="rose" loading={loading} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(22rem,.8fr)]">
        <article className="rounded-lg border border-cyan-300/20 bg-slate-900/75 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <FileText size={18} className="text-cyan-200" />
                Priority review queue
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Vote-ready items first, then conflicts and older migrated submissions.
              </p>
            </div>
            <Link
              to="/app/board/series-proposals"
              className="inline-flex min-h-10 items-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100 hover:bg-cyan-300/15"
            >
              Open proposals
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {priorityQueue.length ? (
              priorityQueue.map((item) => (
                <QueueRow key={item.id} item={item} nowTimestamp={statsNow} />
              ))
            ) : (
              <EmptyLine text="No submissions need board attention right now." />
            )}
          </div>
        </article>

        <article className="rounded-lg border border-violet-300/20 bg-slate-900/75 p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <CheckCircle2 size={18} className="text-violet-200" />
            Recent decisions
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Latest approved or rejected proposals from the MF1 list.
          </p>

          <div className="mt-5 space-y-3">
            {recentDecisions.length ? (
              recentDecisions.map((item) => (
                <DecisionRow key={item.id} item={item} />
              ))
            ) : (
              <EmptyLine text="No recent approved or rejected proposals yet." />
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
          <h2 className="text-lg font-bold text-white">Status breakdown</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              ["Pending EB review", stats.needsVote],
              ["Conflict escalated", stats.conflicts],
              ["Approved", submissions.filter((item) => item.status === "EB_Approved").length],
              ["Rejected", submissions.filter((item) => item.status === "EB_Rejected").length],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-lg bg-slate-950/70 p-3">
                <p className="text-xs uppercase tracking-[.14em] text-slate-500">{label}</p>
                <p className="mt-1 text-xl font-black text-white">{loading ? "..." : value}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-amber-300/20 bg-amber-300/5 p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-amber-100">
            <AlertTriangle size={18} />
            Other board work
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link
              to="/app/board/publishing-schedule"
              className="rounded-lg border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-300 hover:bg-white/5"
            >
              <span className="block font-bold text-white">
                {data?.overview.chaptersReadyForPublish ?? 0} ready to publish
              </span>
              Publishing work is kept outside the MF1 review queue.
            </Link>
            <Link
              to="/app/board/cancellation-review"
              className="rounded-lg border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-300 hover:bg-white/5"
            >
              <span className="block font-bold text-white">
                {data?.overview.cancellationRequestsPending ?? 0} cancellation requests
              </span>
              Review cancellation decisions separately.
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  tone,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "cyan" | "emerald" | "amber" | "violet" | "rose";
  loading: boolean;
}) {
  const toneClass = {
    cyan: "text-cyan-100 bg-cyan-300/10 border-cyan-300/20",
    emerald: "text-emerald-100 bg-emerald-300/10 border-emerald-300/20",
    amber: "text-amber-100 bg-amber-300/10 border-amber-300/20",
    violet: "text-violet-100 bg-violet-300/10 border-violet-300/20",
    rose: "text-rose-100 bg-rose-300/10 border-rose-300/20",
  }[tone];
  return (
    <div className={`rounded-lg border p-4 ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950/40">
          {icon}
        </span>
        <span className="text-xs font-bold uppercase tracking-[.18em] opacity-70">
          MF1
        </span>
      </div>
      <p className="mt-4 text-xs uppercase tracking-[.16em] opacity-75">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{loading ? "..." : value}</p>
    </div>
  );
}

function QueueRow({
  item,
  nowTimestamp,
}: {
  item: EditorialSubmissionListItemDto;
  nowTimestamp: number;
}) {
  const days = ageInDays(item.createdAt, nowTimestamp);
  const stale = item.status === "Pending_EB_Review" && days !== null && days >= 7;
  return (
    <Link
      to={`/app/board/series-proposals?id=${item.id}`}
      className="block rounded-lg border border-white/10 bg-slate-950/60 p-4 hover:border-cyan-300/40 hover:bg-slate-950"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={item.status} />
            {stale ? (
              <span className="rounded-md border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-xs font-bold text-amber-100">
                Stale
              </span>
            ) : null}
          </div>
          <h3 className="mt-2 break-words text-lg font-black text-white">{item.title}</h3>
        </div>
        <time className="shrink-0 text-sm text-slate-400">
          {formatDateTime(item.createdAt)}
        </time>
      </div>
    </Link>
  );
}

function DecisionRow({ item }: { item: EditorialSubmissionListItemDto }) {
  return (
    <Link
      to={`/app/board/series-proposals?id=${item.id}`}
      className="block rounded-lg border border-white/10 bg-slate-950/60 p-3 hover:bg-slate-950"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-bold text-white">{item.title}</p>
          <p className="mt-1 text-xs text-slate-500">{formatDateTime(item.createdAt)}</p>
        </div>
        <StatusBadge status={item.status} />
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusClass =
    status === "Pending_EB_Review"
      ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-100"
      : status === "Conflict_Escalated"
        ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
        : status === "EB_Approved"
          ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
          : status === "EB_Rejected"
            ? "border-rose-300/20 bg-rose-300/10 text-rose-100"
            : "border-white/10 bg-white/5 text-slate-300";
  return (
    <span className={`rounded-md border px-2 py-1 text-xs font-bold ${statusClass}`}>
      {status}
    </span>
  );
}

function EmptyLine({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-dashed border-white/10 p-4 text-sm text-slate-500">
      {text}
    </p>
  );
}
