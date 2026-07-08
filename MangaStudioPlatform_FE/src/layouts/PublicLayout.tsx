import { LogIn } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { mangaHeroImage } from "../shared/visuals/mangaVisuals";
import ModeToggle from "../shared/components/ModeToggle";

export default function PublicLayout() {
  return (
    <div className="app-shell">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <img
          src={mangaHeroImage}
          alt=""
          className="h-full w-full object-cover opacity-[0.08]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,22,0.8),rgba(5,8,22,0.98))]" />
      </div>

      <header className="app-topbar sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:flex-nowrap sm:gap-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-rose-400 to-fuchsia-500 text-sm font-black text-slate-950 shadow-lg shadow-rose-500/20">
              M
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold tracking-wide">
                MangaStudio
              </p>
              <p className="text-xs text-slate-400">
                Create, collaborate and publish
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <ModeToggle />
            <Link
              to="/login"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/10"
            >
              <LogIn size={16} />
              Login
            </Link>
          </div>
        </div>
      </header>

      <main className="relative">
        <Outlet />
      </main>
    </div>
  );
}
