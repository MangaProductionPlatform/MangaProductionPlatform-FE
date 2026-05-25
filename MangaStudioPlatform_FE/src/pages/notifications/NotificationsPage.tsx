import type { ReactNode } from "react";
import { Bell, CheckCircle2, Clock, FileText } from "lucide-react";
import { notifications } from "../../shared/constants/mangakaWorkSpace";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Notifications
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Studio updates and alerts
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Review submissions, deadline warnings, assignment responses, and
            publish readiness messages.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
          <CheckCircle2 size={16} />
          Mark All Read
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Summary icon={<Bell size={18} />} label="Unread" value="8" />
        <Summary icon={<Clock size={18} />} label="Deadline Alerts" value="3" />
        <Summary icon={<FileText size={18} />} label="Review Updates" value="4" />
      </section>

      <section className="rounded-lg border border-white/10 bg-slate-900/75 p-4">
        <div className="space-y-3">
          {notifications.map((notice) => (
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
    <article className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
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

  if (type === "Review") {
    return "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-300 text-sm font-black text-slate-950";
  }

  if (type === "Publish") {
    return "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-300 text-sm font-black text-slate-950";
  }

  return "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-300 text-sm font-black text-slate-950";
}