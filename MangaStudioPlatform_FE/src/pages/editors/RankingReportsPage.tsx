export default function RankingReportsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Ranking & Reports</h1>
      <p className="mt-2 text-slate-400">
        Báo cáo hiệu suất series, số lượng review và mức độ hoàn thành.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {[
          ["Top Series", "Celestial Blade"],
          ["Most Reviewed", "Neo Spirit"],
          ["Best Score", "9.5"],
        ].map(([label, value]) => (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">{label}</p>
            <h2 className="mt-3 text-2xl font-bold text-white">{value}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}