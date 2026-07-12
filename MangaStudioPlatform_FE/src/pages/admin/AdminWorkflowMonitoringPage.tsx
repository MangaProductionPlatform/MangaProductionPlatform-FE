import { useEffect, useMemo, useState } from "react";
import { GitBranch, RefreshCw } from "lucide-react";
import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { AdminWorkflowStatsDto } from "../../shared/types/mangaErp";

// Workflow monitoring chỉ đọc các chỉ số pipeline nhằm hỗ trợ Admin phát hiện điểm nghẽn.
export default function AdminWorkflowMonitoringPage() {
  const toast = useToast();
  const [stats, setStats] = useState<AdminWorkflowStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      setStats(await mangaErpApi.getAdminWorkflowStats());
    } catch (error) {
      toast.error(
        "Could not load workflow stats",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadInitialStats() {
      try {
        const result = await mangaErpApi.getAdminWorkflowStats();
        if (!ignore) setStats(result);
      } catch (error) {
        if (!ignore)
          toast.error(
            "Could not load workflow stats",
            error instanceof Error ? error.message : "Unknown error",
          );
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    void loadInitialStats();
    return () => {
      ignore = true;
    };
    // Initial backend load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = useMemo(
    () => ({
      submissions:
        stats?.submissionStats.reduce((sum, item) => sum + item.count, 0) ?? 0,
      chapters:
        stats?.chapterStats.reduce((sum, item) => sum + item.count, 0) ?? 0,
      tasks: stats?.taskStats.reduce((sum, item) => sum + item.count, 0) ?? 0,
    }),
    [stats],
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Admin
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Workflow monitoring
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Status breakdown across submissions, chapters, and page tasks.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadStats()}
          disabled={isLoading}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Summary label="Submissions" value={totals.submissions} />
        <Summary label="Chapters" value={totals.chapters} />
        <Summary label="Page tasks" value={totals.tasks} />
      </section>

      {isLoading ? (
        <p className="rounded-lg border border-white/10 bg-slate-900/75 p-5 text-sm text-slate-300">
          Loading workflow stats...
        </p>
      ) : null}

      {stats ? (
        <section className="grid gap-5 xl:grid-cols-3">
          <StatusColumn
            title="Submission statuses"
            items={stats.submissionStats}
          />
          <StatusColumn title="Chapter statuses" items={stats.chapterStats} />
          <StatusColumn title="Task statuses" items={stats.taskStats} />
        </section>
      ) : null}

      {!isLoading && !stats ? (
        <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
          <GitBranch className="mx-auto text-slate-500" />
          <p className="mt-3">No workflow statistics are available.</p>
        </div>
      ) : null}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
    </article>
  );
}

function StatusColumn({
  title,
  items,
}: {
  title: string;
  items: Array<{ status: string; count: number }>;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
      <h3 className="font-bold text-white">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div
            key={item.status}
            className="flex items-center justify-between gap-3 rounded-lg bg-slate-950 px-3 py-2 text-sm"
          >
            <span className="text-slate-300">{item.status}</span>
            <span className="font-bold text-cyan-100">{item.count}</span>
          </div>
        ))}
        {!items.length ? (
          <p className="text-sm text-slate-500">No records.</p>
        ) : null}
      </div>
    </section>
  );
}
