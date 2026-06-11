import type { ReactNode } from "react";
import { Mail, ShieldCheck, User } from "lucide-react";

type StoredUser = {
  userId?: string;
  email?: string;
  role?: string;
};

export default function ProfilePage() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null") as
    | StoredUser
    | null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Profile
        </p>
        <h2 className="mt-2 text-3xl font-black text-white">
          Account profile
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          This page only shows the authenticated session stored by the login
          flow. Profile data is loaded from the current backend session.
        </p>
      </div>

      <section className="grid gap-5 xl:grid-cols-[22rem_1fr]">
        <aside className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 via-rose-300 to-cyan-300 text-3xl font-black text-slate-950">
              {(currentUser?.email?.[0] ?? "U").toUpperCase()}
            </div>
            <h3 className="mt-4 text-xl font-black text-white">
              {currentUser?.email ?? "Unknown user"}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {currentUser?.role ?? "No role"}
            </p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-100">
              <ShieldCheck size={16} />
              Backend session
            </span>
          </div>
        </aside>

        <main className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Info icon={<Mail size={16} />} label="Email" value={currentUser?.email ?? "-"} />
            <Info icon={<ShieldCheck size={16} />} label="Role" value={currentUser?.role ?? "-"} />
            <Info icon={<User size={16} />} label="User ID" value={currentUser?.userId ?? "-"} />
          </div>
        </main>
      </section>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="mb-2 flex items-center gap-2 text-cyan-200">
        {icon}
        <p className="text-sm font-semibold text-slate-200">{label}</p>
      </div>
      <p className="break-all font-bold text-white">{value}</p>
    </div>
  );
}
