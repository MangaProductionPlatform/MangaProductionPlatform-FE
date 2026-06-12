import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  BookOpen,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  PenTool,
  Settings,
  Trophy,
  User,
} from "lucide-react";
import { useToast } from "../shared/components/ToastProvider";
import { clearAuthSession } from "../shared/utils/authSession";

const defaultMenus = [
  { label: "Dashboard", path: "/app/dashboard", icon: LayoutDashboard, end: true },
  { label: "Series", path: "/app/series", icon: BookOpen },
  { label: "Approval", path: "/app/series/approval", icon: ClipboardCheck },
  { label: "Chapters", path: "/app/chapters", icon: FileText },
  { label: "Tasks", path: "/app/tasks", icon: ClipboardCheck },
  { label: "Analytics", path: "/app/analytics", icon: BarChart3 },
  { label: "Notifications", path: "/app/notifications", icon: Bell },
  { label: "Ranking", path: "/app/ranking", icon: Trophy },
  { label: "Profile", path: "/app/profile", icon: User },
] as const;

const editorMenus = [
  { label: "Dashboard", path: "/app/editor/dashboard", icon: LayoutDashboard },
  { label: "Review Queue", path: "/app/editor/review-queue", icon: ClipboardCheck },
  { label: "Series Monitoring", path: "/app/editor/series-monitoring", icon: BookOpen },
  { label: "Annotations", path: "/app/editor/annotations", icon: PenTool },
  { label: "Publishing Queue", path: "/app/editor/publishing-queue", icon: FileText },
  { label: "Ranking & Reports", path: "/app/editor/ranking-reports", icon: Trophy },
  { label: "Notifications", path: "/app/editor/notifications", icon: Bell },
  { label: "Profile", path: "/app/editor/profile", icon: User },
] as const;

const boardMenus = [
  { label: "Dashboard", path: "/app/board/dashboard", icon: LayoutDashboard },
  { label: "Series Proposals", path: "/app/board/series-proposals", icon: BookOpen },
  { label: "Voting Center", path: "/app/board/voting-center", icon: ClipboardCheck },
  { label: "Publishing Schedule", path: "/app/board/publishing-schedule", icon: FileText },
  { label: "Ranking & Analytics", path: "/app/board/ranking-analytics", icon: Trophy },
  { label: "Cancellation Review", path: "/app/board/cancellation-review", icon: PenTool },
  { label: "Reports", path: "/app/board/reports", icon: FileText },
  { label: "Notifications", path: "/app/board/notifications", icon: Bell },
  { label: "Profile", path: "/app/board/profile", icon: User },
] as const;

export default function DashboardLayout() {
  const navigate = useNavigate();
  const toast = useToast();
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null") as
    | { role?: string }
    | null;
  const role = currentUser?.role;

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const menus =
    role === "editor"
      ? editorMenus
      : role === "editorial_board"
        ? boardMenus
        : defaultMenus;
  const workspaceLabel =
    role === "editor"
      ? "Editor Workspace"
      : role === "editorial_board"
        ? "Editorial Board"
        : "Creator command center";

  const handleLogout = () => {
    clearAuthSession();
    toast.info("Logged out", "Your session has been cleared.");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#050816] text-slate-100">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-white/10 bg-slate-950/85 p-5 backdrop-blur-xl lg:block">
          <NavLink to="/app/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-rose-400 to-cyan-300 text-sm font-black text-slate-950">
              M
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Manga Studio</h1>
              <p className="text-xs text-slate-400">{workspaceLabel}</p>
            </div>
          </NavLink>

          <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-100/80">
              Active role
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{role ?? "Mangaka"}</p>
                <p className="text-xs text-slate-400">{workspaceLabel}</p>
              </div>
              <Settings size={18} className="text-amber-200" />
            </div>
          </div>

          <nav className="mt-6 space-y-1.5">
            {menus.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={"end" in item ? item.end : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "border border-white/10 bg-white text-slate-950 shadow-lg shadow-cyan-500/10"
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
            onClick={handleLogout}
            className="mt-6 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-rose-200 transition hover:bg-rose-500/10"
          >
            <LogOut size={18} />
            Logout
          </button>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 px-4 py-4 backdrop-blur-xl lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <NavLink to="/app/dashboard" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-rose-400 to-cyan-300 text-sm font-black text-slate-950">
                  M
                </div>
                <div>
                  <p className="font-semibold">Manga Studio</p>
                  <p className="text-xs text-slate-400">{workspaceLabel}</p>
                </div>
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-rose-300/20 bg-rose-500/10 p-2 text-rose-100"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </header>

          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
