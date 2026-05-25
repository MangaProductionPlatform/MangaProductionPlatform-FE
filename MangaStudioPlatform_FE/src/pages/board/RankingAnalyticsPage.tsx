export default function QualityReportsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Quality Reports</h1>
      <p className="mt-2 text-slate-400">
        Báo cáo chất lượng nội dung, artwork, pacing và độ phù hợp xuất bản.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {[
          ["Story Quality", "92%"],
          ["Artwork Quality", "88%"],
          ["Publishing Readiness", "95%"],
        ].map(([label, value]) => (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">{label}</p>
            <h2 className="mt-3 text-3xl font-bold text-white">{value}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}