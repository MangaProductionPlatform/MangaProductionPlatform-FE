import {
  Activity,
  AlertTriangle,
  Bot,
  Database,
  FileText,
  Server,
  Users,
} from "lucide-react";
import { adminStats, monitoredSeries, recentAdminActivities, systemHealth } from "../../shared/constants/adminWorkSpace";


const statIcons = [Users, Database, FileText, Bot, Server] as const;

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-white/10 bg-slate-900 p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              Admin Dashboard
            </p>
            <h2 className="mt-2 text-3xl font-black text-white">
              Studio Operations Dashboard
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Manga platform monitoring, production governance, AI queues, and
              operational risk in one command center.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100">
            <Activity size={16} />
            Platform operational
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {adminStats.map((stat, index) => {
          const Icon = statIcons[index];

          return (
            <article
              key={stat.label}
              className="rounded-lg border border-white/10 bg-slate-900 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-400">{stat.label}</p>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-cyan-200">
                  <Icon size={18} />
                </span>
              </div>
              <p className="mt-4 text-2xl font-black text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-slate-500">{stat.note}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-lg border border-white/10 bg-slate-900 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">
                Workflow Monitoring
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Series progress and deadline risk.
              </p>
            </div>
            <AlertTriangle size={18} className="text-amber-200" />
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
<thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
                <tr className="border-b border-white/10">
                  <th className="py-3 pr-4">Series</th>
                  <th className="py-3 pr-4">Progress</th>
                  <th className="py-3 pr-4">Deadline Risk</th>
                  <th className="py-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {monitoredSeries.slice(0, 4).map((series) => (
                  <tr key={series.title} className="border-b border-white/10">
                    <td className="py-4 pr-4 font-bold text-white">
                      {series.title}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-32 rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-cyan-300"
                            style={{ width: `${series.progress}%` }}
                          />
                        </div>
                        <span className="text-slate-300">
                          {series.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <span className={riskTone(series.deadlineRisk)}>
                        {series.deadlineRisk}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-slate-300">
                      {series.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-lg border border-white/10 bg-slate-900 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">System Health</h3>
              <p className="mt-1 text-sm text-slate-400">
                Queues, failed jobs, and server state.
              </p>
            </div>
            <Server size={18} className="text-emerald-200" />
          </div>

          <div className="mt-5 space-y-3">
            {systemHealth.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-3"
              >
                <div>
                  <p className="font-semibold text-white">{item.label}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.value}</p>
                </div>
                <span className={healthTone(item.status)}>{item.status}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-lg border border-white/10 bg-slate-900 p-5">
<h3 className="text-lg font-bold text-white">Recent Activities</h3>
        <div className="mt-5 grid gap-3 xl:grid-cols-4">
          {recentAdminActivities.map((activity) => (
            <article
              key={`${activity.title}-${activity.time}`}
              className="rounded-lg border border-white/10 bg-white/5 p-4"
            >
              <p className="font-bold text-white">{activity.title}</p>
              <p className="mt-2 text-sm leading-5 text-slate-400">
                {activity.meta}
              </p>
              <p className="mt-4 text-xs text-slate-500">{activity.time}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function riskTone(risk: string) {
  if (risk === "High") {
    return "rounded-md border border-rose-300/30 bg-rose-300/10 px-2 py-1 text-xs font-bold text-rose-100";
  }

  if (risk === "Medium") {
    return "rounded-md border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs font-bold text-amber-100";
  }

  return "rounded-md border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 text-xs font-bold text-emerald-100";
}

function healthTone(status: string) {
  if (status === "Healthy") {
    return "rounded-md border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 text-xs font-bold text-emerald-100";
  }

  if (status === "Attention") {
    return "rounded-md border border-rose-300/30 bg-rose-300/10 px-2 py-1 text-xs font-bold text-rose-100";
  }

  return "rounded-md border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs font-bold text-amber-100";
}