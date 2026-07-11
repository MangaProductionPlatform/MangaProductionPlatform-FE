import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardCheck, RefreshCw, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { EditorDashboardDto } from "../../shared/types/mangaErp";
import { useToast } from "../../shared/components/toastContext";

export default function EditorWorkspacePage() {
  const toast = useToast();
  const [data, setData] = useState<EditorDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try {
      setData(await mangaErpApi.getEditorDashboard());
    } catch (error) {
      toast.error(
        "Could not load editor dashboard",
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
  const overview = data?.overview;
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.28em] text-cyan-200">
            Tantou Editor
          </p>
          <h1 className="mt-2 text-3xl font-black text-white">
            Editorial workspace
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
          ["Assigned series", overview?.assignedSeriesCount],
          ["Waiting for QA", overview?.chaptersWaitingForQa],
          ["In revision", overview?.chaptersInRevision],
          ["Pins to verify", overview?.pinsAwaitingVerification],
          ["Approved this month", overview?.approvedThisMonth],
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
        <article className="border border-cyan-300/20 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <ClipboardCheck size={18} className="text-cyan-200" />
              QA queue
            </h2>
            <Link
              to="/app/editor/annotations"
              className="text-sm font-semibold text-cyan-200"
            >
              Open QA
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {data?.qaQueue.length ? (
              data.qaQueue.map((chapter) => (
                <div
                  key={chapter.id}
                  className="flex justify-between gap-3 border-b border-white/10 pb-3 text-sm"
                >
                  <span className="font-semibold text-white">
                    Ch. {chapter.chapterNumber}: {chapter.title}
                  </span>
                  <time className="text-slate-500">
                    {chapter.submittedAt
                      ? new Date(chapter.submittedAt).toLocaleDateString()
                      : ""}
                  </time>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No chapters are waiting for QA.
              </p>
            )}
          </div>
        </article>
        <article className="border border-amber-300/20 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <Wrench size={18} className="text-amber-200" />
              Revision watchlist
            </h2>
            <Link
              to="/app/editor/annotations"
              className="text-sm font-semibold text-cyan-200"
            >
              Review fixes
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {data?.revisionWatchlist.length ? (
              data.revisionWatchlist.map((chapter) => (
                <div
                  key={chapter.id}
                  className="flex justify-between gap-3 border-b border-white/10 pb-3 text-sm"
                >
                  <span className="font-semibold text-white">
                    Ch. {chapter.chapterNumber}: {chapter.title}
                  </span>
                  <span className="text-slate-400">
                    Open {chapter.pins.open} · Fixing {chapter.pins.inFixing} ·
                    Fixed {chapter.pins.fixed}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No revisions need attention.
              </p>
            )}
          </div>
        </article>
      </section>
      <section className="border border-emerald-300/20 bg-slate-900 p-5">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <CheckCircle2 size={18} className="text-emerald-200" />
          Upcoming publishing
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {data?.upcomingPublishing.length ? (
            data.upcomingPublishing.map((chapter) => (
              <div
                key={chapter.id}
                className="border border-white/10 p-3 text-sm"
              >
                <p className="font-semibold text-white">
                  Ch. {chapter.chapterNumber}: {chapter.title}
                </p>
                <p className="mt-1 text-slate-400">
                  {chapter.scheduledPublishAt
                    ? new Date(chapter.scheduledPublishAt).toLocaleString()
                    : "Not scheduled"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No upcoming publications.</p>
          )}
        </div>
      </section>
    </div>
  );
}
