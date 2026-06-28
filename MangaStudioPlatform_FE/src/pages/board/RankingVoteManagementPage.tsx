import { useState } from "react";
import { BarChart3, RefreshCw, Send } from "lucide-react";
import { rankingService } from "../../shared/services/rankingService";

export default function RankingVoteManagementPage() {
  const [seriesId, setSeriesId] = useState("");
  const [votePeriod, setVotePeriod] = useState("2026-W01");
  const [rawVotes, setRawVotes] = useState(0);
  const [rankingItems, setRankingItems] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  async function handleImportVote() {
    try {
      await rankingService.importVote({
        SeriesId: seriesId.trim(),
        VotePeriod: votePeriod.trim(),
        RawVotes: rawVotes,
      });
      setMessage("Import vote thành công.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Import vote thất bại.");
    }
  }

  async function handleLoadRanking() {
    try {
      const result = await rankingService.getRankingBoard(votePeriod.trim());
      setRankingItems(Array.isArray(result) ? result : []);
      setMessage("Load ranking thành công.");
    } catch (err) {
      setRankingItems([]);
      setMessage(err instanceof Error ? err.message : "Load ranking thất bại.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Editorial Board
        </p>
        <h1 className="mt-2 text-3xl font-black text-white">
          Ranking Vote Management
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Nhập dữ liệu vote thô và xem bảng xếp hạng series theo kỳ bình chọn.
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <Send size={20} className="text-cyan-300" />
            Import Raw Votes
          </h2>

          <div className="mt-5 space-y-4">
            <input
              value={seriesId}
              onChange={(e) => setSeriesId(e.target.value)}
              placeholder="Series ID"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
            />

            <input
              value={votePeriod}
              onChange={(e) => setVotePeriod(e.target.value)}
              placeholder="Vote Period, ví dụ 2026-W01"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
            />

            <input
              type="number"
              value={rawVotes}
              onChange={(e) => setRawVotes(Number(e.target.value))}
              placeholder="Raw Votes"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
            />

            <button
              type="button"
              onClick={handleImportVote}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white hover:bg-cyan-500"
            >
              <Send size={18} />
              Import Votes
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <BarChart3 size={20} className="text-cyan-300" />
            Ranking Board
          </h2>

          <button
            type="button"
            onClick={handleLoadRanking}
            className="mt-5 flex items-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 font-semibold text-cyan-200 hover:bg-cyan-300/15"
          >
            <RefreshCw size={18} />
            Load Ranking
          </button>

          {message && (
            <div className="mt-5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-200">
              {message}
            </div>
          )}

          <div className="mt-5 space-y-3">
            {rankingItems.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-200"
              >
                <p className="font-bold">
                  #{index + 1} {item.seriesTitle ?? item.title ?? "Untitled Series"}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Votes: {item.rawVotes ?? item.votes ?? "N/A"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}