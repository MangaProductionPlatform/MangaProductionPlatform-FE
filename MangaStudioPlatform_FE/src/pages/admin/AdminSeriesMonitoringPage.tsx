import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Database, RefreshCw } from "lucide-react";
import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { MangaSeriesDto } from "../../shared/types/mangaErp";

const statusOptions = ["", "Active", "Hiatus", "Cancelled"];

// Màn hình chỉ theo dõi series toàn hệ thống; thao tác chỉnh sửa series vẫn thuộc workflow của Mangaka.
export default function AdminSeriesMonitoringPage() {
  const toast = useToast();
  const [series, setSeries] = useState<MangaSeriesDto[]>([]);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadSeries = async (nextStatus = status, showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      setSeries(await mangaErpApi.getAllSeries(nextStatus || undefined));
    } catch (error) {
      toast.error("Could not load series", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadInitialSeries() {
      try {
        const result = await mangaErpApi.getAllSeries();
        if (!ignore) setSeries(result);
      } catch (error) {
        if (!ignore) toast.error("Could not load series", error instanceof Error ? error.message : "Unknown error");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    void loadInitialSeries();
    return () => {
      ignore = true;
    };
    // Initial backend load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => (
    series.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1;
      return acc;
    }, {})
  ), [series]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Admin</p>
          <h2 className="mt-2 text-3xl font-black text-white">Series monitoring</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Monitor all official series currently active on the platform.
          </p>
        </div>
        <button type="button" onClick={() => void loadSeries()} disabled={isLoading} className="btn-secondary inline-flex items-center gap-2">
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      <section className="grid gap-3 rounded-lg border border-white/10 bg-slate-900/75 p-4 md:grid-cols-[1fr_auto]">
        <select
          className="input"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            void loadSeries(event.target.value);
          }}
        >
          {statusOptions.map((option) => (
            <option key={option || "all"} value={option}>{option || "All statuses"}</option>
          ))}
        </select>
        <span className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm text-slate-300">
          {series.length} returned
        </span>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        {["Active", "Hiatus", "Cancelled", "Other"].map((label) => (
          <div key={label} className="rounded-lg border border-white/10 bg-slate-900/75 p-4">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-black text-white">
              {label === "Other"
                ? series.filter((item) => !["Active", "Hiatus", "Cancelled"].includes(item.status)).length
                : counts[label] ?? 0}
            </p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-lg border border-white/10 bg-slate-900/75">
        {isLoading ? <div className="p-5 text-sm text-slate-300">Loading series...</div> : null}
        {!isLoading && series.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            <Database className="mx-auto text-slate-500" />
            <p className="mt-3">No official series are available.</p>
          </div>
        ) : null}
        {!isLoading && series.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-[52rem] table-fixed divide-y divide-white/10 text-sm xl:min-w-full">
              <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="w-[32%] px-4 py-3">Series</th>
                  <th className="w-[16%] px-4 py-3">Genre</th>
                  <th className="w-[14%] px-4 py-3">Status</th>
                  <th className="w-[22%] px-4 py-3">Submission</th>
                  <th className="w-[16%] px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {series.map((item) => (
                  <tr key={item.id} className="text-slate-200">
                    <td className="px-4 py-3">
                      <Link to={`/app/series/${item.id}`} className="font-semibold text-white hover:text-cyan-200">{item.title}</Link>
                      <p className="mt-1 truncate text-xs text-slate-500">{item.id}</p>
                    </td>
                    <td className="px-4 py-3">{item.genre ?? "-"}</td>
                    <td className="px-4 py-3">{item.status}</td>
                    <td className="truncate px-4 py-3 text-slate-400">{item.submissionId ?? "-"}</td>
                    <td className="px-4 py-3">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
