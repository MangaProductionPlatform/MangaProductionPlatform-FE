import { Bell, Mail, Save } from "lucide-react";
import { adminNotifications } from "../../shared/constants/adminWorkSpace";

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            Notifications
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Notification management
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Email templates, warning notifications, publish notifications, and
            system alerts.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100">
          <Save size={16} />
          Save Templates
        </button>
      </div>

      <section className="grid gap-5 xl:grid-cols-[1fr_22rem]">
        <main className="rounded-lg border border-white/10 bg-slate-900 p-5">
          <div className="space-y-3">
            {adminNotifications.map((item) => (
              <article
                key={item.title}
                className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-300/15 text-cyan-200">
                    <Bell size={18} />
                  </span>
                  <div>
                    <h3 className="font-bold text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {item.channel}
                    </p>
                  </div>
                </div>
                <span className="rounded-md border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 text-xs font-bold text-emerald-100">
                  {item.status}
                </span>
              </article>
            ))}
          </div>
        </main>

        <aside className="rounded-lg border border-white/10 bg-slate-900 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-950">
              <Mail size={18} />
            </span>
            <div>
              <h3 className="font-bold text-white">Template Editor</h3>
              <p className="text-sm text-slate-400">Admin email copy</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <input className="input" defaultValue="Deadline Warning" />
            <textarea
              className="input min-h-40"
defaultValue="A production deadline is approaching. Please review the assigned workflow item."
            />
            <button className="w-full rounded-lg bg-cyan-300 px-4 py-2.5 text-sm font-black text-slate-950 hover:bg-cyan-200">
              Update Template
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}
