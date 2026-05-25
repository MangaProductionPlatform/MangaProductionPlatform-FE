export default function SeriesProposalsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white">
        Series Proposals
      </h1>

      <p className="mt-2 text-slate-400">
        Danh sách đề xuất series mới từ editor và author.
      </p>

      <div className="mt-6 space-y-4">
        {[
          "Celestial Blade Reboot",
          "Neo Spirit Season 2",
          "Moonlit Garden Spin-off",
        ].map((item) => (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold text-white">
              {item}
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Waiting for board voting.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}