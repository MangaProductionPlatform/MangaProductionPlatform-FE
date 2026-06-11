import { BarChart3, Info } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Analytics
        </p>
        <h2 className="mt-2 text-3xl font-black text-white">
          Ranking, views, and engagement
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          This page will show data once the
          backend exposes creator analytics endpoints.
        </p>
      </div>

      <section className="rounded-lg border border-white/10 bg-slate-900/75 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
          <BarChart3 size={22} />
        </div>
        <h3 className="mt-4 text-lg font-bold text-white">No backend analytics</h3>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
          Ranking service can return ranking boards, but this creator analytics
          dashboard does not have a matching backend contract yet.
        </p>
        <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-lg border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm text-amber-100">
          <Info size={16} />
          Waiting for analytics API
        </div>
      </section>
    </div>
  );
}
