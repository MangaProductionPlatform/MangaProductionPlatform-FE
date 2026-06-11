import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Ban } from "lucide-react";
import {
  mangaErpApi,
  type ChapterDto,
  type MangaSeriesDto,
} from "../../shared/api/mangaErpApi";
import { useToast } from "../../shared/components/ToastProvider";

export default function SeriesDetailPage() {
  const params = useParams();
  const toast = useToast();
  const [series, setSeries] = useState<MangaSeriesDto | null>(null);
  const [chapters, setChapters] = useState<ChapterDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

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

  const handleCancelSeries = async () => {
    if (!series) return;

    setIsCancelling(true);
    try {
      await mangaErpApi.cancelSeries(series.id);
      toast.success("Series cancelled", "The backend accepted the cancellation request.");
      const refreshed = await mangaErpApi.getSeries(series.id);
      setSeries(refreshed);
    } catch (err) {
      toast.error(
        "Could not cancel series",
        err instanceof Error ? err.message : "Please check your role and try again.",
      );
    } finally {
      setIsCancelling(false);
    }
  };

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
          Loading series detail from backend...
        </div>
      ) : null}

      {!isLoading && series ? (
        <section className="grid gap-5 rounded-lg border border-white/10 bg-slate-900/75 p-5 lg:grid-cols-[13rem_1fr]">
          <img
            src={series.coverImageUrl || "/favicon.svg"}
            alt={series.title}
            className="aspect-[2/3] w-full rounded-lg object-cover shadow-xl shadow-slate-950/30"
          />
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-xs font-semibold text-cyan-100">
                {series.status}
              </span>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelSeries}
                className="inline-flex items-center gap-2 rounded-lg border border-rose-300/30 bg-rose-300/10 px-3 py-2 text-sm font-bold text-rose-100 hover:bg-rose-300/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Ban size={16} />
                {isCancelling ? "Cancelling..." : "Cancel Series"}
              </button>
            </div>
            <h2 className="mt-3 text-3xl font-black text-white">{series.title}</h2>
            <p className="mt-2 text-sm text-slate-400">
              {series.genre ?? "Uncategorized"}
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
              {series.description || "No description from backend."}
            </p>
          </div>
        </section>
      ) : null}

      {!isLoading && !series ? (
        <div className="rounded-lg border border-white/10 bg-slate-900/75 p-6 text-sm text-slate-300">
          No series detail found from backend.
        </div>
      ) : null}

      <section className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white">Chapter Activity</h3>
            <p className="mt-1 text-sm text-slate-400">
              Latest chapter status from backend.
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
              No chapters found from backend for this series.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
