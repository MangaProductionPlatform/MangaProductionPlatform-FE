import { Database, Filter, Search } from "lucide-react";
import { monitoredSeries } from "../../shared/constants/adminWorkSpace";

const filters = ["Active", "Pending", "Cancelled", "Hiatus"] as const;

export default function AdminSeriesMonitoringPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            Series Monitoring
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Platform manga inventory
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Status, ranking, reports, author ownership, and production risk for
            every title.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-300">
          <Database size={16} className="text-cyan-200" />
          342 series monitored
        </div>
      </div>

      <section className="flex flex-col gap-3 rounded-lg border border-white/10 bg-slate-900 p-4 xl:flex-row xl:items-center xl:justify-between">
        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2.5">
          <Search size={18} className="text-slate-500" />
          <input
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            placeholder="Search series, author, status"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
            >
              <Filter size={15} />
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-slate-900 p-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr className="border-b border-white/10">
                <th className="py-3 pr-4">Series</th>
                <th className="py-3 pr-4">Author</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Ranking</th>
                <th className="py-3 pr-4">Reports</th>
                <th className="py-3 pr-4">Progress</th>
                <th className="py-3 pr-4">Risk</th>
              </tr>
            </thead>
            <tbody>
              {monitoredSeries.map((series) => (
                <tr key={series.title} className="border-b border-white/10">
<td className="py-4 pr-4 font-bold text-white">
                    {series.title}
                  </td>
                  <td className="py-4 pr-4 text-slate-300">{series.author}</td>
                  <td className="py-4 pr-4">
                    <span className={statusTone(series.status)}>
                      {series.status}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-amber-100">{series.ranking}</td>
                  <td className="py-4 pr-4 text-slate-300">{series.reports}</td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-32 rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-cyan-300"
                          style={{ width: `${series.progress}%` }}
                        />
                      </div>
                      <span className="text-slate-300">{series.progress}%</span>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <span className={riskTone(series.deadlineRisk)}>
                      {series.deadlineRisk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function statusTone(status: string) {
  if (status === "Active") {
    return "rounded-md border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 text-xs font-bold text-emerald-100";
  }

  if (status === "Pending") {
    return "rounded-md border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs font-bold text-amber-100";
  }

  if (status === "Cancelled") {
    return "rounded-md border border-rose-300/30 bg-rose-300/10 px-2 py-1 text-xs font-bold text-rose-100";
  }

  return "rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-xs font-bold text-slate-300";
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
