import { useEffect, useState } from "react";
import { RefreshCw, UploadCloud } from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import { useToast } from "../../shared/components/toastContext";

const read = (item: Record<string, unknown>, ...keys: string[]) =>
  keys
    .map((key) => item[key])
    .find((value) => value !== undefined && value !== null);

export default function AssistantSubmissionsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try {
      setItems(await mangaErpApi.getAssistantSubmissions());
    } catch (error) {
      toast.error(
        "Could not load submission history",
        error instanceof Error ? error.message : "Unknown error",
      );
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
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.28em] text-cyan-200">
            Assistant · MF2
          </p>
          <h1 className="mt-2 text-3xl font-black text-white">
            Layer submissions
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Your submitted artwork layers and their current review status.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="icon-button"
          title="Refresh"
        >
          <RefreshCw size={17} />
        </button>
      </header>
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-slate-950/70 text-xs uppercase tracking-[.15em] text-slate-400">
              <tr>
                <th className="p-4">Task</th>
                <th className="p-4">Layer</th>
                <th className="p-4">Version</th>
                <th className="p-4">Submitted</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={String(
                    read(item, "id", "layerId", "submissionId") ?? index,
                  )}
                  className="border-t border-slate-800"
                >
                  <td className="p-4 text-slate-200">
                    {String(
                      read(item, "pageTaskTitle", "taskTitle", "pageTaskId") ??
                        "—",
                    )}
                  </td>
                  <td className="p-4 text-slate-300">
                    {String(read(item, "layerType", "LayerType") ?? "—")}
                  </td>
                  <td className="p-4 text-slate-300">
                    {String(read(item, "version", "Version") ?? "—")}
                  </td>
                  <td className="p-4 text-slate-400">
                    {String(
                      read(item, "submittedAt", "createdAt", "SubmittedAt") ??
                        "—",
                    )}
                  </td>
                  <td className="p-4">
                    <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-cyan-100">
                      {String(read(item, "status", "Status") ?? "—")}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && !items.length ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400">
                    <UploadCloud className="mx-auto mb-3" />
                    No layer submissions yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
