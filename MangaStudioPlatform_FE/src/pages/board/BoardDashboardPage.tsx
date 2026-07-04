import { ArrowRight, Gavel, ScrollText } from "lucide-react";
import { Link } from "react-router-dom";

export default function BoardDashboardPage() {
  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-fuchsia-300/15 bg-[radial-gradient(circle_at_top_right,rgba(192,132,252,.16),transparent_35%),rgba(15,23,42,.82)] p-7">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-fuchsia-200">Editorial Board · MF1</p>
        <h1 className="mt-2 text-3xl font-black text-white">Series decision workspace</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Move proposals from evidence review to a transparent board outcome.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <Link to="/app/board/series-proposals" className="group rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/10 p-6 transition hover:-translate-y-1 hover:border-fuchsia-300/45">
          <ScrollText className="text-fuchsia-200" size={24} />
          <h2 className="mt-5 text-xl font-bold text-white">Review proposal evidence</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">Open the submission, manuscript, author profile, feedback, and current vote summary.</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-fuchsia-200">Open queue <ArrowRight size={16} /></span>
        </Link>
        <Link to="/app/board/voting-center" className="group rounded-2xl border border-white/10 bg-slate-900/80 p-6 transition hover:-translate-y-1 hover:border-fuchsia-300/30">
          <Gavel className="text-cyan-200" size={24} />
          <h2 className="mt-5 text-xl font-bold text-white">Understand the decision round</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">See consensus paths, the three-member review rule, and Head Editor escalation.</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-200">View voting model <ArrowRight size={16} /></span>
        </Link>
      </section>
    </div>
  );
}
