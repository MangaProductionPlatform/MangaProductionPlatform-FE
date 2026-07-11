import { useEffect, useState } from "react";
import { RefreshCw, Trophy } from "lucide-react";
import { mangaErpApi } from "../services/mangaErpService";
import type { RankingListDto, RankingPeriod } from "../types/mangaErp";
import { useToast } from "./toastContext";

export function RankingWorkspace({
  eyebrow,
  title,
  allowRefresh = false,
}: {
  eyebrow: string;
  title: string;
  allowRefresh?: boolean;
}) {
  const toast = useToast();
  const [period, setPeriod] = useState<RankingPeriod>("Weekly");
  const [data, setData] = useState<RankingListDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      setData(await mangaErpApi.getRankings(period, 20));
    } catch (error) {
      toast.error(
        "Could not load rankings",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setLoading(false);
    }
  };
  // Reload when the selected period changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [period]);
  const refresh = async () => {
    setRefreshing(true);
    try {
      await mangaErpApi.refreshRankings();
      await load();
      toast.success(
        "Rankings refreshed",
        "The latest ranking snapshot is now displayed.",
      );
    } catch (error) {
      toast.error(
        "Could not refresh rankings",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setRefreshing(false);
    }
  };
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.28em] text-cyan-200">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-black text-white">{title}</h1>
        </div>
        <div className="flex gap-2">
          <select
            className="input w-32"
            value={period}
            onChange={(event) => setPeriod(event.target.value as RankingPeriod)}
          >
            {(["Daily", "Weekly", "Monthly", "AllTime"] as RankingPeriod[]).map(
              (item) => (
                <option key={item}>{item}</option>
              ),
            )}
          </select>
          <button
            type="button"
            title="Refresh rankings"
            disabled={loading || refreshing}
            onClick={() => void (allowRefresh ? refresh() : load())}
            className="icon-button"
          >
            <RefreshCw size={17} />
          </button>
        </div>
      </header>
      <div className="overflow-x-auto border border-white/10">
        <table className="w-full min-w-160 text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="p-4">Rank</th>
              <th className="p-4">Series</th>
              <th className="p-4">Score</th>
              <th className="p-4">Views</th>
              <th className="p-4">Votes</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((item, index) => (
              <tr key={item.seriesId} className="border-t border-white/10">
                <td className="p-4 font-black text-cyan-200">
                  {item.rank ?? index + 1}
                </td>
                <td className="p-4 font-semibold text-white">
                  <Trophy size={15} className="mr-2 inline text-amber-200" />
                  {item.title ?? item.seriesId}
                </td>
                <td className="p-4 text-slate-300">{item.score ?? 0}</td>
                <td className="p-4 text-slate-400">{item.viewsCount ?? 0}</td>
                <td className="p-4 text-slate-400">{item.votesCount ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !data?.items.length ? (
          <p className="p-8 text-center text-sm text-slate-500">
            No ranking data is available for this period.
          </p>
        ) : null}
      </div>
    </div>
  );
}
