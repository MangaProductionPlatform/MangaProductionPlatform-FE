import type { ReactNode } from "react";
import { Activity, BarChart3, Upload, Users } from "lucide-react";
import { analyticsSeries } from "../../shared/constants/adminWorkSpace";

export default function AdminReportsAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
          Reports & Analytics
        </p>
        <h2 className="mt-2 text-3xl font-black text-white">
          Platform analytics
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Active users, manga uploads, ranking trends, engagement, and AI usage.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric icon={<Users size={18} />} label="Active users" value="12.5K" />
        <Metric icon={<Upload size={18} />} label="Manga uploads" value="1,284" />
        <Metric icon={<Activity size={18} />} label="Engagement" value="81%" />
        <Metric icon={<BarChart3 size={18} />} label="AI usage" value="6.8K jobs" />
      </section>

      <section className="rounded-lg border border-white/10 bg-slate-900 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white">System Trends</h3>
            <p className="mt-1 text-sm text-slate-400">
              Monthly platform activity.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-md bg-cyan-300/10 px-2 py-1 text-cyan-100">
              users
            </span>
            <span className="rounded-md bg-amber-300/10 px-2 py-1 text-amber-100">
              uploads
            </span>
            <span className="rounded-md bg-emerald-300/10 px-2 py-1 text-emerald-100">
              engagement
            </span>
            <span className="rounded-md bg-fuchsia-300/10 px-2 py-1 text-fuchsia-100">
              ai
            </span>
          </div>
        </div>

        <div className="mt-6 grid h-80 grid-cols-5 items-end gap-4">
          {analyticsSeries.map((item) => (
            <div key={item.label} className="flex h-full flex-col justify-end">
              <div className="flex flex-1 items-end gap-1.5">
                <div
                  className="w-full rounded-t-md bg-cyan-300/85"
                  style={{ height: `${item.users}%` }}
                />
                <div
                  className="w-full rounded-t-md bg-amber-300/85"
                  style={{ height: `${item.uploads}%` }}
                />
                <div
                  className="w-full rounded-t-md bg-emerald-300/85"
                  style={{ height: `${item.engagement}%` }}
                />
                <div
                  className="w-full rounded-t-md bg-fuchsia-300/85"
                  style={{ height: `${item.ai}%` }}
                />
</div>
              <p className="mt-3 text-center text-xs text-slate-500">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-lg border border-white/10 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <span className="text-cyan-200">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-black text-white">{value}</p>
    </article>
  );
}
