import { ArrowRight, Flame } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type {
  MangaSeriesDto,
  RankingBoardItemDto,
} from "../../shared/types/mangaErp";
import { useToast } from "../../shared/components/toastContext";

function getCurrentVotePeriod() {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - yearStart.getTime()) / 86400000);
  const week = Math.ceil((days + yearStart.getDay() + 1) / 7);

  return `${now.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

export default function RankingPage() {
  const toast = useToast();
  const [votePeriod, setVotePeriod] = useState(getCurrentVotePeriod);
  const [rankingBoard, setRankingBoard] = useState<RankingBoardItemDto[]>([]);
  const [seriesList, setSeriesList] = useState<MangaSeriesDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadRanking() {
      setIsLoading(true);
      try {
        const [rankingResult, seriesResult] = await Promise.all([
          mangaErpApi.getRankingBoard(votePeriod),
          mangaErpApi.getAllSeries(),
        ]);
        if (!ignore) {
          setRankingBoard(rankingResult);
          setSeriesList(seriesResult);
        }
      } catch (err) {
        if (!ignore) {
          setRankingBoard([]);
          toast.error(
            "Could not load ranking board",
            err instanceof Error ? err.message : "Please check that Ranking service is running.",
          );
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadRanking();
    return () => {
      ignore = true;
    };
  }, [votePeriod, toast]);

  const seriesById = useMemo(
    () => new Map(seriesList.map((series) => [series.id, series])),
    [seriesList],
  );

  const displayItems = rankingBoard.map((item) => {
    const series = seriesById.get(item.seriesId);

    return {
      rank: item.rank,
      title: series?.title ?? item.seriesId,
      genre: series?.genre ?? item.votePeriod,
      image: series?.coverImageUrl,
      score: String(item.totalVotes),
    };
  });

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
              This page only displays ranking records returned by the backend.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-100">
            <Flame size={16} />
            Backend ranking
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-[1rem] border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="text-sm text-slate-300">
            Vote period
            <input
              className="ml-3 rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none"
              value={votePeriod}
              onChange={(event) => setVotePeriod(event.target.value)}
              placeholder={getCurrentVotePeriod()}
            />
          </label>
        </div>

        <div className="mt-8 space-y-4">
          {isLoading ? (
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
              Loading ranking from backend...
            </div>
          ) : null}

          {!isLoading && displayItems.length === 0 ? (
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
              No ranking records found from backend for this vote period.
            </div>
          ) : null}

          {!isLoading &&
            displayItems.map((item) => (
              <div
                key={`${item.rank}-${item.title}`}
                className="flex flex-col gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-rose-400 to-fuchsia-500 text-xl font-black text-slate-950">
                    {item.rank}
                  </div>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-24 w-16 rounded-2xl border border-white/10 object-cover shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
                    />
                  ) : (
                    <div className="flex h-24 w-16 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/70 text-xs font-bold uppercase text-slate-500">
                      No cover
                    </div>
                  )}
                  <div>
                    <p className="text-xl font-bold text-white">{item.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-amber-200/70">
                      {item.genre}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Votes
                  </p>
                  <p className="mt-1 text-2xl font-bold text-amber-300">
                    {item.score}
                  </p>
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
