export default function SeriesMonitoringPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Series Monitoring</h1>
      <p className="mt-2 text-slate-400">
        Theo dõi tiến độ các series mà Editor đang phụ trách.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {["Celestial Blade", "Neo Spirit", "Moonlit Garden"].map((name) => (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-xl font-semibold text-white">{name}</h2>
            <p className="mt-2 text-slate-400">Progress: 75%</p>
            <div className="mt-4 h-2 rounded-full bg-slate-800">
              <div className="h-2 w-3/4 rounded-full bg-indigo-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}