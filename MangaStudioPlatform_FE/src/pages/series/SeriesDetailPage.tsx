import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { ChapterDto, MangaSeriesDto } from "../../shared/types/mangaErp";
import { useToast } from "../../shared/components/toastContext";
import { mangaCoverImages } from "../../shared/visuals/mangaVisuals";
import { resolveMediaUrl } from "../../shared/utils/mediaUrl";

type SeriesRouteState = {
  coverImageUrl?: string;
  seriesId?: string;
};

function fallbackCoverForSeries(seriesId: string) {
  const index = Array.from(seriesId).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  );

  return mangaCoverImages[index % mangaCoverImages.length].image;
}

export default function SeriesDetailPage() {
  const params = useParams();
  const location = useLocation();
  const toast = useToast();
  const [series, setSeries] = useState<MangaSeriesDto | null>(null);
  const [chapters, setChapters] = useState<ChapterDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const routeState = location.state as SeriesRouteState | null;

  useEffect(() => {
    if (!params.id) return;
    let ignore = false;

    async function loadDetail() {
      setIsLoading(true);
      try {
        const [seriesResult, chapterResult] = await Promise.all([
          mangaErpApi.getSeries(params.id!),
          mangaErpApi.getChaptersBySeries(params.id!),
        ]);

        if (!ignore) {
          setSeries(seriesResult);
          setChapters(chapterResult);
        }
      } catch (err) {
        if (!ignore) {
          setSeries(null);
          setChapters([]);
          toast.error(
            "Could not load series detail",
            err instanceof Error ? err.message : "Please try again.",
          );
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadDetail();
    return () => {
      ignore = true;
    };
  }, [params.id, toast]);

  return (
    <div className="space-y-6">
      <Link
        to="/app/series"
        className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 hover:text-cyan-100"
      >
        <ArrowLeft size={16} />
        Back to My Series
      </Link>

      {isLoading ? (
        <div className="rounded-lg border border-white/10 bg-slate-900/75 p-6 text-sm text-slate-300">
          Loading series details...
        </div>
      ) : null}

      {!isLoading && series ? (
        <section className="grid gap-5 rounded-lg border border-white/10 bg-slate-900/75 p-5 lg:grid-cols-[13rem_1fr]">
          <img
            src={
              routeState?.seriesId === series.id && routeState.coverImageUrl
                ? routeState.coverImageUrl
                : resolveMediaUrl(series.coverImageUrl) ||
                  fallbackCoverForSeries(series.id)
            }
            alt={series.title}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = fallbackCoverForSeries(series.id);
            }}
            className="aspect-[2/3] w-full rounded-lg object-cover shadow-xl shadow-slate-950/30"
          />
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-xs font-semibold text-cyan-100">
                {series.status}
              </span>
            </div>
            <h2 className="mt-3 text-3xl font-black text-white">{series.title}</h2>
            <p className="mt-2 text-sm text-slate-400">
              {series.genre ?? "Uncategorized"}
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
              {series.description || "No description is available yet."}
            </p>
          </div>
        </section>
      ) : null}

      {!isLoading && !series ? (
        <div className="rounded-lg border border-white/10 bg-slate-900/75 p-6 text-sm text-slate-300">
          Series details are not available.
        </div>
      ) : null}

      <section className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white">Chapter Activity</h3>
            <p className="mt-1 text-sm text-slate-400">
              Latest chapter status and publication progress.
            </p>
          </div>
          <Link
            to="/app/chapters"
            className="rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100"
          >
            Open Chapters
          </Link>
        </div>

        <div className="mt-5 space-y-3">
          {chapters.length ? (
            chapters.map((chapter) => (
              <article
                key={chapter.id}
                className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-bold text-white">
                    Chapter {chapter.chapterNumber} - {chapter.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {chapter.totalPages} pages
                  </p>
                </div>
                <span className="rounded-md bg-slate-950/70 px-2 py-1 text-sm text-slate-300">
                  {chapter.status}
                </span>
              </article>
            ))
          ) : (
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              No chapters are available for this series yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
