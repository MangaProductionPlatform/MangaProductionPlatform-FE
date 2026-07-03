import { Send } from "lucide-react";

const assistants = ["Assistant A", "Assistant B", "Assistant C"];

export default function ChapterTaskSetupPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-7">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-400">
          Create Page Task
        </p>

        <h1 className="mt-3 text-4xl font-bold text-white">
          Assign Layer Task
        </h1>

        <p className="mt-3 text-slate-400">
          Mangaka tạo task theo layer và giao cho Assistant.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-sm text-slate-400">Page Number</label>
            <input
              placeholder="VD: Page 12"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400">Layer Type</label>
            <select className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none">
              <option>Sketch</option>
              <option>Lineart</option>
              <option>Background</option>
              <option>Coloring</option>
              <option>Effect</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-400">Assistant</label>
            <select className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none">
              {assistants.map((assistant) => (
                <option key={assistant}>{assistant}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-400">Deadline</label>
            <input
              type="date"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
            />
          </div>
        </div>

        <textarea
          placeholder="Mô tả yêu cầu cho Assistant..."
          className="mt-5 h-32 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none"
        />

        <button className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-500">
          <Send size={18} />
          Assign Task
        </button>
      </div>
    </div>
  );
}
