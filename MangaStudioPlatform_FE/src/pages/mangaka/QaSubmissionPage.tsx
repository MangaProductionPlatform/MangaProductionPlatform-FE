import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleDashed, FileCheck2, Send } from "lucide-react";
import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { ChapterDto, MangaSeriesDto, PageTaskDto, QaBugPinDto } from "../../shared/types/mangaErp";
import "./QaSubmissionPage.css";

const isApproved = (status: string) => ["approved", "accepted", "complete", "completed"].includes(status.toLowerCase());

export default function QaSubmissionPage() {
  const toast = useToast();
  const [series, setSeries] = useState<MangaSeriesDto[]>([]);
  const [seriesId, setSeriesId] = useState("");
  const [chapters, setChapters] = useState<ChapterDto[]>([]);
  const [chapterId, setChapterId] = useState("");
  const [tasks, setTasks] = useState<PageTaskDto[]>([]);
  const [qaPins, setQaPins] = useState<QaBugPinDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const approvedCount = useMemo(() => tasks.filter((task) => isApproved(task.status)).length, [tasks]);
  const isReady = tasks.length > 0 && approvedCount === tasks.length;

  const loadTasks = async (id: string) => {
    setChapterId(id);
    if (!id) { setTasks([]); setQaPins([]); return; }
    setIsLoading(true);
    try {
      const taskItems = await mangaErpApi.getChapterPageTasks(id);
      setTasks(taskItems);
      try { setQaPins(await mangaErpApi.getQaPins(id)); }
      catch (error) {
        setQaPins([]);
        toast.error("Could not load Editorial QA feedback", error instanceof Error ? error.message : "Unknown error");
      }
    }
    catch (error) { setTasks([]); toast.error("Could not check QA readiness", error instanceof Error ? error.message : "Unknown error"); }
    finally { setIsLoading(false); }
  };

  const changeSeries = async (id: string) => {
    setSeriesId(id);
    setChapterId("");
    setTasks([]);
    setQaPins([]);
    setIsLoading(true);
    try {
      const items = id ? await mangaErpApi.getChaptersBySeries(id) : [];
      setChapters(items);
      if (items[0]) await loadTasks(items[0].id);
    } catch (error) { setChapters([]); toast.error("Could not load chapters", error instanceof Error ? error.message : "Unknown error"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    void mangaErpApi.getMySeries().then((items) => {
      setSeries(items);
      const first = items[0]?.id ?? "";
      setSeriesId(first);
      if (first) void changeSeries(first); else setIsLoading(false);
    }).catch((error: unknown) => { setIsLoading(false); toast.error("Could not load your series", error instanceof Error ? error.message : "Unknown error"); });
    // Initial load only; subsequent selection changes are user-driven.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    if (!chapterId || !isReady) {
      toast.error("Chapter is not ready", "Every created page task must be approved before QA submission.");
      return;
    }
    setIsSubmitting(true);
    try {
      await mangaErpApi.submitChapterForQA(chapterId);
      toast.success("Chapter submitted to QA", "The Tantou Editor can now review the completed chapter.");
      setChapters((items) => items.map((item) => item.id === chapterId ? { ...item, status: "InQA" } : item));
    } catch (error) { toast.error("QA submission failed", error instanceof Error ? error.message : "Unknown error"); }
    finally { setIsSubmitting(false); }
  };

  return <div className="qa-submission-page space-y-6">
    <header><p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Mangaka · MF2/MF3 handoff</p><h1 className="mt-2 text-3xl font-black text-white">QA Submission & Corrections</h1><p className="mt-2 text-sm text-slate-400">Submit a completed chapter, receive the Editor feedback batch, and replace corrected layers on their existing page tasks.</p></header>
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="grid gap-4 md:grid-cols-2"><label className="text-sm text-slate-400">Series<select className="input mt-2" value={seriesId} onChange={(event) => void changeSeries(event.target.value)}><option value="">Select series</option>{series.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><label className="text-sm text-slate-400">Chapter<select className="input mt-2" value={chapterId} onChange={(event) => void loadTasks(event.target.value)}><option value="">Select chapter</option>{chapters.map((item) => <option key={item.id} value={item.id}>Ch. {item.chapterNumber} — {item.title} ({item.status})</option>)}</select></label></div>
      <div className={`mt-6 rounded-2xl border p-5 ${isReady ? "border-emerald-400/25 bg-emerald-500/10" : "border-amber-400/20 bg-amber-500/5"}`}>
        <div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3">{isReady ? <CheckCircle2 className="text-emerald-300" /> : <CircleDashed className="text-amber-300" />}<div><p className="font-bold text-white">{isLoading ? "Checking page tasks…" : isReady ? "Ready for QA" : "Review is incomplete"}</p><p className="mt-1 text-sm text-slate-400">{approvedCount} of {tasks.length} page tasks approved</p></div></div><FileCheck2 className={isReady ? "text-emerald-300" : "text-slate-600"} size={30} /></div>
        {!isLoading && tasks.length > 0 ? <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{tasks.map((task) => <div key={task.id} className="flex items-center justify-between rounded-lg bg-slate-950/70 px-3 py-2 text-sm"><span className="text-slate-300">Page {task.pageNumber}</span><span className={isApproved(task.status) ? "text-emerald-300" : "text-amber-300"}>{task.status}</span></div>)}</div> : null}
        {!isLoading && tasks.length === 0 ? <p className="mt-4 text-sm text-amber-200">This chapter has no created page tasks yet.</p> : null}
      </div>
      {qaPins.length === 0 ? <button type="button" onClick={() => void submit()} disabled={!isReady || isSubmitting || isLoading} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"><Send size={18} />{isSubmitting ? "Submitting…" : "Submit to QA"}</button> : null}
    </section>
    {qaPins.length > 0 ? <section className="rounded-2xl border border-amber-300/20 bg-slate-900 p-6"><p className="text-xs font-semibold uppercase tracking-[.2em] text-amber-200">Editor feedback batch</p><h2 className="mt-2 text-xl font-bold text-white">Correct the existing page tasks</h2><p className="mt-2 text-sm text-slate-400">The official API has no QA reassignment or chapter-resubmission operation. The Mangaka or originally assigned Assistant uploads the corrected layer to the same page task; the Editor then rechecks and resolves each pin.</p><div className="mt-5 space-y-3">{qaPins.map((pin) => { const task = tasks.find((item) => item.id === pin.pageTaskId); return <article key={pin.id} className="rounded-xl border border-white/10 bg-slate-950 p-4"><p className="font-semibold text-white">{pin.issueType ?? "Quality issue"} · Page {task?.pageNumber ?? "—"}</p><p className="mt-2 text-sm text-slate-300">{pin.noteMessage}</p><p className="mt-2 break-all text-xs text-slate-500">Page task: {pin.pageTaskId} · Status: {pin.status}</p></article>; })}</div><p className="mt-4 rounded-lg border border-dashed border-slate-700 p-3 text-xs text-slate-500">TODO: Add Assistant QA-reassignment UI only when the backend publishes an official reassignment endpoint.</p></section> : null}
  </div>;
}
