import {
  ArrowRight,
  BookOpenText,
  CalendarDays,
  Clock3,
  ChevronLeft,
  ChevronRight,
  Compass,
  Eye,
  Flame,
  Gem,
  MessagesSquare,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { mangaCovers } from "../../shared/constants/mangakaImages";

const heroPoster = mangaCovers[0].image;

const trendingManga = mangaCovers.slice(0, 4).map((manga, index) => ({
  title: manga.title,
  author: manga.author,
  genre: manga.genre,
  ranking: `#${index + 1}`,
  views: manga.views,
  cover: manga.image,
}));

const updateTimes = [
  "12 min ago",
  "42 min ago",
  "1 hour ago",
  "3 hours ago",
] as const;

const latestUpdates = mangaCovers.slice(0, 4).map((manga, index) => ({
  title: manga.title,
  chapter: manga.chapter,
  updated: updateTimes[index],
  thumbnail: manga.image,
}));

const rankingScores = ["99.1", "97.8", "96.4", "94.9", "93.2"] as const;

const topRanking = mangaCovers.slice(0, 5).map((manga, index) => ({
  title: manga.title,
  author: manga.author,
  score: rankingScores[index],
}));

const topicTags = [
  { label: "Shonen Legends", count: "10 covers" },
  { label: "Ninja Action", count: "Naruto pick" },
  { label: "Family Comedy", count: "Spy x Family" },
  { label: "Pirate Adventure", count: "One Piece" },
  { label: "Dark Fantasy", count: "Demon Slayer" },
  { label: "Supernatural", count: "Jujutsu Kaisen" },
];

const creatorGallery = mangaCovers.map((manga) => ({
  title: manga.title,
  image: manga.image,
  caption: `${manga.author} - ${manga.genre} color manga cover`,
}));

const spotlightFrames = mangaCovers.map((manga) => ({
  title: manga.title,
  image: manga.image,
  tag: manga.genre,
  description: manga.note,
  stat: manga.stat,
}));

const movingCoverRail = [...mangaCovers, ...mangaCovers];

const sectionReveal = (index: number) => ({
  animationDelay: `${index * 90}ms`,
});

export default function LandingPage() {
  const [activeSpotlight, setActiveSpotlight] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSpotlight(
        (currentIndex) => (currentIndex + 1) % spotlightFrames.length,
      );
    }, 4000);

    return () => window.clearInterval(timer);
  }, []);

  const previousSpotlight = () => {
    setActiveSpotlight(
      (currentIndex) =>
        (currentIndex - 1 + spotlightFrames.length) % spotlightFrames.length,
    );
  };

  const nextSpotlight = () => {
    setActiveSpotlight(
      (currentIndex) => (currentIndex + 1) % spotlightFrames.length,
    );
  };

  return (
    <div>
      <main>
        <section id="discover" className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={heroPoster}
              alt="Manga banner"
              className="h-full w-full object-cover opacity-35"
            />
<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.28),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_24%),linear-gradient(180deg,rgba(5,8,22,0.5)_0%,rgba(5,8,22,0.85)_58%,#050816_100%)]" />
          </div>

          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
            <div className="space-y-8 reveal-up" style={sectionReveal(0)}>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-white/6 px-4 py-2 text-sm text-amber-100 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
                <Sparkles size={16} className="text-amber-300" />A premium home
                for manga readers and creators
              </div>

              <div className="space-y-5">
                <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl xl:text-7xl">
                  Create, Collaborate and Publish Your Manga
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                  A platform for manga creators, assistants, editors and
                  readers.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/trending"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-slate-950 transition hover:scale-[1.02]"
                >
                  Start Reading
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/creator"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10"
                >
                  Become a Mangaka
                  <Sparkles size={16} />
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { value: "2.4M", label: "weekly readers", icon: Eye },
                  { value: "780", label: "active series", icon: BookOpenText },
                  { value: "96%", label: "creator satisfaction", icon: Users },
                ].map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="reveal-up rounded-3xl border border-white/10 bg-slate-950/45 p-5 backdrop-blur-xl"
                      style={sectionReveal(index + 1)}
                    >
                      <Icon size={18} className="text-amber-300" />
                      <p className="mt-3 text-3xl font-bold text-white">
                        {item.value}
</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {item.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              className="relative flex items-center justify-center reveal-up"
              style={sectionReveal(1)}
            >
              <div className="absolute left-6 top-8 h-28 w-28 rounded-full bg-fuchsia-500/20 blur-3xl pulse-glow" />
              <div className="absolute bottom-10 right-4 h-36 w-36 rounded-full bg-cyan-400/20 blur-3xl pulse-glow" />

              <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">
                      Featured Works
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      Rotating every 4 seconds
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={previousSpotlight}
                      className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:border-white/25 hover:bg-white/10"
                      aria-label="Previous spotlight"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={nextSpotlight}
                      className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:border-white/25 hover:bg-white/10"
                      aria-label="Next spotlight"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="relative h-[520px] overflow-hidden rounded-[1.6rem] border border-white/10 bg-slate-950 sm:h-[560px]">
                  {spotlightFrames.map((frame, index) => (
                    <div
                      key={frame.title}
                      className={`absolute inset-0 transition-all duration-700 ease-out ${
                        index === activeSpotlight
                          ? "opacity-100 translate-x-0 scale-100"
                          : "pointer-events-none opacity-0 translate-x-3 scale-[1.02]"
                      }`}
                    >
                      <img
                        src={frame.image}
                        alt=""
className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-xl"
                      />
                      <img
                        src={frame.image}
                        alt={frame.title}
                        className="relative z-10 mx-auto h-full w-auto max-w-[82%] object-contain py-6 drop-shadow-[0_28px_55px_rgba(0,0,0,0.65)]"
                      />
                      <div className="absolute inset-0 z-20 bg-[linear-gradient(180deg,rgba(6,10,26,0.05)_10%,rgba(6,10,26,0.82)_90%)]" />

                      <div className="absolute left-6 top-6 z-30 rounded-2xl border border-white/10 bg-slate-950/75 px-4 py-3 backdrop-blur-xl">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                          {frame.tag}
                        </p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          {frame.title}
                        </p>
                      </div>

                      <div className="absolute bottom-6 left-6 right-6 z-30 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 backdrop-blur-xl">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                            Spotlight note
                          </p>
                          <div className="mt-2 flex items-center justify-between gap-4">
                            <div>
                              <p className="text-base font-semibold text-white">
                                {frame.stat}
                              </p>
                              <p className="text-sm text-slate-400">
                                {frame.description}
                              </p>
                            </div>
                            <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                              Live
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 backdrop-blur-xl">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                            Community pulse
                          </p>
                          <div className="mt-2 flex items-center justify-between gap-4">
                            <div>
                              <p className="text-base font-semibold text-white">
                                4.8k comments
                              </p>
                              <p className="text-sm text-slate-400">
                                Readers discussing the twist
                              </p>
                            </div>
                            <MessagesSquare
                              size={20}
className="text-amber-300"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 px-1">
                  <div className="flex items-center gap-2">
                    {spotlightFrames.map((frame, index) => (
                      <button
                        key={frame.title}
                        type="button"
                        onClick={() => setActiveSpotlight(index)}
                        className={`h-2.5 w-8 rounded-full transition ${
                          index === activeSpotlight
                            ? "bg-amber-300"
                            : "bg-white/15 hover:bg-white/25"
                        }`}
                        aria-label={`Go to spotlight ${index + 1}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    {String(activeSpotlight + 1).padStart(2, "0")}/
                    {String(spotlightFrames.length).padStart(2, "0")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-slate-950/55 py-5">
          <div className="overflow-hidden">
            <div className="cover-marquee-track flex w-max gap-4 px-4">
              {movingCoverRail.map((manga, index) => (
                <div
                  key={`${manga.title}-${index}`}
                  className="h-44 w-28 shrink-0 overflow-hidden rounded-[1rem] border border-white/10 bg-white/5 shadow-[0_16px_45px_rgba(2,6,23,0.45)] sm:h-56 sm:w-36"
                >
                  <img
                    src={manga.image}
                    alt={manga.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="trending"
          className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10"
        >
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-amber-200/70">
                Trending Manga
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                Hot titles with strong momentum
              </h2>
            </div>
            <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 md:flex md:items-center md:gap-2">
              <Flame size={16} className="text-rose-300" />
              Updated every hour
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
{trendingManga.map((item, index) => (
              <article
                key={item.title}
                className="reveal-up group overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 shadow-[0_24px_80px_rgba(2,6,23,0.45)] transition duration-300 hover:-translate-y-2 hover:border-rose-300/40 hover:bg-white/10"
                style={sectionReveal(index)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="aspect-[2/3] w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
                  <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-slate-950/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xl">
                    {item.ranking}
                  </div>
                  <div className="absolute right-4 top-4 rounded-full bg-amber-300/90 px-3 py-1 text-xs font-semibold text-slate-950">
                    {item.views} views
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xl font-bold text-white">
                        {item.title}
                      </h3>
                      <Star size={16} className="mt-1 text-amber-300" />
                    </div>
                    <p className="mt-1 text-sm text-slate-400">
                      by {item.author}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/6 px-3 py-1.5">
                      <Gem size={14} className="text-cyan-300" />
                      {item.genre}
                    </span>
                    <span className="text-slate-400">Rank {item.ranking}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-14">
          <div
            className="reveal-up rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            style={sectionReveal(0)}
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
                  Latest Updates
                </p>
                <h2 className="mt-2 text-3xl font-bold text-white">
                  Fresh chapters just dropped
                </h2>
</div>
              <div className="rounded-full border border-white/10 bg-slate-950/50 px-4 py-2 text-sm text-slate-300">
                <Clock3 size={14} className="mr-2 inline text-amber-300" />
                Real-time feed
              </div>
            </div>

            <div className="space-y-4">
              {latestUpdates.map((item, index) => (
                <div
                  key={`${item.title}-${item.chapter}`}
                  className="flex items-center gap-4 rounded-3xl border border-white/10 bg-slate-950/45 p-3 transition hover:border-white/20 hover:bg-slate-950/70"
                  style={sectionReveal(index)}
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="h-20 w-16 rounded-2xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-white">
                      {item.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                      <span>{item.chapter}</span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays size={14} />
                        {item.updated}
                      </span>
                    </div>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-slate-500 transition group-hover:text-white"
                  />
                </div>
              ))}
            </div>
          </div>

          <div
            className="reveal-up rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            style={sectionReveal(1)}
          >
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
              Top Ranking
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">
              Weekly board highlights
            </h2>

            <div className="mt-6 space-y-3">
              {topRanking.map((item, index) => (
                <div
                  key={item.title}
                  className="flex items-center gap-4 rounded-3xl border border-white/10 bg-slate-950/45 px-4 py-4 transition hover:border-amber-300/30 hover:bg-slate-950/70"
                  style={sectionReveal(index)}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-rose-400 to-fuchsia-500 text-lg font-black text-slate-950">
                    #{index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="text-sm text-slate-400">{item.author}</p>
</div>
                  <div className="text-right">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                      Weekly score
                    </p>
                    <p className="mt-1 text-xl font-bold text-amber-300">
                      {item.score}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="genres"
          className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
        >
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
                Topics
              </p>
              <h2 className="mt-2 text-3xl font-bold text-white">
                Browse editorial collections
              </h2>
            </div>
            <Compass size={22} className="text-cyan-300" />
          </div>

          <div className="flex flex-wrap gap-3">
            {topicTags.map((item, index) => (
              <Link
                key={item.label}
                to="/genres"
                className="reveal-up inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition duration-300 hover:border-cyan-300/40 hover:bg-white/10"
                style={sectionReveal(index)}
              >
                <span className="font-semibold text-white">{item.label}</span>
                <span className="rounded-full bg-slate-950/70 px-2 py-1 text-[11px] text-slate-400">
                  {item.count}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
                Cover Gallery
              </p>
              <h2 className="mt-2 text-3xl font-bold text-white">
                10 color manga covers with an auto-rotating spotlight
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-400">
              A denser wall of recognizable covers keeps this section closer to
              a manga shelf than a plain genre listing.
            </p>
          </div>

          <div className="mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(2,6,23,0.4)] sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr] lg:items-stretch">
              <div className="relative h-[24rem] overflow-hidden rounded-[1.6rem] border border-white/10 bg-slate-950 sm:h-[28rem]">
                {spotlightFrames.map((frame, index) => (
                  <div
key={frame.title}
                    className={`absolute inset-0 transition-all duration-700 ease-out ${
                      index === activeSpotlight
                        ? "opacity-100 translate-x-0 scale-100"
                        : "pointer-events-none opacity-0 translate-x-3 scale-[1.02]"
                    }`}
                  >
                    <img
                      src={frame.image}
                      alt=""
                      className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-xl"
                    />
                    <img
                      src={frame.image}
                      alt={frame.title}
                      className="relative z-10 mx-auto h-full w-auto max-w-[78%] object-contain py-5 drop-shadow-[0_24px_48px_rgba(0,0,0,0.6)]"
                    />
                    <div className="absolute inset-0 z-20 bg-[linear-gradient(180deg,rgba(5,8,22,0.05)_5%,rgba(5,8,22,0.7)_100%)]" />
                    <div className="absolute left-5 top-5 z-30 rounded-full border border-white/15 bg-slate-950/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-xl">
                      {frame.tag}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 z-30 p-5 sm:p-6">
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-300/80">
                        {String(index + 1).padStart(2, "0")}/
                        {String(spotlightFrames.length).padStart(2, "0")}
                      </p>
                      <h3 className="mt-2 text-3xl font-black text-white sm:text-4xl">
                        {frame.title}
                      </h3>
                      <p className="mt-2 max-w-xl text-sm leading-7 text-slate-200/85 sm:text-base">
                        {frame.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 self-stretch">
                {spotlightFrames.map((frame, index) => (
                  <button
                    key={frame.title}
                    type="button"
                    onClick={() => setActiveSpotlight(index)}
                    className={`group flex items-center gap-4 rounded-[1.35rem] border p-3 text-left transition duration-300 ${
                      index === activeSpotlight
                        ? "border-amber-300/50 bg-white/10"
                        : "border-white/10 bg-slate-950/45 hover:border-white/20 hover:bg-slate-950/70"
                    }`}
                  >
                    <img
                      src={frame.image}
                      alt={frame.title}
                      className="h-20 w-16 rounded-2xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
{frame.tag}
                      </p>
                      <p className="truncate text-base font-semibold text-white">
                        {frame.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-400">
                        {frame.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {creatorGallery.map((item, index) => (
              <article
                key={item.title}
                className="reveal-up group overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 shadow-[0_20px_70px_rgba(2,6,23,0.35)] transition duration-300 hover:-translate-y-1 hover:border-amber-300/40 hover:bg-white/10"
                style={sectionReveal(index)}
              >
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,22,0.02)_5%,rgba(5,8,22,0.68)_100%)]" />
                  <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-slate-950/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xl">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                </div>

                <div className="space-y-2 p-4">
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <p className="text-sm leading-6 text-slate-400">
                    {item.caption}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="creator"
          className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16"
        >
          <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-[linear-gradient(135deg,rgba(2,6,23,0.94),rgba(15,23,42,0.9),rgba(76,29,149,0.85))] p-8 shadow-[0_28px_100px_rgba(2,6,23,0.55)] sm:p-10 lg:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,114,182,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.18),transparent_30%)]" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-amber-200/80">
                  Become a Mangaka
                </p>
                <h2 className="mt-3 max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl">
                  Want to publish your own manga?
</h2>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                  Apply as a Mangaka and start building your series. Set up your
                  profile, upload chapters, and collaborate with editors in one
                  workspace.
                </p>
              </div>

              <div className="flex flex-col items-start gap-3 sm:flex-row lg:flex-col lg:items-end">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:scale-[1.02]"
                >
                  Apply Now
                  <ArrowRight size={16} />
                </Link>
                <p className="text-sm text-slate-400">
                  Creator onboarding takes less than 3 minutes.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950/80">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
          <div>
            <p className="text-lg font-semibold text-white">MangaStudio</p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-slate-400">
              A polished home for manga discovery, collaboration, and
              publishing.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-slate-300">
            <Link to="/discover" className="transition hover:text-white">
              About
            </Link>
            <Link to="/creator" className="transition hover:text-white">
              Contact
            </Link>
            <Link to="/" className="transition hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/" className="transition hover:text-white">
              Terms of Service
            </Link>
            <Link to="/" className="transition hover:text-white">
              Discord
            </Link>
            <Link to="/" className="transition hover:text-white">
              GitHub
            </Link>
            <Link to="/" className="transition hover:text-white">
              Social
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}