import { AlertTriangle, GitBranch, Users } from "lucide-react";
import { workflowColumns, workflowHealth } from "../../shared/constants/adminWorkSpace";


export default function AdminWorkflowMonitoringPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
          Workflow Monitoring
        </p>
        <h2 className="mt-2 text-3xl font-black text-white">
          Production tracking overview
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Overdue tasks, unfinished chapters, assistant workload, editor queue,
          and publishing throughput.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {workflowHealth.map((item) => (
          <article
            key={item.label}
            className="rounded-lg border border-white/10 bg-slate-900 p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">{item.label}</p>
              <span className={severityTone(item.severity)}>
                {item.severity}
              </span>
            </div>
            <p className="mt-3 text-2xl font-black text-white">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        {workflowColumns.map((column) => (
          <div
            key={column.title}
            className="min-h-[26rem] rounded-lg border border-white/10 bg-slate-900 p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">{column.title}</h3>
              <span className="rounded-md bg-slate-950 px-2 py-1 text-xs font-bold text-slate-300">
                {column.count}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {column.items.map((item) => (
                <article
                  key={`${column.title}-${item}`}
                  className="rounded-lg border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-white">{item}</p>
                    {column.title === "Review" ? (
                      <AlertTriangle size={16} className="text-amber-200" />
                    ) : (
                      <GitBranch size={16} className="text-cyan-200" />
                    )}
                  </div>
                  <p className="mt-3 text-sm text-slate-400">
                    {column.title} queue
                  </p>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-white/10 bg-slate-900 p-5">
        <div className="flex items-center gap-3">
<span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
            <Users size={18} />
          </span>
          <div>
            <h3 className="font-bold text-white">Assistant Workload</h3>
            <p className="text-sm text-slate-400">
              76% average workload across active assistants.
            </p>
          </div>
        </div>
        <div className="mt-5 h-3 rounded-full bg-slate-800">
          <div className="h-full w-[76%] rounded-full bg-cyan-300" />
        </div>
      </section>
    </div>
  );
}

function severityTone(severity: string) {
  if (severity === "High") {
    return "rounded-md border border-rose-300/30 bg-rose-300/10 px-2 py-1 text-xs font-bold text-rose-100";
  }

  return "rounded-md border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs font-bold text-amber-100";
}
