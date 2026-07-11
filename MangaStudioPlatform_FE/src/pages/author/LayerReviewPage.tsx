import { CheckCircle2, RotateCcw, Send } from "lucide-react";

const layers = [
  {
    id: 1,
    chapter: "Celestial Blade - Chapter 27",
    page: "Page 12",
    layer: "Background",
    assistant: "Assistant A",
    status: "Waiting Review",
  },
  {
    id: 2,
    chapter: "Neo Spirit - Chapter 13",
    page: "Page 08",
    layer: "Color",
    assistant: "Assistant B",
    status: "Waiting Review",
  },
];

export default function LayerReviewPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-7">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-400">
          Layer Review
        </p>

        <h1 className="mt-3 text-4xl font-bold text-white">
          Review Assistant Layers
        </h1>

        <p className="mt-3 text-slate-400">
          Mangaka kiểm tra layer Assistant đã upload, sau đó accept hoặc yêu cầu
          chỉnh sửa.
        </p>
      </div>

      <div className="space-y-4">
        {layers.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {item.chapter}
                </h2>

                <p className="mt-2 text-slate-400">
                  {item.page} - {item.layer}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Submitted by: {item.assistant}
                </p>
              </div>

              <span className="rounded-full bg-yellow-500/10 px-4 py-2 text-sm text-yellow-300">
                {item.status}
              </span>
            </div>

            <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950 p-5 text-slate-400">
              Artwork layer preview placeholder
            </div>

            <textarea
              placeholder="Nhập nhận xét cho Assistant..."
              className="mt-5 h-28 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none"
            />

            <div className="mt-4 flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-500">
                <CheckCircle2 size={18} />
                Accept
              </button>

              <button className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-3 font-semibold text-white hover:bg-amber-500">
                <RotateCcw size={18} />
                Request Revision
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
        <h2 className="text-xl font-semibold text-white">
          All required layers completed?
        </h2>

        <p className="mt-2 text-slate-400">
          Khi các layer cần thiết đã được duyệt, Mangaka có thể gửi chapter sang
          Editorial QA.
        </p>

        <button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-500">
          <Send size={18} />
          Send to Editorial QA
        </button>
      </div>
    </div>
  );
}
