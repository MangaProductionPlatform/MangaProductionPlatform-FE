import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  Eye,
  Gavel,
  MessageSquare,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type {
  CurrentUser,
  SubmissionDetailDto,
  SubmissionSummaryDto,
  SubmissionVotesDto,
  SubmissionVoteType,
} from "../../shared/types/mangaErp";
import { useToast } from "../../shared/components/toastContext";
import LoadingSkeleton from "../../shared/components/LoadingSkeleton";

type BoardAction = "approve" | "revision" | "reject";

const voteTypeByAction: Record<BoardAction, SubmissionVoteType> = {
  approve: "APPROVE",
  revision: "REQ_REVISION",
  reject: "REJECT",
};

const actionLabel: Record<BoardAction, string> = {
  approve: "Approve",
  revision: "Request revision",
  reject: "Reject",
};

export default function SeriesProposalsPage() {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [queue, setQueue] = useState<SubmissionSummaryDto[]>([]);
  const [selected, setSelected] = useState<SubmissionDetailDto | null>(null);
  const [reason, setReason] = useState("");
  const [pinPage, setPinPage] = useState("");
  const [pinX, setPinX] = useState("0.5");
  const [pinY, setPinY] = useState("0.5");
  const [pinComment, setPinComment] = useState("");
  const [pinCategory, setPinCategory] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [runningAction, setRunningAction] = useState<BoardAction | null>(null);
  const [lastVoteResult, setLastVoteResult] = useState<string | null>(null);
  const [voteSummary, setVoteSummary] = useState<SubmissionVotesDto | null>(
    null,
  );

  const currentUser = useMemo(
    () =>
      JSON.parse(
        localStorage.getItem("currentUser") || "null",
      ) as CurrentUser | null,
    [],
  );
  const isEditorialBoard = currentUser?.role === "editorial_board";
  const isEditorInChief = currentUser?.role === "editor_in_chief";
  const linkedSubmissionId = searchParams.get("id") ?? searchParams.get("submissionId");

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
        "Could not load proposal queue",
        err instanceof Error ? err.message : "Please check your Board session.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial backend fetch; state updates occur as the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openSubmission = async (id: string) => {
    try {
      const detail = await mangaErpApi.getSubmission(id);
      setSelected(detail);
      setReason(detail.feedbackMessage ?? "");
      setLastVoteResult(null);
      setVoteSummary(null);
      const votes = await mangaErpApi.getSubmissionVotes(id).catch(() => null);
      setVoteSummary(votes);
    } catch (err) {
      toast.error(
        "Could not open submission",
        err instanceof Error ? err.message : "Please try again.",
      );
    }
  };

  useEffect(() => {
    if (linkedSubmissionId) {
      void openSubmission(linkedSubmissionId);
    }
    // React to notification deep links only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkedSubmissionId]);

  const buildFeedbackPins = () =>
    pinComment.trim()
      ? [
          {
            pageIdentifier: pinPage.trim() || "cover",
            coordinateX: Number(pinX),
            coordinateY: Number(pinY),
            comment: pinComment.trim(),
            category: pinCategory,
          },
        ]
      : [];

  const runAction = async (action: BoardAction) => {
    if (!selected) {
      toast.error(
        "Select a submission",
        "Open one proposal before sending a decision.",
      );
      return;
    }

    if (action !== "approve" && !reason.trim()) {
      toast.error("Reason required", "Enter a revision or rejection reason.");
      return;
    }

    if (!isEditorialBoard && !isEditorInChief) {
      toast.error(
        "Unsupported role",
        "This page accepts Editorial Board or Editor-in-Chief accounts.",
      );
      return;
    }

    if (isEditorInChief && selected.status !== "Conflict_Escalated") {
      toast.error(
        "No conflict to resolve",
        "Editor-in-Chief can only decide escalated submissions.",
      );
      return;
    }

    setRunningAction(action);
    try {
      if (isEditorInChief) {
        const result = await mangaErpApi.resolveSubmissionConflict(
          selected.id,
          {
            finalDecision: voteTypeByAction[action],
            feedbackMessage:
              action === "approve"
                ? reason.trim() || "Approved by Editor-in-Chief."
                : reason.trim(),
          },
        );
        toast.success(
          "Conflict resolved",
          `${actionLabel[action]} saved as final decision.`,
        );
        setLastVoteResult(
          `Final decision: ${result.finalDecision}. New status: ${result.newStatus}.`,
        );
      } else {
        const result = await mangaErpApi.castSubmissionVote(selected.id, {
          voteType: voteTypeByAction[action],
          comment: reason.trim() || null,
          feedbackPins: action === "revision" ? buildFeedbackPins() : [],
        });
        const outcome =
          result.aggregationOutcome ??
          `Waiting for more votes (${result.totalVotesInRound}/3)`;
        toast.success("Vote submitted", outcome);
        setLastVoteResult(
          `${outcome}. Current status: ${result.submissionStatus}. Round ${result.roundNumber}.`,
        );
      }

      await loadQueue();
      const refreshed = await mangaErpApi
        .getSubmission(selected.id)
        .catch(() => null);
      setSelected(refreshed);
      const votes = await mangaErpApi
        .getSubmissionVotes(selected.id)
        .catch(() => null);
      setVoteSummary(votes);
    } catch (err) {
      toast.error(
        isEditorInChief ? "Conflict decision failed" : "Vote failed",
        err instanceof Error
          ? err.message
          : "Please check submission status and your role.",
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
            {isEditorInChief ? "Editor-in-Chief" : "Editorial Board"}
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Series proposals
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            {isEditorInChief
              ? "Escalated conflicts and active proposals awaiting board review."
              : "Submissions you can vote on in the current Editorial Board round."}
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
          {isLoading ? <LoadingSkeleton cards={3} /> : null}

          {!isLoading && queue.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-slate-900/75 p-5 text-sm text-slate-300">
              No proposals are available for your role.
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
                  <h3 className="mt-3 text-xl font-black text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {item.genre ?? "Uncategorized"}
                  </p>
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
          <h3 className="text-lg font-bold text-white">
            {isEditorInChief ? "Final decision" : "Board vote"}
          </h3>
          {selected ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-lg border border-white/10 bg-slate-950/60 p-4">
                <p className="break-all text-xs text-slate-500">
                  {selected.id}
                </p>
                <h4 className="mt-2 font-bold text-white">{selected.title}</h4>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {selected.description || "No description."}
                </p>
                {selected.submitter ? (
                  <p className="mt-3 text-xs text-slate-400">
                    Author:{" "}
                    {selected.submitter.penName ||
                      selected.submitter.fullName ||
                      selected.submitter.userId}
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

              {lastVoteResult ? (
                <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-100">
                  {lastVoteResult}
                </div>
              ) : null}

              {isEditorInChief && selected.status !== "Conflict_Escalated" ? (
                <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">
                  This proposal is not escalated.
                </div>
              ) : null}

              {voteSummary ? (
                <div className="rounded-lg border border-white/10 bg-slate-950/50 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-400">
                      Round {voteSummary.round} votes
                    </p>
                    <p className="text-xs text-slate-400">
                      {voteSummary.totalVotes}/3 | A {voteSummary.approveCount}{" "}
                      | R {voteSummary.rejectCount} | Rev{" "}
                      {voteSummary.revisionCount}
                    </p>
                  </div>
                  <div className="mt-3 space-y-2">
                    {voteSummary.votes.map((vote) => (
                      <div
                        key={`${vote.editorId}-${vote.votedAt}`}
                        className="rounded-md border border-white/10 p-2 text-xs text-slate-300"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-white">
                            {vote.voteType}
                          </span>
                          <span className="break-all text-slate-500">
                            {vote.editorId}
                          </span>
                        </div>
                        {vote.comment ? (
                          <p className="mt-1 leading-5">{vote.comment}</p>
                        ) : null}
                      </div>
                    ))}
                    {!voteSummary.votes.length ? (
                      <p className="text-xs text-slate-500">
                        No votes recorded for the current round.
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <textarea
                className="input min-h-32 resize-y"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder={
                  isEditorInChief ? "Final decision message" : "Vote comment"
                }
              />

              {!isEditorInChief ? (
                <div className="space-y-2 rounded-lg border border-white/10 bg-slate-950/40 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-400">
                    Optional revision pin
                  </p>
                  <input
                    className="input"
                    value={pinPage}
                    onChange={(event) => setPinPage(event.target.value)}
                    placeholder="Page identifier"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="input"
                      type="number"
                      step="0.01"
                      value={pinX}
                      onChange={(event) => setPinX(event.target.value)}
                      placeholder="X"
                    />
                    <input
                      className="input"
                      type="number"
                      step="0.01"
                      value={pinY}
                      onChange={(event) => setPinY(event.target.value)}
                      placeholder="Y"
                    />
                  </div>
                  <select
                    className="input"
                    value={pinCategory}
                    onChange={(event) =>
                      setPinCategory(Number(event.target.value))
                    }
                  >
                    <option value={0}>Visual</option>
                    <option value={1}>Content</option>
                    <option value={2}>Typo</option>
                  </select>
                  <textarea
                    className="input min-h-20"
                    value={pinComment}
                    onChange={(event) => setPinComment(event.target.value)}
                    placeholder="Pin comment"
                  />
                </div>
              ) : null}

              <ActionButton
                icon={<CheckCircle2 size={16} />}
                label={isEditorInChief ? "Resolve as approve" : "Vote approve"}
                disabled={
                  isEditorInChief && selected.status !== "Conflict_Escalated"
                }
                loading={runningAction === "approve"}
                onClick={() => void runAction("approve")}
              />
              <ActionButton
                icon={
                  isEditorInChief ? (
                    <Gavel size={16} />
                  ) : (
                    <MessageSquare size={16} />
                  )
                }
                label={
                  isEditorInChief ? "Resolve as revision" : "Vote revision"
                }
                disabled={
                  isEditorInChief && selected.status !== "Conflict_Escalated"
                }
                loading={runningAction === "revision"}
                onClick={() => void runAction("revision")}
              />
              <ActionButton
                icon={<XCircle size={16} />}
                label={isEditorInChief ? "Resolve as reject" : "Vote reject"}
                disabled={
                  isEditorInChief && selected.status !== "Conflict_Escalated"
                }
                loading={runningAction === "reject"}
                onClick={() => void runAction("reject")}
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">
              Open a proposal to review it.
            </p>
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
  disabled,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  loading: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
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
