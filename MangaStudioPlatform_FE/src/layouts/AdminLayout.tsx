import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  Database,
  Flag,
  GitBranch,
  HardDrive,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useToast } from "../shared/components/toastContext";
import { clearAuthSession } from "../shared/utils/authSession";

const menus = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard, end: true },
  { label: "Users", path: "/admin/users", icon: Users, end: true },
  { label: "Roles & Permissions", path: "/admin/roles", icon: LockKeyhole },
  { label: "Series Monitoring", path: "/admin/series", icon: Database },
  { label: "Workflow Monitoring", path: "/admin/workflow", icon: GitBranch },
  { label: "AI Management", path: "/admin/ai", icon: Bot },
  { label: "Reports & Analytics", path: "/admin/reports", icon: BarChart3 },
  { label: "Storage", path: "/admin/storage", icon: HardDrive },
  { label: "Moderation", path: "/admin/moderation", icon: Flag },
  { label: "System Settings", path: "/admin/settings", icon: Settings },
  { label: "Notifications", path: "/admin/notifications", icon: Bell },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const toast = useToast();
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    clearAuthSession();
    toast.info("Logged out", "Your session has been cleared.");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-white/10 bg-slate-950 p-5 lg:block">
          <NavLink to="/admin/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-sm font-black text-slate-950">
              OP
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">
                Studio Operations
              </h1>
              <p className="text-xs text-slate-400">Admin governance</p>
            </div>
          </NavLink>

          <div className="mt-6 rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-100/80">
              Platform status
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">Operational</p>
                <p className="text-xs text-slate-400">3 queues need review</p>
              </div>
              <Activity size={18} className="text-emerald-200" />
            </div>
          </div>

          <nav className="mt-6 space-y-1.5">
            {menus.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-white text-slate-950"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-rose-200 transition hover:bg-rose-500/10"
          >
            <LogOut size={18} />
            Logout
          </button>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 px-4 py-4 backdrop-blur-xl lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <NavLink to="/admin/dashboard" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-xs font-black text-slate-950">
                  OP
                </div>
                <div>
                  <p className="font-semibold">Studio Operations</p>
                  <p className="text-xs text-slate-400">Admin governance</p>
                </div>
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-rose-300/20 bg-rose-500/10 p-2 text-rose-100"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </header>

          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mb-6 hidden items-center justify-between gap-4 lg:flex">
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2.5">
                <Search size={17} className="text-slate-500" />
                <input
                  className="w-80 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  placeholder="Search users, series, jobs, reports"
                />
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-300">
                <ShieldCheck size={16} className="text-emerald-200" />
                Admin access
              </div>
            </div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
