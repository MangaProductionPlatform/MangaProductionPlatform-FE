import { ArrowRight, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { mangaCovers } from "../../shared/constants/mangakaImages";

const rankingScores = ["99.1", "97.8", "96.4", "94.9", "93.2", "91.7", "90.4", "88.9", "87.6", "86.2"] as const;
const rankingChanges = ["+12.4%", "+10.1%", "+8.9%", "+7.6%", "+6.2%", "+5.4%", "+4.7%", "+3.9%", "+3.1%", "+2.6%"] as const;

const rankingItems = mangaCovers.map((manga, index) => ({
  rank: index + 1,
  title: manga.title,
  author: manga.author,
  genre: manga.genre,
  image: manga.image,
  score: rankingScores[index],
  change: rankingChanges[index],
}));

export default function RankingPage() {
  return (
    <div className="min-h-screen bg-[#050816] text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
              Ranking
            </p>
            <h1 className="mt-2 text-4xl font-black text-white sm:text-5xl">
              Weekly manga ranking
            </h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Browse the highest performing titles and track how each series is
              moving this week.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-100">
            <Flame size={16} />
            Trending now
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {rankingItems.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-rose-400 to-fuchsia-500 text-xl font-black text-slate-950">
                  {item.rank}
                </div>
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-24 w-16 rounded-2xl border border-white/10 object-cover shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
                />
                <div>
                  <p className="text-xl font-bold text-white">{item.title}</p>
                  <p className="text-sm text-slate-400">by {item.author}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-amber-200/70">
                    {item.genre}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
<p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Score
                  </p>
                  <p className="mt-1 text-2xl font-bold text-amber-300">
                    {item.score}
                  </p>
                </div>
                <div className="rounded-full border border-emerald-300/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-200">
                  {item.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-white">
            Want to publish your own title?
          </h2>
          <p className="mt-2 text-slate-300">
            Create a creator profile and start uploading your first chapter.
          </p>
          <Link
            to="/creator"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:scale-[1.02]"
          >
            Become a Mangaka
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}