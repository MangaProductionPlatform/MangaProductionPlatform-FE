import type { ReactNode } from "react";
import { Activity, BarChart3, Eye, TrendingUp } from "lucide-react";
import { analyticsTimeline, mangakaSeries } from "../../shared/constants/mangakaWorkSpace";


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
          Compare audience growth, ranking movement, and chapter engagement
          across the creator portfolio.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={<TrendingUp size={18} />} label="Best Rank" value="#12" note="Aurora Blade" />
        <MetricCard icon={<Eye size={18} />} label="Weekly Views" value="4.74M" note="+18.6%" />
        <MetricCard icon={<Activity size={18} />} label="Engagement" value="82%" note="+6.4%" />
      </section>

      <section className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white">Weekly Trend</h3>
            <p className="mt-1 text-sm text-slate-400">
              Ranking, views, and engagement normalized by day.
            </p>
          </div>
          <BarChart3 className="text-cyan-200" />
        </div>

        <div className="mt-6 grid h-80 grid-cols-7 items-end gap-4">
          {analyticsTimeline.map((item) => (
            <div key={item.label} className="flex h-full flex-col justify-end">
              <div className="flex flex-1 items-end gap-1.5">
                <div
                  className="w-full rounded-t-md bg-cyan-300/85"
                  style={{ height: `${item.ranking}%` }}
                />
                <div
                  className="w-full rounded-t-md bg-amber-300/85"
                  style={{ height: `${item.views}%` }}
                />
                <div
                  className="w-full rounded-t-md bg-emerald-300/85"
                  style={{ height: `${item.engagement}%` }}
                />
              </div>
              <p className="mt-3 text-center text-xs text-slate-500">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {mangakaSeries.map((series) => (
          <article
            key={series.id}
            className="rounded-lg border border-white/10 bg-slate-900/75 p-5"
          >
            <div className="flex items-center gap-4">
              <img
                src={series.cover}
                alt={series.title}
                className="h-20 w-14 rounded-lg object-cover"
/>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white">{series.title}</h3>
                    <p className="text-sm text-slate-400">{series.genre}</p>
                  </div>
                  <span className="rounded-md border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-sm font-bold text-amber-100">
                    {series.ranking}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <SmallMetric label="Views" value={series.views} />
                  <SmallMetric label="Engage" value={series.engagement} />
                  <SmallMetric label="Progress" value={`${series.progress}%`} />
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  note,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <article className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <span className="text-cyan-200">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{note}</p>
    </article>
  );
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 truncate font-bold text-white">{value}</p>
    </div>
  );
}
