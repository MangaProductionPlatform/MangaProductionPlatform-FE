import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, RefreshCw, Users } from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { AdminUserDto } from "../../shared/types/mangaErp";
import { useToast } from "../../shared/components/toastContext";

// Bộ lọc được gửi về backend để danh sách người dùng luôn phản ánh dữ liệu phân quyền hiện tại.
export default function AdminUsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const result = await mangaErpApi.listUsers({
        roleFilter: roleFilter === "" ? undefined : Number(roleFilter),
        statusFilter: statusFilter === "" ? undefined : Number(statusFilter),
      });
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
    let ignore = false;

    async function loadInitialUsers() {
      try {
        const result = await mangaErpApi.listUsers();
        if (!ignore) {
          setUsers(result.users);
        }
      } catch (err) {
        if (!ignore) {
          toast.error(
            "Could not load users",
            err instanceof Error ? err.message : "Please check your admin session.",
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialUsers();
    return () => {
      ignore = true;
    };
  }, [toast]);

  return (
    <div className="admin-users-page space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Admin
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">Users</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Provisioned accounts returned by the Identity service.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap xl:w-auto xl:justify-end">
          <button
            type="button"
            onClick={() => void loadUsers()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <Link
            to="/admin/users/create"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100"
          >
            <PlusCircle size={16} />
            Create user
          </Link>
        </div>
      </div>

      <section className="grid gap-3 rounded-lg border border-white/10 bg-slate-900/75 p-4 md:grid-cols-[minmax(12rem,1fr)_minmax(12rem,1fr)_auto]">
        <select className="input min-w-0" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All roles</option><option value="0">Admin</option><option value="1">Editorial Board</option><option value="2">Tantou Editor</option><option value="3">Mangaka</option><option value="4">Assistant</option><option value="5">Editor-in-Chief</option><option value="99">Reader</option>
        </select>
        <select className="input min-w-0" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option><option value="0">Pending activation</option><option value="1">Active</option><option value="2">Suspended</option><option value="3">Deactivated</option>
        </select>
        <button type="button" className="min-h-11 rounded-lg bg-cyan-300 px-5 py-2 text-sm font-bold text-slate-950" onClick={() => void loadUsers()}>Apply filters</button>
      </section>

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
          <div className="admin-users-table overflow-x-auto">
            <table className="min-w-[58rem] table-fixed divide-y divide-white/10 text-sm xl:min-w-full">
              <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="w-[18%] px-4 py-3">Name</th>
                  <th className="w-[24%] px-4 py-3">Username</th>
                  <th className="w-[14%] px-4 py-3">Role</th>
                  <th className="w-[15%] px-4 py-3">Status</th>
                  <th className="w-[13%] px-4 py-3">Phone</th>
                  <th className="w-[10%] px-4 py-3">Created</th>
                  <th className="w-[6rem] px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map((user) => (
                  <tr key={user.userId} className="text-slate-200">
                    <td className="px-4 py-3 font-semibold text-white">
                      <Link to={`/admin/users/${user.userId}`} className="block truncate hover:text-cyan-200">
                        {user.fullName ?? "-"}
                      </Link>
                    </td>
                    <td className="truncate px-4 py-3 text-slate-300">{user.username}</td>
                    <td className="truncate px-4 py-3">{user.role}</td>
                    <td className="truncate px-4 py-3">{user.accountStatus}</td>
                    <td className="truncate px-4 py-3">{user.phoneNumber ?? "-"}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/users/${user.userId}`}
                        className="inline-flex rounded-lg bg-cyan-300 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-200"
                      >
                        Manage
                      </Link>
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
