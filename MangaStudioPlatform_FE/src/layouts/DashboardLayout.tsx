import { NavLink, Outlet } from "react-router-dom";
import {
  BookOpen,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  PenTool,
  Trophy,
  User,
} from "lucide-react";

const menus = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Series", path: "/series", icon: BookOpen },
  { label: "Approval", path: "/series/approval", icon: ClipboardCheck },
  { label: "Manuscripts", path: "/manuscripts", icon: FileText },
  { label: "Review", path: "/manuscripts/review", icon: PenTool },
  { label: "Tasks", path: "/tasks", icon: ClipboardCheck },
  { label: "Ranking", path: "/ranking", icon: Trophy },
  { label: "Profile", path: "/profile", icon: User },
];

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="w-72 border-r border-slate-800 bg-slate-900 p-6">
        <h1 className="text-2xl font-bold">Manga Studio</h1>
        <p className="mt-1 text-sm text-slate-400">Publishing Platform</p>

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

        <button className="mt-10 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-300 hover:bg-slate-800">
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