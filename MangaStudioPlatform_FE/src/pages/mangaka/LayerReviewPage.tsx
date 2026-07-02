import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Eye,
  GitMerge,
  ImageOff,
  MessageSquare,
  RefreshCw,
  RotateCcw,
  UserRoundCog,
} from "lucide-react";
import { useToast } from "../../shared/components/toastContext";
import { WorkflowStatusBadge } from "../../shared/components/WorkflowStatusBadge";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type {
  ChapterDto,
  MangaSeriesDto,
  PageTaskDto,
} from "../../shared/types/mangaErp";
import "./LayerReviewPage.css";

function isReviewableTask(task: PageTaskDto) {
  const status = task.status.replace(/[\s_-]/g, "").toLowerCase();

  return (
    Boolean(
      task.currentLayerType ||
        task.fileUrlOriginal ||
        task.fileUrlOptimized ||
        task.submissionNote,
    ) || !["assigned", "incomplete", "pending"].includes(status)
  );
}

export default function LayerReviewPage() {
  const toast = useToast();
  const [series, setSeries] = useState<MangaSeriesDto[]>([]);
  const [seriesId, setSeriesId] = useState("");
  const [chapters, setChapters] = useState<ChapterDto[]>([]);
  const [chapterId, setChapterId] = useState("");
  const [tasks, setTasks] = useState<PageTaskDto[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [feedbackError, setFeedbackError] = useState(false);
  const [reviewNotice, setReviewNotice] = useState("");

  const reviewableTasks = useMemo(
    () => tasks.filter(isReviewableTask),
    [tasks],
  );
  const selected =
    reviewableTasks.find((task) => task.id === selectedId) ?? null;
  const taskGroups = useMemo(() => {
    const groups = new Map<number, PageTaskDto[]>();

    reviewableTasks.forEach((task) => {
      const pageTasks = groups.get(task.pageNumber) ?? [];
      pageTasks.push(task);
      groups.set(task.pageNumber, pageTasks);
    });

    return [...groups.entries()].sort(([pageA], [pageB]) => pageA - pageB);
  }, [reviewableTasks]);

  const loadTasks = useCallback(
    async (id: string) => {
      if (!id.trim()) {
        setTasks([]);
        setSelectedId("");
        return;
      }

      setIsLoading(true);
      setReviewNotice("");

      try {
        const items = await mangaErpApi.getChapterPageTasks(id.trim());
        const firstReviewable = items.find(isReviewableTask);
        setTasks(items);
        setSelectedId((current) =>
          items.some((item) => item.id === current && isReviewableTask(item))
            ? current
            : (firstReviewable?.id ?? ""),
        );
      } catch (error) {
        setTasks([]);
        setSelectedId("");
        toast.error(
          "Could not load chapter tasks",
          error instanceof Error ? error.message : "Unknown error",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    void mangaErpApi
      .getMySeries()
      .then(async (items) => {
        setSeries(items);
        const firstSeriesId = items[0]?.id ?? "";
        setSeriesId(firstSeriesId);

        if (!firstSeriesId) return;

        const chapterItems =
          await mangaErpApi.getChaptersBySeries(firstSeriesId);
        const firstChapterId = chapterItems[0]?.id ?? "";
        setChapters(chapterItems);
        setChapterId(firstChapterId);

        if (firstChapterId) await loadTasks(firstChapterId);
      })
      .catch((error: unknown) => {
        toast.error(
          "Could not load review workspace",
          error instanceof Error ? error.message : "Unknown error",
        );
      })
      .finally(() => setIsLoadingWorkspace(false));
  }, [loadTasks, toast]);

  const changeSeries = async (id: string) => {
    setSeriesId(id);
    setChapterId("");
    setChapters([]);
    setTasks([]);
    setSelectedId("");
    setIsLoadingWorkspace(true);

    try {
      const items = id ? await mangaErpApi.getChaptersBySeries(id) : [];
      const firstChapterId = items[0]?.id ?? "";
      setChapters(items);
      setChapterId(firstChapterId);

      if (firstChapterId) await loadTasks(firstChapterId);
    } catch (error) {
      toast.error(
        "Could not load chapters",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setIsLoadingWorkspace(false);
    }
  };

  const review = async (isAccepted: boolean) => {
    if (!selected) return;

    if (!isAccepted && !feedback.trim()) {
      setFeedbackError(true);
      toast.error(
        "Feedback is required",
        "Tell the assistant exactly what needs to change.",
      );
      return;
    }

    setFeedbackError(false);
    setReviewNotice("");
    setIsReviewing(true);

    try {
      await mangaErpApi.reviewPageTask(selected.id, {
        IsAccepted: isAccepted,
        RejectionNote: isAccepted ? "" : feedback.trim(),
      });
      const notice = isAccepted
        ? `Page ${selected.pageNumber} layer approved.`
        : `Revision request sent for page ${selected.pageNumber}.`;
      toast.success(
        isAccepted ? "Layer approved" : "Changes requested",
        isAccepted
          ? "The approved layer is ready for backend compositing when supported."
          : "The task has been returned to the assistant.",
      );
      setReviewNotice(notice);
      setFeedback("");
      await loadTasks(chapterId);
      setReviewNotice(notice);
    } catch (error) {
      toast.error(
        "Review could not be saved",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="layer-review-page space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Mangaka · MF2
        </p>
        <h1 className="mt-2 text-3xl font-black text-white">
          Page Layer Review
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Review submitted artwork by chapter and page, approve production-ready
          layers, or return precise revision notes to the assistant.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <label className="text-sm text-slate-400">
            Series
            <select
              className="input mt-2"
              value={seriesId}
              onChange={(event) => void changeSeries(event.target.value)}
              disabled={isLoadingWorkspace}
            >
              <option value="">Select series</option>
              {series.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-400">
            Chapter
            <select
              className="input mt-2"
              value={chapterId}
              onChange={(event) => {
                const id = event.target.value;
                setChapterId(id);
                void loadTasks(id);
              }}
              disabled={isLoadingWorkspace}
            >
              <option value="">Select chapter</option>
              {chapters.map((item) => (
                <option key={item.id} value={item.id}>
                  Ch. {item.chapterNumber} — {item.title}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            disabled={isLoading || !chapterId}
            onClick={() => void loadTasks(chapterId)}
            className="btn-primary self-end inline-flex items-center justify-center gap-2"
          >
            <RefreshCw
              size={16}
              className={isLoading ? "animate-spin" : ""}
            />
            Refresh tasks
          </button>
        </div>

        {!isLoadingWorkspace && chapters.length === 0 ? (
          <label className="mt-4 block text-sm text-slate-400">
            Chapter ID fallback
            <input
              className="input mt-2"
              value={chapterId}
              onChange={(event) => setChapterId(event.target.value)}
              placeholder="Paste a chapter ID if the chapter list is unavailable"
            />
            <span className="mt-2 block text-xs text-slate-500">
              Use this only when the backend cannot return your chapter list.
            </span>
          </label>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Review queue
              </p>
              <h2 className="mt-1 text-xl font-bold text-white">
                Submitted Layers
              </h2>
            </div>
            <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">
              {reviewableTasks.length} layers
            </span>
          </div>

          <div className="mt-5 space-y-5">
            {isLoading || isLoadingWorkspace ? (
              <div className="review-loading rounded-xl bg-slate-950 p-5 text-sm text-slate-400">
                Loading submitted layers…
              </div>
            ) : null}

            {!isLoading && !isLoadingWorkspace && taskGroups.length === 0 ? (
              <div className="review-empty rounded-xl border border-dashed border-slate-700 bg-slate-950 p-8 text-center">
                <Eye className="mx-auto text-slate-600" size={30} />
                <p className="mt-3 font-semibold text-white">
                  No submitted layers to review
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Submitted assistant work will appear here, grouped by page.
                </p>
              </div>
            ) : null}

            {taskGroups.map(([pageNumber, pageTasks]) => (
              <div key={pageNumber} className="review-page-group">
                <div className="mb-2 flex items-center gap-3">
                  <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-200">
                    Page {pageNumber}
                  </span>
                  <span className="h-px flex-1 bg-slate-800" />
                </div>

                <div className="space-y-2">
                  {pageTasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(task.id);
                        setFeedback("");
                        setFeedbackError(false);
                        setReviewNotice("");
                      }}
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        selectedId === task.id
                          ? "border-cyan-400 bg-cyan-400/10"
                          : "border-slate-800 bg-slate-950 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="rounded-md bg-cyan-500/10 px-2 py-1 text-xs font-semibold text-cyan-200">
                          {task.currentLayerType ?? "Layer"}
                          {task.currentLayerVersion
                            ? ` · v${task.currentLayerVersion}`
                            : ""}
                        </span>
                        <WorkflowStatusBadge status={task.status} />
                      </div>
                      <p className="mt-3 text-xs text-slate-500">
                        Assistant: {task.assignedAssistantId ?? "Not returned"}
                      </p>
                      <p className="mt-1 break-all font-mono text-[11px] text-slate-600">
                        Task {task.id}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold text-white">
            Review Selected Layer
          </h2>

          {!selected ? (
            <div className="mt-5 flex min-h-72 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950 p-8 text-center text-sm text-slate-400">
              Choose a submitted layer from the review queue.
            </div>
          ) : (
            <div className="mt-5 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-cyan-500/10 px-3 py-1.5 text-sm font-semibold text-cyan-200">
                  Page {selected.pageNumber}
                </span>
                <span className="rounded-lg bg-violet-500/10 px-3 py-1.5 text-sm font-semibold text-violet-200">
                  {selected.currentLayerType ?? "Unknown layer"}
                </span>
                <WorkflowStatusBadge
                  status={selected.status}
                  className="rounded-lg px-3 py-1.5 text-sm"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <LayerPreview
                  label="Original artwork"
                  url={selected.fileUrlOriginal}
                  pageNumber={selected.pageNumber}
                />
                <LayerPreview
                  label="Optimized preview"
                  url={
                    selected.fileUrlOptimized ?? selected.previewCompositeUrl
                  }
                  pageNumber={selected.pageNumber}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Metadata
                  label="Assigned assistant"
                  value={selected.assignedAssistantId ?? "Not returned"}
                />
                <Metadata label="Page task ID" value={selected.id} technical />
              </div>

              {selected.submissionNote ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs text-slate-500">Assistant note</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    {selected.submissionNote}
                  </p>
                </div>
              ) : null}

              <label className="block text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <MessageSquare size={16} />
                  Change request feedback
                </span>
                <textarea
                  className={`mt-2 h-28 w-full rounded-xl border bg-slate-950 p-4 text-slate-100 outline-none focus:border-cyan-400 ${
                    feedbackError ? "border-rose-400/70" : "border-slate-700"
                  }`}
                  value={feedback}
                  onChange={(event) => {
                    setFeedback(event.target.value);
                    if (event.target.value.trim()) setFeedbackError(false);
                  }}
                  placeholder="Describe the exact changes needed…"
                  aria-invalid={feedbackError}
                />
                {feedbackError ? (
                  <span className="mt-2 block text-xs text-rose-300">
                    Add a clear revision note before requesting changes.
                  </span>
                ) : (
                  <span className="mt-2 block text-xs text-slate-500">
                    Required only when returning the layer for revision.
                  </span>
                )}
              </label>

              {reviewNotice ? (
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                  {reviewNotice}
                </div>
              ) : null}

              <div className="review-action-bar flex flex-wrap gap-3 rounded-xl border border-slate-800 bg-slate-950/85 p-3">
                <button
                  type="button"
                  disabled={isReviewing}
                  onClick={() => void review(true)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
                >
                  <CheckCircle2 size={18} />
                  {isReviewing ? "Saving…" : "Approve layer"}
                </button>
                <button
                  type="button"
                  disabled={isReviewing}
                  onClick={() => void review(false)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
                >
                  <RotateCcw size={18} />
                  Request changes
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <InformationCard
          icon={GitMerge}
          title="Layer Merge"
          tone="cyan"
          description="Approved layers will be merged into the base page by the backend when compositing support is available. No client-side merge is performed."
        />
        <InformationCard
          icon={UserRoundCog}
          title="Reassign Task"
          tone="amber"
          badge="Coming Soon"
          description="Reassignment is not available in the current backend contract. Existing task ownership remains unchanged."
        />
      </section>
    </div>
  );
}

type LayerPreviewProps = {
  label: string;
  url?: string | null;
  pageNumber: number;
};

function LayerPreview({ label, url, pageNumber }: LayerPreviewProps) {
  return (
    <div className="layer-preview-card rounded-xl border border-dashed border-slate-700 bg-slate-950 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Eye size={14} />
          {label}
        </p>
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200"
          >
            Open
            <ExternalLink size={12} />
          </a>
        ) : null}
      </div>

      {url ? (
        <img
          src={url}
          alt={`${label} for page ${pageNumber}`}
          className="mt-3 h-72 w-full rounded-lg object-contain"
        />
      ) : (
        <div className="mt-3 flex h-72 flex-col items-center justify-center rounded-lg bg-slate-900 px-5 text-center text-sm text-slate-500">
          <ImageOff size={28} />
          <p className="mt-2">No URL was returned for this preview.</p>
        </div>
      )}
    </div>
  );
}

type MetadataProps = {
  label: string;
  value: string;
  technical?: boolean;
};

function Metadata({ label, value, technical = false }: MetadataProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={`mt-1 break-all text-sm text-slate-200 ${
          technical ? "font-mono text-xs text-slate-500" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

type InformationCardProps = {
  icon: typeof GitMerge;
  title: string;
  description: string;
  tone: "cyan" | "amber";
  badge?: string;
};

function InformationCard({
  icon: Icon,
  title,
  description,
  tone,
  badge,
}: InformationCardProps) {
  const toneClass =
    tone === "cyan"
      ? "border-cyan-400/20 bg-cyan-500/5 text-cyan-300"
      : "border-amber-400/20 bg-amber-500/5 text-amber-300";

  return (
    <article className={`rounded-2xl border p-5 ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon size={19} />
          <h3 className="font-bold text-white">{title}</h3>
        </div>
        {badge ? (
          <span className="rounded-full border border-current/20 px-2.5 py-1 text-xs font-semibold">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
    </article>
  );
}
