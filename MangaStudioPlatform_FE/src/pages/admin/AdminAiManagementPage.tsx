import { Bot, SlidersHorizontal, ToggleLeft } from "lucide-react";
import { aiJobs, aiModels } from "../../shared/constants/adminWorkSpace";

export default function AdminAiManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            AI Management
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Models, thresholds, and processing queue
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            AI-assisted panel detection, masking, OCR, and upload safety jobs.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100">
          <SlidersHorizontal size={16} />
          Update Thresholds
        </button>
      </div>

      <section className="grid gap-5 xl:grid-cols-[1fr_22rem]">
        <article className="rounded-lg border border-white/10 bg-slate-900 p-5">
          <h3 className="text-lg font-bold text-white">Models</h3>
          <div className="mt-5 space-y-3">
            {aiModels.map((model) => (
              <div
                key={model.model}
                className="grid gap-3 rounded-lg border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_8rem_8rem_5rem]"
              >
                <div>
                  <p className="font-bold text-white">{model.model}</p>
                  <p className="mt-1 text-sm text-slate-400">{model.feature}</p>
                </div>
                <span className={statusTone(model.status)}>{model.status}</span>
                <p className="font-bold text-cyan-100">{model.accuracy}</p>
                <button className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10">
                  Toggle
                </button>
              </div>
            ))}
          </div>
        </article>

        <aside className="rounded-lg border border-white/10 bg-slate-900 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
              <Bot size={18} />
            </span>
            <div>
              <h3 className="font-bold text-white">AI Settings</h3>
              <p className="text-sm text-slate-400">Runtime controls</p>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            <Setting label="Enable AI" value="On" />
            <Setting label="Confidence threshold" value="86%" />
            <Setting label="Queue priority" value="Production first" />
<button className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
              <ToggleLeft size={16} />
              Toggle Maintenance
            </button>
          </div>
        </aside>
      </section>

      <section className="rounded-lg border border-white/10 bg-slate-900 p-5">
        <h3 className="text-lg font-bold text-white">AI Jobs</h3>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr className="border-b border-white/10">
                <th className="py-3 pr-4">Job</th>
                <th className="py-3 pr-4">Type</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Owner</th>
              </tr>
            </thead>
            <tbody>
              {aiJobs.map((job) => (
                <tr key={job.id} className="border-b border-white/10">
                  <td className="py-4 pr-4 font-bold text-white">{job.id}</td>
                  <td className="py-4 pr-4 text-slate-300">{job.type}</td>
                  <td className="py-4 pr-4">
                    <span className={jobTone(job.status)}>{job.status}</span>
                  </td>
                  <td className="py-4 pr-4 text-slate-300">{job.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Setting({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-bold text-white">{value}</p>
    </div>
  );
}

function statusTone(status: string) {
  if (status === "Active") {
    return "rounded-md border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 text-xs font-bold text-emerald-100";
  }

  return "rounded-md border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs font-bold text-amber-100";
}

function jobTone(status: string) {
  if (status === "Failed") {
    return "rounded-md border border-rose-300/30 bg-rose-300/10 px-2 py-1 text-xs font-bold text-rose-100";
  }

  if (status === "Completed") {
    return "rounded-md border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 text-xs font-bold text-emerald-100";
  }

  if (status === "Running") {
    return "rounded-md border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-xs font-bold text-cyan-100";
  }

  return "rounded-md border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs font-bold text-amber-100";
}
