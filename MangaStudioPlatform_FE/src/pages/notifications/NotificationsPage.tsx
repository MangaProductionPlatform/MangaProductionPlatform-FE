import { Bell, Info } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Notifications
        </p>
        <h2 className="mt-2 text-3xl font-black text-white">
          Studio updates and alerts
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          This page will display real
          messages after a notification endpoint is available.
        </p>
      </div>

      <section className="rounded-lg border border-white/10 bg-slate-900/75 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
          <Bell size={22} />
        </div>
        <h3 className="mt-4 text-lg font-bold text-white">No backend notifications</h3>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
          There is no notifications API in the current backend, so no local
          placeholder alerts are shown.
        </p>
        <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-lg border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm text-amber-100">
          <Info size={16} />
          Waiting for notifications API
        </div>
      </section>
    </div>
  );
}
