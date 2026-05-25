import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  FileArchive,
  FileImage,
  FileText,
  MessageSquare,
  Send,
  UploadCloud,
} from "lucide-react";
import { assistantComments, assistantTasks } from "../../shared/constants/assistantWorkSpace";


export default function AssistantTaskDetailPage() {
  const params = useParams();
  const task =
    assistantTasks.find((item) => item.id === params.id) ?? assistantTasks[0];
  const thumbnails = assistantTasks.slice(0, 5);

  return (
    <div className="space-y-5">
      <Link
        to="/assistant/tasks"
        className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 hover:text-cyan-100"
      >
        <ArrowLeft size={16} />
        Back to My Tasks
      </Link>

      <div className="grid gap-5 xl:grid-cols-[10rem_1fr_22rem]">
        <aside className="rounded-lg border border-white/10 bg-slate-900 p-4">
          <h3 className="text-sm font-bold text-white">Pages</h3>
          <div className="mt-4 space-y-3">
            {thumbnails.map((item) => (
              <Link
                key={item.id}
                to={`/assistant/tasks/${item.id}`}
                className={`block rounded-lg border p-2 transition ${
                  item.id === task.id
                    ? "border-cyan-300/50 bg-cyan-300/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <img
                  src={item.image}
                  alt={`${item.title} ${item.page}`}
                  className="aspect-[2/3] w-full rounded-md object-cover"
                />
                <p className="mt-2 truncate text-xs font-semibold text-white">
                  {item.page}
                </p>
              </Link>
            ))}
          </div>
        </aside>

        <main className="rounded-lg border border-white/10 bg-slate-900 p-4">
          <div className="flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                Manga Canvas
              </p>
              <h2 className="mt-1 text-2xl font-black text-white">
                {task.series} • {task.chapter} • {task.page}
              </h2>
            </div>
            <span className={priorityTone(task.priority)}>{task.priority}</span>
          </div>

          <div className="mt-5 flex min-h-[42rem] items-center justify-center rounded-lg border border-white/10 bg-slate-950/70 p-4">
            <img
              src={task.image}
              alt={`${task.title} canvas`}
              className="max-h-[40rem] w-auto rounded-md object-contain shadow-2xl shadow-slate-950/40"
            />
          </div>
        </main>

        <aside className="space-y-4">
<section className="rounded-lg border border-white/10 bg-slate-900 p-4">
            <h3 className="font-bold text-white">Task Information</h3>
            <div className="mt-4 space-y-3">
              <Info label="Task title" value={task.title} />
              <Info label="Assigned region" value={task.region} />
              <Info label="Deadline" value={task.deadline} />
              <Info label="Status" value={task.status} />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              {task.instruction}
            </p>
          </section>

          <section className="rounded-lg border border-white/10 bg-slate-900 p-4">
            <h3 className="font-bold text-white">Download Resources</h3>
            <div className="mt-4 grid gap-2">
              <Resource icon={<FileImage size={16} />} label="Download PSD" />
              <Resource icon={<FileArchive size={16} />} label="Download References" />
              <Resource icon={<FileText size={16} />} label="Download Manuscript" />
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-slate-900 p-4">
            <h3 className="font-bold text-white">Upload Result</h3>
            <div className="mt-4 space-y-3">
              <input className="input" type="file" />
              <input className="input" type="file" />
              <input className="input" type="file" />
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
                <UploadCloud size={16} />
                Upload Files
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-slate-900 p-4">
            <div className="flex items-center gap-2 text-white">
              <MessageSquare size={17} className="text-cyan-200" />
              <h3 className="font-bold">Comments</h3>
            </div>
            <div className="mt-4 space-y-3">
              {assistantComments.map((comment) => (
                <div
                  key={`${comment.author}-${comment.time}`}
                  className="rounded-lg border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">
                      {comment.author}
                    </p>
                    <span className="text-xs text-slate-500">
                      {comment.time}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-5 text-slate-300">
                    {comment.text}
                  </p>
                </div>
              ))}
            </div>
          </section>
<button className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 hover:bg-cyan-200">
            <Send size={16} />
            Submit for Review
          </button>
        </aside>
      </div>
    </div>
  );
}

function Resource({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button className="inline-flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10">
      <span className="inline-flex items-center gap-2">
        <span className="text-cyan-200">{icon}</span>
        {label}
      </span>
      <Download size={15} />
    </button>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function priorityTone(priority: string) {
  if (priority === "High") {
    return "rounded-md border border-rose-300/30 bg-rose-300/10 px-3 py-1.5 text-sm font-bold text-rose-100";
  }

  if (priority === "Medium") {
    return "rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-sm font-bold text-amber-100";
  }

  return "rounded-md border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-sm font-bold text-emerald-100";
}
