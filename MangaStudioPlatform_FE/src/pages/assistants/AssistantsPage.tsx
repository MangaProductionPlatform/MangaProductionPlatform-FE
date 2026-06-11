import { Info, Users } from "lucide-react";

export default function AssistantsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Assistants
        </p>
        <h2 className="mt-2 text-3xl font-black text-white">
          Studio team workload
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Assistant local placeholder profiles have been removed. This page needs a backend
          assistant/user query before it can show real assistant records.
        </p>
      </div>

      <section className="rounded-lg border border-white/10 bg-slate-900/75 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
          <Users size={22} />
        </div>
        <h3 className="mt-4 text-lg font-bold text-white">No backend assistants</h3>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
          Identity currently supports login, but it does not
          expose a users/assistants list endpoint.
        </p>
        <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-lg border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm text-amber-100">
          <Info size={16} />
          Waiting for assistant list API
        </div>
      </section>
    </div>
  );
}
