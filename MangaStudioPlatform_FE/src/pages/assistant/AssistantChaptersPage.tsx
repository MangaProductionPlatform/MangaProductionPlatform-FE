import { useEffect, useMemo, useState } from "react";
import { BookOpen, RefreshCw } from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { PageTaskDto } from "../../shared/types/mangaErp";
import { useToast } from "../../shared/components/toastContext";

export default function AssistantChaptersPage() {
  const toast = useToast();
  const [tasks, setTasks] = useState<PageTaskDto[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try {
      setTasks(await mangaErpApi.getAssignedPageTasks());
    } catch (error) {
      toast.error(
        "Could not load assigned chapters",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setLoading(false);
    }
  };
  // Initial backend load only.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const chapters = useMemo(
    () =>
      Object.values(
        tasks.reduce<
          Record<
            string,
            { title: string; number?: number; total: number; completed: number }
          >
        >((result, task) => {
          const key = task.chapterId || task.chapterTitle || "unknown";
          const current = result[key] ?? {
            title: task.chapterTitle || "Untitled chapter",
            number: task.chapterNumber,
            total: 0,
            completed: 0,
          };
          current.total += 1;
          if (
            ["approved", "accepted", "complete", "completed"].includes(
              task.status.toLowerCase(),
            )
          )
            current.completed += 1;
          result[key] = current;
          return result;
        }, {}),
      ),
    [tasks],
  );
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.28em] text-cyan-200">
            Assistant
          </p>
          <h1 className="mt-2 text-3xl font-black text-white">
            Assigned chapters
          </h1>
        </div>
        <button
          type="button"
          title="Refresh assigned chapters"
          onClick={() => void load()}
          className="icon-button"
        >
          <RefreshCw size={17} />
        </button>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {chapters.map((chapter) => (
          <article
            key={`${chapter.number}-${chapter.title}`}
            className="border border-white/10 bg-slate-900 p-5"
          >
            <BookOpen size={20} className="text-cyan-200" />
            <h2 className="mt-4 font-bold text-white">
              {chapter.number ? `Ch. ${chapter.number}: ` : ""}
              {chapter.title}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {chapter.completed} of {chapter.total} assigned page task(s)
              approved
            </p>
          </article>
        ))}
        {!loading && !chapters.length ? (
          <p className="border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">
            No chapters are assigned to you.
          </p>
        ) : null}
      </div>
    </div>
  );
}
