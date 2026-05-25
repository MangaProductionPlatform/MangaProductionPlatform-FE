import { Link } from "react-router-dom";
import { Calendar, Flag, Search, User } from "lucide-react";
import { assistantTaskColumns } from "../../shared/constants/assistantWorkSpace";

export default function AssistantTasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            My Tasks
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Assigned task board
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Move page work from todo to review. Each task opens into resources,
            canvas preview, upload result, and Mangaka feedback.
          </p>
        </div>
        <label className="flex min-w-72 items-center gap-3 rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5">
          <Search size={18} className="text-slate-500" />
          <input
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            placeholder="Search task"
          />
        </label>
      </div>

      <section className="grid gap-4 xl:grid-cols-4">
        {assistantTaskColumns.map((column) => (
          <div
            key={column.title}
            className="min-h-[34rem] rounded-lg border border-white/10 bg-slate-900 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold text-white">{column.title}</h3>
              <span className="rounded-md bg-slate-950 px-2 py-1 text-xs font-semibold text-slate-300">
                {column.tasks.length}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {column.tasks.map((task) => (
                <Link
                  key={task.id}
                  to={`/assistant/tasks/${task.id}`}
                  className="block rounded-lg border border-white/10 bg-slate-950/70 p-4 shadow-lg shadow-slate-950/20 transition hover:border-cyan-300/35 hover:bg-slate-950"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className={priorityTone(task.priority)}>
                      {task.priority}
                    </span>
                    <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-400">
                      {task.page}
                    </span>
                  </div>

                  <h4 className="mt-3 font-bold text-white">{task.title}</h4>
                  <p className="mt-1 text-sm text-slate-400">
                    Series: {task.series}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {task.chapter}
                  </p>

                  <div className="mt-4 space-y-2 text-sm">
<div className="flex items-center gap-2 text-slate-300">
                      <User size={15} className="text-cyan-200" />
                      Assigned by {task.assignedBy}
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar size={15} className="text-amber-200" />
                      {task.deadline}
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Flag size={15} className="text-rose-200" />
                      {task.priority} priority
                    </div>
                  </div>

                  <div className="mt-4 h-2 rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-cyan-300"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function priorityTone(priority: string) {
  if (priority === "High") {
    return "rounded-md border border-rose-300/30 bg-rose-300/10 px-2 py-1 text-xs font-bold text-rose-100";
  }

  if (priority === "Medium") {
    return "rounded-md border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs font-bold text-amber-100";
  }

  return "rounded-md border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 text-xs font-bold text-emerald-100";
}
