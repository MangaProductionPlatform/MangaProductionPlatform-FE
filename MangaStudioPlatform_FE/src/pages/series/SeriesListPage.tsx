import { Link } from "react-router-dom";
import { ArrowRight, PlusCircle, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { MangaSeriesDto } from "../../shared/types/mangaErp";
import { useToast } from "../../shared/components/toastContext";
import { mangaCoverImages } from "../../shared/visuals/mangaVisuals";

export default function SeriesListPage() {
  const toast = useToast();
  const [seriesList, setSeriesList] = useState<MangaSeriesDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let ignore = false;

    async function loadSeries() {
      setIsLoading(true);

      try {
        const result = await mangaErpApi.getMySeries();

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
  }, [toast]);

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
            Approved series appear here. New titles submitted from this
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
      </div>

      <section className="grid gap-5 xl:grid-cols-2">
        {isLoading ? (
          <div className="rounded-lg border border-white/10 bg-slate-900/75 p-5 text-sm text-slate-300">
            Loading series...
          </div>
        ) : null}

        {!isLoading && seriesList.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-slate-900/75 p-6 text-sm text-slate-300">
            No approved series are available yet. Submitted proposals appear
            here after the approval workflow creates an official series.
          </div>
        ) : null}

        {!isLoading && seriesList.map((series, index) => (
          <article
            key={series.id}
            className="grid gap-4 rounded-lg border border-white/10 bg-slate-900/75 p-4 sm:grid-cols-[8.5rem_1fr]"
          >
            <img
              src={series.coverImageUrl || mangaCoverImages[index % mangaCoverImages.length].image}
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
                  <p className="mt-1 text-sm text-slate-400">
                    {series.genre ?? "Uncategorized"}
                  </p>
                </div>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <Info label="Submission" value={series.submissionId ?? "-"} />
                <Info label="Created" value={new Date(series.createdAt).toLocaleDateString()} />
              </dl>

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
