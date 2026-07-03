import { ArrowRight, ClipboardCheck, Layers3, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CoverMarquee from "../../shared/components/CoverMarquee";
import { mangaHeroSlides } from "../../shared/visuals/mangaVisuals";

const workflowHighlights = [
  {
    title: "Series governance",
    description: "Mangaka proposals move through Editorial Board review, consensus handling, and final approval decisions.",
    icon: ClipboardCheck,
  },
  {
    title: "Production control",
    description: "Chapters, page tasks, assistant layers, revisions, and approvals stay visible in one operational workspace.",
    icon: Layers3,
  },
  {
    title: "Role-based access",
    description: "Company accounts route to Mangaka, Assistant, Editorial Board, Editor, or Admin workspaces after login.",
    icon: ShieldCheck,
  },
] as const;

export default function LandingPage() {
  const [heroIndex, setHeroIndex] = useState(0);
  const heroSlide = mangaHeroSlides[heroIndex];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % mangaHeroSlides.length);
    }, 3500);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#050816] text-slate-100">
      <main className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-6xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <section className="grid items-center gap-8 lg:grid-cols-[1fr_24rem]">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200">
              Company operations portal
            </p>
            <h1 className="mt-4 text-5xl font-black tracking-tight text-white sm:text-6xl">
              MangaStudio ERP
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              Internal management system for series submission, editorial review, chapter production, assistant tasking, QA handoff, and platform operations.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/login"
                className="btn-primary inline-flex items-center justify-center gap-2"
              >
                Login to portal
                <ArrowRight size={17} />
              </Link>
              <span className="inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-300">
                Authorized company accounts only
              </span>
            </div>
          </div>
          <div className="relative min-h-80 overflow-hidden rounded-lg border border-white/10 bg-slate-900/70 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
            <img
              key={heroSlide.image}
              src={heroSlide.image}
              alt="Manga covers and production inspiration"
              className="hero-slide absolute inset-0 h-full w-full object-cover opacity-65"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,22,0.08),rgba(5,8,22,0.92))]" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-100">
                {heroSlide.eyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                {heroSlide.title}
              </h2>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <CoverMarquee />
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {workflowHighlights.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="surface-card rounded-lg p-5"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-200">
                  <Icon size={20} />
                </span>
                <h2 className="mt-5 text-lg font-bold text-white">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {item.description}
                </p>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
