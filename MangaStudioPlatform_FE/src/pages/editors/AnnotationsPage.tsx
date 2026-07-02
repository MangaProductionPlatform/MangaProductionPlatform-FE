import { useMemo, useState } from "react";
import { CheckCircle2, MessageSquareWarning, RefreshCw, Send } from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { ChapterDto, PageTaskDto, QaBugPinDto, QaSessionDto } from "../../shared/types/mangaErp";
import { useToast } from "../../shared/components/toastContext";

const isResolved = (status: string) => ["resolved", "closed", "fixed"].includes(status.toLowerCase());

export default function AnnotationsPage() {
  const toast = useToast();
  const [chapterId, setChapterId] = useState("");
  const [chapter, setChapter] = useState<ChapterDto | null>(null);
  const [tasks, setTasks] = useState<PageTaskDto[]>([]);
  const [pageTaskId, setPageTaskId] = useState("");
  const [x, setX] = useState("0.5");
  const [y, setY] = useState("0.5");
  const [note, setNote] = useState("");
  const [issueType, setIssueType] = useState("Lineart");
  const [batchToken, setBatchToken] = useState(() => crypto.randomUUID());
  const [pins, setPins] = useState<QaBugPinDto[]>([]);
  const [session, setSession] = useState<QaSessionDto | null>(null);
  const [busy, setBusy] = useState(false);
  const unresolved = useMemo(() => pins.filter((pin) => !isResolved(pin.status)), [pins]);
  const currentBatchCount = pins.filter((pin) => pin.batchToken === batchToken).length;

  const load = async (requestedChapterId = chapterId) => {
    const id = requestedChapterId.trim();
    if (!id) { toast.error("Chapter ID is required"); return; }
    setChapterId(id);
    setBusy(true);
    setChapter(null);
    setTasks([]);
    setPins([]);
    setSession(null);
    try {
      const [chapterResult, taskResult, pinResult, sessionResult] = await Promise.all([
        mangaErpApi.getChapter(id),
        mangaErpApi.getChapterPageTasks(id),
        mangaErpApi.getQaPins(id),
        mangaErpApi.getQaSession(id),
      ]);
      setChapter(chapterResult);
      setTasks(taskResult);
      setPageTaskId((current) => taskResult.some((task) => task.id === current) ? current : taskResult[0]?.id ?? "");
      setPins(pinResult);
      setSession(sessionResult);
    } catch (error) { toast.error("Could not load QA review", error instanceof Error ? error.message : "Unknown error"); }
    finally { setBusy(false); }
  };

  const add = async () => {
    if (!chapterId || !pageTaskId || !note.trim()) { toast.error("Issue details are incomplete", "Select a page task and describe the quality issue."); return; }
    setBusy(true);
    try {
      await mangaErpApi.addQaPin(chapterId.trim(), { pageTaskId, coordinateX: Number(x), coordinateY: Number(y), noteMessage: note.trim(), issueType, batchToken });
      toast.success("Issue marked", "Add any remaining issues, then send the batch.");
      setNote("");
      setPins(await mangaErpApi.getQaPins(chapterId.trim()));
    } catch (error) { toast.error("Could not mark issue", error instanceof Error ? error.message : "Unknown error"); }
    finally { setBusy(false); }
  };

  const sendBatch = async () => {
    if (!chapterId || currentBatchCount === 0) { toast.error("No feedback to send", "Mark at least one issue in the current batch."); return; }
    setBusy(true);
    try {
      await mangaErpApi.sendQaFeedback(chapterId.trim(), batchToken);
      toast.success("Feedback batch sent", `${currentBatchCount} issue${currentBatchCount === 1 ? "" : "s"} sent to the mangaka.`);
      setBatchToken(crypto.randomUUID());
      await load(chapterId);
    } catch (error) { toast.error("Could not send feedback", error instanceof Error ? error.message : "Unknown error"); }
    finally { setBusy(false); }
  };

  const resolve = async (id: string) => {
    try { await mangaErpApi.resolveQaPin(id); toast.success("Issue resolved"); await load(chapterId); }
    catch (error) { toast.error("Could not resolve issue", error instanceof Error ? error.message : "Unknown error"); }
  };

  const approve = async () => {
    if (!chapterId || unresolved.length > 0) { toast.error("Open issues remain", "Resolve every QA issue before approving the chapter."); return; }
    setBusy(true);
    try { await mangaErpApi.approveChapterQa(chapterId.trim()); toast.success("Chapter approved", "The Editorial Board can now publish or schedule it."); await load(chapterId); }
    catch (error) { toast.error("Could not approve chapter", error instanceof Error ? error.message : "Unknown error"); }
    finally { setBusy(false); }
  };

  return <div className="space-y-6">
    <header><p className="text-xs font-semibold uppercase tracking-[.28em] text-cyan-200">Tantou Editor · MF3</p><h1 className="mt-2 text-3xl font-black text-white">Editorial QA Review</h1><p className="mt-2 text-sm text-slate-400">Inspect visual and content quality, send all detected issues as one feedback batch, and approve only when every issue is resolved.</p></header>
    <section className="rounded-2xl border border-white/10 bg-slate-900/75 p-5">
      <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950 p-3 text-xs text-slate-500">TODO: The official backend contract does not expose an incoming QA queue endpoint. Open a completed chapter using its ID.</div><div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]"><label className="text-sm text-slate-400">Completed chapter ID<input className="input mt-2" value={chapterId} onChange={(event) => setChapterId(event.target.value)} placeholder="Enter chapter ID submitted for QA" /></label><button disabled={busy} className="btn-secondary self-end inline-flex items-center justify-center gap-2" onClick={() => void load(chapterId)}><RefreshCw size={16} className={busy ? "animate-spin" : ""} />Load QA review</button></div>
      {chapter ? <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-950 p-4"><div><p className="font-bold text-white">Ch. {chapter.chapterNumber} — {chapter.title}</p><p className="mt-1 text-sm text-slate-400">{chapter.status} · QA {session?.status ?? "not started"}</p></div><span className={`rounded-lg px-3 py-2 text-sm ${unresolved.length ? "bg-amber-500/10 text-amber-200" : "bg-emerald-500/10 text-emerald-200"}`}>{unresolved.length} open issue{unresolved.length === 1 ? "" : "s"}</span></div> : null}
    </section>

    {chapter ? <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-2xl border border-white/10 bg-slate-900/75 p-5"><h2 className="flex items-center gap-2 text-lg font-bold text-white"><MessageSquareWarning className="text-amber-300" size={20} />Mark a quality issue</h2><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-sm text-slate-400">Page task<select className="input mt-2" value={pageTaskId} onChange={(event) => setPageTaskId(event.target.value)}><option value="">Select page</option>{tasks.map((task) => <option key={task.id} value={task.id}>Page {task.pageNumber} · {task.currentLayerType ?? "composite"}</option>)}</select></label><label className="text-sm text-slate-400">Issue type<select className="input mt-2" value={issueType} onChange={(event) => setIssueType(event.target.value)}><option value="Lineart">Lineart</option><option value="Coloring">Coloring</option><option value="Text">Text</option><option value="Layout">Layout</option></select></label><label className="text-sm text-slate-400">X coordinate<input className="input mt-2" type="number" min="0" max="1" step="0.01" value={x} onChange={(event) => setX(event.target.value)} /></label><label className="text-sm text-slate-400">Y coordinate<input className="input mt-2" type="number" min="0" max="1" step="0.01" value={y} onChange={(event) => setY(event.target.value)} /></label></div><label className="mt-3 block text-sm text-slate-400">Feedback<textarea className="input mt-2 min-h-28" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Explain the issue and expected correction." /></label><button disabled={busy} className="mt-4 rounded-lg bg-white px-4 py-2 font-bold text-slate-950 disabled:opacity-50" onClick={() => void add()}>Add to feedback batch</button><div className="mt-4 rounded-lg border border-cyan-300/15 bg-cyan-500/5 p-3 text-sm text-cyan-100">Current batch: {currentBatchCount} issue{currentBatchCount === 1 ? "" : "s"}</div><button disabled={busy || currentBatchCount === 0} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 font-bold text-slate-950 disabled:opacity-40" onClick={() => void sendBatch()}><Send size={17} />Send feedback batch</button></div>
      <div className="rounded-2xl border border-white/10 bg-slate-900/75 p-5"><h2 className="text-lg font-bold text-white">QA issues</h2><div className="mt-4 space-y-3">{pins.map((pin) => <article key={pin.id} className="rounded-xl border border-white/10 bg-slate-950 p-4"><div className="flex flex-wrap justify-between gap-4"><div><b className="text-white">{pin.issueType || "Quality issue"}</b><p className="mt-1 text-sm text-slate-300">{pin.noteMessage}</p><p className="mt-2 text-xs text-slate-500">({pin.coordinateX}, {pin.coordinateY}) · {pin.status}</p></div>{!isResolved(pin.status) ? <button className="h-fit rounded-lg border border-emerald-300/30 px-3 py-2 text-sm text-emerald-100" onClick={() => void resolve(pin.id)}>Mark resolved</button> : null}</div></article>)}{pins.length === 0 ? <p className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">No QA issues marked.</p> : null}</div><button disabled={busy || unresolved.length > 0 || session?.isApproved} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white disabled:opacity-40" onClick={() => void approve()}><CheckCircle2 size={18} />{session?.isApproved ? "Chapter approved" : "Approve chapter"}</button></div>
    </section> : null}
  </div>;
}
