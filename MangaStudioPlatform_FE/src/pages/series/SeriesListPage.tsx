import { Link } from "react-router-dom";
import { ArrowRight, PlusCircle, Search, SlidersHorizontal, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { mangaErpApi, type MangaSeriesDto } from "../../shared/api/mangaErpApi";
import { useToast } from "../../shared/components/ToastProvider";

export default function SeriesListPage() {
  const toast = useToast();
  const [seriesList, setSeriesList] = useState<MangaSeriesDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = useMemo(
    () => JSON.parse(localStorage.getItem("currentUser") || "null") as
      | { userId?: string }
      | null,
    [],
  );

  useEffect(() => {
    let ignore = false;

    async function loadSeries() {
      setIsLoading(true);

      try {
        const result = currentUser?.userId
          ? await mangaErpApi.getSeriesByAuthor(currentUser.userId)
          : await mangaErpApi.getAllSeries();

        if (!ignore) {
          setSeriesList(result);
        }
      } catch (err) {
        if (!ignore) {
          toast.error(
            "Could not load series",
            err instanceof Error ? err.message : "Please check that Series service is running.",
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadSeries();
    return () => {
      ignore = true;
    };
  }, [currentUser?.userId, toast]);

  const displaySeries = seriesList.map((series) => ({
        id: series.id,
        title: series.title,
        cover: series.coverImageUrl || "/favicon.svg",
        status: series.status,
        genre: series.genre ?? "Uncategorized",
        ranking: "-",
        latestChapter: "Load chapters from detail",
        views: "-",
        engagement: "-",
        editor: "-",
        progress: series.status === "Active" ? 65 : 15,
      }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            My Series
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Manga created by you
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Approved backend series appear here. New titles submitted from this
            workspace start as proposals and do not appear here until approved.
          </p>
        </div>
        <Link
          to="/app/series/create"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-100"
        >
          <PlusCircle size={16} />
          Submit Proposal
        </Link>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-slate-900/75 p-4 md:flex-row md:items-center md:justify-between">
        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2.5">
          <Search size={18} className="shrink-0 text-slate-500" />
          <input
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            placeholder="Search title, genre, editor"
          />
        </label>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 hover:bg-white/10">
            <SlidersHorizontal size={16} />
            Status
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 hover:bg-white/10">
            <TrendingUp size={16} />
            Ranking
          </button>
        </div>
      </div>

      <section className="grid gap-5 xl:grid-cols-2">
        {isLoading ? (
          <div className="rounded-lg border border-white/10 bg-slate-900/75 p-5 text-sm text-slate-300">
            Loading series from backend...
          </div>
        ) : null}

        {!isLoading && displaySeries.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-slate-900/75 p-6 text-sm text-slate-300">
            No approved series found from backend yet. If you just submitted a
            proposal, check MangaSubmissionDB; it will only appear here after
            the approval flow creates a series record.
          </div>
        ) : null}

        {!isLoading && displaySeries.map((series) => (
          <article
            key={series.id}
            className="grid gap-4 rounded-lg border border-white/10 bg-slate-900/75 p-4 sm:grid-cols-[8.5rem_1fr]"
          >
            <img
              src={series.cover}
              alt={series.title}
              className="aspect-[2/3] w-full rounded-lg object-cover shadow-xl shadow-slate-950/30"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
<span className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-xs font-semibold text-cyan-100">
                    {series.status}
                  </span>
                  <h3 className="mt-3 text-2xl font-black text-white">
                    {series.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">{series.genre}</p>
                </div>
                <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-right">
                  <p className="text-xs uppercase tracking-[0.18em] text-amber-100/80">
                    Rank
                  </p>
                  <p className="mt-1 text-lg font-bold text-amber-100">
                    {series.ranking}
                  </p>
                </div>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <Info label="Latest chapter" value={series.latestChapter} />
                <Info label="Views" value={series.views} />
                <Info label="Engagement" value={series.engagement} />
                <Info label="Editor" value={series.editor} />
              </dl>

              <div className="mt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Production progress</span>
                  <span className="font-semibold text-white">
                    {series.progress}%
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300"
                    style={{ width: `${series.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  to={`/app/series/${series.id}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-100"
                >
                  Open
                  <ArrowRight size={15} />
                </Link>
                <Link
                  to="/app/chapters"
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Chapters
                </Link>
                <Link
                  to="/app/tasks"
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Tasks
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
<div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 truncate font-semibold text-slate-100">{value}</dd>
    </div>
  );
}
