export default function AnnotationsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Annotations</h1>
      <p className="mt-2 text-slate-400">
        Ghi chú nội dung, panel, thoại và lỗi cần chỉnh sửa.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <textarea
          placeholder="Nhập ghi chú biên tập..."
          className="h-56 w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none"
        />

        <button className="mt-4 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white">
          Save Annotation
        </button>
      </div>
    </div>
  );
}