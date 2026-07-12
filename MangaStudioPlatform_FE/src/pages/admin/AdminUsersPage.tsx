import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, RefreshCw, Users } from "lucide-react";

import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { AdminUserDto } from "../../shared/types/mangaErp";

function formatDisplayLabel(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ");
}

export default function AdminUsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Bộ lọc được gửi về backend để danh sách phản ánh dữ liệu phân quyền hiện tại.
  const loadUsers = async () => {
    setIsLoading(true);

    try {
      const result = await mangaErpApi.listUsers({
        roleFilter: roleFilter === "" ? undefined : Number(roleFilter),
        statusFilter: statusFilter === "" ? undefined : Number(statusFilter),
      });

      setUsers(result.users);
    } catch (error) {
      toast.error(
        "Could not load users",
        error instanceof Error
          ? error.message
          : "Please check your admin session.",
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
      } catch (error) {
        if (!ignore) {
          toast.error(
            "Could not load users",
            error instanceof Error
              ? error.message
              : "Please check your admin session.",
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
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
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
            disabled={isLoading}
            className="btn-secondary inline-flex min-h-11 items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={isLoading ? "animate-spin" : undefined}
            />
            {isLoading ? "Loading…" : "Refresh"}
          </button>
          <Link
            to="/admin/users/create"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100"
          >
            <PlusCircle size={16} />
            Create user
          </Link>
        </div>
      </header>

      <section className="grid gap-3 rounded-lg border border-white/10 bg-slate-900/75 p-4 md:grid-cols-[minmax(12rem,1fr)_minmax(12rem,1fr)_auto]">
        <select
          className="input min-w-0"
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          aria-label="Filter users by role"
        >
          <option value="">All roles</option>
          <option value="0">Admin</option>
          <option value="1">Editorial Board</option>
          <option value="2">Tantou Editor</option>
          <option value="3">Mangaka</option>
          <option value="4">Assistant</option>
          <option value="5">Editor-in-Chief</option>
          <option value="99">Reader</option>
        </select>
        <select
          className="input min-w-0"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter users by account status"
        >
          <option value="">All statuses</option>
          <option value="0">Pending activation</option>
          <option value="1">Active</option>
          <option value="2">Suspended</option>
          <option value="3">Deactivated</option>
        </select>
        <button
          type="button"
          onClick={() => void loadUsers()}
          disabled={isLoading}
          className="min-h-11 rounded-lg bg-cyan-300 px-5 py-2 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Apply filters
        </button>
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
            <p className="mt-4 text-sm text-slate-300">
              No users are available.
            </p>
          </div>
        ) : null}

        {!isLoading && users.length > 0 ? (
          <table className="w-full table-fixed divide-y divide-white/10 text-xs lg:text-sm">
            <thead className="bg-white/5 text-left text-[0.65rem] uppercase tracking-[0.16em] text-slate-500 lg:text-xs lg:tracking-[0.18em]">
              <tr>
                <th className="w-[17%] px-2 py-3 sm:px-3 lg:px-4">Name</th>
                <th className="w-[24%] px-2 py-3 sm:px-3 lg:px-4">Username</th>
                <th className="w-[13%] px-2 py-3 sm:px-3 lg:px-4">Role</th>
                <th className="w-[15%] px-2 py-3 sm:px-3 lg:px-4">Status</th>
                <th className="w-[12%] px-2 py-3 sm:px-3 lg:px-4">Phone</th>
                <th className="w-[10%] px-2 py-3 sm:px-3 lg:px-4">Created</th>
                <th className="w-[9%] px-2 py-3 text-right sm:px-3 lg:px-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user) => (
                <tr key={user.userId} className="text-slate-200">
                  <td className="break-words px-2 py-3 font-semibold text-white sm:px-3 lg:px-4">
                    <Link
                      to={`/admin/users/${user.userId}`}
                      className="hover:text-cyan-200"
                    >
                      {user.fullName ?? "-"}
                    </Link>
                  </td>
                  <td className="break-all px-2 py-3 text-slate-300 sm:px-3 lg:px-4">
                    {user.username}
                  </td>
                  <td className="break-words px-2 py-3 sm:px-3 lg:px-4">
                    {formatDisplayLabel(user.role)}
                  </td>
                  <td className="break-words px-2 py-3 sm:px-3 lg:px-4">
                    {formatDisplayLabel(user.accountStatus)}
                  </td>
                  <td className="break-all px-2 py-3 sm:px-3 lg:px-4">
                    {user.phoneNumber ?? "-"}
                  </td>
                  <td className="break-words px-2 py-3 sm:px-3 lg:px-4">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-2 py-3 text-right sm:px-3 lg:px-4">
                    <Link
                      to={`/admin/users/${user.userId}`}
                      className="inline-flex min-h-9 items-center justify-center rounded-lg bg-cyan-300 px-2.5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-200 lg:px-3"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </section>
    </div>
  );
}
