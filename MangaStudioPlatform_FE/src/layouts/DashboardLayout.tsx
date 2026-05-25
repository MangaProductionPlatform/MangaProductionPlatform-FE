import { NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  Bell,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Search,
  Settings,
  Users,
  User,
} from "lucide-react";

const menus = [
  { label: "Dashboard", path: "/app/dashboard", icon: LayoutDashboard, end: true },
  { label: "My Series", path: "/app/series", icon: BookOpen, end: true },
  { label: "Create Series", path: "/app/series/create", icon: PlusCircle },
  { label: "Chapters", path: "/app/chapters", icon: FileText },
  { label: "Tasks", path: "/app/tasks", icon: ClipboardCheck },
  { label: "Assistants", path: "/app/assistants", icon: Users },
  { label: "Reviews", path: "/app/reviews", icon: ClipboardCheck },
  { label: "Analytics", path: "/app/analytics", icon: BarChart3 },
  { label: "Notifications", path: "/app/notifications", icon: Bell },
  { label: "Profile", path: "/app/profile", icon: User },
];

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#050816] text-slate-100">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-white/10 bg-slate-950/85 p-5 backdrop-blur-xl lg:block">
          <NavLink to="/app/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-rose-400 to-cyan-300 text-sm font-black text-slate-950">
              M
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Mangaka Studio</h1>
              <p className="text-xs text-slate-400">Creator command center</p>
            </div>
          </NavLink>

          <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-100/80">
              Active role
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">Mangaka</p>
                <p className="text-xs text-slate-400">Series owner</p>
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
                  end={item.end}
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

          <button className="mt-6 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-rose-200 transition hover:bg-rose-500/10">
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
                  <p className="font-semibold">Mangaka Studio</p>
                  <p className="text-xs text-slate-400">Creator workspace</p>
                </div>
              </NavLink>
              <button className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200">
                <Search size={18} />
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
