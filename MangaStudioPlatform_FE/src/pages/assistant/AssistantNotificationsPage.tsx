import type { ReactNode } from "react";
import { Bell, CheckCircle2, Clock, RotateCcw } from "lucide-react";
import { assistantNotifications } from "../../shared/constants/assistantWorkSpace";

export default function AssistantNotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            Notifications
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Task updates and feedback
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            New assignments, revision requests, deadline alerts, and approval
            results from Mangaka reviews.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
          <CheckCircle2 size={16} />
          Mark All Read
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Summary icon={<Bell size={18} />} label="New Tasks" value="2" />
        <Summary icon={<RotateCcw size={18} />} label="Revisions" value="1" />
        <Summary icon={<Clock size={18} />} label="Deadline Alerts" value="2" />
      </section>

      <section className="rounded-lg border border-white/10 bg-slate-900 p-4">
        <div className="space-y-3">
          {assistantNotifications.map((notice) => (
            <article
              key={notice.title}
              className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-start gap-3">
                <span className={typeTone(notice.type)}>
                  {notice.type.slice(0, 1)}
                </span>
                <div>
                  <h3 className="font-bold text-white">{notice.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{notice.meta}</p>
                </div>
              </div>
              <span className="text-sm text-slate-500">{notice.time}</span>
            </article>
          ))}
        </div>
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
    <article className="rounded-lg border border-white/10 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <span className="text-cyan-200">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-black text-white">{value}</p>
    </article>
  );
}

function typeTone(type: string) {
  if (type === "Deadline") {
return "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-300 text-sm font-black text-slate-950";
  }

  if (type === "Revision") {
    return "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-300 text-sm font-black text-slate-950";
  }

  if (type === "Approval") {
    return "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-300 text-sm font-black text-slate-950";
  }

  return "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-300 text-sm font-black text-slate-950";
}
