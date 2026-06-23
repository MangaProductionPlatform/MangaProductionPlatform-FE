import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { CheckCircle2, Eye, MessageSquare, RefreshCw, XCircle } from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { SubmissionDetailDto, SubmissionSummaryDto } from "../../shared/types/mangaErp";
import { useToast } from "../../shared/components/toastContext";

type BoardAction = "approve" | "revision" | "reject";

export default function SeriesProposalsPage() {
  const toast = useToast();
  const [queue, setQueue] = useState<SubmissionSummaryDto[]>([]);
  const [selected, setSelected] = useState<SubmissionDetailDto | null>(null);
  const [reason, setReason] = useState("");
  const [assignedEditorId, setAssignedEditorId] = useState("");
  const [pinPage, setPinPage] = useState("");
  const [pinX, setPinX] = useState("0.5");
  const [pinY, setPinY] = useState("0.5");
  const [pinComment, setPinComment] = useState("");
  const [pinCategory, setPinCategory] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [runningAction, setRunningAction] = useState<BoardAction | null>(null);

  const loadQueue = async () => {
    setIsLoading(true);
    try {
      const result = await mangaErpApi.getSubmissionQueue();
      setQueue(result);
      if (selected && !result.some((item) => item.id === selected.id)) {
        setSelected(null);
      }
    } catch (err) {
      setQueue([]);
      toast.error(
        "Could not load Board queue",
        err instanceof Error ? err.message : "Please check your Editorial Board session.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function loadInitialQueue() {
      try {
        const result = await mangaErpApi.getSubmissionQueue();
        if (!ignore) {
          setQueue(result);
        }
      } catch (err) {
        if (!ignore) {
          setQueue([]);
          toast.error(
            "Could not load Board queue",
            err instanceof Error ? err.message : "Please check your Editorial Board session.",
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialQueue();
    return () => {
      ignore = true;
    };
  }, [toast]);

  const openSubmission = async (id: string) => {
    try {
      const detail = await mangaErpApi.getSubmission(id);
      setSelected(detail);
      setReason(detail.feedbackMessage ?? "");
    } catch (err) {
      toast.error(
        "Could not open submission",
        err instanceof Error ? err.message : "Please try again.",
      );
    }
  };

  const runAction = async (action: BoardAction) => {
    if (!selected) {
      toast.error("Select a submission", "Open one proposal before sending an action.");
      return;
    }

    if (action !== "approve" && !reason.trim()) {
      toast.error("Reason required", "Enter a revision or rejection reason.");
      return;
    }
    if (action === "approve" && !assignedEditorId.trim()) {
      toast.error("Editor required", "Backend requires the Tantou Editor user ID when approving.");
      return;
    }

    setRunningAction(action);
    try {
      if (action === "approve") {
        await mangaErpApi.approveSubmission(selected.id, assignedEditorId.trim());
        toast.success("Submission approved", "A series record was created by the backend.");
      }

      if (action === "revision") {
        await mangaErpApi.requestSubmissionRevision(selected.id, {
          reason: reason.trim(),
          pins: pinComment.trim() ? [{
            pageIdentifier: pinPage.trim() || "cover",
            coordinateX: Number(pinX),
            coordinateY: Number(pinY),
            comment: pinComment.trim(),
            category: pinCategory,
          }] : [],
        });
        toast.success("Revision requested", "The author can revise and resubmit.");
      }

      if (action === "reject") {
        await mangaErpApi.rejectSubmission(selected.id, {
          reason: reason.trim(),
        });
        toast.success("Rejected", "The EB rejection was saved.");
      }

      await loadQueue();
      const refreshed = await mangaErpApi.getSubmission(selected.id).catch(() => null);
      setSelected(refreshed);
    } catch (err) {
      toast.error(
        "Submission action failed",
        err instanceof Error ? err.message : "Please check submission status and your role.",
      );
    } finally {
      setRunningAction(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Editorial Board
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">Series proposals</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Series submissions waiting for Editorial Board review.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadQueue()}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
        <div className="space-y-3">
          {isLoading ? (
            <div className="rounded-lg border border-white/10 bg-slate-900/75 p-5 text-sm text-slate-300">
              Loading Board queue from backend...
            </div>
          ) : null}

          {!isLoading && queue.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-slate-900/75 p-5 text-sm text-slate-300">
              No submissions waiting for Board review.
            </div>
          ) : null}

          {queue.map((item) => (
            <article
              key={item.id}
              className="rounded-lg border border-white/10 bg-slate-900/75 p-4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <span className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-xs font-semibold text-cyan-100">
                    {item.status}
                  </span>
                  <h3 className="mt-3 text-xl font-black text-white">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{item.genre ?? "Uncategorized"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void openSubmission(item.id)}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
                >
                  <Eye size={15} />
                  Open
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
          <h3 className="text-lg font-bold text-white">Board decision</h3>
          {selected ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-lg border border-white/10 bg-slate-950/60 p-4">
                <p className="break-all text-xs text-slate-500">{selected.id}</p>
                <h4 className="mt-2 font-bold text-white">{selected.title}</h4>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {selected.description || "No description."}
                </p>
                {selected.editorRecommendationMessage ? (
                  <p className="mt-3 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm leading-6 text-cyan-50">
                    {selected.editorRecommendationMessage}
                  </p>
                ) : null}
                {selected.manuscriptUrl ? (
                  <a
                    href={selected.manuscriptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex text-sm font-semibold text-cyan-200 hover:text-cyan-100"
                  >
                    Open manuscript
                  </a>
                ) : null}
              </div>

              <textarea
                className="input min-h-32 resize-y"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Revision or rejection reason"
              />

              <input
                className="input"
                value={assignedEditorId}
                onChange={(event) => setAssignedEditorId(event.target.value)}
                placeholder="Tantou Editor user ID (required for approval)"
              />

              <div className="space-y-2 rounded-lg border border-white/10 bg-slate-950/40 p-3">
                <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-400">Optional revision pin</p>
                <input className="input" value={pinPage} onChange={e => setPinPage(e.target.value)} placeholder="Page identifier, e.g. cover or page-3" />
                <div className="grid grid-cols-2 gap-2"><input className="input" type="number" step="0.01" value={pinX} onChange={e => setPinX(e.target.value)} placeholder="X"/><input className="input" type="number" step="0.01" value={pinY} onChange={e => setPinY(e.target.value)} placeholder="Y"/></div>
                <select className="input" value={pinCategory} onChange={e => setPinCategory(Number(e.target.value))}><option value={0}>Visual</option><option value={1}>Content</option><option value={2}>Typo</option></select>
                <textarea className="input min-h-20" value={pinComment} onChange={e => setPinComment(e.target.value)} placeholder="Pin comment (leave empty for no pin)" />
              </div>

              <ActionButton
                icon={<CheckCircle2 size={16} />}
                label="Approve and create series"
                loading={runningAction === "approve"}
                onClick={() => void runAction("approve")}
              />
              <ActionButton
                icon={<MessageSquare size={16} />}
                label="Request revision"
                loading={runningAction === "revision"}
                onClick={() => void runAction("revision")}
              />
              <ActionButton
                icon={<XCircle size={16} />}
                label="Reject"
                loading={runningAction === "reject"}
                onClick={() => void runAction("reject")}
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">Open a proposal to review it.</p>
          )}
        </aside>
      </section>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  loading,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-left text-sm font-bold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
        {icon}
      </span>
      {loading ? "Sending..." : label}
    </button>
  );
}
