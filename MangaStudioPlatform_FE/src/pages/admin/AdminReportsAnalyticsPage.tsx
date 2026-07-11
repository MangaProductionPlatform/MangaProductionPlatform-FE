import { useEffect, useState } from "react";
import { BarChart3, RefreshCw, Trophy } from "lucide-react";
import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { AdminDashboardDto, AdminWorkflowStatsDto, RankingListDto, RankingPeriod } from "../../shared/types/mangaErp";

export default function AdminReportsAnalyticsPage() {
  const toast = useToast();
  const [dashboard, setDashboard] = useState<AdminDashboardDto | null>(null);
  const [workflow, setWorkflow] = useState<AdminWorkflowStatsDto | null>(null);
  const [rankings, setRankings] = useState<RankingListDto | null>(null);
  const [period, setPeriod] = useState<RankingPeriod>("Weekly");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingRanks, setIsRefreshingRanks] = useState(false);

  const loadReports = async (nextPeriod = period, showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const [dashboardResult, workflowResult, rankingResult] = await Promise.all([
        mangaErpApi.getAdminDashboard(),
        mangaErpApi.getAdminWorkflowStats(),
        mangaErpApi.getRankings(nextPeriod, 10),
      ]);
      setDashboard(dashboardResult);
      setWorkflow(workflowResult);
      setRankings(rankingResult);
    } catch (error) {
      toast.error("Could not load reports", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadInitialReports() {
      try {
        const [dashboardResult, workflowResult, rankingResult] = await Promise.all([
          mangaErpApi.getAdminDashboard(),
          mangaErpApi.getAdminWorkflowStats(),
          mangaErpApi.getRankings("Weekly", 10),
        ]);
        if (!ignore) {
          setDashboard(dashboardResult);
          setWorkflow(workflowResult);
          setRankings(rankingResult);
        }
      } catch (error) {
        if (!ignore) toast.error("Could not load reports", error instanceof Error ? error.message : "Unknown error");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    void loadInitialReports();
    return () => {
      ignore = true;
    };
    // Initial backend load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshRankings = async () => {
    setIsRefreshingRanks(true);
    try {
      await mangaErpApi.refreshRankings();
      toast.success("Ranking refresh requested");
      await loadReports(period);
    } catch (error) {
      toast.error("Could not refresh rankings", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsRefreshingRanks(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Admin</p>
          <h2 className="mt-2 text-3xl font-black text-white">Reports and analytics</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Operational metrics composed from dashboard, workflow, and ranking APIs.
          </p>
        </div>
        <button type="button" onClick={() => void loadReports()} disabled={isLoading} className="btn-secondary inline-flex items-center gap-2">
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ReportMetric label="Users" value={dashboard?.userStats.totalUsers ?? 0} />
        <ReportMetric label="Submissions" value={dashboard?.submissionStats.totalSubmissions ?? 0} />
        <ReportMetric label="Series" value={dashboard?.seriesStats.totalSeries ?? 0} />
        <ReportMetric label="Task statuses" value={workflow?.taskStats.length ?? 0} />
      </section>

      <section className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 font-bold text-white"><Trophy size={18} className="text-cyan-200" />Ranking analytics</h3>
            <p className="mt-1 text-sm text-slate-400">Public ranking snapshots plus admin refresh command.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="input min-h-11 w-40"
              value={period}
              onChange={(event) => {
                const next = event.target.value as RankingPeriod;
                setPeriod(next);
                void loadReports(next);
              }}
            >
              {["Daily", "Weekly", "Monthly", "AllTime"].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <button
              type="button"
              onClick={() => void refreshRankings()}
              disabled={isRefreshingRanks}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 disabled:opacity-50"
            >
              <RefreshCw size={16} className={isRefreshingRanks ? "animate-spin" : ""} />
              Refresh rankings
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[42rem] table-fixed divide-y divide-white/10 text-sm xl:min-w-full">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="w-20 px-4 py-3">Rank</th>
                <th className="px-4 py-3">Series</th>
                <th className="w-28 px-4 py-3">Score</th>
                <th className="w-28 px-4 py-3">Votes</th>
                <th className="w-28 px-4 py-3">Views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {rankings?.items.map((item, index) => (
                <tr key={`${item.seriesId}-${index}`} className="text-slate-200">
                  <td className="px-4 py-3 font-bold text-white">{item.rank ?? index + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">{item.title ?? "Untitled series"}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">{item.seriesId}</p>
                  </td>
                  <td className="px-4 py-3">{item.score ?? "-"}</td>
                  <td className="px-4 py-3">{item.votesCount ?? "-"}</td>
                  <td className="px-4 py-3">{item.viewsCount ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rankings?.items.length ? <p className="p-5 text-center text-sm text-slate-500">No ranking data returned.</p> : null}
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
        <h3 className="flex items-center gap-2 font-bold text-white"><BarChart3 size={18} className="text-cyan-200" />Workflow status counts</h3>
        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          <MiniList title="Submissions" items={workflow?.submissionStats ?? []} />
          <MiniList title="Chapters" items={workflow?.chapterStats ?? []} />
          <MiniList title="Tasks" items={workflow?.taskStats ?? []} />
        </div>
      </section>
    </div>
  );
}

function ReportMetric({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
    </article>
  );
}

function MiniList({ title, items }: { title: string; items: Array<{ status: string; count: number }> }) {
  return (
    <div className="rounded-lg bg-slate-950 p-4">
      <p className="font-semibold text-white">{title}</p>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item.status} className="flex justify-between gap-3 text-sm">
            <span className="text-slate-400">{item.status}</span>
            <span className="font-bold text-cyan-100">{item.count}</span>
          </div>
        ))}
        {!items.length ? <p className="text-sm text-slate-500">No records.</p> : null}
      </div>
    </div>
  );
}
