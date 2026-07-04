import { ArrowRight, CheckCircle2, Scale, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";

const reviewRules = [
  { icon: UsersRound, title: "Three-member review", copy: "The first three eligible Editorial Board members form the active review group." },
  { icon: CheckCircle2, title: "Consensus outcome", copy: "Approve, revision, or reject is applied when the board reaches the configured agreement." },
  { icon: Scale, title: "Conflict escalation", copy: "A round without consensus moves to the Head Editor for the final decision." },
];

export default function VotingCenterPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-200">Editorial Board · MF1</p>
          <h1 className="mt-2 text-3xl font-black text-white">Voting center</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">A clear view of how member votes become a board decision.</p>
        </div>
        <Link to="/app/board/series-proposals" className="inline-flex items-center justify-center gap-2 rounded-xl bg-fuchsia-200 px-4 py-3 text-sm font-black text-slate-950 hover:bg-fuchsia-100">
          Open proposal queue <ArrowRight size={16} />
        </Link>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {reviewRules.map(({ icon: Icon, title, copy }, index) => (
          <article key={title} className="group rounded-2xl border border-fuchsia-300/15 bg-slate-900/80 p-5 transition hover:-translate-y-1 hover:border-fuchsia-300/35">
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-fuchsia-300/10 text-fuchsia-200"><Icon size={21} /></span>
              <span className="text-xs font-black tracking-[0.2em] text-slate-600">0{index + 1}</span>
            </div>
            <h2 className="mt-5 font-bold text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-900/75 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Available vote outcomes</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Decision tone="emerald" title="Approve" copy="Create and activate the official series." />
          <Decision tone="amber" title="Request revision" copy="Return feedback and reopen the Mangaka edit loop." />
          <Decision tone="rose" title="Reject" copy="Close the workflow with the board's reason." />
        </div>
      </section>
    </div>
  );
}

function Decision({ tone, title, copy }: { tone: "emerald" | "amber" | "rose"; title: string; copy: string }) {
  const tones = {
    emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
    amber: "border-amber-400/20 bg-amber-500/10 text-amber-200",
    rose: "border-rose-400/20 bg-rose-500/10 text-rose-200",
  };
  return <div className={`rounded-xl border p-4 ${tones[tone]}`}><p className="font-bold">{title}</p><p className="mt-1 text-xs leading-5 text-slate-400">{copy}</p></div>;
}
