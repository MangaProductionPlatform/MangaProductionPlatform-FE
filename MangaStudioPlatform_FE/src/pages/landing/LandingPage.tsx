import { ArrowRight, BookOpenText, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import CoverMarquee from "../../shared/components/CoverMarquee";
import { mangaHeroImage } from "../../shared/visuals/mangaVisuals";

const entryLinks = [
  {
    title: "Login",
    description: "Open your workspace with a real backend account.",
    to: "/login",
    icon: LogIn,
  },
  {
    title: "Ranking",
    description: "View ranking data when the ranking service is running.",
    to: "/ranking",
    icon: BookOpenText,
  },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050816] text-slate-100">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <section className="grid items-center gap-8 lg:grid-cols-[1fr_24rem]">
          <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200">
            MangaStudio
          </p>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-white sm:text-6xl">
            Manga production workspace
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Use the actions below to demo real backend-connected
            flows.
          </p>
          </div>
          <div className="relative min-h-80 overflow-hidden rounded-lg border border-white/10 bg-slate-900/70 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
            <img
              src={mangaHeroImage}
              alt="Manga covers and production inspiration"
              className="absolute inset-0 h-full w-full object-cover opacity-65"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,22,0.08),rgba(5,8,22,0.92))]" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-100">
                Cover desk
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                Stories move from pitch to print.
              </h2>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <CoverMarquee />
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          {entryLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                to={item.to}
                className="group rounded-lg border border-white/10 bg-slate-900/75 p-5 transition hover:border-cyan-300/40 hover:bg-slate-900"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-200">
                    <Icon size={20} />
                  </span>
                  <ArrowRight
                    size={18}
                    className="text-slate-500 transition group-hover:text-cyan-200"
                  />
                </div>
                <h2 className="mt-5 text-xl font-bold text-white">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {item.description}
                </p>
              </Link>
            );
          })}
        </section>
      </main>
    </div>
  );
}
