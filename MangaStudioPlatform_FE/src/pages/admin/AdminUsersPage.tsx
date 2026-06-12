import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, RefreshCw, Users } from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { AdminUserDto } from "../../shared/types/mangaErp";
import { useToast } from "../../shared/components/toastContext";

export default function AdminUsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const result = await mangaErpApi.listUsers();
      setUsers(result.users);
    } catch (err) {
      toast.error(
        "Could not load users",
        err instanceof Error ? err.message : "Please check your admin session.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Admin
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">Users</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Provisioned accounts returned by the Identity service.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadUsers()}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <Link
            to="/admin/users/create"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100"
          >
            <PlusCircle size={16} />
            Create user
          </Link>
        </div>
      </div>

      <section className="overflow-hidden rounded-lg border border-white/10 bg-slate-900/75">
        {isLoading ? (
          <div className="p-5 text-sm text-slate-300">Loading users...</div>
        ) : null}

        {!isLoading && users.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
              <Users size={22} />
            </div>
            <p className="mt-4 text-sm text-slate-300">No users returned by backend.</p>
          </div>
        ) : null}

        {!isLoading && users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map((user) => (
                  <tr key={user.userId} className="text-slate-200">
                    <td className="px-4 py-3 font-semibold text-white">
                      <Link to={`/admin/users/${user.userId}`} className="hover:text-cyan-200">
                        {user.fullName ?? "-"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{user.username}</td>
                    <td className="px-4 py-3">{user.role}</td>
                    <td className="px-4 py-3">{user.accountStatus}</td>
                    <td className="px-4 py-3">{user.phoneNumber ?? "-"}</td>
                    <td className="px-4 py-3">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
