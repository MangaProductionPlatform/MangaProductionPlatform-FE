import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  FilePenLine,
  RefreshCw,
  Send,
  XCircle,
} from "lucide-react";

import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type {
  MangaSeriesDto,
  SubmissionSummaryDto,
} from "../../shared/types/mangaErp";

type AnalyticsTrend = {
  month: string;
  views?: number;
  votes?: number;
  publishedChapters?: number;
};

type SeriesAnalytics = {
  seriesId?: string;
  totalViews?: number;
  totalVotes?: number;
  monthlyTrends: AnalyticsTrend[];
  chapterTrends: AnalyticsTrend[];
};

type SeriesAnalyticsEntry = {
  series: MangaSeriesDto;
  analytics: SeriesAnalytics | null;
};

function formatMetric(value: number | undefined): string {
  return typeof value === "number"
    ? new Intl.NumberFormat("en-US").format(value)
    : "—";
}

function AnalyticsTrendTable({
  title,
  trends,
  metricLabel,
  getValue,
}: {
  title: string;
  trends: AnalyticsTrend[];
  metricLabel: string;
  getValue: (trend: AnalyticsTrend) => number | undefined;
}) {
  if (!trends.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-2 text-sm text-slate-400">
          No trend data returned for this series.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/40">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <p className="text-sm font-semibold text-white">{title}</p>
        <span className="text-xs text-slate-400">{metricLabel}</span>
      </div>
      <div className="max-h-56 overflow-y-auto">
        {trends.map((trend) => (
          <div
            key={`${title}-${trend.month}`}
            className="flex items-center justify-between gap-4 border-b border-white/5 px-4 py-2.5 last:border-b-0"
          >
            <span className="text-sm text-slate-300">{trend.month}</span>
            <span className="font-semibold text-white">
              {formatMetric(getValue(trend))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SeriesAnalyticsPanel({ series, analytics }: SeriesAnalyticsEntry) {
  return (
    <article className="rounded-2xl border border-cyan-200/15 bg-slate-950/30 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3
            className="truncate text-lg font-bold text-white"
            title={series.title}
          >
            {series.title}
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            {series.genre || "Official series"} · {series.status}
          </p>
        </div>
        <Link
          to="/mangaka/chapters"
          state={{ seriesId: series.id }}
          className="btn-secondary inline-flex shrink-0 items-center justify-center"
        >
          View series chapters
        </Link>
      </div>

      {analytics ? (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-cyan-100/70">
                Total views
              </p>
              <p className="mt-2 text-2xl font-black text-white">
                {formatMetric(analytics.totalViews)}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-cyan-100/70">
                Total votes
              </p>
              <p className="mt-2 text-2xl font-black text-white">
                {formatMetric(analytics.totalVotes)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <AnalyticsTrendTable
              title="Monthly views"
              trends={analytics.monthlyTrends}
              metricLabel="Views"
              getValue={(trend) => trend.views}
            />
            <AnalyticsTrendTable
              title="Published chapters"
              trends={analytics.chapterTrends}
              metricLabel="Chapters"
              getValue={(trend) => trend.publishedChapters}
            />
          </div>
        </>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-slate-700 bg-slate-950/30 p-4">
          <p className="text-sm font-medium text-slate-300">
            Analytics are not available for this series yet.
          </p>
        </div>
      )}
    </article>
  );
}

export default function MangakaDashboardPage() {
  const toast = useToast();
  const [submissions, setSubmissions] = useState<SubmissionSummaryDto[]>([]);
  const [series, setSeries] = useState<MangaSeriesDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboard = async (showRefreshingState = false) => {
    if (showRefreshingState) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [submissionResult, seriesResult] = await Promise.all([
        mangaErpApi.getMySubmissions(),
        mangaErpApi.getMySeries(),
      ]);

      setSubmissions(submissionResult);
      setSeries(seriesResult);
    } catch (error) {
      toast.error(
        "Could not load MF1 dashboard",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Defer initial fetching so state changes happen after the first paint.
    const initialLoadTimer = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => window.clearTimeout(initialLoadTimer);
    // loadDashboard is intentionally invoked once for the initial dashboard load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = [
    {
      label: "Drafts",
      value: submissions.filter((item) => item.status === "Draft").length,
      icon: FilePenLine,
    },
    {
      label: "Pending EB review",
      value: submissions.filter((item) => item.status === "Pending_EB_Review")
        .length,
      icon: Send,
    },
    {
      label: "Rejected proposals",
      value: submissions.filter((item) => item.status === "EB_Rejected")
        .length,
      icon: XCircle,
    },
    {
      label: "Active series",
      value: series.filter((item) => item.status === "Active").length,
      icon: BookOpen,
    },
  ];

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-white/10 bg-slate-900/75 p-7">
        <p className="text-xs font-semibold uppercase tracking-[.28em] text-cyan-200">
          Mangaka · MF1
        </p>
        <h1 className="mt-2 text-3xl font-black text-white">
          Series Submission Dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Track proposal progress and the status of your official series.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-slate-900/75 p-5"
            >
              <div className="flex justify-between text-slate-400">
                <span>{item.label}</span>
                <Icon size={20} className="text-cyan-300" />
              </div>
              <p className="mt-4 text-3xl font-black text-white">
                {loading ? "…" : item.value}
              </p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          to="/mangaka/submissions"
          className="interactive-card rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-6"
        >
          <h2 className="text-xl font-bold text-white">
            Create or manage a proposal
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Draft, update manuscript, and submit proposals for board review.
          </p>
        </Link>
        <Link
          to="/mangaka/series"
          className="interactive-card rounded-2xl border border-white/10 bg-slate-900/75 p-6"
        >
          <h2 className="text-xl font-bold text-white">Official Series</h2>
          <p className="mt-2 text-sm text-slate-400">
            Approved Series become Active and allow Chapter creation.
          </p>
        </Link>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-900/75 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-white">Recent submissions</h2>
          <button
            type="button"
            onClick={() => void loadDashboard(true)}
            disabled={isRefreshing}
            className="btn-secondary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? "animate-spin" : undefined}
            />
            {isRefreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {submissions.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/60 p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
              <span className="h-fit rounded-md bg-cyan-300/10 px-2 py-1 text-sm text-cyan-100">
                {item.status}
              </span>
            </div>
          ))}
          {!loading && !submissions.length ? (
            <p className="text-sm text-slate-400">No submissions yet.</p>
          ) : null}
        </div>
      </section>

    </div>
  );
}
