export default function SeriesDecisionPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Series Decision</h1>
      <p className="mt-2 text-slate-400">
        Quyết định tiếp tục, tạm dừng hoặc ưu tiên xuất bản series.
      </p>

      <div className="mt-6 space-y-4">
        {["Celestial Blade", "Neo Spirit", "Moonlit Garden"].map((name) => (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-xl font-semibold text-white">{name}</h2>
            <div className="mt-4 flex gap-3">
              <button className="rounded-xl bg-indigo-600 px-4 py-2 text-white">
                Continue
              </button>
              <button className="rounded-xl bg-slate-700 px-4 py-2 text-white">
                Hold
              </button>
              <button className="rounded-xl bg-red-600 px-4 py-2 text-white">
                Stop
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}