import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  ClipboardList,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  UploadCloud,
  User,
  Wallet,
} from "lucide-react";
import { useToast } from "../shared/components/toastContext";
import { clearAuthSession } from "../shared/utils/authSession";
import { QuickSettingsTrigger } from "../shared/components/QuickSettingsPanel";

const menus = [
  {
    label: "Dashboard",
    path: "/assistant/dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  { label: "My Tasks", path: "/assistant/tasks", icon: ClipboardList, end: true },
  { label: "Assigned Chapters", path: "/assistant/chapters", icon: FolderOpen },
  { label: "Submissions", path: "/assistant/submissions", icon: UploadCloud },
  { label: "Notifications", path: "/assistant/notifications", icon: Bell },
  { label: "Income", path: "/assistant/income", icon: Wallet },
  { label: "Profile", path: "/assistant/profile", icon: User },
];

export default function AssistantLayout() {
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
    <div className="app-shell">
      <div className="flex min-h-screen">
        <aside className="app-sidebar settings-sidebar sticky top-0 hidden h-dvh w-72 shrink-0 p-5 lg:block">
          <NavLink to="/assistant/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-300 text-sm font-black text-slate-950">
              A
            </div>
            <div className="sidebar-copy">
              <h1 className="text-lg font-bold leading-tight">
                Assistant Studio
              </h1>
              <p className="text-xs text-slate-400">Worker workspace</p>
            </div>
          </NavLink>

          <div className="premium-card sidebar-role-card mt-6 rounded-xl p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/80">
              Active role
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="sidebar-copy">
                <p className="font-semibold text-white">Assistant</p>
                <p className="text-xs text-slate-400">Task worker</p>
              </div>
              <QuickSettingsTrigger variant="settings" />
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
                  <span className="sidebar-copy">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <button
            type="button"
            onClick={handleLogout}
            className="app-logout-top hidden items-center gap-2 lg:inline-flex"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
          <header className="app-topbar sticky top-0 z-30 px-4 py-4 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <NavLink to="/assistant/dashboard" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-300 text-sm font-black text-slate-950">
                  A
                </div>
                <div>
                  <p className="font-semibold">Assistant Studio</p>
                  <p className="text-xs text-slate-400">Worker workspace</p>
                </div>
              </NavLink>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-rose-300/20 bg-rose-500/10 p-2 text-rose-100"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
            <nav className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Assistant navigation">
              {menus.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `whitespace-nowrap rounded-full border px-3 py-2 text-xs font-semibold ${
                      isActive
                        ? "border-cyan-300/40 bg-cyan-300/15 text-cyan-100"
                        : "border-white/10 bg-white/5 text-slate-300"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </header>

          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
