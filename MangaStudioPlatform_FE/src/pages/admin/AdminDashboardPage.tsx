import { useEffect, useState } from "react";
import { Database, FileText, RefreshCw, Users } from "lucide-react";
import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { AdminDashboardDto } from "../../shared/types/mangaErp";

export default function AdminDashboardPage() {
  const toast = useToast();
  const [dashboard, setDashboard] = useState<AdminDashboardDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      setDashboard(await mangaErpApi.getAdminDashboard());
    } catch (error) {
      toast.error("Could not load admin dashboard", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadInitialDashboard() {
      try {
        const result = await mangaErpApi.getAdminDashboard();
        if (!ignore) setDashboard(result);
      } catch (error) {
        if (!ignore) toast.error("Could not load admin dashboard", error instanceof Error ? error.message : "Unknown error");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    void loadInitialDashboard();
    return () => {
      ignore = true;
    };
    // Initial backend load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const userStats = dashboard?.userStats;
  const submissionStats = dashboard?.submissionStats;
  const seriesStats = dashboard?.seriesStats;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Admin</p>
          <h2 className="mt-2 text-3xl font-black text-white">Admin dashboard</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Cross-module overview from the backend admin dashboard API.
          </p>
        </div>
        <button type="button" onClick={() => void loadDashboard()} disabled={isLoading} className="btn-secondary inline-flex items-center gap-2">
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      {isLoading ? <p className="rounded-lg border border-white/10 bg-slate-900/75 p-5 text-sm text-slate-300">Loading dashboard...</p> : null}

      {dashboard ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Metric icon={Users} label="Total users" value={userStats?.totalUsers ?? 0} detail={`${userStats?.activeUsers ?? 0} active`} />
            <Metric icon={Users} label="Pending activation" value={userStats?.pendingActivation ?? 0} detail={`${userStats?.suspendedUsers ?? 0} suspended`} />
            <Metric icon={FileText} label="Submissions" value={submissionStats?.totalSubmissions ?? 0} detail={`${submissionStats?.pendingEBReview ?? 0} pending EB`} />
            <Metric icon={Database} label="Series" value={seriesStats?.totalSeries ?? 0} detail={`${seriesStats?.active ?? 0} active`} />
          </section>

          <section className="grid gap-5 xl:grid-cols-3">
            <Breakdown
              title="Users by role"
              items={[
                ["Admins", userStats?.totalAdmins ?? 0],
                ["Mangaka", userStats?.totalMangaka ?? 0],
                ["Assistants", userStats?.totalAssistants ?? 0],
                ["Tantou Editors", userStats?.totalTantouEditors ?? 0],
                ["Editorial Board", userStats?.totalEditorialBoard ?? 0],
                ["Editor-in-Chief", userStats?.totalEditorInChief ?? 0],
              ]}
            />
            <Breakdown
              title="Submission workflow"
              items={[
                ["Draft", submissionStats?.draft ?? 0],
                ["Pending EB Review", submissionStats?.pendingEBReview ?? 0],
                ["Requires Revision", submissionStats?.requiresRevision ?? 0],
                ["Conflict Escalated", submissionStats?.conflictEscalated ?? 0],
                ["EB Approved", submissionStats?.ebApproved ?? 0],
                ["EB Rejected", submissionStats?.ebRejected ?? 0],
              ]}
            />
            <Breakdown
              title="Series lifecycle"
              items={[
                ["Active", seriesStats?.active ?? 0],
                ["Hiatus", seriesStats?.hiatus ?? 0],
                ["Cancelled", seriesStats?.cancelled ?? 0],
                ["Pending cancellation", seriesStats?.pendingCancellationRequests ?? 0],
              ]}
            />
          </section>

          <p className="text-xs text-slate-500">
            Generated at {dashboard.generatedAt ? new Date(dashboard.generatedAt).toLocaleString() : "-"}
          </p>
        </>
      ) : null}
    </div>
  );
}

function Metric({ icon: Icon, label, value, detail }: { icon: typeof Users; label: string; value: number; detail: string }) {
  return (
    <article className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-black text-white">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-200">
          <Icon size={20} />
        </div>
      </div>
    </article>
  );
}

function Breakdown({ title, items }: { title: string; items: Array<[string, number]> }) {
  return (
    <section className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
      <h3 className="font-bold text-white">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map(([label, count]) => (
          <div key={label} className="flex items-center justify-between gap-3 rounded-lg bg-slate-950 px-3 py-2 text-sm">
            <span className="text-slate-300">{label}</span>
            <span className="font-bold text-cyan-100">{count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
