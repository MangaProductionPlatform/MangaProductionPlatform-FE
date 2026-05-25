import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ListChecks,
} from "lucide-react";
import { assistantPerformance, assistantStats, assistantTasks } from "../../shared/constants/assistantWorkSpace";


const statIcons = [ListChecks, Clock, CheckCircle2, AlertTriangle] as const;

export default function AssistantDashboardPage() {
  const todayTasks = assistantTasks.slice(0, 4);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-white/10 bg-slate-900 p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              Assistant Dashboard
            </p>
            <h2 className="mt-2 text-3xl font-black text-white">
              Focus on assigned pages and deadlines
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Download resources, finish edits, upload results, and submit work
              back to the Mangaka review queue.
            </p>
          </div>
          <Link
            to="/assistant/tasks"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100"
          >
            Open My Tasks
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {assistantStats.map((stat, index) => {
          const Icon = statIcons[index];

          return (
            <article
              key={stat.label}
              className="rounded-lg border border-white/10 bg-slate-900 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-400">{stat.label}</p>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-300/15 text-cyan-200">
                  <Icon size={18} />
                </span>
              </div>
              <p className="mt-4 text-2xl font-black text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-slate-500">{stat.note}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
        <article className="rounded-lg border border-white/10 bg-slate-900 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Today's Tasks</h3>
              <p className="mt-1 text-sm text-slate-400">
                Most urgent assigned work.
              </p>
            </div>
            <Clock size={18} className="text-cyan-200" />
          </div>
<div className="mt-5 space-y-3">
            {todayTasks.map((task) => (
              <Link
                key={task.id}
                to={`/assistant/tasks/${task.id}`}
                className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 transition hover:bg-white/10 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-white">{task.title}</h4>
                    <span className={priorityTone(task.priority)}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    {task.series} • {task.chapter} • {task.page}
                  </p>
                </div>
                <div className="text-sm text-slate-300">
                  Deadline: <span className="font-semibold">{task.deadline}</span>
                </div>
              </Link>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-white/10 bg-slate-900 p-5">
          <div>
            <h3 className="text-lg font-bold text-white">Progress Chart</h3>
            <p className="mt-1 text-sm text-slate-400">
              Completed tasks and monthly quality.
            </p>
          </div>

          <div className="mt-6 grid h-64 grid-cols-5 items-end gap-3">
            {assistantPerformance.map((item) => (
              <div key={item.label} className="flex h-full flex-col justify-end">
                <div className="flex flex-1 items-end gap-1.5">
                  <div
                    className="w-full rounded-t-md bg-cyan-300/85"
                    style={{ height: `${item.completed}%` }}
                  />
                  <div
                    className="w-full rounded-t-md bg-emerald-300/85"
                    style={{ height: `${item.quality}%` }}
                  />
                </div>
                <p className="mt-3 text-center text-xs text-slate-500">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </article>
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
