import { Ban, Flag, ShieldAlert, Trash2 } from "lucide-react";
import { moderationReports } from "../../shared/constants/adminWorkSpace";

export default function AdminModerationPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            Moderation
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Reports and enforcement
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Spam, copyright concerns, unsafe uploads, harassment, warnings, and
            account actions.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-rose-300/20 bg-rose-300/10 px-4 py-2 text-sm font-semibold text-rose-100">
          <ShieldAlert size={16} />
          3 pending reports
        </div>
      </div>

      <section className="rounded-lg border border-white/10 bg-slate-900 p-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr className="border-b border-white/10">
                <th className="py-3 pr-4">Report</th>
                <th className="py-3 pr-4">Target</th>
                <th className="py-3 pr-4">Severity</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {moderationReports.map((report) => (
                <tr key={report.id} className="border-b border-white/10">
                  <td className="py-4 pr-4">
                    <p className="font-bold text-white">{report.report}</p>
                    <p className="mt-1 text-xs text-slate-500">{report.id}</p>
                  </td>
                  <td className="py-4 pr-4 text-slate-300">{report.target}</td>
                  <td className="py-4 pr-4">
                    <span className={severityTone(report.severity)}>
                      {report.severity}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-slate-300">{report.status}</td>
                  <td className="py-4 pr-4">
                    <div className="flex gap-2">
                      <button className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-200 hover:bg-white/10" title="Warn user">
                        <Flag size={16} />
                      </button>
                      <button className="rounded-lg border border-white/10 bg-white/5 p-2 text-rose-200 hover:bg-rose-500/10" title="Remove content">
                        <Trash2 size={16} />
                      </button>
<button className="rounded-lg border border-white/10 bg-white/5 p-2 text-amber-100 hover:bg-white/10" title="Suspend account">
                        <Ban size={16} />
                      </button>
                    </div>
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

function severityTone(severity: string) {
  if (severity === "High") {
    return "rounded-md border border-rose-300/30 bg-rose-300/10 px-2 py-1 text-xs font-bold text-rose-100";
  }

  if (severity === "Medium") {
    return "rounded-md border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs font-bold text-amber-100";
  }

  return "rounded-md border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 text-xs font-bold text-emerald-100";
}
