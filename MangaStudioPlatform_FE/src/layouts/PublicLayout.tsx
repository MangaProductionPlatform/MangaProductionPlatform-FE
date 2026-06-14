import { LogIn, Menu } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { mangaHeroImage } from "../shared/visuals/mangaVisuals";

const navItems = [
  { to: "/discover", label: "Discover" },
  { to: "/trending", label: "Trending" },
  { to: "/genres", label: "Genres" },
  { to: "/ranking", label: "Ranking" },
  { to: "/creator", label: "Become a Mangaka" },
];

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#050816] text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <img
          src={mangaHeroImage}
          alt=""
          className="h-full w-full object-cover opacity-[0.08]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,22,0.8),rgba(5,8,22,0.98))]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-rose-400 to-fuchsia-500 text-sm font-black text-slate-950 shadow-lg shadow-rose-500/20">
              M
            </div>
            <div>
              <p className="text-base font-semibold tracking-wide">
                MangaStudio
              </p>
              <p className="text-xs text-slate-400">
                Create, collaborate and publish
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 text-sm lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative inline-flex items-center rounded-full px-3.5 py-2 font-medium transition duration-300 ${
                    isActive
                      ? "border border-amber-300/30 bg-white/10 text-amber-100 shadow-[0_0_28px_rgba(251,191,36,0.18)]"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <span
                    className={
                      isActive
                        ? "bg-gradient-to-r from-amber-200 via-rose-300 to-cyan-200 bg-clip-text text-transparent [text-shadow:0_0_18px_rgba(251,191,36,0.18)]"
                        : ""
                    }
                  >
                    {item.label}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/10"
            >
              <LogIn size={16} />
              Login
            </Link>
            <button className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 lg:hidden">
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="relative">
        <Outlet />
      </main>
    </div>
  );
}
