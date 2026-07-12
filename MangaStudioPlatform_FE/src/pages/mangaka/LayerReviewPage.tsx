import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Eye, MessageSquare, RefreshCw, RotateCcw } from "lucide-react";
import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { ChapterDto, LayerHistoryDto, MangaSeriesDto, PageTaskDto } from "../../shared/types/mangaErp";
import LoadingSkeleton from "../../shared/components/LoadingSkeleton";
import WorkflowEmptyState from "../../shared/components/WorkflowEmptyState";

export default function LayerReviewPage() {
  const toast = useToast();
  const role = (JSON.parse(localStorage.getItem("currentUser") || "null") as { role?: string; } | null)?.role;
  const [series, setSeries] = useState<MangaSeriesDto[]>([]);
  const [seriesId, setSeriesId] = useState("");
  const [chapters, setChapters] = useState<ChapterDto[]>([]);
  const [chapterId, setChapterId] = useState("");
  const [tasks, setTasks] = useState<PageTaskDto[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [pendingLayer, setPendingLayer] = useState<LayerHistoryDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const selected = tasks.find((task) => task.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedId) return;

    let ignore = false;
    // Ưu tiên layer Pending mới nhất để không review nhầm phiên bản cũ sau khi Assistant nộp sửa.
    void mangaErpApi.getLayerHistory({ pageTaskId: selectedId, status: "Pending" })
      .then((items) => {
        if (!ignore) setPendingLayer(items[0] ?? null);
      })
      .catch(() => {
        if (!ignore) setPendingLayer(null);
      });

    return () => {
      ignore = true;
    };
  }, [selectedId]);

  const loadTasks = useCallback(async (id: string) => {
    if (!id.trim()) return;
    setIsLoading(true);
    try {
      const items = await mangaErpApi.getChapterPageTasks(id.trim());
      setTasks(items);
      setSelectedId((current) => items.some((item) => item.id === current) ? current : items[0]?.id ?? "");
    } catch (error) {
      setTasks([]);
      setSelectedId("");
      toast.error("Could not load chapter tasks", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (role !== "mangaka") return;
    void mangaErpApi.getMySeries().then((items) => {
      setSeries(items);
      const firstId = items[0]?.id ?? "";
      setSeriesId(firstId);
      if (!firstId) return;
      void mangaErpApi.getChaptersBySeries(firstId).then((chapterItems) => {
        setChapters(chapterItems);
        const firstChapter = chapterItems[0]?.id ?? "";
        setChapterId(firstChapter);
        if (firstChapter) void loadTasks(firstChapter);
      });
    }).catch((error: unknown) => toast.error("Could not load your series", error instanceof Error ? error.message : "Unknown error"));
  }, [loadTasks, role, toast]);

  const changeSeries = async (id: string) => {
    // Xóa dữ liệu chapter/task cũ trước khi đổi series để không lẫn dữ liệu giữa các series.
    setSeriesId(id);
    setChapterId("");
    setTasks([]);
    try {
      const items = id ? await mangaErpApi.getChaptersBySeries(id) : [];
      setChapters(items);
      const first = items[0]?.id ?? "";
      setChapterId(first);
      if (first) await loadTasks(first);
    } catch (error) {
      toast.error("Could not load chapters", error instanceof Error ? error.message : "Unknown error");
    }
  };

  const review = async (isAccepted: boolean) => {
    if (!selected) return;
    if (!isAccepted && !feedback.trim()) {
      toast.error("Feedback is required", "Tell the assistant what needs to change.");
      return;
    }
    setIsReviewing(true);
    try {
      // Từ chối layer bắt buộc có feedback để Assistant biết chính xác cần sửa gì.
      await mangaErpApi.reviewPageTask(selected.id, { IsAccepted: isAccepted, RejectionNote: isAccepted ? "" : feedback.trim() });
      toast.success(isAccepted ? "Layer approved" : "Changes requested", isAccepted ? `Page ${selected.pageNumber} was accepted and is ready to merge.` : "A revision request was returned to the assistant.");
      setFeedback("");
      setPendingLayer(null);
      // Tải lại để giao diện nhận status/version do backend cập nhật sau review.
      await loadTasks(chapterId);
    } catch (error) {
      toast.error("Review could not be saved", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">{role === "mangaka" ? "Mangaka" : "Editor"} workflow</p>
        <h1 className="mt-2 text-3xl font-black text-white">Page Layer Review</h1>
        <p className="mt-2 text-sm text-slate-400">Inspect submitted artwork, approve it, or return actionable feedback to the assistant.</p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className={`grid gap-4 ${role === "mangaka" ? "md:grid-cols-[1fr_1fr_auto]" : "md:grid-cols-[1fr_auto]"}`}>
          {role === "mangaka" ? <label className="text-sm text-slate-400">Series<select className="input mt-2" value={seriesId} onChange={(event) => void changeSeries(event.target.value)}><option value="">Select series</option>{series.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label> : null}
          {role === "mangaka" ? (
            <label className="text-sm text-slate-400">Chapter<select className="input mt-2" value={chapterId} onChange={(event) => { const id = event.target.value; setChapterId(id); void loadTasks(id); }}><option value="">Select chapter</option>{chapters.map((item) => <option key={item.id} value={item.id}>Ch. {item.chapterNumber} — {item.title}</option>)}</select></label>
          ) : (
            <label className="text-sm text-slate-400">Chapter ID<input className="input mt-2" value={chapterId} onChange={(event) => setChapterId(event.target.value)} placeholder="Enter an assigned chapter ID" /></label>
          )}
          <button type="button" disabled={isLoading || !chapterId} onClick={() => void loadTasks(chapterId)} className="btn-primary self-end inline-flex items-center justify-center gap-2"><RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />Load tasks</button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold text-white">Chapter Tasks</h2>
          <div className="mt-5 space-y-3">
            {isLoading ? <LoadingSkeleton cards={3} /> : null}
            {!isLoading && tasks.length === 0 ? <WorkflowEmptyState icon={Eye} title="No page tasks to review" description="Select a chapter with Assistant submissions to review its artwork layers." actionLabel="Open task assignment" actionTo="/mangaka/task-assignment" onRefresh={() => { if (chapterId) void loadTasks(chapterId); }} /> : null}
            {tasks.map((task) => <button key={task.id} type="button" onClick={() => { setPendingLayer(null); setSelectedId(task.id); setFeedback(""); }} className={`w-full rounded-xl border p-4 text-left transition ${selectedId === task.id ? "border-cyan-400 bg-cyan-400/10" : "border-slate-800 bg-slate-950 hover:border-slate-600"}`}><div className="flex items-center justify-between gap-3"><span className="font-semibold text-white">Page {task.pageNumber}</span><span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-cyan-200">{task.status}</span></div><p className="mt-2 text-sm text-slate-400">{task.currentLayerType ?? "No layer"}{task.currentLayerVersion ? ` · v${task.currentLayerVersion}` : ""}</p>{task.submissionNote ? <p className="mt-2 line-clamp-2 text-sm text-slate-300">“{task.submissionNote}”</p> : null}</button>)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold text-white">Review Selected Layer</h2>
          {!selected ? <p className="mt-5 text-sm text-slate-400">Choose a task from the chapter list.</p> : <div className="mt-5 space-y-5">
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950 p-4"><p className="flex items-center gap-2 text-sm text-slate-300"><Eye size={17} /> Artwork preview</p>{pendingLayer?.fileUrlOptimized || pendingLayer?.fileUrlOriginal || selected.fileUrlOptimized || selected.fileUrlOriginal || selected.previewCompositeUrl ? <img src={pendingLayer?.fileUrlOptimized ?? pendingLayer?.fileUrlOriginal ?? selected.fileUrlOptimized ?? selected.fileUrlOriginal ?? selected.previewCompositeUrl ?? ""} alt={`Page ${selected.pageNumber} submitted layer`} className="mt-4 max-h-96 w-full rounded-lg object-contain" /> : <div className="mt-4 flex h-56 items-center justify-center rounded-lg bg-slate-900 px-5 text-center text-sm text-slate-500">No preview URL was returned. Review metadata is still available.</div>}</div>
            {selected.submissionNote ? <div className="rounded-xl border border-slate-800 bg-slate-950 p-4"><p className="text-xs text-slate-500">Assistant note</p><p className="mt-2 text-sm text-slate-200">{selected.submissionNote}</p></div> : null}
            <label className="block text-sm text-slate-400"><span className="flex items-center gap-2"><MessageSquare size={16} />Change request feedback</span><textarea className="mt-2 h-28 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none focus:border-cyan-400" value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Describe the exact changes needed…" /></label>
            <div className="flex flex-wrap gap-3"><button type="button" disabled={isReviewing} onClick={() => void review(true)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white disabled:opacity-50"><CheckCircle2 size={18} />Approve</button><button type="button" disabled={isReviewing} onClick={() => void review(false)} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 font-semibold text-white disabled:opacity-50"><RotateCcw size={18} />Request changes</button></div>
          </div>}
        </div>
      </section>
    </div>
  );
}
