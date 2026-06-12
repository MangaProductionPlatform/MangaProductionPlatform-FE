import { Link } from "react-router-dom";
import { ArrowLeft, ClipboardCheck } from "lucide-react";

export default function TaskDetailPage() {
  return (
    <div className="space-y-5">
      <Link
        to="/app/tasks"
        className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 hover:text-cyan-100"
      >
        <ArrowLeft size={16} />
        Back to Tasks
      </Link>

      <section className="rounded-lg border border-white/10 bg-slate-900/75 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
          <ClipboardCheck size={22} />
        </div>
        <h2 className="mt-4 text-xl font-bold text-white">No backend task detail</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
          This route has no backend task detail endpoint yet, so local placeholder task data
          has been removed.
        </p>
      </section>
    </div>
  );
}
