import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleDashed, FileCheck2, History, RefreshCw, Send, UploadCloud, UserPlus } from "lucide-react";
import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { ChapterDto, MangaSeriesDto, PageTaskDto, QaBugPinDto, QaFeedbackHistoryDto, QaHistoryDto, QaRevisionTaskDto, QaSummaryDto } from "../../shared/types/mangaErp";

const isApproved = (status: string) => ["approved", "accepted", "complete", "completed"].includes(status.toLowerCase());
const taskStatus = (status?: string) => (status ?? "").replaceAll("_", "").toLowerCase();
const isNotFoundError = (error: unknown) => String(error instanceof Error ? error.message : error).includes("404");
const normalizeStatus = (status?: string) => (status ?? "").replace(/[^a-z0-9]/gi, "").toLowerCase();
const canSubmitChapterStatus = (status?: string) => ["draft", "qarevisionrequired", "revisionrequired"].includes(normalizeStatus(status));
const pinText = (pin: QaBugPinDto) => pin.description ?? pin.noteMessage ?? "QA issue";

const pinToRevisionTask = (pin: QaBugPinDto, chapterId: string): QaRevisionTaskDto => ({
  id: pin.id,
  pinId: pin.id,
  chapterId: pin.chapterId ?? chapterId,
  pageId: pin.pageTaskId ?? pin.pageId,
  description: pinText(pin),
  status: pin.status,
  pinType: pin.issueType ?? pin.pinType,
  severity: pin.severity,
  coordinateX: pin.coordinateX,
  coordinateY: pin.coordinateY,
  assignedToRole: pin.category ?? pin.assignedToRole,
  resolvedImageUrl: pin.resolvedImageUrl,
  notes: pin.notes,
});

export default function QaSubmissionPage() {
  const toast = useToast();
  const [series, setSeries] = useState<MangaSeriesDto[]>([]);
  const [seriesId, setSeriesId] = useState("");
  const [chapters, setChapters] = useState<ChapterDto[]>([]);
  const [chapterId, setChapterId] = useState("");
  const [tasks, setTasks] = useState<PageTaskDto[]>([]);
  const [revisionTasks, setRevisionTasks] = useState<QaRevisionTaskDto[]>([]);
  const [resolvedImageByPin, setResolvedImageByPin] = useState<Record<string, string>>({});
  const [noteByPin, setNoteByPin] = useState<Record<string, string>>({});
  const [assistantByPin, setAssistantByPin] = useState<Record<string, string>>({});
  const [instructionsByPin, setInstructionsByPin] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<QaSummaryDto | null>(null);
  const [feedbackHistory, setFeedbackHistory] = useState<QaFeedbackHistoryDto | null>(null);
  const [qaHistory, setQaHistory] = useState<QaHistoryDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const approvedCount = useMemo(() => tasks.filter((task) => isApproved(task.status)).length, [tasks]);
  const isReady = tasks.length > 0 && approvedCount === tasks.length;
  const selectedChapter = useMemo(() => chapters.find((item) => item.id === chapterId), [chapterId, chapters]);
  const chapterStatus = selectedChapter?.status ?? "";
  const normalizedChapterStatus = normalizeStatus(chapterStatus);
  const canSubmitCurrentChapter = canSubmitChapterStatus(chapterStatus);
  const currentRevisionTasks = useMemo(
    () => revisionTasks.filter((task) => !chapterId || !task.chapterId || task.chapterId === chapterId),
    [chapterId, revisionTasks],
  );
  const unresolvedRevisionTasks = currentRevisionTasks.filter((task) => !["fixed", "resolved"].includes(taskStatus(task.status)));

  const readinessTitle = (() => {
    if (isLoading) return "Checking page tasks…";
    if (!isReady) return "Review is incomplete";
    if (canSubmitCurrentChapter) return "Ready to submit for QA";
    if (["readyforqa", "pendingqa"].includes(normalizedChapterStatus)) return "Already submitted for QA";
    if (normalizedChapterStatus === "inreview") return "Editor is reviewing";
    if (["revisionrequired", "qarevisionrequired"].includes(normalizedChapterStatus)) return "Revision required";
    if (normalizedChapterStatus === "approved") return "QA approved";
    return "Ready for QA";
  })();

  const submitButtonLabel = (() => {
    if (isSubmitting) return "Submitting…";
    if (!canSubmitCurrentChapter && isReady) return "Waiting for Editor review";
    return currentRevisionTasks.length ? "Resubmit to QA" : "Submit to QA";
  })();

  const loadRevisionTasks = async (id = chapterId) => {
    try {
      if (!id) {
        setRevisionTasks([]);
        return;
      }
      const pins = await mangaErpApi.getQaSessionPins(id);
      const [summaryResult, feedbackResult, historyResult] = await Promise.allSettled([
        mangaErpApi.getQaSummary(id),
        mangaErpApi.getQaFeedbackHistory(id),
        mangaErpApi.getQaHistory(id),
      ]);
      setRevisionTasks(pins.map((pin) => pinToRevisionTask(pin, id)));
      setSummary(summaryResult.status === "fulfilled" ? summaryResult.value : null);
      setFeedbackHistory(feedbackResult.status === "fulfilled" ? feedbackResult.value : null);
      setQaHistory(historyResult.status === "fulfilled" ? historyResult.value : null);
    } catch (error) {
      setRevisionTasks([]);
      setSummary(null);
      setFeedbackHistory(null);
      setQaHistory(null);
      if (isNotFoundError(error)) return;
      toast.error("Could not load QA revision pins", error instanceof Error ? error.message : "Unknown error");
    }
  };

  const loadTasks = async (id: string) => {
    setChapterId(id);
    if (!id) {
      setTasks([]);
      setRevisionTasks([]);
      setSummary(null);
      setFeedbackHistory(null);
      setQaHistory(null);
      return;
    }
    setIsLoading(true);
    try {
      setTasks(await mangaErpApi.getChapterPageTasks(id));
      await loadRevisionTasks(id);
    } catch (error) {
      setTasks([]);
      toast.error("Could not check QA readiness", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const changeSeries = async (id: string) => {
    setSeriesId(id);
    setChapterId("");
    setTasks([]);
    setRevisionTasks([]);
    setIsLoading(true);
    try {
      const items = id ? await mangaErpApi.getChaptersBySeries(id) : [];
      setChapters(items);
      if (items[0]) await loadTasks(items[0].id);
    } catch (error) {
      setChapters([]);
      toast.error("Could not load chapters", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void mangaErpApi.getMySeries().then((items) => {
      setSeries(items);
      const first = items[0]?.id ?? "";
      setSeriesId(first);
      if (first) void changeSeries(first);
      else setIsLoading(false);
    }).catch((error: unknown) => {
      setIsLoading(false);
      toast.error("Could not load your series", error instanceof Error ? error.message : "Unknown error");
    });
    // Initial load only; subsequent selection changes are user-driven.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reportFixed = async (task: QaRevisionTaskDto) => {
    const resolvedImageUrl = resolvedImageByPin[task.pinId]?.trim() ?? "";
    setIsSubmitting(true);
    try {
      await mangaErpApi.resolveQaPin(task.pinId, {
        ResolvedImageUrl: resolvedImageUrl,
        Notes: noteByPin[task.pinId]?.trim() || "Đã sửa pin QA theo yêu cầu.",
      });
      toast.success("Fix reported", "The Editor can now verify this fixed pin.");
      await loadRevisionTasks(chapterId);
    } catch (error) {
      toast.error("Could not report fix", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const assignFix = async (task: QaRevisionTaskDto) => {
    const assistantId = assistantByPin[task.pinId]?.trim();
    if (!assistantId) {
      toast.error("Assistant ID is required", "Paste the assistant user ID to assign this QA pin.");
      return;
    }
    setIsSubmitting(true);
    try {
      await mangaErpApi.assignQaFix(task.pinId, {
        AssistantId: assistantId,
        Instructions: instructionsByPin[task.pinId]?.trim() || undefined,
      });
      toast.success("Fix assigned", "The selected assistant can work on this QA pin.");
      await loadRevisionTasks(chapterId);
    } catch (error) {
      toast.error("Could not assign fix", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submit = async () => {
    if (!chapterId || !isReady) {
      toast.error("Chapter is not ready", "Every created page task must be approved before QA submission.");
      return;
    }
    if (!canSubmitCurrentChapter) {
      toast.error("Chapter cannot be submitted again", `Current status is ${chapterStatus || "unknown"}. Only Draft or QA Revision Required chapters can be submitted for QA.`);
      return;
    }
    if (unresolvedRevisionTasks.length > 0) {
      toast.error("Revision pins remain", "Report every QA revision pin as fixed before resubmitting.");
      return;
    }
    setIsSubmitting(true);
    try {
      await mangaErpApi.resubmitChapterForQA(chapterId);
      toast.success("Chapter submitted to QA", "The Tantou Editor can now re-review the corrected chapter.");
      setChapters((items) => items.map((item) => item.id === chapterId ? { ...item, status: "PendingQA" } : item));
    } catch (error) {
      toast.error("QA submission failed", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Mangaka · MF2/MF3 handoff</p>
        <h1 className="mt-2 text-3xl font-black text-white">QA Submission & Corrections</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Submit completed chapters to QA, receive revision pins from Editor review, report fixed pins, and resubmit for re-review.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-400">
            Series
            <select className="input mt-2" value={seriesId} onChange={(event) => void changeSeries(event.target.value)}>
              <option value="">Select series</option>
              {series.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
          </label>
          <label className="text-sm text-slate-400">
            Chapter
            <select className="input mt-2" value={chapterId} onChange={(event) => void loadTasks(event.target.value)}>
              <option value="">Select chapter</option>
              {chapters.map((item) => <option key={item.id} value={item.id}>Ch. {item.chapterNumber} — {item.title} ({item.status})</option>)}
            </select>
          </label>
        </div>

        <div className={`mt-6 rounded-2xl border p-5 ${isReady ? "border-emerald-400/25 bg-emerald-500/10" : "border-amber-400/20 bg-amber-500/5"}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {isReady ? <CheckCircle2 className="text-emerald-300" /> : <CircleDashed className="text-amber-300" />}
              <div>
                <p className="font-bold text-white">{readinessTitle}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {approvedCount} of {tasks.length} page tasks approved{chapterStatus ? ` · Chapter status: ${chapterStatus}` : ""}
                </p>
              </div>
            </div>
            <FileCheck2 className={isReady ? "text-emerald-300" : "text-slate-600"} size={30} />
          </div>
          {!isLoading && tasks.length > 0 ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between rounded-lg bg-slate-950/70 px-3 py-2 text-sm">
                  <span className="text-slate-300">Page {task.pageNumber}</span>
                  <span className={isApproved(task.status) ? "text-emerald-300" : "text-amber-300"}>{task.status}</span>
                </div>
              ))}
            </div>
          ) : null}
          {!isLoading && tasks.length === 0 ? <p className="mt-4 text-sm text-amber-200">This chapter has no created page tasks yet.</p> : null}
        </div>

        <button
          type="button"
          onClick={() => void submit()}
          disabled={!isReady || !canSubmitCurrentChapter || isSubmitting || isLoading || unresolvedRevisionTasks.length > 0}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={18} />
          {submitButtonLabel}
        </button>
        {!isLoading && isReady && !canSubmitCurrentChapter ? (
          <p className="mt-3 text-sm text-slate-400">
            This chapter is already in the QA flow. Submit is only available while the chapter is Draft or QA Revision Required.
          </p>
        ) : null}

        {summary ? (
          <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-100">QA summary</p>
                <p className="mt-1 text-sm text-slate-300">Session: {summary.sessionStatus ?? "—"} · {summary.canApprove ? "Ready for Editor approval" : "Corrections still in progress"}</p>
              </div>
              <span className="rounded-xl bg-slate-950 px-3 py-2 text-sm text-slate-300">{summary.totalPins} total pins</span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-4">
              <div className="rounded-lg bg-slate-950/70 p-3"><p className="text-xs text-slate-500">Open</p><p className="font-bold text-amber-200">{summary.openPins}</p></div>
              <div className="rounded-lg bg-slate-950/70 p-3"><p className="text-xs text-slate-500">In fixing</p><p className="font-bold text-cyan-200">{summary.inFixingPins}</p></div>
              <div className="rounded-lg bg-slate-950/70 p-3"><p className="text-xs text-slate-500">Fixed</p><p className="font-bold text-blue-200">{summary.fixedPins}</p></div>
              <div className="rounded-lg bg-slate-950/70 p-3"><p className="text-xs text-slate-500">Resolved</p><p className="font-bold text-emerald-200">{summary.resolvedPins}</p></div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-amber-300/20 bg-slate-900 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-amber-200">Editor revision pins</p>
            <h2 className="mt-2 text-xl font-bold text-white">Fix QA pins</h2>
            <p className="mt-2 text-sm text-slate-400">Report each corrected pin as fixed. The Editor will resolve or reopen it after verification.</p>
          </div>
          <button type="button" className="btn-secondary inline-flex items-center gap-2" onClick={() => void loadRevisionTasks(chapterId)}>
            <RefreshCw size={16} />
            Refresh pins
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {currentRevisionTasks.map((task) => (
            <article key={task.id} className="rounded-xl border border-white/10 bg-slate-950 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{task.pinType ?? "QA issue"} · Page {task.pageNumber ?? "—"} · {task.severity ?? "Normal"}</p>
                  <p className="mt-2 text-sm text-slate-300">{task.description}</p>
                  <p className="mt-2 text-xs text-slate-500">Pin: {task.pinId} · Status: {task.status} · Category: {task.assignedToRole ?? "—"}</p>
                  {task.coordinateX !== undefined && task.coordinateY !== undefined ? (
                    <p className="mt-1 text-xs text-slate-500">Position: {task.coordinateX}%, {task.coordinateY}%</p>
                  ) : null}
                </div>
                <span className={`rounded-lg px-3 py-2 text-sm ${["fixed", "resolved"].includes(taskStatus(task.status)) ? "bg-emerald-500/10 text-emerald-200" : "bg-amber-500/10 text-amber-200"}`}>{task.status}</span>
              </div>

              {!["fixed", "resolved"].includes(taskStatus(task.status)) ? (
                <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
                  <label className="text-sm text-slate-400">
                    Resolved image / layer URL (optional)
                    <input className="input mt-2" value={resolvedImageByPin[task.pinId] ?? ""} onChange={(event) => setResolvedImageByPin((current) => ({ ...current, [task.pinId]: event.target.value }))} placeholder="url_anh_da_sua" />
                  </label>
                  <label className="text-sm text-slate-400">
                    Fix notes (optional)
                    <input className="input mt-2" value={noteByPin[task.pinId] ?? ""} onChange={(event) => setNoteByPin((current) => ({ ...current, [task.pinId]: event.target.value }))} placeholder="Đã vẽ lại bàn tay theo đúng ref." />
                  </label>
                  <button type="button" disabled={isSubmitting} onClick={() => void reportFixed(task)} className="inline-flex h-fit self-end items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white disabled:opacity-40">
                    <UploadCloud size={17} />
                    Report fixed
                  </button>
                </div>
              ) : null}

              {!["fixed", "resolved"].includes(taskStatus(task.status)) ? (
                <div className="mt-4 rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-white"><UserPlus size={16} className="text-cyan-200" />Assign this pin to Assistant</p>
                  <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1.4fr_auto]">
                    <label className="text-sm text-slate-400">
                      Assistant ID
                      <input className="input mt-2" value={assistantByPin[task.pinId] ?? ""} onChange={(event) => setAssistantByPin((current) => ({ ...current, [task.pinId]: event.target.value }))} placeholder="assistant-uuid" />
                    </label>
                    <label className="text-sm text-slate-400">
                      Instructions
                      <input className="input mt-2" value={instructionsByPin[task.pinId] ?? ""} onChange={(event) => setInstructionsByPin((current) => ({ ...current, [task.pinId]: event.target.value }))} placeholder="Sửa lại đường viền ở góc phải" />
                    </label>
                    <button type="button" disabled={isSubmitting || !assistantByPin[task.pinId]?.trim()} onClick={() => void assignFix(task)} className="inline-flex h-fit self-end items-center justify-center gap-2 rounded-xl border border-cyan-300/30 px-4 py-3 font-semibold text-cyan-100 disabled:opacity-40">
                      <UserPlus size={17} />
                      Assign fix
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
          {!currentRevisionTasks.length ? <p className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">No revision pins returned for this chapter.</p> : null}
        </div>
      </section>

      {chapterId ? (
        <section className="rounded-2xl border border-white/10 bg-slate-900 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-white"><History size={18} className="text-cyan-200" />QA feedback & history</h2>
              <p className="mt-2 text-sm text-slate-400">Read-only feedback batches and QA session history for the selected chapter.</p>
            </div>
            <button type="button" className="btn-secondary inline-flex items-center gap-2" onClick={() => void loadRevisionTasks(chapterId)}>
              <RefreshCw size={16} />
              Refresh QA data
            </button>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-slate-950 p-4">
              <p className="text-sm font-semibold text-white">Feedback batches</p>
              <div className="mt-3 space-y-3">
                {feedbackHistory?.batches.map((batch) => (
                  <div key={batch.batchToken} className="rounded-lg border border-white/10 p-3">
                    <p className="text-xs text-slate-500">Batch: {batch.batchToken}</p>
                    <p className="mt-1 text-xs text-slate-500">Sent: {batch.sentAt || batch.createdAt ? new Date(batch.sentAt ?? batch.createdAt ?? "").toLocaleString() : "—"}</p>
                    <p className="mt-2 text-sm text-slate-300">{batch.pins.length} pins included</p>
                  </div>
                ))}
                {!feedbackHistory?.batches.length ? <p className="text-sm text-slate-500">No feedback batches returned.</p> : null}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950 p-4">
              <p className="text-sm font-semibold text-white">QA sessions</p>
              <div className="mt-3 space-y-3">
                {qaHistory?.sessions.map((item) => (
                  <div key={item.id ?? item.sessionId ?? item.createdAt} className="rounded-lg border border-white/10 p-3">
                    <p className="text-sm text-slate-300">{item.status} {item.isApproved ? "· Approved" : ""}</p>
                    <p className="mt-1 text-xs text-slate-500">Editor: {item.editorId ?? "—"}</p>
                    <p className="mt-1 text-xs text-slate-500">Created: {item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}</p>
                  </div>
                ))}
                {!qaHistory?.sessions.length ? <p className="text-sm text-slate-500">No QA session history returned.</p> : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
