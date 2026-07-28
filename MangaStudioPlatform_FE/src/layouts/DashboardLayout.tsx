import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  BookOpen,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  MailPlus,
  PenTool,
  Trophy,
  User,
} from "lucide-react";
import { useToast } from "../shared/components/toastContext";
import { clearAuthSession } from "../shared/utils/authSession";
import { QuickSettingsTrigger } from "../shared/components/QuickSettingsPanel";

const defaultMenus = [
  {
    label: "Dashboard",
    path: "/app/dashboard",
    icon: LayoutDashboard,
    end: true,
  },
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
  {
    label: "Review Queue",
    path: "/app/editor/review-queue",
    icon: ClipboardCheck,
  },
  {
    label: "Series Monitoring",
    path: "/app/editor/series-monitoring",
    icon: BookOpen,
  },
  { label: "Editorial QA", path: "/app/editor/annotations", icon: PenTool },
  { label: "QA Handoff", path: "/app/editor/publishing-queue", icon: FileText },
  { label: "Notifications", path: "/app/editor/notifications", icon: Bell },
  { label: "Profile", path: "/app/editor/profile", icon: User },
] as const;

const boardMenus = [
  { label: "Dashboard", path: "/app/board/dashboard", icon: LayoutDashboard },
  {
    label: "Series Proposals",
    path: "/app/board/series-proposals",
    icon: BookOpen,
  },
  {
    label: "Publishing Schedule",
    path: "/app/board/publishing-schedule",
    icon: FileText,
  },
  {
    label: "Cancellation Review",
    path: "/app/board/cancellation-review",
    icon: PenTool,
  },
  { label: "Reports", path: "/app/board/reports", icon: FileText },
  { label: "Notifications", path: "/app/board/notifications", icon: Bell },
  { label: "Profile", path: "/app/board/profile", icon: User },
] as const;

export default function DashboardLayout() {
  const navigate = useNavigate();
  const toast = useToast();
  const currentUser = JSON.parse(
    localStorage.getItem("currentUser") || "null",
  ) as { role?: string } | null;
  const role = currentUser?.role;

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const mangakaMenus = [
    {
      label: "Dashboard",
      path: "/mangaka/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Series Submissions",
      path: "/mangaka/submissions",
      icon: FileText,
    },
    {
      label: "My Series",
      path: "/mangaka/series",
      icon: BookOpen,
    },
    {
      label: "Assistant Invitations",
      path: "/mangaka/assistants",
      icon: MailPlus,
    },
    {
      label: "Chapter Management",
      path: "/mangaka/chapters",
      icon: BookOpen,
    },
    {
      label: "Task Assignment",
      path: "/mangaka/task-assignment",
      icon: ClipboardCheck,
    },
    {
      label: "Layer Review",
      path: "/mangaka/layer-review",
      icon: PenTool,
    },
    {
      label: "Submit QA",
      path: "/mangaka/qa-submission",
      icon: FileText,
    },
    {
      label: "Profile",
      path: "/mangaka/profile",
      icon: User,
    },
  ];

  const menus =
    role === "editor"
      ? editorMenus
      : role === "editorial_board" || role === "editor_in_chief"
        ? boardMenus
        : role === "mangaka"
          ? mangakaMenus
          : defaultMenus;

  const workspaceLabel =
    role === "editor"
      ? "Editor Workspace"
      : role === "editorial_board"
        ? "Editorial Board"
        : role === "editor_in_chief"
          ? "Editor-in-Chief"
          : role === "mangaka"
            ? "Mangaka Workspace"
            : "Creator command center";
  const homePath =
    role === "editor"
      ? "/app/editor/dashboard"
      : role === "editorial_board" || role === "editor_in_chief"
        ? "/app/board/dashboard"
        : role === "mangaka"
          ? "/mangaka/dashboard"
          : "/app/dashboard";

  const handleLogout = () => {
    clearAuthSession();
    toast.info("Logged out", "Your session has been cleared.");
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      <div className="flex min-h-screen">
        <aside className="app-sidebar settings-sidebar sticky top-0 hidden h-dvh w-72 shrink-0 flex-col overflow-hidden p-5 lg:flex">
          <NavLink to={homePath} className="flex shrink-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-rose-400 to-cyan-300 text-sm font-black text-slate-950">
              M
            </div>
            <div className="sidebar-copy">
              <h1 className="text-lg font-bold leading-tight">Manga Studio</h1>
              <p className="text-xs text-slate-400">{workspaceLabel}</p>
            </div>
          </NavLink>

          <div className="premium-card sidebar-role-card mt-6 shrink-0 rounded-xl p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-100/80">
              Active role
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="sidebar-copy">
                <p className="font-semibold text-white">{role ?? "Mangaka"}</p>
                <p className="text-xs text-slate-400">{workspaceLabel}</p>
              </div>
              <QuickSettingsTrigger variant="settings" />
            </div>
          </div>

          <nav className="mt-6 min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
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
                  <span className="sidebar-copy">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="app-desktop-action-row hidden lg:flex">
            <button
              type="button"
              onClick={handleLogout}
              className="app-logout-top inline-flex items-center gap-2"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
          <header className="app-topbar sticky top-0 z-30 px-4 py-4 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <NavLink to={homePath} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-rose-400 to-cyan-300 text-sm font-black text-slate-950">
                  M
                </div>
                <div>
                  <p className="font-semibold">Manga Studio</p>
                  <p className="text-xs text-slate-400">{workspaceLabel}</p>
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
            <nav
              className="mt-3 flex gap-2 overflow-x-auto pb-1"
              aria-label="Workspace navigation"
            >
              {menus.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={"end" in item ? item.end : undefined}
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
