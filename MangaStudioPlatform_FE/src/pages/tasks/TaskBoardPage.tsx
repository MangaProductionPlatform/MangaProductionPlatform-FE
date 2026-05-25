import { Calendar, Flag, PlusCircle, UserPlus } from "lucide-react";
import { assistants, mangakaSeries, taskColumns } from "../../shared/constants/mangakaWorkSpace";


export default function TaskBoardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Task Assignment
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Assistant production board
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Assign work to assistants, set deadlines, mark priority, and move
            tasks through review until the chapter is ready.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100">
          <PlusCircle size={16} />
          New Task
        </button>
      </div>

      <section className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_0.8fr_0.7fr_auto]">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-200">
              Task
            </span>
            <input className="input" placeholder="Ink pages 19-26" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-200">
              Series
            </span>
            <select className="input">
              {mangakaSeries.map((series) => (
                <option key={series.id}>{series.title}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-200">
              Assistant
            </span>
            <select className="input">
              {assistants.map((assistant) => (
                <option key={assistant.name}>{assistant.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-200">
              Deadline
            </span>
            <input className="input" type="date" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-200">
              Priority
            </span>
            <select className="input min-w-32">
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </label>
        </div>
        <div className="mt-4 flex justify-end">
<button className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-200">
            <UserPlus size={16} />
            Assign Assistant
          </button>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        {taskColumns.map((column) => (
          <div
            key={column.title}
            className={`min-h-[34rem] rounded-lg border p-4 ${column.tone}`}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold text-white">{column.title}</h3>
              <span className="rounded-md bg-slate-950/70 px-2 py-1 text-xs font-semibold text-slate-300">
                {column.tasks.length}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {column.tasks.map((task) => (
                <article
                  key={`${column.title}-${task.title}`}
                  className="rounded-lg border border-white/10 bg-slate-950/70 p-4 shadow-lg shadow-slate-950/20"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className={priorityTone(task.priority)}>
                      {task.priority}
                    </span>
                    <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-400">
                      {task.tag}
                    </span>
                  </div>
                  <h4 className="mt-3 font-bold text-white">{task.title}</h4>
                  <p className="mt-1 text-sm text-slate-400">{task.series}</p>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-300">
                      <UserPlus size={15} className="text-cyan-200" />
                      {task.assistant}
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
                </article>
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