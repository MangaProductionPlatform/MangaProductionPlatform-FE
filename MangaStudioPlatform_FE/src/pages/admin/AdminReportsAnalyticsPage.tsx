import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Download,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { AdminRoleDto, AdminUserDto } from "../../shared/types/mangaErp";

const roleFilters = [
  { value: "", label: "All roles" },
  { value: "Admin", label: "Admin" },
  { value: "EditorialBoard", label: "Editorial Board" },
  { value: "TantouEditor", label: "Tantou Editor" },
  { value: "Mangaka", label: "Mangaka" },
  { value: "Assistant", label: "Assistant" },
  { value: "EditorInChief", label: "Editor-in-Chief" },
  { value: "Reader", label: "Reader" },
];

const statusFilters = [
  { value: "", label: "All statuses" },
  { value: "PendingActivation", label: "Pending activation" },
  { value: "Active", label: "Active" },
  { value: "Suspended", label: "Suspended" },
  { value: "Deactivated", label: "Deactivated" },
];

function formatDisplayLabel(value?: string | null): string {
  if (!value) return "-";
  return value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ");
}

function normalizeText(value?: string | null) {
  return (value ?? "").toLowerCase();
}

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function statusTone(status: string) {
  if (status === "Active") return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
  if (status === "Suspended") return "border-rose-300/25 bg-rose-300/10 text-rose-100";
  if (status === "PendingActivation") return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  return "border-slate-500/25 bg-slate-500/10 text-slate-200";
}

export default function AdminReportsAnalyticsPage() {
  const toast = useToast();
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [roles, setRoles] = useState<AdminRoleDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const [userResult, roleResult] = await Promise.all([
        mangaErpApi.listUsers(),
        mangaErpApi.getAdminRoles(),
      ]);
      setUsers(userResult.users);
      setRoles(roleResult);
    } catch (error) {
      toast.error(
        "Could not load account report",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function loadInitialReports() {
      try {
        const [userResult, roleResult] = await Promise.all([
          mangaErpApi.listUsers(),
          mangaErpApi.getAdminRoles(),
        ]);
        if (!ignore) {
          setUsers(userResult.users);
          setRoles(roleResult);
        }
      } catch (error) {
        if (!ignore) {
          toast.error(
            "Could not load account report",
            error instanceof Error ? error.message : "Unknown error",
          );
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void loadInitialReports();
    return () => {
      ignore = true;
    };
  }, [toast]);

  const filteredUsers = useMemo(() => {
    const query = normalizeText(search);

    return users.filter((user) => {
      const matchesRole = roleFilter ? user.role === roleFilter : true;
      const matchesStatus = statusFilter ? user.accountStatus === statusFilter : true;
      const matchesSearch = query
        ? [
            user.fullName,
            user.username,
            user.personalEmail,
            user.phoneNumber,
            user.penName,
            user.userId,
          ].some((value) => normalizeText(value).includes(query))
        : true;

      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [roleFilter, search, statusFilter, users]);

  const totals = useMemo(() => ({
    shown: filteredUsers.length,
    total: users.length,
    active: filteredUsers.filter((user) => user.accountStatus === "Active").length,
    pending: filteredUsers.filter((user) => user.accountStatus === "PendingActivation").length,
    suspended: filteredUsers.filter((user) => user.accountStatus === "Suspended").length,
  }), [filteredUsers, users.length]);

  const roleReport = useMemo(() => {
    const roleNames = new Set([
      ...roles.map((role) => role.name),
      ...users.map((user) => user.role),
    ]);

    return Array.from(roleNames).sort().map((roleName) => {
      const usersInRole = users.filter((user) => user.role === roleName);
      return {
        role: roleName,
        total: usersInRole.length,
        active: usersInRole.filter((user) => user.accountStatus === "Active").length,
        suspended: usersInRole.filter((user) => user.accountStatus === "Suspended").length,
        pending: usersInRole.filter((user) => user.accountStatus === "PendingActivation").length,
      };
    });
  }, [roles, users]);

  const attentionItems = useMemo(() => {
    const pending = users.filter((user) => user.accountStatus === "PendingActivation");
    const suspended = users.filter((user) => user.accountStatus === "Suspended");
    const mangakaMissingTantou = users.filter(
      (user) => user.role === "Mangaka" && !user.managingTantouId,
    );

    return [
      {
        label: "Pending activation",
        value: pending.length,
        detail: "Need activation follow-up.",
        tone: "border-amber-300/30",
      },
      {
        label: "Suspended accounts",
        value: suspended.length,
        detail: "Review blocked access.",
        tone: "border-rose-300/30",
      },
      {
        label: "Mangaka without Tantou",
        value: mangakaMissingTantou.length,
        detail: "Assign an access manager.",
        tone: "border-cyan-300/30",
      },
    ];
  }, [users]);

  const exportCsv = () => {
    const headers = [
      "User ID",
      "Full name",
      "Username",
      "Email",
      "Role",
      "Status",
      "Phone",
      "Managing Tantou ID",
      "Created At",
    ];
    const rows = filteredUsers.map((user) => [
      user.userId,
      user.fullName,
      user.username,
      user.personalEmail,
      user.role,
      user.accountStatus,
      user.phoneNumber,
      user.managingTantouId,
      user.createdAt,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `account-access-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Admin</p>
          <h2 className="mt-2 text-3xl font-black text-white">Account access report</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Review account status, role coverage, and access issues from Identity service data.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void loadReports()} disabled={isLoading} className="btn-secondary inline-flex min-h-11 items-center gap-2">
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={isLoading || filteredUsers.length === 0}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </header>

      <section className="overflow-hidden rounded-lg border border-white/10 bg-slate-900/75">
        <div className="grid divide-y divide-white/10 md:grid-cols-5 md:divide-x md:divide-y-0">
          <SummaryMetric label="Shown accounts" value={`${totals.shown}/${totals.total}`} />
          <SummaryMetric label="Active" value={totals.active} />
          <SummaryMetric label="Pending" value={totals.pending} />
          <SummaryMetric label="Suspended" value={totals.suspended} />
          <SummaryMetric label="Roles tracked" value={roleReport.length} />
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-slate-900/75 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
          <Search size={16} className="text-cyan-200" />
          Report filters
        </div>
        <div className="grid gap-3 lg:grid-cols-[minmax(16rem,1fr)_13rem_13rem]">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Search</span>
            <div className="flex min-w-0 items-center gap-3 rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2.5">
              <Search size={18} className="shrink-0 text-slate-500" />
              <input
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, username, email, phone"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Role</span>
            <select className="input min-h-11" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
              {roleFilters.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Status</span>
            <select className="input min-h-11" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              {statusFilters.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_22rem]">
        <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-900/75">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div>
              <h3 className="flex items-center gap-2 font-bold text-white">
                <Users size={18} className="text-cyan-200" />
                Accounts
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Filtered access inventory for admin review.
              </p>
            </div>
          </div>

          {isLoading ? (
            <p className="p-5 text-sm text-slate-300">Loading account report...</p>
          ) : null}

          {!isLoading && filteredUsers.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-400">No accounts match the current filters.</p>
          ) : null}

          {!isLoading && filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-[56rem] table-fixed divide-y divide-white/10 text-sm xl:min-w-full">
                <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="w-[20%] px-4 py-3">User</th>
                    <th className="w-[24%] px-4 py-3">Account</th>
                    <th className="w-[14%] px-4 py-3">Role</th>
                    <th className="w-[14%] px-4 py-3">Status</th>
                    <th className="w-[16%] px-4 py-3">Managing Tantou</th>
                    <th className="w-[12%] px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredUsers.map((user) => (
                    <tr key={user.userId} className="text-slate-200 hover:bg-white/[0.03]">
                      <td className="break-words px-4 py-3">
                        <p className="font-semibold text-white">{user.fullName ?? "-"}</p>
                        <p className="mt-1 text-xs text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="break-all px-4 py-3">
                        <p className="text-slate-100">{user.username}</p>
                        <p className="mt-1 text-xs text-slate-500">{user.personalEmail ?? user.userId}</p>
                      </td>
                      <td className="break-words px-4 py-3">{formatDisplayLabel(user.role)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${statusTone(user.accountStatus)}`}>
                          {formatDisplayLabel(user.accountStatus)}
                        </span>
                      </td>
                      <td className="break-all px-4 py-3 text-xs text-slate-400">{user.managingTantouId ?? "-"}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/users/${user.userId}`}
                          className="inline-flex min-h-9 items-center rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-100"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>

        <aside className="space-y-5">
          <section className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
            <h3 className="flex items-center gap-2 font-bold text-white">
              <AlertTriangle size={18} className="text-amber-200" />
              Attention
            </h3>
            <div className="mt-4 space-y-3">
              {attentionItems.map((item) => (
                <div key={item.label} className={`rounded-lg border-l-2 bg-slate-950/60 p-3 ${item.tone}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <span className="text-lg font-black text-white">{item.value}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
            <h3 className="flex items-center gap-2 font-bold text-white">
              <ShieldCheck size={18} className="text-cyan-200" />
              Role coverage
            </h3>
            <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
              <table className="w-full table-fixed divide-y divide-white/10 text-sm">
                <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.14em] text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Role</th>
                    <th className="w-14 px-3 py-2 text-right">All</th>
                    <th className="w-14 px-3 py-2 text-right">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {roleReport.map((item) => (
                    <tr key={item.role}>
                      <td className="break-words px-3 py-2 text-slate-200">{formatDisplayLabel(item.role)}</td>
                      <td className="px-3 py-2 text-right font-bold text-white">{item.total}</td>
                      <td className="px-3 py-2 text-right font-bold text-amber-100">{item.pending + item.suspended}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!roleReport.length ? <p className="p-4 text-sm text-slate-500">No role data returned.</p> : null}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}
