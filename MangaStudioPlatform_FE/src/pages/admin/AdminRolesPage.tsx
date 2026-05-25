import { PlusCircle, ShieldCheck } from "lucide-react";
import {
  adminRoles,
  permissionMatrix,
} from "../../shared/constants/adminWorkSpace";

export default function AdminRolesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            Roles & Permissions
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            RBAC Control Panel
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Reader, Mangaka, Assistant, Editor, Board, and Admin permission
            governance.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100">
          <PlusCircle size={16} />
          Create Role
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {adminRoles.map((role) => (
          <article
            key={role}
            className="rounded-lg border border-white/10 bg-slate-900 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-bold text-white">{role}</p>
              <ShieldCheck size={17} className="text-cyan-200" />
            </div>
            <button className="mt-4 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10">
              Assign Role
            </button>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-white/10 bg-slate-900 p-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr className="border-b border-white/10">
                <th className="py-3 pr-4">Permission</th>
                {adminRoles.map((role) => (
                  <th key={role} className="py-3 pr-4">
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionMatrix.map((row) => (
                <tr key={row.permission} className="border-b border-white/10">
                  <td className="py-4 pr-4 font-bold text-white">
                    {row.permission}
                  </td>
                  {adminRoles.map((role) => (
                    <td key={`${row.permission}-${role}`} className="py-4 pr-4">
                      <button
                        className={
                          row[role]
                            ? "rounded-md border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-xs font-bold text-emerald-100"
: "rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-400"
                        }
                      >
                        {row[role] ? "Allowed" : "Blocked"}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
