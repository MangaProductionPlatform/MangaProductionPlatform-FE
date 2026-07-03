import { useState } from "react";
import { BookOpenCheck, CalendarClock, RefreshCw, Rocket } from "lucide-react";
import { useToast } from "./toastContext";
import { mangaErpApi } from "../services/mangaErpService";
import type { ChapterDto, PublicationType, QaSessionDto } from "../types/mangaErp";

export function ChapterPublishingPanel() {
  const toast = useToast();
  const [chapterId, setChapterId] = useState("");
  const [chapter, setChapter] = useState<ChapterDto | null>(null);
  const [qa, setQa] = useState<QaSessionDto | null>(null);
  const [issueType, setIssueType] = useState<PublicationType>("Weekly");
  const [scheduledAt, setScheduledAt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const qaApproved = qa?.isApproved === true || ["qaapproved", "readytopublish", "scheduled"].includes((chapter?.status ?? "").replaceAll("_", "").toLowerCase());

  const load = async () => {
    if (!chapterId.trim()) { toast.error("Chapter ID is required"); return; }
    setIsLoading(true);
    setChapter(null);
    setQa(null);
    try {
      const [chapterResult, qaResult] = await Promise.all([mangaErpApi.getChapter(chapterId.trim()), mangaErpApi.getQaSession(chapterId.trim())]);
      setChapter(chapterResult);
      setQa(qaResult);
    } catch (error) {
      toast.error("Could not load publishing status", error instanceof Error ? error.message : "Unknown error");
    } finally { setIsLoading(false); }
  };

  const schedule = async () => {
    if (!chapter || !qaApproved || !scheduledAt) { toast.error("Schedule details are incomplete", "Load a QA-approved chapter and choose a publication time."); return; }
    setIsScheduling(true);
    try {
      await mangaErpApi.schedulePublication({ chapterId: chapter.id, seriesId: chapter.seriesId, issueType, scheduledPublishAt: new Date(scheduledAt).toISOString() });
      setChapter({ ...chapter, status: "Scheduled", scheduledPublishAt: new Date(scheduledAt).toISOString() });
      toast.success("Publication scheduled", new Date(scheduledAt).toLocaleString());
    } catch (error) { toast.error("Schedule failed", error instanceof Error ? error.message : "Unknown error"); }
    finally { setIsScheduling(false); }
  };

  const publish = async () => {
    if (!chapter || !qaApproved) { toast.error("QA approval required", "Only approved chapters can be published."); return; }
    setIsPublishing(true);
    try {
      await mangaErpApi.publishChapter(chapter.id);
      setChapter({ ...chapter, status: "Published", publishedAt: new Date().toISOString() });
      toast.success("Chapter published", `${chapter.title} is now available to readers.`);
    } catch (error) { toast.error("Publish failed", error instanceof Error ? error.message : "Unknown error"); }
    finally { setIsPublishing(false); }
  };

  return <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
    <div className="grid gap-3 md:grid-cols-[1fr_auto]"><label className="text-sm text-slate-400">Chapter ID<input className="input mt-2" value={chapterId} onChange={(event) => setChapterId(event.target.value)} placeholder="Enter chapter ID from the QA queue" /></label><button type="button" onClick={() => void load()} disabled={isLoading} className="btn-secondary self-end inline-flex items-center justify-center gap-2"><RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />Check QA status</button></div>
    {chapter ? <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950 p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-wider text-slate-500">Chapter {chapter.chapterNumber}</p><h2 className="mt-1 text-xl font-bold text-white">{chapter.title}</h2><p className="mt-2 text-sm text-slate-400">Chapter status: {chapter.status} · QA session: {qa?.status ?? "Unknown"}</p></div><span className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${qaApproved ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300"}`}><BookOpenCheck size={17} />{qaApproved ? "QA approved" : "Awaiting QA approval"}</span></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-sm text-slate-400">Publishing type<select className="input mt-2" value={issueType} onChange={(event) => setIssueType(event.target.value as PublicationType)}><option value="Weekly">Weekly</option><option value="Monthly">Monthly</option><option value="Special">Special</option></select></label><label className="text-sm text-slate-400">Automatic publish time<input className="input mt-2" type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} /></label></div>
      <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={() => void schedule()} disabled={!qaApproved || !scheduledAt || isScheduling || chapter.status.toLowerCase() === "published"} className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white disabled:opacity-40"><CalendarClock size={18} />{isScheduling ? "Scheduling…" : "Schedule publication"}</button><button type="button" onClick={() => void publish()} disabled={!qaApproved || isPublishing || chapter.status.toLowerCase() === "published"} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white disabled:opacity-40"><Rocket size={18} />{isPublishing ? "Publishing…" : "Publish now"}</button></div><p className="mt-3 text-xs text-slate-500">Scheduled publishing is handled by the Publishing service at the selected time.</p>
    </div> : !isLoading ? <div className="mt-6 rounded-xl border border-dashed border-slate-700 bg-slate-950 p-8 text-center text-sm text-slate-400">Load a chapter to verify that QA is approved before publishing.</div> : null}
  </section>;
}
