import { ClipboardCheck, Info } from "lucide-react";

export default function TaskBoardPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Task Assignment
        </p>
        <h2 className="mt-2 text-3xl font-black text-white">
          Assistant production board
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          No backend endpoint exists yet for listing or creating task-board
          assignments, so this page no longer displays local placeholder task data.
        </p>
      </div>

      <section className="rounded-lg border border-white/10 bg-slate-900/75 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
          <ClipboardCheck size={22} />
        </div>
        <h3 className="mt-4 text-lg font-bold text-white">No backend tasks</h3>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
          Task service currently supports layer submission and layer review by
          `pageTaskId`, but it does not expose a task board list/create API.
        </p>
        <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-lg border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm text-amber-100">
          <Info size={16} />
          Waiting for backend task-board API
        </div>
      </section>
    </div>
  );
}
