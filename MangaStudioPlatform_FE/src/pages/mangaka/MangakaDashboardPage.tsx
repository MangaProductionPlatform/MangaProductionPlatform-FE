import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, FilePenLine, RefreshCw, Send } from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { MangaSeriesDto, SubmissionSummaryDto } from "../../shared/types/mangaErp";
import { useToast } from "../../shared/components/toastContext";
import "./MangakaDashboardPage.css";

export default function MangakaDashboardPage() {
  const toast = useToast();
  const [submissions, setSubmissions] = useState<SubmissionSummaryDto[]>([]);
  const [series, setSeries] = useState<MangaSeriesDto[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); try { const [submissionResult, seriesResult] = await Promise.all([mangaErpApi.getMySubmissions(), mangaErpApi.getMySeries()]); setSubmissions(submissionResult); setSeries(seriesResult); } catch (e) { toast.error("Could not load MF1 dashboard", e instanceof Error ? e.message : "Unknown error"); } finally { setLoading(false); } };
  useEffect(() => {
    // Initial backend fetch; state updates happen after the requests resolve.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const stats = [
    { label: "Drafts", value: submissions.filter(x => x.status === "Draft").length, icon: FilePenLine },
    { label: "Pending EB review", value: submissions.filter(x => x.status === "Pending_EB_Review").length, icon: Send },
    { label: "Requires revision", value: submissions.filter(x => x.status === "Requires_Revision").length, icon: RefreshCw },
    { label: "Active series", value: series.filter(x => x.status === "Active").length, icon: BookOpen },
  ];
  return <div className="mangaka-dashboard-page space-y-6"><div className="rounded-2xl border border-white/10 bg-slate-900/75 p-7"><p className="text-xs font-semibold uppercase tracking-[.28em] text-cyan-200">Mangaka · MF1</p><h1 className="mt-2 text-3xl font-black text-white">Series Submission Dashboard</h1><p className="mt-2 text-sm text-slate-400">Real submission and official-series status returned by the backend.</p></div>
    <div className="grid gap-4 md:grid-cols-4">{stats.map(item => { const Icon = item.icon; return <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-900/75 p-5"><div className="flex justify-between text-slate-400"><span>{item.label}</span><Icon size={20} className="text-cyan-300" /></div><p className="mt-4 text-3xl font-black text-white">{loading ? "…" : item.value}</p></div>; })}</div>
    <section className="grid gap-4 md:grid-cols-2"><Link to="/mangaka/submissions" className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-6"><h2 className="text-xl font-bold text-white">Create or manage a proposal</h2><p className="mt-2 text-sm text-slate-300">Draft, update manuscript, submit and resubmit.</p></Link><Link to="/mangaka/series" className="rounded-2xl border border-white/10 bg-slate-900/75 p-6"><h2 className="text-xl font-bold text-white">Official Series</h2><p className="mt-2 text-sm text-slate-400">Approved Series become Active and allow Chapter creation.</p></Link></section>
    <section className="rounded-2xl border border-white/10 bg-slate-900/75 p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-bold text-white">Recent submissions</h2><button className="text-sm font-semibold text-cyan-200" onClick={() => void load()}>Refresh</button></div><div className="mt-4 space-y-3">{submissions.slice(0, 5).map(x => <div key={x.id} className="flex justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/60 p-4"><div><p className="font-semibold text-white">{x.title}</p><p className="mt-1 text-xs text-slate-500">{new Date(x.createdAt).toLocaleString()}</p></div><span className="h-fit rounded-md bg-cyan-300/10 px-2 py-1 text-sm text-cyan-100">{x.status}</span></div>)}{!loading && !submissions.length ? <p className="text-sm text-slate-400">No submissions yet.</p> : null}</div></section>
  </div>;
}
