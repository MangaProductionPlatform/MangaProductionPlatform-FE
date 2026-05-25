export default function ReviewQueuePage() {
  const reviews = [
    ["Celestial Blade", "Chapter 27", "Urgent", "Today 18:00"],
    ["Neo Spirit", "Chapter 12", "Reviewing", "Tomorrow"],
    ["Moonlit Garden", "Chapter 05", "New", "May 26"],
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Review Queue</h1>
      <p className="mt-2 text-slate-400">Danh sách bản thảo đang chờ Editor duyệt.</p>

      <div className="mt-6 space-y-4">
        {reviews.map(([title, chapter, status, due]) => (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="mt-1 text-slate-400">{chapter}</p>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-indigo-300">{status}</span>
              <span className="text-slate-500">{due}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}