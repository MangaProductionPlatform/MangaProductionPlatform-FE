import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowDownUp,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Eye,
  FileImage,
  Filter,
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
type ProgressFilter =
  | "all"
  | "voteable"
  | "pending_eb"
  | "pending_tantou"
  | "approved"
  | "rejected"
  | "conflict";
type SortMode = "priority" | "newest" | "oldest";
type TimeFilter = "all" | "today" | "week" | "month" | "custom";

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
  createdAt?: string | null;
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
const readPreviewImage = (
  item: Pick<ProposalQueueItem, "coverImageUrl" | "manuscriptUrl">,
) => item.coverImageUrl || item.manuscriptUrl || null;
const filterSelectClass =
  "input h-12 py-0 pl-4 pr-10 leading-normal text-sm";
const filterInputClass =
  "input h-12 py-0 leading-normal text-sm";
const getTimeValue = (value?: string | null) => {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};
const formatSubmittedAt = (value?: string | null) => {
  const time = getTimeValue(value);
  if (!time) return "No created time";
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(time));
};
const getAgeLabel = (value?: string | null) => {
  const time = getTimeValue(value);
  if (!time) return "Unknown age";
  const diffMs = Date.now() - time;
  const diffHours = Math.max(0, Math.floor(diffMs / 36e5));
  if (diffHours < 24) return diffHours <= 1 ? "New today" : `${diffHours}h old`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d old`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w old`;
  return `${Math.floor(diffDays / 30)}mo old`;
};
const getPriorityRank = (item: ProposalQueueItem) => {
  if (item.status === "Pending_EB_Review" && item.assignment) return 0;
  if (item.status === "Pending_EB_Review") return 1;
  if (item.status === "Conflict_Escalated") return 2;
  if (item.status === "Pending_Tantou_Review") return 3;
  if (item.status === "EB_Rejected") return 4;
  if (item.status === "EB_Approved") return 5;
  return 6;
};
const withTimeout = <T,>(promise: Promise<T>, label: string, ms = 8000) =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error(`${label} timed out`)), ms);
    }),
  ]);

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
  const [searchText, setSearchText] = useState("");
  const [progressFilter, setProgressFilter] = useState<ProgressFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("priority");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");

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
          createdAt: null,
          conflict: item,
        }));
        setQueue(items);
        if (selected && !items.some((item) => item.workId === selected.id)) {
          setSelected(null);
          setSelectedReview(null);
        }
        return;
      }

      const [allSubmissionsResult, queueResult, dashboardResult] = await Promise.allSettled([
        withTimeout(
          mangaErpApi.getEditorialAllSubmissions(),
          "EB submissions list",
          12000,
        ),
        withTimeout(mangaErpApi.getSubmissionQueue(), "Submission queue", 12000),
        withTimeout(mangaErpApi.getBoardDashboard(), "Board dashboard", 12000),
      ]);
      const allSubmissions =
        allSubmissionsResult.status === "fulfilled"
          ? allSubmissionsResult.value
          : [];
      const queueFallback =
        queueResult.status === "fulfilled" ? queueResult.value : [];
      const boardDashboard =
        dashboardResult.status === "fulfilled" ? dashboardResult.value : null;

      if (
        allSubmissionsResult.status === "rejected" &&
        queueResult.status === "rejected" &&
        dashboardResult.status === "rejected"
      ) {
        setQueueLoadIssue(
          `Could not load Board submissions: ${
            allSubmissionsResult.reason instanceof Error
              ? allSubmissionsResult.reason.message
              : "Unknown error"
          }`,
        );
      }

      const allSubmissionItems = allSubmissions.map((submission) => {
          return {
            id: `submission-${submission.id}`,
            title: submission.title,
            status: submission.status,
            workType: "SeriesSubmission",
            workId: submission.id,
            roundNumber: submission.currentRound ?? 1,
            createdAt: submission.createdAt,
            assignmentMissing:
              submission.status === "Pending_EB_Review",
          } satisfies ProposalQueueItem;
        });

      const knownWorkIds = new Set(allSubmissionItems.map((item) => item.workId));
      const queueFallbackItems = queueFallback
        .filter((submission) => !knownWorkIds.has(submission.id))
        .map((submission) => ({
          id: `queue-${submission.id}`,
          title: submission.title,
          status: submission.status,
          workType: "SeriesSubmission",
          workId: submission.id,
          roundNumber: null,
          genre: submission.genre,
          createdAt: submission.createdAt,
          assignmentMissing: submission.status === "Pending_EB_Review",
        }) satisfies ProposalQueueItem);

      queueFallbackItems.forEach((item) => knownWorkIds.add(item.workId));
      const boardPending = boardDashboard?.proposalQueue ?? [];
      const boardPendingItems = boardPending
        .filter((submission) => !knownWorkIds.has(submission.id))
        .map((submission) => ({
          id: `pending-${submission.id}`,
          title: submission.title,
          status: "Pending_EB_Review",
          workType: "SeriesSubmission",
          workId: submission.id,
          roundNumber: null,
          createdAt: submission.submittedAt,
          assignmentMissing: true,
        }) satisfies ProposalQueueItem);

      const baseItems = [
        ...allSubmissionItems,
        ...queueFallbackItems,
        ...boardPendingItems,
      ];

      setQueue(baseItems);
      setIsLoading(false);
      void enrichQueueDetails(baseItems);
      void enrichReviewSlots(baseItems);

      if (selected && !baseItems.some((item) => item.workId === selected.id)) {
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

  const enrichReviewSlots = async (items: ProposalQueueItem[]) => {
    const reviews = await withTimeout(
      mangaErpApi.getEditorialReviews(),
      "EB review slots",
      15000,
    ).catch(() => null);
    if (!reviews) {
      setQueueLoadIssue(
        "Submissions loaded, but vote slots are still loading slowly. Open a proposal again after refresh if the vote buttons stay disabled.",
      );
      return;
    }

    const reviewByWorkId = new Map(
      reviews
        .filter((review) => isSeriesSubmissionWork(review.workType))
        .map((review) => [review.workId, review] as const),
    );

    setQueue((current) =>
      current.map((item) => {
        const review = reviewByWorkId.get(item.workId);
        if (!review) return item;
        return {
          ...item,
          id: review.id,
          roundNumber: review.roundNumber,
          assignment: review,
          assignmentMissing: false,
        };
      }),
    );

    if (selectedReview) {
      const review = items.find((item) => item.workId === selected?.id)?.assignment;
      if (review) {
        const detail = await mangaErpApi
          .getEditorialReviewDetail(review.id)
          .catch(() => null);
        setSelectedReview(detail);
      }
    }
  };

  const enrichQueueDetails = async (items: ProposalQueueItem[]) => {
    const results = await Promise.allSettled(
      items.map(async (item) => {
        const detail = await withTimeout(
          mangaErpApi.getSubmission(item.workId),
          `Submission ${item.workId}`,
          6000,
        );
        return { item, detail };
      }),
    );

    const detailByWorkId = new Map<string, SubmissionDetailDto>();
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        detailByWorkId.set(result.value.item.workId, result.value.detail);
      }
    });
    if (detailByWorkId.size === 0) return;

    setQueue((current) =>
      current.map((item) => {
        const detail = detailByWorkId.get(item.workId);
        if (!detail) return item;
        return {
          ...item,
          title: detail.title,
          status: detail.status,
          genre: detail.genre,
          coverImageUrl: detail.coverImageUrl,
          manuscriptUrl: detail.manuscriptUrl,
          authorName: readAuthorName(detail),
          description: detail.description,
          createdAt: detail.createdAt ?? item.createdAt,
          assignmentMissing:
            detail.status === "Pending_EB_Review" && !item.assignment,
        };
      }),
    );
  };

  const filteredQueue = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();
    const now = new Date();
    let fromTime: number | null = null;
    let toTime: number | null = null;

    if (timeFilter === "today") {
      fromTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      toTime = now.getTime();
    } else if (timeFilter === "week") {
      fromTime = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      toTime = now.getTime();
    } else if (timeFilter === "month") {
      fromTime = now.getTime() - 30 * 24 * 60 * 60 * 1000;
      toTime = now.getTime();
    } else if (timeFilter === "custom") {
      fromTime = createdFrom
        ? new Date(`${createdFrom}T00:00:00`).getTime()
        : null;
      toTime = createdTo
        ? new Date(`${createdTo}T23:59:59`).getTime()
        : null;
    }

    return queue
      .filter((item) => {
        const textMatch =
          !normalizedSearch ||
          [item.title, item.genre, item.authorName, item.description, item.status]
            .filter(Boolean)
            .some((value) =>
              String(value).toLowerCase().includes(normalizedSearch),
            );
        if (!textMatch) return false;

        const progressMatch =
          progressFilter === "all" ||
          (progressFilter === "voteable" &&
            item.status === "Pending_EB_Review" &&
            Boolean(item.assignment)) ||
          (progressFilter === "pending_eb" &&
            item.status === "Pending_EB_Review") ||
          (progressFilter === "pending_tantou" &&
            item.status === "Pending_Tantou_Review") ||
          (progressFilter === "approved" && item.status === "EB_Approved") ||
          (progressFilter === "rejected" && item.status === "EB_Rejected") ||
          (progressFilter === "conflict" &&
            item.status === "Conflict_Escalated");
        if (!progressMatch) return false;

        const createdTime = getTimeValue(item.createdAt);
        if (fromTime !== null && (!createdTime || createdTime < fromTime)) {
          return false;
        }
        if (toTime !== null && (!createdTime || createdTime > toTime)) {
          return false;
        }
        return true;
      })
      .sort((left, right) => {
        if (sortMode === "priority") {
          const priorityDiff = getPriorityRank(left) - getPriorityRank(right);
          if (priorityDiff !== 0) return priorityDiff;
        }
        const newestFirst =
          getTimeValue(right.createdAt) - getTimeValue(left.createdAt);
        return sortMode === "oldest" ? -newestFirst : newestFirst;
      });
  }, [createdFrom, createdTo, progressFilter, queue, searchText, sortMode, timeFilter]);

  const resetFilters = () => {
    setSearchText("");
    setProgressFilter("all");
    setSortMode("priority");
    setTimeFilter("all");
    setCreatedFrom("");
    setCreatedTo("");
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
              : "Series submissions visible to Editorial Board. Pending EB review proposals can be voted first-come-first-serve."}
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

      <section className="rounded-lg border border-white/10 bg-slate-900/75 p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          {[
            { label: "Needs vote", progress: "voteable", time: "all" },
            { label: "New today", progress: "all", time: "today" },
            { label: "Last 7 days", progress: "all", time: "week" },
            { label: "Pending EB", progress: "pending_eb", time: "all" },
            { label: "Approved", progress: "approved", time: "all" },
          ].map((chip) => {
            const active =
              progressFilter === chip.progress && timeFilter === chip.time;
            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  setProgressFilter(chip.progress as ProgressFilter);
                  setTimeFilter(chip.time as TimeFilter);
                  setSortMode("priority");
                  setCreatedFrom("");
                  setCreatedTo("");
                }}
                className={`min-h-10 rounded-lg border px-3 text-sm font-bold transition ${
                  active
                    ? "border-cyan-300/60 bg-cyan-300/15 text-cyan-100"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-56 flex-1">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-slate-400">
              <Filter size={14} />
              Search
            </span>
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className={filterInputClass}
              placeholder="Title, author, genre, status"
            />
          </label>

          <label className="w-full min-w-44 sm:w-44">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[.14em] text-slate-400">
              Progress
            </span>
            <select
              value={progressFilter}
              onChange={(event) =>
                setProgressFilter(event.target.value as ProgressFilter)
              }
              className={filterSelectClass}
            >
              <option value="all">All progress</option>
              <option value="voteable">Ready to vote</option>
              <option value="pending_eb">Pending EB vote</option>
              <option value="pending_tantou">Pending Tantou</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="conflict">Conflict escalated</option>
            </select>
          </label>

          <label className="w-full min-w-40 sm:w-44">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-slate-400">
              <Clock3 size={14} />
              Time
            </span>
            <select
              value={timeFilter}
              onChange={(event) => {
                const value = event.target.value as TimeFilter;
                setTimeFilter(value);
                if (value !== "custom") {
                  setCreatedFrom("");
                  setCreatedTo("");
                }
              }}
              className={filterSelectClass}
            >
              <option value="all">All time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="custom">Custom range</option>
            </select>
          </label>

          <label className="w-full min-w-40 sm:w-44">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-slate-400">
              <ArrowDownUp size={14} />
              Priority
            </span>
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className={filterSelectClass}
            >
              <option value="priority">Review priority</option>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>

          <label className="w-full min-w-40 sm:w-44">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-slate-400">
              <CalendarDays size={14} />
              From
            </span>
            <input
              type="date"
              value={createdFrom}
              onChange={(event) => {
                setTimeFilter("custom");
                setCreatedFrom(event.target.value);
              }}
              className={filterInputClass}
            />
          </label>

          <label className="w-full min-w-40 sm:w-44">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[.14em] text-slate-400">
              To
            </span>
            <input
              type="date"
              value={createdTo}
              onChange={(event) => {
                setTimeFilter("custom");
                setCreatedTo(event.target.value);
              }}
              className={filterInputClass}
            />
          </label>

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex h-11 min-w-20 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-bold text-white hover:bg-white/10"
          >
            Clear
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Showing {filteredQueue.length} of {queue.length} submissions
        </p>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_30rem]">
        <div className="space-y-3">
          {isLoading ? <LoadingSkeleton cards={3} /> : null}

          {!isLoading && filteredQueue.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-slate-900/75 p-5 text-sm text-slate-300">
              {queue.length === 0
                ? "No proposals are available for your role."
                : "No submissions match the current filters."}
              {queueLoadIssue ? (
                <p className="mt-3 leading-6 text-amber-100">
                  {queueLoadIssue}
                </p>
              ) : null}
            </div>
          ) : null}

          {filteredQueue.map((item) => {
            const previewImage = readPreviewImage(item);
            return (
              <article
                key={item.id}
                className={`rounded-lg border bg-slate-900/75 p-4 transition hover:border-cyan-300/40 hover:bg-slate-900 ${
                  selected?.id === item.workId
                    ? "border-cyan-300/60"
                    : "border-white/10"
                }`}
              >
                <div className="grid gap-4 md:grid-cols-[7.5rem_minmax(0,1fr)_auto] md:items-start">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-white/10 bg-slate-950">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt={`${item.title} preview`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center text-slate-600">
                        <FileImage size={28} />
                        <span className="text-xs font-semibold">No cover</span>
                      </div>
                    )}
                    {!item.coverImageUrl && item.manuscriptUrl ? (
                      <span className="absolute bottom-2 left-2 rounded bg-slate-950/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-200">
                        Manuscript
                      </span>
                    ) : null}
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
                      {item.status !== "Pending_EB_Review" &&
                      item.status !== "Conflict_Escalated" ? (
                        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-slate-300">
                          View only
                        </span>
                      ) : null}
                      {item.genre ? (
                        <span className="rounded-md border border-fuchsia-300/20 bg-fuchsia-300/10 px-2 py-1 text-xs font-semibold text-fuchsia-100">
                          {item.genre}
                        </span>
                      ) : null}
                      <span className="rounded-md border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-xs font-semibold text-emerald-100">
                        {getAgeLabel(item.createdAt)}
                      </span>
                    </div>
                    <h3 className="mt-3 break-words text-2xl font-black text-white">
                      {item.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-300">
                      {item.authorName ? (
                        <span className="flex items-center gap-2">
                          <UserRound size={15} className="text-cyan-200" />
                          {item.authorName}
                        </span>
                      ) : null}
                      <span className="flex items-center gap-2 text-slate-400">
                        <Clock3 size={15} className="text-emerald-200" />
                        {formatSubmittedAt(item.createdAt)}
                      </span>
                    </div>
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
            );
          })}
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
                  <div className="relative aspect-[3/4] bg-slate-950">
                    {selected.coverImageUrl || selected.manuscriptUrl ? (
                      <img
                        src={
                          selected.coverImageUrl ||
                          selected.manuscriptUrl ||
                          undefined
                        }
                        alt={`${selected.title} preview`}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center text-slate-600">
                        <FileImage size={34} />
                        <span className="text-xs font-semibold">No cover</span>
                      </div>
                    )}
                    {!selected.coverImageUrl && selected.manuscriptUrl ? (
                      <span className="absolute bottom-2 left-2 rounded bg-slate-950/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-200">
                        Manuscript
                      </span>
                    ) : null}
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
                    <p className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                      <Clock3 size={15} className="text-emerald-200" />
                      {formatSubmittedAt(selected.createdAt)}
                    </p>
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
                  {selected.status === "Pending_EB_Review"
                    ? "This proposal is pending EB review, but no active review slot is available for voting yet. It may be an older submission created before reviewer assignment was generated."
                    : "This submission is visible for tracking, but only Pending_EB_Review proposals can be voted by Editorial Board."}
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
