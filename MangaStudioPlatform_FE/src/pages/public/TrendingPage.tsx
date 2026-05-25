import { ArrowRight, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { mangaCovers } from "../../shared/constants/mangakaImages";

const trending = mangaCovers.slice(0, 8);

const pulseStats = [
  { label: "Most shared", value: "28.4K" },
  { label: "Fast rising", value: "14 titles" },
  { label: "Editor's pick", value: "Weekly" },
];

export default function TrendingPage() {
  return (
    <div className="min-h-screen bg-[#050816] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
          <div>
            <div className="flex items-center gap-2 text-rose-200">
              <Flame size={18} />
              Trending
            </div>
            <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">
              The titles readers are following right now.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
              A separate page for trending content so the header no longer jumps
              within the landing screen.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
              Pulse
            </p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {trending.slice(0, 4).map((item) => (
                <img
                  key={item.title}
                  src={item.image}
                  alt={item.title}
                  className="aspect-[2/3] rounded-xl border border-white/10 object-cover"
                />
              ))}
            </div>
            <div className="mt-4 space-y-3">
              {pulseStats.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="text-base font-semibold text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {trending.map((item, index) => (
            <article
              key={item.title}
              className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 shadow-[0_20px_70px_rgba(2,6,23,0.35)]"
            >
              <img
                src={item.image}
                alt={item.title}
                className="aspect-[2/3] w-full object-cover transition duration-500 hover:scale-105"
              />
              <div className="space-y-3 p-5">
<div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">{item.title}</h2>
                  <span className="rounded-full bg-amber-300/90 px-3 py-1 text-xs font-semibold text-slate-950">
                    #{index + 1}
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  {item.genre} by {item.author}
                </p>
                <p className="text-sm text-slate-400">
                  {item.views} views this week
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10">
          <Link
            to="/ranking"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:scale-[1.02]"
          >
            See Ranking <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}