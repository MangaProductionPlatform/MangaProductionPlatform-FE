import { useEffect, useState } from "react";
import { RefreshCw, Send } from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import { useToast } from "../../shared/components/toastContext";

type QueueItem = { id?: string; chapterId?: string; title?: string; chapterTitle?: string; chapterNumber?: number; status?: string; scheduledPublishAt?: string | null; issueType?: string | null };

export default function PublishingQueuePage() {
  const toast = useToast(); const [items, setItems] = useState<QueueItem[]>([]); const [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); try { setItems(await mangaErpApi.getPublishingQueue() as QueueItem[]); } catch (error) { toast.error("Could not load publishing queue", error instanceof Error ? error.message : "Unknown error"); } finally { setLoading(false); } };
  // Initial backend load only.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, []);
  return <div className="space-y-6"><header className="flex items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.28em] text-cyan-200">Tantou Editor · MF3</p><h1 className="mt-2 text-3xl font-black text-white">QA handoff</h1><p className="mt-2 text-sm text-slate-400">Approved chapters moving through the Editorial Board publishing workflow.</p></div><button type="button" title="Refresh publishing queue" onClick={() => void load()} className="icon-button"><RefreshCw size={17}/></button></header><div className="grid gap-3">{items.map((item, index) => <article key={item.id ?? item.chapterId ?? index} className="flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-slate-900 p-4"><div><p className="flex items-center gap-2 font-bold text-white"><Send size={16} className="text-cyan-200"/>Ch. {item.chapterNumber ?? "-"}: {item.title ?? item.chapterTitle ?? "Untitled chapter"}</p><p className="mt-1 text-sm text-slate-400">{item.status ?? "Approved"}{item.issueType ? ` · ${item.issueType}` : ""}</p></div><time className="text-sm text-slate-400">{item.scheduledPublishAt ? new Date(item.scheduledPublishAt).toLocaleString() : "Waiting for Board schedule"}</time></article>)}{!loading && !items.length ? <p className="border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">No chapters are in the publishing queue.</p> : null}</div></div>;
}
