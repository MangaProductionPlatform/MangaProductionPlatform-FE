import { useEffect, useState } from "react";
import { BookOpen, RefreshCw } from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { MangaSeriesDto } from "../../shared/types/mangaErp";
import { useToast } from "../../shared/components/toastContext";

export default function SeriesMonitoringPage() {
  const toast = useToast();
  const [series, setSeries] = useState<MangaSeriesDto[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try {
      setSeries(await mangaErpApi.getAllSeries());
    } catch (error) {
      toast.error(
        "Could not load assigned series",
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
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.28em] text-cyan-200">
            Tantou Editor
          </p>
          <h1 className="mt-2 text-3xl font-black text-white">
            Series monitoring
          </h1>
        </div>
        <button
          type="button"
          title="Refresh series"
          onClick={() => void load()}
          className="icon-button"
        >
          <RefreshCw size={17} />
        </button>
      </header>
      <div className="overflow-x-auto border border-white/10">
        <table className="w-full min-w-160 text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="p-4">Series</th>
              <th className="p-4">Genre</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created</th>
            </tr>
          </thead>
          <tbody>
            {series.map((item) => (
              <tr key={item.id} className="border-t border-white/10">
                <td className="p-4 font-semibold text-white">
                  <span className="mr-2 inline-flex align-middle text-cyan-200">
                    <BookOpen size={16} />
                  </span>
                  {item.title}
                </td>
                <td className="p-4 text-slate-300">{item.genre || "-"}</td>
                <td className="p-4 text-slate-300">{item.status}</td>
                <td className="p-4 text-slate-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !series.length ? (
          <p className="p-6 text-center text-sm text-slate-500">
            No series are assigned to this editor.
          </p>
        ) : null}
      </div>
    </div>
  );
}
