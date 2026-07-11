import { useEffect, useState } from "react";
import { ClipboardCheck, RefreshCw } from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { ChapterDto } from "../../shared/types/mangaErp";
import { useToast } from "../../shared/components/toastContext";

export default function ReviewQueuePage() {
  const toast = useToast(); const [chapters, setChapters] = useState<ChapterDto[]>([]); const [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); try { setChapters(await mangaErpApi.getEditorChapterQueue()); } catch (error) { toast.error("Could not load chapter queue", error instanceof Error ? error.message : "Unknown error"); } finally { setLoading(false); } };
  // Initial backend load only.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, []);
  return <div className="space-y-6"><header className="flex items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.28em] text-cyan-200">Tantou Editor</p><h1 className="mt-2 text-3xl font-black text-white">Chapter review queue</h1></div><button type="button" title="Refresh chapter queue" onClick={() => void load()} className="icon-button"><RefreshCw size={17}/></button></header><div className="grid gap-3">{chapters.map((chapter) => <article key={chapter.id} className="flex flex-wrap items-center justify-between gap-4 border border-white/10 bg-slate-900 p-4"><div><p className="flex items-center gap-2 font-bold text-white"><ClipboardCheck size={17} className="text-cyan-200"/>Ch. {chapter.chapterNumber}: {chapter.title}</p><p className="mt-1 text-sm text-slate-400">{chapter.status} · {chapter.approvedPages ?? 0}/{chapter.totalPages} pages approved</p></div><span className="text-sm text-slate-400">{chapter.progressPercent ?? 0}% complete</span></article>)}{!loading && !chapters.length ? <p className="border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">No chapters are assigned to this editor.</p> : null}</div></div>;
}
