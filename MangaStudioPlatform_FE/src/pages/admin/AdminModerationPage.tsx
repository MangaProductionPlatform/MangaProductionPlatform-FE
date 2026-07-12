import { useEffect, useState } from "react";
import { Check, Eye, EyeOff, RefreshCw, X } from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import { useToast } from "../../shared/components/toastContext";

const itemId = (item: Record<string, unknown>) =>
  String(item.id ?? item.reportId ?? item.Id ?? "");

// Một report được xử lý theo từng thao tác độc lập để Admin có thể xem detail trước khi quyết định.
export default function AdminModerationPage() {
  const toast = useToast();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [busy, setBusy] = useState("");
  const load = async () => {
    try {
      setItems(await mangaErpApi.getModerationQueue());
    } catch (e) {
      toast.error(
        "Could not load moderation queue",
        e instanceof Error ? e.message : "Unknown error",
      );
    }
  };
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const view = async (id: string) => {
    if (!id) return;
    try {
      setDetail(await mangaErpApi.getModerationDetail(id));
    } catch (e) {
      toast.error(
        "Could not load report detail",
        e instanceof Error ? e.message : "Unknown error",
      );
    }
  };
  const act = async (id: string, action: "approve" | "reject" | "hide") => {
    if (!id) return;
    setBusy(`${action}-${id}`);
    try {
      if (action === "approve") await mangaErpApi.approveModeration(id);
      if (action === "reject") await mangaErpApi.rejectModeration(id);
      if (action === "hide") await mangaErpApi.hideModerationContent(id);
      toast.success(`Report ${action}d`, "The moderation queue was refreshed.");
      setDetail(null);
      await load();
    } catch (e) {
      toast.error(
        `Could not ${action} report`,
        e instanceof Error ? e.message : "Unknown error",
      );
    } finally {
      setBusy("");
    }
  };
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.28em] text-cyan-200">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-black text-white">
            Moderation queue
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Inspect reports, confirm or reject them, and hide violating content.
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
      <div className="grid gap-5 xl:grid-cols-[1fr_24rem]">
        <section className="space-y-3">
          {items.map((item, index) => {
            const id = itemId(item);
            return (
              <article
                key={id || index}
                className="rounded-xl border border-slate-800 bg-slate-900 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-white">
                      {String(
                        item.title ??
                          item.reason ??
                          item.reportType ??
                          `Report ${id || index + 1}`,
                      )}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      {String(item.status ?? "Pending review")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void view(id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-100"
                    >
                      <Eye size={15} />
                      Detail
                    </button>
                    <button
                      type="button"
                      disabled={busy === `approve-${id}`}
                      onClick={() => void act(id, "approve")}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-bold text-white"
                    >
                      <Check size={15} />
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busy === `reject-${id}`}
                      onClick={() => void act(id, "reject")}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-300/30 px-3 py-2 text-sm font-semibold text-rose-100"
                    >
                      <X size={15} />
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={busy === `hide-${id}`}
                      onClick={() => void act(id, "hide")}
                      className="inline-flex items-center gap-1 rounded-lg border border-amber-300/30 px-3 py-2 text-sm font-semibold text-amber-100"
                    >
                      <EyeOff size={15} />
                      Hide
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
          {!items.length ? (
            <p className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
              No moderation reports returned.
            </p>
          ) : null}
        </section>
        <aside className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="font-bold text-white">Report detail</h2>
          {detail ? (
            <pre className="mt-4 max-h-[38rem] overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-slate-300">
              {JSON.stringify(detail, null, 2)}
            </pre>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Select Detail on a report to review the available information.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
