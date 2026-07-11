import { useEffect, useState } from "react";
import { CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { CancellationQueueItemDto } from "../../shared/types/mangaErp";
import { useToast } from "../../shared/components/toastContext";

export default function CancellationReviewPage() {
  const toast = useToast();
  const [items, setItems] = useState<CancellationQueueItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const load = async () => {
    setLoading(true);
    try {
      setItems(await mangaErpApi.getCancellationQueue());
    } catch (error) {
      toast.error(
        "Could not load cancellation queue",
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
  const decide = async (item: CancellationQueueItemDto, approved: boolean) => {
    const reason =
      window
        .prompt("Reason for rejecting this cancellation request:")
        ?.trim() ?? "";
    if (!approved && !reason) return;
    setBusy(item.seriesId);
    try {
      if (approved) await mangaErpApi.approveCancellation(item.seriesId);
      else await mangaErpApi.rejectCancellation(item.seriesId, reason);
      toast.success(
        approved ? "Cancellation approved" : "Cancellation rejected",
        item.title,
      );
      await load();
    } catch (error) {
      toast.error(
        "Could not update cancellation request",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setBusy("");
    }
  };
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.28em] text-fuchsia-200">
            Editorial Board
          </p>
          <h1 className="mt-2 text-3xl font-black text-white">
            Cancellation review
          </h1>
        </div>
        <button
          type="button"
          title="Refresh cancellation queue"
          onClick={() => void load()}
          className="icon-button"
        >
          <RefreshCw size={17} />
        </button>
      </header>
      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.seriesId}
            className="border border-amber-300/20 bg-slate-900 p-5"
          >
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <h2 className="font-bold text-white">{item.title}</h2>
                <p className="mt-2 text-sm text-slate-300">
                  {item.reason || "No reason provided."}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Requested{" "}
                  {item.requestedAt
                    ? new Date(item.requestedAt).toLocaleString()
                    : ""}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  disabled={busy === item.seriesId}
                  onClick={() => void decide(item, true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  <CheckCircle2 size={16} />
                  Approve
                </button>
                <button
                  type="button"
                  disabled={busy === item.seriesId}
                  onClick={() => void decide(item, false)}
                  className="inline-flex items-center gap-2 rounded-lg border border-rose-300/40 px-3 py-2 text-sm font-bold text-rose-200 disabled:opacity-50"
                >
                  <XCircle size={16} />
                  Reject
                </button>
              </div>
            </div>
          </article>
        ))}
        {!loading && !items.length ? (
          <p className="border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">
            No cancellation requests are waiting for review.
          </p>
        ) : null}
      </div>
    </div>
  );
}
