import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  FileText,
  MessageSquareText,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";

const stats = [
  { label: "Manuscripts to review", value: "8", note: "3 urgent", icon: FileText },
  { label: "Series supervised", value: "12", note: "5 ongoing", icon: BookOpen },
  { label: "Feedback sent", value: "34", note: "+9 this week", icon: MessageSquareText },
  { label: "Ready for approval", value: "4", note: "waiting board", icon: CheckCircle2 },
];

const reviewQueue = [
  {
    title: "Celestial Blade",
    chapter: "Chapter 27 - Final Draft",
    author: "Aiko Tan",
    deadline: "Today, 18:00",
    status: "Urgent",
    progress: 82,
  },
  {
    title: "Neo Spirit",
    chapter: "Chapter 12 - Storyboard",
    author: "Minh Khoa",
    deadline: "Tomorrow, 10:30",
    status: "Reviewing",
    progress: 55,
  },
  {
    title: "Moonlit Garden",
    chapter: "Chapter 05 - Dialogue Check",
    author: "Lina Ho",
    deadline: "May 26, 09:00",
    status: "New",
    progress: 20,
  },
];

const tasks = [
  { title: "Check plot consistency", series: "Celestial Blade", level: "High", due: "2h left" },
  { title: "Comment panel pacing", series: "Neo Spirit", level: "Medium", due: "1 day" },
  { title: "Approve revised dialogue", series: "Moonlit Garden", level: "Low", due: "3 days" },
];

export default function EditorWorkspacePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-slate-800 bg-slate-900 p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-200">
              <Sparkles size={16} /> Editor Workspace
            </div>

            <h2 className="mt-5 text-4xl font-bold text-white">
              Welcome back, Editor
            </h2>

            <p className="mt-3 max-w-2xl text-slate-400">
              Review manuscripts, send feedback to authors, track revisions,
              and prepare series for approval.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500">
              <Edit3 size={18} /> Start Review
            </button>

            <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800">
              <Send size={18} /> Send Feedback
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">{item.label}</p>
                <Icon className="text-indigo-400" size={22} />
              </div>

              <p className="mt-4 text-3xl font-bold text-white">{item.value}</p>
              <p className="mt-2 text-sm text-slate-500">{item.note}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-xl font-semibold text-white">Review Queue</h3>
          <p className="mt-1 text-sm text-slate-400">
            Manuscripts waiting for editor feedback.
          </p>

          <div className="mt-6 space-y-4">
            {reviewQueue.map((item) => (
              <article
                key={item.chapter}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 hover:border-indigo-500/40"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="text-lg font-semibold text-white">
                        {item.title}
                      </h4>

                      <StatusBadge status={item.status} />
                    </div>

                    <p className="mt-2 text-sm text-slate-400">
                      {item.chapter}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-2">
                        <UserRound size={16} /> {item.author}
                      </span>

                      <span className="inline-flex items-center gap-2">
                        <Clock3 size={16} /> {item.deadline}
                      </span>
                    </div>
                  </div>

                  <button className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-indigo-600">
                    Open
                  </button>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-xs text-slate-500">
                    <span>Review progress</span>
                    <span>{item.progress}%</span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-indigo-500"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-xl font-semibold text-white">Today Tasks</h3>

          <div className="mt-5 space-y-3">
            {tasks.map((task) => (
              <div
                key={task.title}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{task.title}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {task.series}
                    </p>
                  </div>

                  <PriorityBadge level={task.level} />
                </div>

                <p className="mt-3 inline-flex items-center gap-2 text-sm text-slate-400">
                  <CalendarDays size={16} /> {task.due}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <ActionCard
          icon={MessageSquareText}
          title="Feedback Center"
          desc="Write comments for script, dialogue, panel flow, and art direction."
        />

        <ActionCard
          icon={AlertCircle}
          title="Revision Control"
          desc="Track submitted versions and mark issues authors need to fix."
        />

        <ActionCard
          icon={CheckCircle2}
          title="Approval Handoff"
          desc="Move completed chapters to the approval stage with editor notes."
        />
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const style =
    status === "Urgent"
      ? "border-red-500/30 bg-red-500/10 text-red-300"
      : status === "Reviewing"
      ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
      : "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs ${style}`}>
      {status}
    </span>
  );
}

function PriorityBadge({ level }: { level: string }) {
  const style =
    level === "High"
      ? "bg-red-500/10 text-red-300"
      : level === "Medium"
      ? "bg-amber-500/10 text-amber-300"
      : "bg-emerald-500/10 text-emerald-300";

  return <span className={`rounded-full px-3 py-1 text-xs ${style}`}>{level}</span>;
}

function ActionCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof FileText;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-indigo-500/40">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
        <Icon size={22} />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{desc}</p>
    </div>
  );
}