import { useEffect, useState } from "react";
import { CalendarClock, FileText, RefreshCw, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { BoardDashboardDto } from "../../shared/types/mangaErp";

export default function BoardDashboardPage() {
  const toast = useToast();
  const [data, setData] = useState<BoardDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try {
      setData(await mangaErpApi.getBoardDashboard());
    } catch (error) {
      toast.error(
        "Could not load Board dashboard",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setLoading(false);
    }
  };
  // Initial backend load only.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const o = data?.overview;
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.28em] text-fuchsia-200">
            Editorial Board
          </p>
          <h1 className="mt-2 text-3xl font-black text-white">
            Decision workspace
          </h1>
        </div>
        <button
          type="button"
          title="Refresh dashboard"
          onClick={() => void load()}
          className="icon-button"
        >
          <RefreshCw size={17} />
        </button>
      </header>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Proposals waiting", o?.proposalsWaitingForVote],
          ["Conflicts", o?.conflictsAwaitingResolution],
          ["Ready to publish", o?.chaptersReadyForPublish],
          ["Publishing this week", o?.scheduledPublicationsThisWeek],
          ["Cancellation requests", o?.cancellationRequestsPending],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="border border-white/10 bg-slate-900 p-4"
          >
            <p className="text-xs uppercase tracking-[.16em] text-slate-400">
              {label}
            </p>
            <p className="mt-2 text-2xl font-black text-white">
              {loading ? "..." : (value ?? 0)}
            </p>
          </div>
        ))}
      </section>
      <section className="grid gap-5 xl:grid-cols-2">
        <article className="border border-fuchsia-300/20 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <FileText size={18} className="text-fuchsia-200" />
              Proposal queue
            </h2>
            <Link
              to="/app/board/series-proposals"
              className="text-sm font-semibold text-fuchsia-200"
            >
              Open queue
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {data?.proposalQueue.length ? (
              data.proposalQueue.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-3 border-b border-white/10 pb-3 text-sm"
                >
                  <span className="font-semibold text-white">{item.title}</span>
                  <time className="text-slate-500">
                    {item.submittedAt
                      ? new Date(item.submittedAt).toLocaleDateString()
                      : ""}
                  </time>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No proposals waiting for a vote.
              </p>
            )}
          </div>
        </article>
        <article className="border border-cyan-300/20 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <CalendarClock size={18} className="text-cyan-200" />
              Upcoming schedule
            </h2>
            <Link
              to="/app/board/publishing-schedule"
              className="text-sm font-semibold text-cyan-200"
            >
              Manage schedule
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {data?.upcomingSchedule.length ? (
              data.upcomingSchedule.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-3 border-b border-white/10 pb-3 text-sm"
                >
                  <span className="font-semibold text-white">
                    Ch. {item.chapterNumber}: {item.title}
                  </span>
                  <time className="text-slate-500">
                    {item.scheduledPublishAt
                      ? new Date(item.scheduledPublishAt).toLocaleString()
                      : ""}
                  </time>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No chapters are scheduled.
              </p>
            )}
          </div>
        </article>
      </section>
      <Link
        to="/app/board/cancellation-review"
        className="flex items-center gap-3 border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-100"
      >
        <Scale size={20} />
        {o?.cancellationRequestsPending ?? 0} cancellation request(s) need a
        Board decision.
      </Link>
    </div>
  );
}
