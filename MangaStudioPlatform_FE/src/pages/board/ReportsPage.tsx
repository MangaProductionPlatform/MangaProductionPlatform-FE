    export default function ReportsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white">
        Reports
      </h1>

      <p className="mt-2 text-slate-400">
        Tổng hợp báo cáo hoạt động và hiệu suất xuất bản.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {[
          ["Published Chapters", "512"],
          ["Cancelled Series", "4"],
          ["Approval Success Rate", "91%"],
        ].map(([label, value]) => (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              {label}
            </p>

            <h2 className="mt-3 text-3xl font-bold text-white">
              {value}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}