import { useState } from "react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import { useToast } from "../../shared/components/toastContext";

export default function PublishingSchedulePage() {
  const toast = useToast();
  const [chapterId, setChapterId] = useState("");
  const [seriesId, setSeriesId] = useState("");
  const [issueType, setIssueType] = useState("Weekly");
  const [scheduledPublishAt, setScheduledPublishAt] = useState("");
  const schedule = async () => { try { await mangaErpApi.schedulePublication({ chapterId, seriesId, issueType, scheduledPublishAt: new Date(scheduledPublishAt).toISOString() }); toast.success("Publication scheduled"); } catch (e) { toast.error("Schedule failed", e instanceof Error ? e.message : "Unknown error"); } };
  const publish = async () => { try { await mangaErpApi.publishChapter(chapterId); toast.success("Chapter published"); } catch (e) { toast.error("Publish failed", e instanceof Error ? e.message : "Unknown error"); } };
  return <div className="space-y-6"><div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Editorial Board</p><h2 className="mt-2 text-3xl font-black text-white">Publishing schedule</h2><p className="mt-2 text-sm text-slate-400">BE supports scheduling and immediate publishing; it does not expose a schedule list.</p></div><section className="grid max-w-2xl gap-3 rounded-lg border border-white/10 bg-slate-900/75 p-5"><input className="input" value={chapterId} onChange={e => setChapterId(e.target.value)} placeholder="Chapter ID"/><input className="input" value={seriesId} onChange={e => setSeriesId(e.target.value)} placeholder="Series ID"/><input className="input" value={issueType} onChange={e => setIssueType(e.target.value)} placeholder="Issue type"/><input className="input" type="datetime-local" value={scheduledPublishAt} onChange={e => setScheduledPublishAt(e.target.value)}/><div className="flex gap-2"><button className="btn-primary" onClick={() => void schedule()}>Schedule</button><button className="btn-secondary" onClick={() => void publish()}>Publish now</button></div></section></div>;
}
