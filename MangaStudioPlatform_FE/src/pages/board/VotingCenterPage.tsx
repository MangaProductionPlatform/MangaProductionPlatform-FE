export default function BoardApprovalQueuePage() {
  const items = [
    ["Celestial Blade", "Chapter 27", "Final Approval"],
    ["Neo Spirit", "Chapter 13", "Content Check"],
    ["Moonlit Garden", "Chapter 06", "Publishing Review"],
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Approval Queue</h1>
      <p className="mt-2 text-slate-400">
        Danh sách chương đang chờ hội đồng biên tập phê duyệt.
      </p>

      <div className="mt-6 space-y-4">
        {items.map(([series, chapter, status]) => (
          <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div>
              <h2 className="text-xl font-semibold text-white">{series}</h2>
              <p className="text-slate-400">{chapter}</p>
            </div>
            <span className="rounded-full bg-indigo-500/10 px-4 py-2 text-sm text-indigo-300">
              {status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}