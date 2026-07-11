import { useEffect, useMemo, useState, type MouseEvent } from "react";
import {
  CheckCircle2,
  ClipboardList,
  History,
  ImagePlus,
  Pencil,
  RefreshCw,
  RotateCcw,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import { useToast } from "../../shared/components/toastContext";
import LoadingSkeleton from "../../shared/components/LoadingSkeleton";
import WorkflowEmptyState from "../../shared/components/WorkflowEmptyState";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type {
  QaBugPinDto,
  QaFeedbackHistoryDto,
  QaHistoryDto,
  QaQueueChapterDto,
  QaReviewPageDto,
  QaSessionDto,
  QaSummaryDto,
} from "../../shared/types/mangaErp";

const pinStatus = (status?: string) =>
  (status ?? "").replaceAll("_", "").toLowerCase();
const pinText = (pin: QaBugPinDto) =>
  pin.description ?? pin.noteMessage ?? "Quality issue";
const isOpen = (pin: QaBugPinDto) => pinStatus(pin.status) === "open";
const isInFixing = (pin: QaBugPinDto) => pinStatus(pin.status) === "infixing";
const isFixed = (pin: QaBugPinDto) => pinStatus(pin.status) === "fixed";
const isResolved = (pin: QaBugPinDto) => pinStatus(pin.status) === "resolved";

const isPercentageCoordinate = (value: string) => {
  const coordinate = Number(value);
  return Number.isFinite(coordinate) && coordinate >= 0 && coordinate <= 100;
};

const makeBatchToken = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `qa-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const pageImageOf = (page: QaReviewPageDto | null) =>
  page?.previewCompositeUrl ??
  page?.compositeUrl ??
  page?.fileUrlOptimized ??
  page?.fileUrlOriginal ??
  page?.imageUrl ??
  "";

export default function AnnotationsPage() {
  const toast = useToast();
  const [queue, setQueue] = useState<QaQueueChapterDto[]>([]);
  const [selectedChapter, setSelectedChapter] =
    useState<QaQueueChapterDto | null>(null);
  const [activeChapterId, setActiveChapterId] = useState("");
  const [session, setSession] = useState<QaSessionDto | null>(null);
  const [pages, setPages] = useState<QaReviewPageDto[]>([]);
  const [selectedPageId, setSelectedPageId] = useState("");
  const [pins, setPins] = useState<QaBugPinDto[]>([]);
  const [reviewNotes, setReviewNotes] = useState(
    "Bắt đầu duyệt nội dung và nét vẽ.",
  );
  const [feedback, setFeedback] = useState(
    "Chương này về khá tốt, nhưng các cảnh hành động tỉ lệ body hơi lệch, đã ghim chi tiết ở các trang. Vui lòng check và sửa lại.",
  );
  const [issueType, setIssueType] = useState("Visual");
  const [severity, setSeverity] = useState("High");
  const [category, setCategory] = useState("Shading");
  const [description, setDescription] = useState("");
  const [coordinateX, setCoordinateX] = useState("50.00");
  const [coordinateY, setCoordinateY] = useState("50.00");
  const [batchToken, setBatchToken] = useState(makeBatchToken);
  const [summary, setSummary] = useState<QaSummaryDto | null>(null);
  const [feedbackHistory, setFeedbackHistory] =
    useState<QaFeedbackHistoryDto | null>(null);
  const [qaHistory, setQaHistory] = useState<QaHistoryDto | null>(null);
  const [editingPinId, setEditingPinId] = useState("");
  const [editDraft, setEditDraft] = useState({
    noteMessage: "",
    issueType: "Visual",
    severity: "High",
    category: "Art",
    coordinateX: "50.00",
    coordinateY: "50.00",
  });
  const [busy, setBusy] = useState(false);

  const selectedPage =
    pages.find((page) => page.pageTaskId === selectedPageId) ?? null;
  const selectedPageImage = pageImageOf(selectedPage);
  const openPins = useMemo(() => pins.filter(isOpen), [pins]);
  const fixingPins = useMemo(() => pins.filter(isInFixing), [pins]);
  const fixedPins = useMemo(() => pins.filter(isFixed), [pins]);
  const resolvedPins = useMemo(() => pins.filter(isResolved), [pins]);
  const canApprove = pins.length === 0 || pins.every(isResolved);

  const loadQueue = async (showBusy = true) => {
    if (showBusy) setBusy(true);
    try {
      setQueue(await mangaErpApi.getQaQueue("Pending"));
    } catch (error) {
      toast.error(
        "Could not load QA queue",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      if (showBusy) setBusy(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadQueue(false);
    }, 0);
    return () => window.clearTimeout(timer);
    // Chỉ tải QA queue một lần khi mở màn hình; Refresh do người dùng chủ động thực hiện.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadChapterReview = async (chapterId = activeChapterId) => {
    const trimmed = chapterId.trim();
    if (!trimmed) {
      toast.error(
        "Chapter ID is required",
        "Start QA from the queue or enter a chapter ID.",
      );
      return;
    }

    setBusy(true);
    try {
      // Session, preview trang và pin phải đồng bộ trong cùng một vòng QA đã khóa.
      const [sessionResult, pageResult, pinResult] = await Promise.all([
        mangaErpApi.getQaSessionById(trimmed),
        mangaErpApi.getQaSessionPages(trimmed),
        mangaErpApi.getQaSessionPins(trimmed),
      ]);
      const [summaryResult, feedbackResult, historyResult] =
        await Promise.allSettled([
          mangaErpApi.getQaSummary(trimmed),
          mangaErpApi.getQaFeedbackHistory(trimmed),
          mangaErpApi.getQaHistory(trimmed),
        ]);
      setSession(sessionResult);
      setActiveChapterId(trimmed);
      setPages(pageResult);
      setSelectedPageId((current) =>
        pageResult.some((page) => page.pageTaskId === current)
          ? current
          : (pageResult[0]?.pageTaskId ?? ""),
      );
      setPins(pinResult);
      setSummary(
        summaryResult.status === "fulfilled" ? summaryResult.value : null,
      );
      setFeedbackHistory(
        feedbackResult.status === "fulfilled" ? feedbackResult.value : null,
      );
      setQaHistory(
        historyResult.status === "fulfilled" ? historyResult.value : null,
      );
    } catch (error) {
      toast.error(
        "Could not load QA review",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setBusy(false);
    }
  };

  const startSession = async (chapter: QaQueueChapterDto) => {
    setBusy(true);
    setSelectedChapter(chapter);
    try {
      // Bắt đầu session sẽ khóa chapter để nhiều Editor không review cùng một chapter.
      const result = await mangaErpApi.startQaSession(chapter.chapterId, {
        ReviewMode: "Standard",
        Notes: reviewNotes,
      });
      setSession(
        typeof result === "string"
          ? {
              id: result,
              sessionId: result,
              chapterId: chapter.chapterId,
              status: "InProgress",
            }
          : result,
      );
      setActiveChapterId(chapter.chapterId);
      setBatchToken(makeBatchToken());
      toast.success(
        "QA session started",
        `Chapter ${chapter.chapterNumber ?? ""} is locked for review.`,
      );
      await loadChapterReview(chapter.chapterId);
    } catch (error) {
      toast.error(
        "Could not start QA session",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setBusy(false);
    }
  };

  const captureCoordinate = (event: MouseEvent<HTMLImageElement>) => {
    // Lưu theo phần trăm giúp pin giữ đúng vị trí khi kích thước preview thay đổi.
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setCoordinateX(Math.max(0, Math.min(100, x)).toFixed(2));
    setCoordinateY(Math.max(0, Math.min(100, y)).toFixed(2));
  };

  const addPin = async () => {
    if (!activeChapterId || !selectedPageId || !description.trim()) {
      toast.error(
        "Pin details are incomplete",
        "Load a QA chapter, select a page task, and describe the issue.",
      );
      return;
    }

    if (
      !isPercentageCoordinate(coordinateX) ||
      !isPercentageCoordinate(coordinateY)
    ) {
      toast.error(
        "Invalid pin coordinates",
        "X and Y must be numbers from 0 to 100.",
      );
      return;
    }

    setBusy(true);
    try {
      await mangaErpApi.addQaPin(activeChapterId, selectedPageId, {
        CoordinateX: Number(coordinateX),
        CoordinateY: Number(coordinateY),
        IssueType: issueType,
        NoteMessage: description.trim(),
        Severity: severity,
        Category: category,
        BatchToken: batchToken,
      });
      setDescription("");
      toast.success(
        "Bug pin created",
        "The pin is Open and will be included in the feedback batch.",
      );
      await loadChapterReview(activeChapterId);
    } catch (error) {
      toast.error(
        "Could not create pin",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setBusy(false);
    }
  };

  const beginEditPin = (pin: QaBugPinDto) => {
    setEditingPinId(pin.id);
    setEditDraft({
      noteMessage: pinText(pin),
      issueType: pin.issueType ?? pin.pinType ?? "Visual",
      severity: pin.severity ?? "High",
      category: pin.category ?? "Art",
      coordinateX: String(pin.coordinateX ?? 50),
      coordinateY: String(pin.coordinateY ?? 50),
    });
  };

  const updatePin = async (pinId: string) => {
    setBusy(true);
    try {
      await mangaErpApi.updateQaPin(pinId, {
        NoteMessage: editDraft.noteMessage.trim(),
        IssueType: editDraft.issueType,
        Severity: editDraft.severity,
        Category: editDraft.category,
        CoordinateX: Number(editDraft.coordinateX),
        CoordinateY: Number(editDraft.coordinateY),
      });
      setEditingPinId("");
      toast.success("Pin updated", "The Open QA pin has been updated.");
      await loadChapterReview(activeChapterId);
    } catch (error) {
      toast.error(
        "Could not update pin",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setBusy(false);
    }
  };

  const deletePin = async (pinId: string) => {
    if (!window.confirm("Delete this Open QA pin?")) return;
    setBusy(true);
    try {
      await mangaErpApi.deleteQaPin(pinId);
      toast.success(
        "Pin deleted",
        "The QA pin was removed from this review round.",
      );
      await loadChapterReview(activeChapterId);
    } catch (error) {
      toast.error(
        "Could not delete pin",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setBusy(false);
    }
  };

  const requestRevision = async () => {
    if (!activeChapterId || pins.length === 0) {
      toast.error(
        "No pins to send",
        "Create at least one bug pin in an active QA session before requesting revisions.",
      );
      return;
    }

    setBusy(true);
    try {
      // Batch token gom toàn bộ pin trong vòng QA này thành một gói feedback cho Studio.
      await mangaErpApi.completeQaSession(activeChapterId, {
        Decision: "RequiresRevision",
        GeneralFeedback:
          feedback.trim() ||
          "Please correct the pinned QA issues and submit the chapter again.",
        BatchToken: batchToken,
      });
      toast.success(
        "Revision requested",
        "The backend will notify the Studio and move the chapter into revision.",
      );
      setBatchToken(makeBatchToken());
      await loadChapterReview(activeChapterId);
      await loadQueue(false);
    } catch (error) {
      toast.error(
        "Could not request revision",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setBusy(false);
    }
  };

  const unresolve = async (pinId: string) => {
    const reason = window.prompt(
      "Why is this fix not accepted?",
      "Vẫn chưa đúng, cần sửa lại chi tiết này.",
    );
    if (!reason) return;
    setBusy(true);
    try {
      await mangaErpApi.unresolveQaPin(pinId, { Reason: reason });
      toast.info(
        "Pin reopened",
        "The Studio can continue correcting this issue.",
      );
      await loadChapterReview(activeChapterId);
    } catch (error) {
      toast.error(
        "Could not reopen pin",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setBusy(false);
    }
  };

  const resolvePin = async (pinId: string) => {
    // Chỉ Editor được đóng pin sau khi kiểm tra layer đã sửa, không phải khi Studio báo fixed.
    setBusy(true);
    try {
      const note = window.prompt("Resolve note (optional)", "OK tốt lắm");
      await mangaErpApi.closeQaPin(pinId, { Note: note || undefined });
      toast.success(
        "Pin resolved",
        "This issue has been verified by the Editor.",
      );
      await loadChapterReview(activeChapterId);
    } catch (error) {
      toast.error(
        "Could not resolve pin",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setBusy(false);
    }
  };

  const approve = async () => {
    if (!activeChapterId || !canApprove) {
      toast.error(
        "QA cannot be approved yet",
        "Every QA pin must be Resolved before final approval.",
      );
      return;
    }

    setBusy(true);
    try {
      // Chỉ duyệt chapter khi tất cả pin đã ở trạng thái Resolved.
      await mangaErpApi.completeQaSession(activeChapterId, {
        Decision: "Approved",
        GeneralFeedback:
          "Tuyệt vời, nét vẽ và nội dung đều hoàn hảo. Sẵn sàng xuất bản.",
      });
      toast.success("Chapter approved", "Chapter moved to ReadyForPublishing.");
      await loadChapterReview(activeChapterId);
    } catch (error) {
      toast.error(
        "Could not approve chapter",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setBusy(false);
    }
  };

  const reopenChapter = async () => {
    if (
      !activeChapterId ||
      !window.confirm("Reopen this approved chapter for another QA review?")
    )
      return;
    setBusy(true);
    try {
      await mangaErpApi.reopenQaChapter(activeChapterId);
      toast.info("Chapter reopened", "The chapter moved back to ReadyForQA.");
      await loadChapterReview(activeChapterId);
      await loadQueue(false);
    } catch (error) {
      toast.error(
        "Could not reopen chapter",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[.28em] text-cyan-200">
          Tantou Editor · MF3
        </p>
        <h1 className="mt-2 text-3xl font-black text-white">
          Editorial QA Review
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Pull chapters from the QA queue, start a locked review session, pin
          visual/content issues, request revisions, verify fixes, and approve
          the chapter.
        </p>
      </header>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-2xl border border-white/10 bg-slate-900/75 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-cyan-200">
                QA queue
              </p>
              <h2 className="mt-1 text-xl font-bold text-white">
                Pending chapters
              </h2>
            </div>
            <button
              type="button"
              onClick={() => void loadQueue()}
              disabled={busy}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <RefreshCw size={16} className={busy ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          <label className="mt-4 block text-sm text-slate-400">
            Review notes
            <textarea
              className="input mt-2 min-h-20"
              value={reviewNotes}
              onChange={(event) => setReviewNotes(event.target.value)}
            />
          </label>

          <div className="mt-5 space-y-3">
            {queue.map((chapter) => (
              <article
                key={chapter.chapterId}
                className={`rounded-xl border p-4 ${selectedChapter?.chapterId === chapter.chapterId ? "border-amber-400/60 bg-amber-400/10" : "border-white/10 bg-slate-950"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">
                      Ch. {chapter.chapterNumber ?? "—"} — {chapter.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {chapter.seriesTitle ?? "Unknown series"} ·{" "}
                      {chapter.status ?? "ReadyForQA"}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Chapter ID: {chapter.chapterId}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void startSession(chapter)}
                    disabled={busy}
                    className="rounded-lg bg-amber-400 px-3 py-2 text-sm font-bold text-slate-950 disabled:opacity-40"
                  >
                    Start QA
                  </button>
                </div>
              </article>
            ))}
            {busy && !queue.length ? <LoadingSkeleton cards={2} /> : null}
            {!busy && !queue.length ? (
              <WorkflowEmptyState
                icon={ClipboardList}
                title="No chapters waiting for QA"
                description="When a Mangaka submits a completed chapter to QA, it will appear in this queue."
                actionLabel="Open review queue"
                actionTo="/app/editor/review-queue"
                onRefresh={() => void loadQueue()}
              />
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-slate-900/75 p-5">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <label className="text-sm text-slate-400">
                Chapter ID
                <input
                  className="input mt-2"
                  value={activeChapterId}
                  onChange={(event) => setActiveChapterId(event.target.value)}
                  placeholder="Start QA or paste a chapter ID"
                />
              </label>
              <button
                type="button"
                onClick={() => void loadChapterReview()}
                disabled={busy || !activeChapterId.trim()}
                className="btn-secondary self-end inline-flex items-center gap-2"
              >
                <ClipboardList size={16} />
                Load review
              </button>
            </div>

            {session ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-slate-950 p-3">
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="mt-1 font-semibold text-white">
                    {session.status}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-950 p-3">
                  <p className="text-xs text-slate-500">Open / Fixing</p>
                  <p className="mt-1 font-semibold text-amber-200">
                    {openPins.length + fixingPins.length}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-950 p-3">
                  <p className="text-xs text-slate-500">Fixed</p>
                  <p className="mt-1 font-semibold text-cyan-200">
                    {fixedPins.length}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-950 p-3">
                  <p className="text-xs text-slate-500">Resolved</p>
                  <p className="mt-1 font-semibold text-emerald-200">
                    {resolvedPins.length}
                  </p>
                </div>
              </div>
            ) : null}
            {summary ? (
              <div className="mt-4 rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-100">
                      QA summary
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      Backend approval gate:{" "}
                      {summary.canApprove
                        ? "Ready to approve"
                        : "Pins still need work"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void reopenChapter()}
                    disabled={busy}
                    className="inline-flex items-center gap-2 rounded-lg border border-amber-300/30 px-3 py-2 text-sm font-semibold text-amber-100 disabled:opacity-40"
                  >
                    <RotateCcw size={16} />
                    Reopen chapter
                  </button>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-5">
                  <div className="rounded-lg bg-slate-950/70 p-3">
                    <p className="text-xs text-slate-500">Total</p>
                    <p className="font-bold text-white">{summary.totalPins}</p>
                  </div>
                  <div className="rounded-lg bg-slate-950/70 p-3">
                    <p className="text-xs text-slate-500">Open</p>
                    <p className="font-bold text-amber-200">
                      {summary.openPins}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-950/70 p-3">
                    <p className="text-xs text-slate-500">In fixing</p>
                    <p className="font-bold text-cyan-200">
                      {summary.inFixingPins}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-950/70 p-3">
                    <p className="text-xs text-slate-500">Fixed</p>
                    <p className="font-bold text-blue-200">
                      {summary.fixedPins}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-950/70 p-3">
                    <p className="text-xs text-slate-500">Resolved</p>
                    <p className="font-bold text-emerald-200">
                      {summary.resolvedPins}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          {activeChapterId ? (
            <section className="rounded-2xl border border-white/10 bg-slate-900/75 p-5">
              <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                <div>
                  <label className="text-sm text-slate-400">
                    QA page
                    <select
                      className="input mt-2"
                      value={selectedPageId}
                      onChange={(event) =>
                        setSelectedPageId(event.target.value)
                      }
                    >
                      <option value="">Select page task</option>
                      {pages.map((page) => (
                        <option key={page.pageTaskId} value={page.pageTaskId}>
                          Page {page.pageNumber}{" "}
                          {page.status ? `· ${page.status}` : ""}{" "}
                          {page.taskType ? `· ${page.taskType}` : ""}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-3">
                    {selectedPageImage ? (
                      <img
                        src={selectedPageImage}
                        alt={`QA page ${selectedPage?.pageNumber ?? ""}`}
                        className="max-h-[32rem] w-full cursor-crosshair rounded-lg object-contain"
                        onClick={captureCoordinate}
                      />
                    ) : (
                      <div className="flex min-h-72 items-center justify-center rounded-lg border border-dashed border-slate-700 px-4 text-center text-sm text-slate-500">
                        Load a QA session and select a page. This page uses the
                        QA pages API, not the task chapter API, so Editor can
                        view the composite preview when the backend returns it.
                      </div>
                    )}
                    <p className="mt-2 text-xs text-slate-500">
                      Click the preview to capture percentage coordinates from 0
                      to 100, or type them manually.
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                    <ImagePlus size={19} className="text-cyan-200" />
                    Create bug pin
                  </h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="text-sm text-slate-400">
                      X %
                      <input
                        className="input mt-2"
                        value={coordinateX}
                        onChange={(event) => setCoordinateX(event.target.value)}
                      />
                    </label>
                    <label className="text-sm text-slate-400">
                      Y %
                      <input
                        className="input mt-2"
                        value={coordinateY}
                        onChange={(event) => setCoordinateY(event.target.value)}
                      />
                    </label>
                    <label className="text-sm text-slate-400">
                      Issue type
                      <select
                        className="input mt-2"
                        value={issueType}
                        onChange={(event) => setIssueType(event.target.value)}
                      >
                        <option>Visual</option>
                        <option>Content</option>
                        <option>Text</option>
                        <option>Layout</option>
                      </select>
                    </label>
                    <label className="text-sm text-slate-400">
                      Severity
                      <select
                        className="input mt-2"
                        value={severity}
                        onChange={(event) => setSeverity(event.target.value)}
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Critical</option>
                      </select>
                    </label>
                    <label className="text-sm text-slate-400 sm:col-span-2">
                      Category
                      <input
                        className="input mt-2"
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        placeholder="Shading, Art, Dialogue..."
                      />
                    </label>
                  </div>
                  <label className="mt-3 block text-sm text-slate-400">
                    Note message
                    <textarea
                      className="input mt-2 min-h-28"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Describe the art/content issue to fix."
                    />
                  </label>
                  <p className="mt-2 text-xs text-slate-500">
                    Batch token for this review round: {batchToken}
                  </p>
                  <button
                    type="button"
                    onClick={() => void addPin()}
                    disabled={busy || !activeChapterId || !selectedPageId}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 font-bold text-white disabled:opacity-40"
                  >
                    <ImagePlus size={17} />
                    Add pin
                  </button>
                </div>
              </div>
            </section>
          ) : null}

          {activeChapterId ? (
            <section className="rounded-2xl border border-white/10 bg-slate-900/75 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white">QA pins</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Open/InFixing pins are returned to Studio. Fixed pins can be
                    resolved or reopened after re-review.
                  </p>
                </div>
                <span className="rounded-xl bg-slate-950 px-3 py-2 text-sm text-slate-300">
                  {pins.length} total
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {pins.map((pin) => (
                  <article
                    key={pin.id}
                    className="rounded-xl border border-white/10 bg-slate-950 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-white">
                          {pin.issueType ?? pin.pinType ?? "Quality issue"} ·{" "}
                          {pin.category ?? "General"} ·{" "}
                          {pin.severity ?? "Normal"}
                        </p>
                        <p className="mt-1 text-sm text-slate-300">
                          {pinText(pin)}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          ({pin.coordinateX}%, {pin.coordinateY}%) ·{" "}
                          {pin.status} · Page task: {pin.pageTaskId ?? "—"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {isFixed(pin) ? (
                          <>
                            <button
                              type="button"
                              onClick={() => void resolvePin(pin.id)}
                              className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/30 px-3 py-2 text-sm text-emerald-100"
                            >
                              <CheckCircle2 size={16} />
                              Resolve
                            </button>
                            <button
                              type="button"
                              onClick={() => void unresolve(pin.id)}
                              className="inline-flex items-center gap-2 rounded-lg border border-amber-300/30 px-3 py-2 text-sm text-amber-100"
                            >
                              <RotateCcw size={16} />
                              Reopen
                            </button>
                          </>
                        ) : null}
                        {isResolved(pin) ? (
                          <>
                            <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                              <CheckCircle2 size={16} />
                              Resolved
                            </span>
                            <button
                              type="button"
                              onClick={() => void unresolve(pin.id)}
                              className="inline-flex items-center gap-2 rounded-lg border border-amber-300/30 px-3 py-2 text-sm text-amber-100"
                            >
                              <RotateCcw size={16} />
                              Reopen
                            </button>
                          </>
                        ) : null}
                        {isOpen(pin) ? (
                          <span className="inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                            <XCircle size={16} />
                            Open
                          </span>
                        ) : null}
                        {isInFixing(pin) ? (
                          <span className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200">
                            <RefreshCw size={16} />
                            In fixing
                          </span>
                        ) : null}
                        {isOpen(pin) ? (
                          <>
                            <button
                              type="button"
                              onClick={() => beginEditPin(pin)}
                              className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/30 px-3 py-2 text-sm text-cyan-100"
                            >
                              <Pencil size={16} />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void deletePin(pin.id)}
                              className="inline-flex items-center gap-2 rounded-lg border border-rose-300/30 px-3 py-2 text-sm text-rose-100"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                    {editingPinId === pin.id ? (
                      <div className="mt-4 rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="text-sm text-slate-400">
                            X %
                            <input
                              className="input mt-2"
                              value={editDraft.coordinateX}
                              onChange={(event) =>
                                setEditDraft((current) => ({
                                  ...current,
                                  coordinateX: event.target.value,
                                }))
                              }
                            />
                          </label>
                          <label className="text-sm text-slate-400">
                            Y %
                            <input
                              className="input mt-2"
                              value={editDraft.coordinateY}
                              onChange={(event) =>
                                setEditDraft((current) => ({
                                  ...current,
                                  coordinateY: event.target.value,
                                }))
                              }
                            />
                          </label>
                          <label className="text-sm text-slate-400">
                            Issue type
                            <select
                              className="input mt-2"
                              value={editDraft.issueType}
                              onChange={(event) =>
                                setEditDraft((current) => ({
                                  ...current,
                                  issueType: event.target.value,
                                }))
                              }
                            >
                              <option>Visual</option>
                              <option>Content</option>
                              <option>Text</option>
                              <option>Layout</option>
                            </select>
                          </label>
                          <label className="text-sm text-slate-400">
                            Severity
                            <select
                              className="input mt-2"
                              value={editDraft.severity}
                              onChange={(event) =>
                                setEditDraft((current) => ({
                                  ...current,
                                  severity: event.target.value,
                                }))
                              }
                            >
                              <option>Low</option>
                              <option>Medium</option>
                              <option>High</option>
                              <option>Critical</option>
                            </select>
                          </label>
                          <label className="text-sm text-slate-400 sm:col-span-2">
                            Category
                            <input
                              className="input mt-2"
                              value={editDraft.category}
                              onChange={(event) =>
                                setEditDraft((current) => ({
                                  ...current,
                                  category: event.target.value,
                                }))
                              }
                              placeholder="Shading, Art, Dialogue..."
                            />
                          </label>
                          <label className="text-sm text-slate-400 sm:col-span-2">
                            Note message
                            <textarea
                              className="input mt-2 min-h-20"
                              value={editDraft.noteMessage}
                              onChange={(event) =>
                                setEditDraft((current) => ({
                                  ...current,
                                  noteMessage: event.target.value,
                                }))
                              }
                            />
                          </label>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => void updatePin(pin.id)}
                            disabled={busy || !editDraft.noteMessage.trim()}
                            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
                          >
                            Save pin
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingPinId("")}
                            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </article>
                ))}
                {!pins.length ? (
                  <p className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">
                    No QA pins for this chapter yet.
                  </p>
                ) : null}
              </div>

              <label className="mt-5 block text-sm text-slate-400">
                General feedback
                <textarea
                  className="input mt-2 min-h-24"
                  value={feedback}
                  onChange={(event) => setFeedback(event.target.value)}
                />
              </label>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void requestRevision()}
                  disabled={busy || pins.length === 0}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 font-bold text-slate-950 disabled:opacity-40"
                >
                  <Send size={17} />
                  Request revisions
                </button>
                <button
                  type="button"
                  onClick={() => void approve()}
                  disabled={busy || !canApprove}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white disabled:opacity-40"
                >
                  <CheckCircle2 size={17} />
                  Approve QA
                </button>
              </div>
            </section>
          ) : null}

          {activeChapterId ? (
            <section className="rounded-2xl border border-white/10 bg-slate-900/75 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                    <History size={18} className="text-cyan-200" />
                    QA feedback & history
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Read-only data from summary, feedback batches, and QA
                    history APIs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void loadChapterReview(activeChapterId)}
                  disabled={busy}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <RefreshCw size={16} className={busy ? "animate-spin" : ""} />
                  Refresh QA data
                </button>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-slate-950 p-4">
                  <p className="text-sm font-semibold text-white">
                    Feedback batches
                  </p>
                  <div className="mt-3 space-y-3">
                    {feedbackHistory?.batches.map((batch) => (
                      <div
                        key={batch.batchToken}
                        className="rounded-lg border border-white/10 p-3"
                      >
                        <p className="text-xs text-slate-500">
                          Batch: {batch.batchToken}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Sent:{" "}
                          {batch.sentAt || batch.createdAt
                            ? new Date(
                                batch.sentAt ?? batch.createdAt ?? "",
                              ).toLocaleString()
                            : "—"}
                        </p>
                        <p className="mt-2 text-sm text-slate-300">
                          {batch.pins.length} pins in this feedback batch
                        </p>
                      </div>
                    ))}
                    {!feedbackHistory?.batches.length ? (
                      <p className="text-sm text-slate-500">
                        No feedback batches returned.
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950 p-4">
                  <p className="text-sm font-semibold text-white">
                    QA sessions
                  </p>
                  <div className="mt-3 space-y-3">
                    {qaHistory?.sessions.map((item) => (
                      <div
                        key={item.id ?? item.sessionId ?? item.createdAt}
                        className="rounded-lg border border-white/10 p-3"
                      >
                        <p className="text-sm text-slate-300">
                          {item.status} {item.isApproved ? "· Approved" : ""}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Editor: {item.editorId ?? "—"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Created:{" "}
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString()
                            : "—"}
                        </p>
                      </div>
                    ))}
                    {!qaHistory?.sessions.length ? (
                      <p className="text-sm text-slate-500">
                        No QA session history returned.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </div>
  );
}
