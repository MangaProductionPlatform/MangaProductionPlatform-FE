export default function PublishingQueuePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Publishing Queue</h1>
      <p className="mt-2 text-slate-400">
        Các chương đã hoàn tất review và sẵn sàng chuyển sang xuất bản.
      </p>

      <div className="mt-6 space-y-4">
        {["Chapter 27", "Chapter 13", "Chapter 06"].map((chapter) => (
          <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div>
              <h2 className="font-semibold text-white">{chapter}</h2>
              <p className="text-sm text-slate-400">Ready for publishing</p>
            </div>

            <button className="rounded-xl bg-emerald-600 px-4 py-2 text-white">
              Approve
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}