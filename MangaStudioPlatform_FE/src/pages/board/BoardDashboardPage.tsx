export default function BoardDashboardPage() {
  const stats = [
    ["Waiting Approval", "6"],
    ["Ready to Publish", "4"],
    ["Rejected Drafts", "2"],
    ["Quality Score", "91%"],
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-7">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-400">
          Editorial Board
        </p>
        <h1 className="mt-3 text-4xl font-bold text-white">
          Board Decision Dashboard
        </h1>
        <p className="mt-3 text-slate-400">
          Quản lý phê duyệt cuối cùng, kiểm tra chất lượng nội dung và quyết định xuất bản.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        {stats.map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
          >
            <p className="text-sm text-slate-400">{label}</p>
            <h2 className="mt-3 text-3xl font-bold text-white">{value}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}