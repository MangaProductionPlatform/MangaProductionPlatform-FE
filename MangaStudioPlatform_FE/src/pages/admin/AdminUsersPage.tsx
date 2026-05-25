import { Link } from "react-router-dom";
import {
  Edit3,
  Power,
  Search,
  ShieldOff,
  Trash2,
  UserCog,
} from "lucide-react";
import { adminUsers } from "../../shared/constants/adminWorkSpace";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            Users
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            User Management
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Accounts, roles, status controls, warnings, and recent platform
            activity.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100">
          <UserCog size={16} />
          Create User
        </button>
      </div>

      <section className="rounded-lg border border-white/10 bg-slate-900 p-4">
        <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2.5">
          <Search size={18} className="text-slate-500" />
          <input
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            placeholder="Search username, email, role, status"
          />
        </label>
      </section>

      <section className="rounded-lg border border-white/10 bg-slate-900 p-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr className="border-b border-white/10">
                <th className="py-3 pr-4">Avatar</th>
                <th className="py-3 pr-4">Username</th>
                <th className="py-3 pr-4">Role</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Warnings</th>
                <th className="py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.map((user) => (
                <tr key={user.id} className="border-b border-white/10">
                  <td className="py-4 pr-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sm font-black text-slate-950">
                      {user.avatar}
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <Link
                      to={`/admin/users/${user.id}`}
                      className="font-bold text-white hover:text-cyan-200"
                    >
                      {user.username}
                    </Link>
<p className="mt-1 text-xs text-slate-500">{user.email}</p>
                  </td>
                  <td className="py-4 pr-4 text-slate-300">{user.role}</td>
                  <td className="py-4 pr-4">
                    <span className={statusTone(user.status)}>{user.status}</span>
                  </td>
                  <td className="py-4 pr-4 text-slate-300">{user.warnings}</td>
                  <td className="py-4 pr-4">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/admin/users/${user.id}`}
                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-200 hover:bg-white/10"
                        title="Edit user"
                      >
                        <Edit3 size={16} />
                      </Link>
                      <button
                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-amber-100 hover:bg-white/10"
                        title="Change role"
                      >
                        <UserCog size={16} />
                      </button>
                      <button
                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-rose-100 hover:bg-white/10"
                        title="Suspend user"
                      >
                        <ShieldOff size={16} />
                      </button>
                      <button
                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-emerald-100 hover:bg-white/10"
                        title="Activate user"
                      >
                        <Power size={16} />
                      </button>
                      <button
                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-rose-200 hover:bg-rose-500/10"
                        title="Delete user"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function statusTone(status: string) {
  if (status === "Active") {
    return "rounded-md border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 text-xs font-bold text-emerald-100";
  }

  return "rounded-md border border-rose-300/30 bg-rose-300/10 px-2 py-1 text-xs font-bold text-rose-100";
}
