import { NavLink, Outlet, Navigate } from "react-router-dom";
import {
  BookOpen,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  PenTool,
  Trophy,
  User,
  Bell,
} from "lucide-react";

export default function DashboardLayout() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  const role = currentUser?.role;

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const defaultMenus = [
    { label: "Dashboard", path: "/app/dashboard", icon: LayoutDashboard },
    { label: "Series", path: "/app/series", icon: BookOpen },
    { label: "Approval", path: "/app/series/approval", icon: ClipboardCheck },
    { label: "Manuscripts", path: "/app/manuscripts", icon: FileText },
    { label: "Tasks", path: "/app/tasks", icon: ClipboardCheck },
    { label: "Ranking", path: "/app/ranking", icon: Trophy },
    { label: "Profile", path: "/app/profile", icon: User },
  ];

  const editorMenus = [
    { label: "Dashboard", path: "/app/editor/dashboard", icon: LayoutDashboard },
    { label: "Review Queue", path: "/app/editor/review-queue", icon: ClipboardCheck },
    { label: "Series Monitoring", path: "/app/editor/series-monitoring", icon: BookOpen },
    { label: "Annotations", path: "/app/editor/annotations", icon: PenTool },
    { label: "Publishing Queue", path: "/app/editor/publishing-queue", icon: FileText },
    { label: "Ranking & Reports", path: "/app/editor/ranking-reports", icon: Trophy },
    { label: "Notifications", path: "/app/editor/notifications", icon: Bell },
    { label: "Profile", path: "/app/editor/profile", icon: User },
  ];

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
];

  const menus =
    role === "editor"
      ? editorMenus
      : role === "editorial_board"
      ? boardMenus
      : defaultMenus;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="w-72 border-r border-slate-800 bg-slate-900 p-6">
        <h1 className="text-2xl font-bold">Manga Studio</h1>

        <p className="text-xs text-slate-500">
          {role === "editor"
            ? "Editor Workspace"
            : role === "editorial_board"
            ? "Editorial Board"
            : "Publishing Platform"}
        </p>

        <nav className="mt-8 space-y-2">
          {menus.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-slate-300 hover:bg-slate-800"
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
          onClick={() => {
            localStorage.removeItem("currentUser");
            window.location.href = "/login";
          }}
          className="mt-10 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-300 hover:bg-slate-800"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}