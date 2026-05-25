import { Link } from "react-router-dom";
import { ArrowRight, Calendar, FileText } from "lucide-react";
import { assignedChapters } from "../../shared/constants/assistantWorkSpace";

export default function AssistantChaptersPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
          Assigned Chapters
        </p>
        <h2 className="mt-2 text-3xl font-black text-white">
          Chapter workload
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Track chapter progress, page ranges assigned to you, and upcoming
          deadlines from the Mangaka production plan.
        </p>
      </div>

      <section className="rounded-lg border border-white/10 bg-slate-900 p-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr className="border-b border-white/10">
                <th className="py-3 pr-4">Chapter</th>
                <th className="py-3 pr-4">Series</th>
                <th className="py-3 pr-4">Pages Assigned</th>
                <th className="py-3 pr-4">Progress</th>
                <th className="py-3 pr-4">Deadline</th>
                <th className="py-3 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {assignedChapters.map((chapter) => (
                <tr key={`${chapter.series}-${chapter.chapter}`} className="border-b border-white/10">
                  <td className="py-4 pr-4 font-bold text-white">
                    {chapter.chapter}
                  </td>
                  <td className="py-4 pr-4 text-slate-300">{chapter.series}</td>
                  <td className="py-4 pr-4 text-slate-300">{chapter.pages}</td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-32 rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-cyan-300"
                          style={{ width: `${chapter.progress}%` }}
                        />
                      </div>
                      <span className="text-slate-300">{chapter.progress}%</span>
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-slate-300">{chapter.deadline}</td>
                  <td className="py-4 pr-4">
                    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-slate-200">
                      {chapter.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
{assignedChapters.slice(0, 2).map((chapter) => (
          <article
            key={`${chapter.chapter}-summary`}
            className="rounded-lg border border-white/10 bg-slate-900 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-white">{chapter.chapter}</h3>
                <p className="mt-1 text-sm text-slate-400">{chapter.series}</p>
              </div>
              <FileText size={18} className="text-cyan-200" />
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
              <Calendar size={16} className="text-amber-200" />
              Deadline {chapter.deadline}
            </div>
            <Link
              to="/assistant/tasks"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-100"
            >
              Open Tasks
              <ArrowRight size={15} />
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
