export default function PublicationReviewPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Publication Review</h1>
      <p className="mt-2 text-slate-400">
        Kiểm tra nội dung, lịch phát hành và trạng thái xuất bản.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <textarea
          placeholder="Nhập nhận xét của hội đồng..."
          className="h-56 w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none"
        />

        <div className="mt-4 flex gap-3">
          <button className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white">
            Approve
          </button>
          <button className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white">
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}