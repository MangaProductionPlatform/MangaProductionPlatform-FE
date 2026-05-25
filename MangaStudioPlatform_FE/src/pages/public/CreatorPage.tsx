import { ArrowRight, PencilLine, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { mangaCovers } from "../../shared/constants/mangakaImages";

const creatorSteps = [
  { title: "Create profile", desc: "Set your mangaka identity and role." },
  {
    title: "Upload chapters",
    desc: "Publish episodes and follow release flow.",
  },
  { title: "Reach readers", desc: "Get promoted through featured placements." },
];

const creatorShowcase = mangaCovers.slice(0, 5);

export default function CreatorPage() {
  return (
    <div className="min-h-screen bg-[#050816] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="grid gap-6 rounded-[2.25rem] border border-white/10 bg-[linear-gradient(135deg,rgba(2,6,23,0.94),rgba(15,23,42,0.9),rgba(76,29,149,0.85))] p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-amber-200/80">
              Become a Mangaka
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black text-white sm:text-5xl">
              Start your creator journey on a dedicated page.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
              Register as a mangaka, publish chapters, and work with editors
              without being buried inside the landing screen.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
              Onboarding flow
            </p>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {creatorShowcase.map((manga) => (
                <img
                  key={manga.title}
                  src={manga.image}
                  alt={manga.title}
                  className="aspect-[2/3] rounded-xl border border-white/10 object-cover shadow-[0_14px_32px_rgba(0,0,0,0.35)]"
                />
              ))}
            </div>
            <div className="mt-4 space-y-3">
              {creatorSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.25em] text-amber-200/80">
                    0{index + 1}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {step.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2 grid gap-4 sm:grid-cols-3 lg:col-span-2">
            {[
              { label: "Creator profile", icon: Users },
{ label: "Chapter uploads", icon: PencilLine },
              { label: "Promoted releases", icon: Sparkles },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-3xl border border-white/10 bg-slate-950/45 p-5 backdrop-blur-xl"
                >
                  <Icon size={18} className="text-amber-300" />
                  <p className="mt-3 text-lg font-semibold text-white">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Available after registration
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {creatorShowcase.map((manga) => (
            <article
              key={manga.title}
              className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 shadow-[0_20px_70px_rgba(2,6,23,0.35)]"
            >
              <img
                src={manga.image}
                alt={manga.title}
                className="aspect-[2/3] w-full object-cover"
              />
              <div className="p-4">
                <p className="text-sm font-semibold text-white">
                  {manga.title}
                </p>
                <p className="mt-1 text-sm text-slate-400">{manga.genre}</p>
              </div>
            </article>
          ))}
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:scale-[1.02]"
          >
            Apply Now <ArrowRight size={16} />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}