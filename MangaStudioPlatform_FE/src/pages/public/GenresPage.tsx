import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { mangaCovers } from "../../shared/constants/mangakaImages";

const genres = mangaCovers.map((manga) => manga.genre);

const genreColumns = mangaCovers.slice(0, 4).map((manga) => ({
  title: manga.genre,
  desc: `${manga.title} by ${manga.author}`,
  image: manga.image,
}));

export default function GenresPage() {
  return (
    <div className="min-h-screen bg-[#050816] text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
              Genres
            </p>
            <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">
              Browse manga by mood and style.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
              Each genre can now live on its own route instead of a section jump
              inside the homepage.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
              Reading lanes
            </p>
            <div className="mt-4 space-y-3">
              {genreColumns.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-20 w-14 rounded-xl border border-white/10 object-cover"
                    />
                    <div>
                      <p className="text-base font-semibold text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          {genres.map((genre) => (
            <button
              key={genre}
              type="button"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-300/40 hover:bg-white/10"
            >
              {genre}
            </button>
          ))}
        </div>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {mangaCovers.map((manga, index) => (
            <article
              key={manga.title}
className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 shadow-[0_20px_70px_rgba(2,6,23,0.35)]"
            >
              <div className="relative aspect-[2/3]">
                <img
                  src={manga.image}
                  alt={manga.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute left-4 top-4 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xl">
                  {String(index + 1).padStart(2, "0")}
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">
                  {manga.genre}
                </p>
                <h2 className="mt-2 text-lg font-bold text-white">
                  {manga.title}
                </h2>
              </div>
            </article>
          ))}
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/discover"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:scale-[1.02]"
          >
            Back to Discover <ArrowRight size={16} />
          </Link>
          <Link
            to="/creator"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
          >
            Become a Mangaka
          </Link>
        </div>
      </div>
    </div>
  );
}