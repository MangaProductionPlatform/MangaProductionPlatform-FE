import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Mail, Shield, UserCog } from "lucide-react";
import { adminUsers } from "../../shared/constants/adminWorkSpace";

export default function AdminUserDetailPage() {
  const params = useParams();
  const user = adminUsers.find((item) => item.id === params.id) ?? adminUsers[0];

  return (
    <div className="space-y-6">
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 hover:text-cyan-100"
      >
        <ArrowLeft size={16} />
        Back to Users
      </Link>

      <section className="grid gap-5 xl:grid-cols-[22rem_1fr]">
        <aside className="rounded-lg border border-white/10 bg-slate-900 p-5">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-white text-3xl font-black text-slate-950">
              {user.avatar}
            </div>
            <h2 className="mt-4 text-2xl font-black text-white">
              {user.username}
            </h2>
            <p className="mt-1 text-sm text-slate-400">{user.email}</p>
            <span className={statusTone(user.status)}>{user.status}</span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Info label="Role" value={user.role} />
            <Info label="Warnings" value={String(user.warnings)} />
          </div>
        </aside>

        <main className="rounded-lg border border-white/10 bg-slate-900 p-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Panel icon={<UserCog size={17} />} label="Profile">
              <p className="font-bold text-white">{user.username}</p>
              <p className="mt-1 text-sm text-slate-400">{user.email}</p>
            </Panel>
            <Panel icon={<Shield size={17} />} label="Role">
              <select className="input">
                <option>{user.role}</option>
                <option>Reader</option>
                <option>Mangaka</option>
                <option>Assistant</option>
                <option>Editor</option>
                <option>Board</option>
                <option>Admin</option>
              </select>
            </Panel>
            <Panel icon={<Calendar size={17} />} label="Joined Date">
              <p className="font-bold text-white">{user.joined}</p>
            </Panel>
            <Panel icon={<Mail size={17} />} label="Recent Activity">
              <p className="font-bold text-white">{user.activity}</p>
            </Panel>
          </div>

          <section className="mt-5 rounded-lg border border-white/10 bg-white/5 p-4">
            <h3 className="font-bold text-white">Admin Actions</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-100">
Save Changes
              </button>
              <button className="rounded-lg border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-bold text-amber-100 hover:bg-amber-300/15">
                Change Role
              </button>
              <button className="rounded-lg border border-rose-300/30 bg-rose-300/10 px-4 py-2 text-sm font-bold text-rose-100 hover:bg-rose-300/15">
                Suspend
              </button>
              <button className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-bold text-emerald-100 hover:bg-emerald-300/15">
                Activate
              </button>
            </div>
          </section>
        </main>
      </section>
    </div>
  );
}

function Panel({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center gap-2 text-cyan-200">
        {icon}
        <h3 className="text-sm font-bold text-slate-200">{label}</h3>
      </div>
      {children}
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-bold text-white">{value}</p>
    </div>
  );
}

function statusTone(status: string) {
  if (status === "Active") {
    return "mt-4 rounded-md border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-sm font-bold text-emerald-100";
  }

  return "mt-4 rounded-md border border-rose-300/30 bg-rose-300/10 px-3 py-1.5 text-sm font-bold text-rose-100";
}
