import { BookOpen, ClipboardList, Plus } from "lucide-react";

const chapters = [
  {
    id: 1,
    series: "Celestial Blade",
    chapter: "Chapter 27",
    status: "Drafting",
    pages: 24,
    completedLayers: "18/24",
  },
  {
    id: 2,
    series: "Neo Spirit",
    chapter: "Chapter 13",
    status: "In Progress",
    pages: 18,
    completedLayers: "10/18",
  },
];

export default function AuthorChaptersPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-7">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-400">
          Mangaka Workflow
        </p>

        <h1 className="mt-3 text-4xl font-bold text-white">
          My Chapters
        </h1>

        <p className="mt-3 text-slate-400">
          Chọn chapter để tạo task theo layer và phân công cho Assistant.
        </p>
      </div>

      <div className="grid gap-5">
        {chapters.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <BookOpen className="text-indigo-400" size={22} />

                  <h2 className="text-xl font-semibold text-white">
                    {item.series}
                  </h2>
                </div>

                <p className="mt-2 text-slate-400">{item.chapter}</p>

                <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                  <span>Pages: {item.pages}</span>
                  <span>Layers: {item.completedLayers}</span>
                  <span>Status: {item.status}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <a
                  href={`/app/author/chapters/${item.id}/tasks/setup`}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  <Plus size={16} />
                  Create Task
                </a>

                <a
                  href="/app/author/layer-review"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
                >
                  <ClipboardList size={16} />
                  Review Layers
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}