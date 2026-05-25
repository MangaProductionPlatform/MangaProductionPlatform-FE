import type { ReactNode } from "react";
import { Mail, PlusCircle, Search, Star, UserPlus, Users } from "lucide-react";
import { assistants } from "../../shared/constants/mangakaWorkSpace";

export default function AssistantsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Assistants
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Studio team workload
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Review assistant skills, workload, current assignments, and quality
            history before assigning chapter tasks.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100">
          <UserPlus size={16} />
          Invite Assistant
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Summary icon={<Users size={18} />} label="Active Assistants" value="4" />
        <Summary icon={<Star size={18} />} label="Avg Quality" value="95.3%" />
        <Summary icon={<PlusCircle size={18} />} label="Open Capacity" value="2 slots" />
      </section>

      <section className="rounded-lg border border-white/10 bg-slate-900/75 p-4">
        <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2.5">
          <Search size={18} className="text-slate-500" />
          <input
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            placeholder="Search assistant, skill, current task"
          />
        </label>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {assistants.map((assistant) => (
          <article
            key={assistant.name}
            className="rounded-lg border border-white/10 bg-slate-900/75 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-300 to-amber-300 text-lg font-black text-slate-950">
                  {assistant.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </div>
                <div>
                  <h3 className="font-bold text-white">{assistant.name}</h3>
                  <p className="text-sm text-slate-400">{assistant.role}</p>
                </div>
              </div>
              <button className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10">
                <Mail size={17} />
</button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <Info label="Current" value={assistant.current} />
              <Info label="Review score" value={assistant.rating} />
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Workload</span>
                <span className="font-semibold text-white">
                  {assistant.workload}%
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-amber-300"
                  style={{ width: `${assistant.workload}%` }}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {assistant.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function Summary({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <span className="text-cyan-200">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-black text-white">{value}</p>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 truncate font-semibold text-white">{value}</p>
    </div>
  );
}