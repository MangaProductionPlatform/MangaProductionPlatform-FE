import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, MessageSquare, Send, XCircle } from "lucide-react";
import { mangaErpApi } from "../../shared/api/mangaErpApi";
import { useToast } from "../../shared/components/ToastProvider";

type SubmissionAction = "recommend" | "approve" | "reject" | "revision";

export default function SeriesProposalsPage() {
  const toast = useToast();
  const [submissionId, setSubmissionId] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState<SubmissionAction | null>(null);
  const currentUser = useMemo(
    () => JSON.parse(localStorage.getItem("currentUser") || "null") as
      | { userId?: string; role?: string }
      | null,
    [],
  );

  const reviewerId = currentUser?.userId ?? "";

  const runAction = async (action: SubmissionAction) => {
    if (!submissionId.trim()) {
      toast.error("Submission ID required", "Paste the submission ID returned after proposal creation.");
      return;
    }

    if (!reviewerId) {
      toast.error("Login required", "Please login again before reviewing submissions.");
      return;
    }

    if (action !== "approve" && !feedbackMessage.trim()) {
      toast.error("Feedback required", "Enter feedback before sending this action.");
      return;
    }

    setIsSubmitting(action);
    try {
      if (action === "recommend") {
        await mangaErpApi.recommendSubmission(submissionId.trim(), {
          reviewerEditorId: reviewerId,
          feedbackMessage,
        });
        toast.success("Submission recommended", "The proposal was sent to Editorial Board.");
      }

      if (action === "approve") {
        await mangaErpApi.approveSubmission(submissionId.trim(), reviewerId);
        toast.success("Submission approved", "The backend accepted the approval request.");
      }

      if (action === "reject") {
        await mangaErpApi.rejectSubmission(submissionId.trim(), {
          reviewerUserId: reviewerId,
          feedbackMessage,
        });
        toast.success("Submission rejected", "The rejection was saved to the backend.");
      }

      if (action === "revision") {
        await mangaErpApi.requestSubmissionRevision(submissionId.trim(), {
          reviewerUserId: reviewerId,
          feedbackMessage,
        });
        toast.success("Revision requested", "The revision request was saved to the backend.");
      }
    } catch (err) {
      toast.error(
        "Submission action failed",
        err instanceof Error ? err.message : "Please check the submission ID and your role.",
      );
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Submission Service
        </p>
        <h2 className="mt-2 text-3xl font-black text-white">
          Review series proposal by ID
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          The backend exposes create/recommend/approve/reject/revision commands.
          It does not expose a submission list endpoint, so paste a known
          submission ID to perform review actions.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 rounded-lg border border-white/10 bg-slate-900/75 p-5 xl:grid-cols-[1fr_22rem]"
      >
        <section className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-200">
              Submission ID
            </span>
            <input
              className="input"
              value={submissionId}
              onChange={(event) => setSubmissionId(event.target.value)}
              placeholder="Paste submission GUID"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-200">
              Feedback message
            </span>
            <textarea
              className="input min-h-36 resize-y"
              value={feedbackMessage}
              onChange={(event) => setFeedbackMessage(event.target.value)}
              placeholder="Reason, recommendation, or revision note"
            />
          </label>

          <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
            After approve succeeds, the Submission service publishes the approval
            event. In local multi-service mode, the new Series only appears if
            the event path between services is running correctly.
          </div>
        </section>

        <aside className="space-y-3">
          <ActionButton
            icon={<Send size={16} />}
            label="Recommend"
            description="Tantou Editor only"
            loading={isSubmitting === "recommend"}
            onClick={() => void runAction("recommend")}
          />
          <ActionButton
            icon={<CheckCircle2 size={16} />}
            label="Approve"
            description="Editorial Board only"
            loading={isSubmitting === "approve"}
            onClick={() => void runAction("approve")}
          />
          <ActionButton
            icon={<XCircle size={16} />}
            label="Reject"
            description="Tantou Editor or Board"
            loading={isSubmitting === "reject"}
            onClick={() => void runAction("reject")}
          />
          <ActionButton
            icon={<MessageSquare size={16} />}
            label="Request Revision"
            description="Tantou Editor or Board"
            loading={isSubmitting === "revision"}
            onClick={() => void runAction("revision")}
          />

          <div className="rounded-lg border border-white/10 bg-slate-950/60 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <ClipboardCheck size={16} className="text-cyan-200" />
              Current reviewer
            </div>
            <p className="mt-2 break-all text-xs leading-5 text-slate-400">
              {reviewerId || "Not logged in"}
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  description,
  loading,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  description: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
          {icon}
        </span>
        <span>
          <span className="block font-bold text-white">
            {loading ? "Sending..." : label}
          </span>
          <span className="text-xs text-slate-400">{description}</span>
        </span>
      </span>
    </button>
  );
}
