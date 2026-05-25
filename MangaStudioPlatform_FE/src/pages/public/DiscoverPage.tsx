import { ArrowRight, BookOpenText, Compass, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { mangaCovers } from "../../shared/constants/mangakaImages";

const featuredSeries = mangaCovers.slice(0, 6);

const editorialRows = [
  { label: "Updates", value: "Fresh chapters, timed releases" },
  { label: "Popular", value: "Weekly rankings and fan momentum" },
  { label: "Recommended", value: "Editors' picks with a strong hook" },
];

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-[#050816] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="grid gap-6 rounded-[2.25rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
              Discover
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black text-white sm:text-5xl">
              Find the next series worth following.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
              Browse editorial picks, creator spotlights, and new reader
              favorites without leaving the page.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { value: "780", label: "active series", icon: BookOpenText },
                { value: "2.4M", label: "weekly readers", icon: Users },
                { value: "12", label: "curated collections", icon: Compass },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-3xl border border-white/10 bg-slate-950/50 p-5"
                  >
                    <Icon size={18} className="text-amber-300" />
                    <p className="mt-3 text-3xl font-bold text-white">
                      {item.value}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">
              Editorial feed
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {featuredSeries.slice(0, 3).map((series) => (
                <img
                  key={series.title}
                  src={series.image}
                  alt={series.title}
                  className="aspect-[2/3] rounded-2xl border border-white/10 object-cover shadow-[0_16px_35px_rgba(0,0,0,0.35)]"
                />
              ))}
            </div>
            <div className="mt-4 space-y-3">
{editorialRows.map((row, index) => (
                <div
                  key={row.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                      0{index + 1}
                    </p>
                    <p className="text-xs text-slate-500">Live</p>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {row.label}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          {featuredSeries.map((series) => (
            <article
              key={series.title}
              className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 shadow-[0_20px_70px_rgba(2,6,23,0.35)]"
            >
              <img
                src={series.image}
                alt={series.title}
                className="aspect-[2/3] w-full object-cover transition duration-500 hover:scale-105"
              />
              <div className="p-5">
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
                  {series.genre}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  {series.title}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  by {series.author}
                </p>
              </div>
            </article>
          ))}
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/trending"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:scale-[1.02]"
          >
            Go to Trending <ArrowRight size={16} />
          </Link>
          <Link
            to="/genres"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
          >
            Browse Genres
          </Link>
        </div>
      </div>
    </div>
  );
}