import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileImage,
  RefreshCw,
  UserRound,
  XCircle,
} from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type {
  CurrentUser,
  EditorialConflictItemDto,
  EditorialDecision,
  EditorialReviewAssignmentDto,
  EditorialReviewDetailDto,
  SubmissionDetailDto,
} from "../../shared/types/mangaErp";
import { useToast } from "../../shared/components/toastContext";
import LoadingSkeleton from "../../shared/components/LoadingSkeleton";

type BoardAction = "approve" | "reject";

type ProposalQueueItem = {
  id: string;
  title: string;
  status: string;
  workType: string;
  workId: string;
  roundNumber?: number | null;
  genre?: string | null;
  coverImageUrl?: string | null;
  manuscriptUrl?: string | null;
  authorName?: string | null;
  description?: string | null;
  assignment?: EditorialReviewAssignmentDto;
  conflict?: EditorialConflictItemDto;
  assignmentMissing?: boolean;
};

const decisionByAction: Record<BoardAction, EditorialDecision> = {
  approve: "Approved",
  reject: "Rejected",
};

const actionLabel: Record<BoardAction, string> = {
  approve: "Approve",
  reject: "Reject",
};
const isSeriesSubmissionWork = (workType: string) =>
  workType === "SeriesSubmission" || workType === "0";
const readAuthorName = (detail: SubmissionDetailDto | null) =>
  detail?.submitter?.penName ||
  detail?.submitter?.fullName ||
  detail?.submitter?.userId ||
  null;

export default function SeriesProposalsPage() {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [queue, setQueue] = useState<ProposalQueueItem[]>([]);
  const [selected, setSelected] = useState<SubmissionDetailDto | null>(null);
  const [selectedReview, setSelectedReview] =
    useState<EditorialReviewDetailDto | null>(null);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [runningAction, setRunningAction] = useState<BoardAction | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [queueLoadIssue, setQueueLoadIssue] = useState<string | null>(null);

  const currentUser = useMemo(
    () =>
      JSON.parse(
        localStorage.getItem("currentUser") || "null",
      ) as CurrentUser | null,
    [],
  );
  const isEditorialBoard = currentUser?.role === "editorial_board";
  const isEditorInChief = currentUser?.role === "editor_in_chief";
  const linkedSubmissionId =
    searchParams.get("id") ?? searchParams.get("submissionId");

  const loadQueue = async (resetSelection = false) => {
    setIsLoading(true);
    setQueueLoadIssue(null);
    if (resetSelection) {
      setSelected(null);
      setSelectedReview(null);
      setReason("");
      setLastResult(null);
    }
    try {
      if (isEditorInChief) {
        const conflicts = await mangaErpApi.getEditorialConflicts();
        const items = conflicts.submissions.map((item) => ({
          id: item.id,
          title: item.title,
          status: "Conflict_Escalated",
          workType: item.workType || "SeriesSubmission",
          workId: item.id,
          roundNumber: item.roundNumber,
          conflict: item,
        }));
        setQueue(items);
        if (selected && !items.some((item) => item.workId === selected.id)) {
          setSelected(null);
          setSelectedReview(null);
        }
        return;
      }

      const [reviewsResult, dashboardResult] = await Promise.allSettled([
        mangaErpApi.getEditorialReviews(),
        mangaErpApi.getBoardDashboard(),
      ]);
      const reviews =
        reviewsResult.status === "fulfilled" ? reviewsResult.value : [];
      const boardDashboard =
        dashboardResult.status === "fulfilled" ? dashboardResult.value : null;

      if (reviewsResult.status === "rejected") {
        setQueueLoadIssue(
          `Could not load EB review slots: ${
            reviewsResult.reason instanceof Error
              ? reviewsResult.reason.message
              : "Unknown error"
          }`,
        );
      }

      const items = await Promise.all(
        reviews
          .filter((review) => isSeriesSubmissionWork(review.workType))
          .map(async (review) => {
            const detail = await mangaErpApi.getSubmission(review.workId).catch(
              () => null,
            );
            return {
              id: review.id,
              title: detail?.title ?? review.workId,
              status: review.status,
              workType: review.workType,
              workId: review.workId,
              roundNumber: review.roundNumber,
              genre: detail?.genre,
              coverImageUrl: detail?.coverImageUrl,
              manuscriptUrl: detail?.manuscriptUrl,
              authorName: readAuthorName(detail),
              description: detail?.description,
              assignment: review,
            };
          }),
      );
      const assignedWorkIds = new Set(items.map((item) => item.workId));
      const boardPending = boardDashboard?.proposalQueue ?? [];
      const unassignedPending = boardPending.filter(
        (submission) => !assignedWorkIds.has(submission.id),
      );
      const unassignedItems = await Promise.all(
        unassignedPending.map(async (submission) => {
          const detail = await mangaErpApi.getSubmission(submission.id).catch(
            () => null,
          );
          return {
            id: `pending-${submission.id}`,
            title: detail?.title ?? submission.title,
            status: detail?.status ?? "Pending_EB_Review",
            workType: "SeriesSubmission",
            workId: submission.id,
            roundNumber: null,
            genre: detail?.genre,
            coverImageUrl: detail?.coverImageUrl,
            manuscriptUrl: detail?.manuscriptUrl,
            authorName: readAuthorName(detail),
            description: detail?.description,
            assignmentMissing: true,
          };
        }),
      );

      if (!items.length && (boardDashboard?.proposalQueue.length ?? 0) > 0) {
        setQueueLoadIssue(
          `BE dashboard has ${boardDashboard!.proposalQueue.length} pending proposal(s), but /editorial-workflow/reviews returned no review slots for voting.`,
        );
      } else if (unassignedItems.length > 0) {
        setQueueLoadIssue(
          `${unassignedItems.length} pending proposal(s) are visible from the Board dashboard but do not have editable review slots yet.`,
        );
      }

      const mergedItems = [...items, ...unassignedItems];
      setQueue(mergedItems);
      if (selected && !mergedItems.some((item) => item.workId === selected.id)) {
        setSelected(null);
        setSelectedReview(null);
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
    void loadQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openQueueItem = async (item: ProposalQueueItem) => {
    try {
      const detail = await mangaErpApi.getSubmission(item.workId);
      setSelected(detail);
      setReason(detail.feedbackMessage ?? "");
      setLastResult(null);

      if (item.assignment) {
        const review = await mangaErpApi.getEditorialReviewDetail(
          item.assignment.id,
        );
        setSelectedReview(review);
      } else if (item.conflict) {
        setSelectedReview(null);
        await mangaErpApi
          .getEditorialConflictDetail(item.workType, item.workId)
          .catch(() => null);
      } else {
        setSelectedReview(null);
      }
    } catch (err) {
      toast.error(
        "Could not open submission",
        err instanceof Error ? err.message : "Please try again.",
      );
    }
  };

  useEffect(() => {
    if (linkedSubmissionId) {
      const linkedItem = queue.find((item) => item.workId === linkedSubmissionId);
      if (linkedItem) {
        void openQueueItem(linkedItem);
      } else {
        void mangaErpApi
          .getSubmission(linkedSubmissionId)
          .then((detail) => {
            setSelected(detail);
            setSelectedReview(null);
            setReason(detail.feedbackMessage ?? "");
          })
          .catch((err) =>
            toast.error(
              "Could not open submission",
              err instanceof Error ? err.message : "Please try again.",
            ),
          );
      }
    }
    // React to notification deep links only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkedSubmissionId, queue.length]);

  const runAction = async (action: BoardAction) => {
    if (!selected) {
      toast.error(
        "Select a submission",
        "Open one proposal before sending a decision.",
      );
      return;
    }

    if (action === "reject" && !reason.trim()) {
      toast.error("Reason required", "Enter a rejection reason.");
      return;
    }

    if (!isEditorialBoard && !isEditorInChief) {
      toast.error(
        "Unsupported role",
        "This page accepts Editorial Board or Editor-in-Chief accounts.",
      );
      return;
    }

    if (!isEditorInChief && !selectedReview) {
      toast.error(
        "Review assignment missing",
        "This proposal has no editable Editorial Board review slot yet.",
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
      const payload = {
        decision: decisionByAction[action],
        feedback:
          action === "approve"
            ? reason.trim() || null
            : reason.trim(),
      };

      const result = isEditorInChief
        ? await mangaErpApi.resolveEditorialConflict(
            "SeriesSubmission",
            selected.id,
            payload,
          )
        : await mangaErpApi.submitEditorialReviewDecision(
            selectedReview!.id,
            payload,
          );

      toast.success(
        isEditorInChief ? "Conflict resolved" : "Vote submitted",
        `${actionLabel[action]} saved.`,
      );
      setLastResult(`Status: ${result.status}`);
      await loadQueue();
      const refreshed = await mangaErpApi
        .getSubmission(selected.id)
        .catch(() => null);
      setSelected(refreshed);
      if (!isEditorInChief && selectedReview) {
        const review = await mangaErpApi
          .getEditorialReviewDetail(selectedReview.id)
          .catch(() => null);
        setSelectedReview(review);
      }
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
              ? "Escalated conflicts awaiting a final approve or reject decision."
              : "Assigned series proposals awaiting your approve or reject vote."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadQueue(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_30rem]">
        <div className="space-y-3">
          {isLoading ? <LoadingSkeleton cards={3} /> : null}

          {!isLoading && queue.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-slate-900/75 p-5 text-sm text-slate-300">
              No proposals are available for your role.
              {queueLoadIssue ? (
                <p className="mt-3 leading-6 text-amber-100">
                  {queueLoadIssue}
                </p>
              ) : null}
            </div>
          ) : null}

          {queue.map((item) => (
            <article
              key={item.id}
              className={`rounded-lg border bg-slate-900/75 p-4 transition hover:border-cyan-300/40 hover:bg-slate-900 ${
                selected?.id === item.workId
                  ? "border-cyan-300/60"
                  : "border-white/10"
              }`}
            >
              <div className="grid gap-4 md:grid-cols-[7.5rem_minmax(0,1fr)_auto] md:items-start">
                <div className="aspect-[3/4] overflow-hidden rounded-lg border border-white/10 bg-slate-950">
                  {item.coverImageUrl ? (
                    <img
                      src={item.coverImageUrl}
                      alt={`${item.title} cover`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-600">
                      <FileImage size={28} />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-xs font-semibold text-cyan-100">
                      {item.status}
                    </span>
                    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-slate-300">
                      Round {item.roundNumber ?? 1}
                    </span>
                    {item.assignmentMissing ? (
                      <span className="rounded-md border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-xs font-semibold text-amber-100">
                        No review slot
                      </span>
                    ) : null}
                    {item.genre ? (
                      <span className="rounded-md border border-fuchsia-300/20 bg-fuchsia-300/10 px-2 py-1 text-xs font-semibold text-fuchsia-100">
                        {item.genre}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-3 break-words text-2xl font-black text-white">
                    {item.title}
                  </h3>
                  {item.authorName ? (
                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                      <UserRound size={15} className="text-cyan-200" />
                      {item.authorName}
                    </p>
                  ) : null}
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">
                    {item.description || "No description provided."}
                  </p>
                  {item.manuscriptUrl ? (
                    <a
                      href={item.manuscriptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border border-violet-300/25 bg-violet-300/10 px-3 text-sm font-semibold text-violet-100 hover:bg-violet-300/15"
                    >
                      <BookOpen size={15} />
                      Manuscript
                      <ExternalLink size={14} />
                    </a>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => void openQueueItem(item)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
                >
                  <Eye size={15} />
                  Open
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-white">
              {isEditorInChief ? "Final decision" : "Board vote"}
            </h3>
            {selected ? (
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-slate-300">
                {selected.status}
              </span>
            ) : null}
          </div>
          {selected ? (
            <div className="mt-4 space-y-4">
              <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-950/60">
                <div className="grid gap-0 sm:grid-cols-[10rem_minmax(0,1fr)]">
                  <div className="aspect-[3/4] bg-slate-950">
                    {selected.coverImageUrl ? (
                      <img
                        src={selected.coverImageUrl}
                        alt={`${selected.title} cover`}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-600">
                        <FileImage size={34} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 p-4">
                    <p className="break-all text-xs text-slate-500">
                      {selected.id}
                    </p>
                    <h4 className="mt-2 break-words text-2xl font-black leading-tight text-white">
                      {selected.title}
                    </h4>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selected.genre ? (
                        <span className="rounded-md border border-fuchsia-300/20 bg-fuchsia-300/10 px-2 py-1 text-xs font-semibold text-fuchsia-100">
                          {selected.genre}
                        </span>
                      ) : null}
                      <span className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-xs font-semibold text-cyan-100">
                        MF1 proposal
                      </span>
                    </div>
                    {selected.submitter ? (
                      <p className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                        <UserRound size={15} className="text-cyan-200" />
                        {selected.submitter.penName ||
                          selected.submitter.fullName ||
                          selected.submitter.userId}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="border-t border-white/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-500">
                    Synopsis
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {selected.description || "No description."}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-slate-950/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-sm font-bold text-white">
                    <BookOpen size={16} className="text-violet-200" />
                    Manuscript
                  </p>
                  {selected.manuscriptUrl ? (
                    <a
                      href={selected.manuscriptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-violet-300/25 bg-violet-300/10 px-3 text-sm font-semibold text-violet-100 hover:bg-violet-300/15"
                    >
                      Open
                      <ExternalLink size={14} />
                    </a>
                  ) : null}
                </div>
                {selected.manuscriptUrl ? (
                  <a
                    href={selected.manuscriptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 block overflow-hidden rounded-lg border border-white/10 bg-slate-950"
                  >
                    <img
                      src={selected.manuscriptUrl}
                      alt={`${selected.title} manuscript`}
                      loading="lazy"
                      className="max-h-80 w-full object-contain"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  </a>
                ) : (
                  <p className="mt-3 rounded-lg border border-dashed border-white/10 p-4 text-sm text-slate-500">
                    No manuscript file is attached.
                  </p>
                )}
              </div>

              {selectedReview ? (
                <div className="rounded-lg border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-300">
                  <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-400">
                    Your assignment
                  </p>
                  <p className="mt-2">
                    Status:{" "}
                    <span className="font-bold text-white">
                      {selectedReview.status}
                    </span>
                  </p>
                  {selectedReview.decision ? (
                    <p className="mt-1">Decision: {selectedReview.decision}</p>
                  ) : null}
                </div>
              ) : null}

              {!isEditorInChief && !selectedReview ? (
                <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">
                  This proposal is pending EB review, but no active review slot
                  is available for voting yet. It may be an older submission
                  created before reviewer assignment was generated.
                </div>
              ) : null}

              {lastResult ? (
                <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-100">
                  {lastResult}
                </div>
              ) : null}

              {isEditorInChief && selected.status !== "Conflict_Escalated" ? (
                <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">
                  This proposal is not escalated.
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

              <ActionButton
                icon={<CheckCircle2 size={16} />}
                label={isEditorInChief ? "Resolve as approve" : "Vote approve"}
                disabled={
                  (isEditorInChief && selected.status !== "Conflict_Escalated") ||
                  (!isEditorInChief && !selectedReview)
                }
                loading={runningAction === "approve"}
                onClick={() => void runAction("approve")}
              />
              <ActionButton
                icon={<XCircle size={16} />}
                label={isEditorInChief ? "Resolve as reject" : "Vote reject"}
                disabled={
                  (isEditorInChief && selected.status !== "Conflict_Escalated") ||
                  (!isEditorInChief && !selectedReview)
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
