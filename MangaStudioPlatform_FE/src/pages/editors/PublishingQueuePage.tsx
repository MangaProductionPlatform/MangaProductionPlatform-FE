import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function PublishingQueuePage() {
  return <div className="space-y-6"><header><p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Tantou Editor · MF3</p><h1 className="mt-2 text-3xl font-black text-white">QA Handoff</h1><p className="mt-2 text-sm text-slate-400">Editors approve quality; publication scheduling belongs to the Editorial Board.</p></header><section className="rounded-2xl border border-emerald-300/20 bg-slate-900 p-6"><CheckCircle2 className="text-emerald-300" size={30} /><h2 className="mt-4 text-xl font-bold text-white">Complete Editorial QA</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Review the completed chapter, batch all visual and content feedback, verify revisions, and approve it. Approval hands the chapter to the Board’s publishing schedule.</p><Link to="/app/editor/annotations" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 font-semibold text-white">Open Editorial QA <ArrowRight size={17} /></Link></section></div>;
}
