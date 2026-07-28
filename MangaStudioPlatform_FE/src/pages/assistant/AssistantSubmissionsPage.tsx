import { useEffect, useState } from "react";
import { RefreshCw, UploadCloud } from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import { useToast } from "../../shared/components/toastContext";

const read = (item: Record<string, unknown>, ...keys: string[]) =>
  keys
    .map((key) => item[key])
    .find((value) => value !== undefined && value !== null);

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

function readRelatedTaskId(item: Record<string, unknown>) {
  return read(
    item,
    "pageTaskId",
    "PageTaskId",
    "taskId",
    "TaskId",
    "pageId",
    "PageId",
  );
}

function formatSubmissionTask(item: Record<string, unknown>) {
  const explicitTitle = read(item, "pageTaskTitle", "taskTitle");

  if (explicitTitle) {
    return String(explicitTitle);
  }

  const chapterTitle = read(item, "chapterTitle", "chapterName");
  const chapterNumber = read(item, "chapterNumber");
  const pageNumber = read(item, "pageNumber");
  const layerType = read(item, "layerType", "LayerType");
  const chapterLabel =
    chapterTitle ??
    (chapterNumber ? `Chapter ${String(chapterNumber)}` : "Submitted page");
  const pageLabel = pageNumber ? `Page ${String(pageNumber)}` : "Page task";

  return `${String(chapterLabel)} - ${pageLabel}${
    layerType ? ` - ${String(layerType)}` : ""
  }`;
}

function getSubmissionMeta(item: Record<string, unknown>) {
  const seriesTitle = read(
    item,
    "seriesTitle",
    "SeriesTitle",
    "seriesName",
    "SeriesName",
    "mangaTitle",
    "MangaTitle",
    "mangaName",
    "MangaName",
  );
  const chapterTitle = read(
    item,
    "chapterTitle",
    "ChapterTitle",
    "chapterName",
    "ChapterName",
  );

  return {
    taskTitle: formatSubmissionTask(item),
    seriesTitle: seriesTitle ? String(seriesTitle) : "Series not provided",
    chapterTitle: chapterTitle ? String(chapterTitle) : null,
    chapterNumber: read(item, "chapterNumber", "ChapterNumber"),
    pageNumber: read(item, "pageNumber"),
    layerType: read(item, "layerType", "LayerType"),
    version: read(item, "version", "Version"),
    submittedAt: read(item, "submittedAt", "createdAt", "SubmittedAt"),
    status: String(read(item, "status", "Status") ?? "Unknown"),
  };
}

function formatSubmittedAt(value: unknown) {
  if (!value) return "-";

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function statusClassName(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes("approved")) {
    return "border-emerald-300/30 bg-emerald-400/10 text-emerald-200";
  }

  if (normalized.includes("archived") || normalized.includes("replaced")) {
    return "border-slate-500/30 bg-slate-700/50 text-slate-300";
  }

  if (normalized.includes("rejected") || normalized.includes("revision")) {
    return "border-rose-300/30 bg-rose-400/10 text-rose-200";
  }

  return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
}

export default function AssistantSubmissionsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [submissionItems, assignedTasks, seriesItems] = await Promise.all([
        mangaErpApi.getAssistantSubmissions(),
        mangaErpApi.getAssignedPageTasks().catch(() => []),
        mangaErpApi.getMySeries().catch(() => []),
      ]);
      const taskIds = Array.from(
        new Set(
          submissionItems
            .map((item) => readRelatedTaskId(asRecord(item)))
            .filter((value): value is string => typeof value === "string"),
        ),
      );
      const taskDetails = await Promise.all(
        taskIds.map((taskId) =>
          mangaErpApi
            .getPageTask(taskId)
            .then((task) => [taskId, task] as const)
            .catch(() => null),
        ),
      );
      const tasksById = new Map(
        assignedTasks.map((task) => [task.id, asRecord(task)]),
      );

      taskDetails.forEach((entry) => {
        if (entry) {
          const [taskId, task] = entry;
          tasksById.set(taskId, {
            ...(tasksById.get(taskId) ?? {}),
            ...asRecord(task),
          });
        }
      });

      const chapterIds = Array.from(
        new Set(
          Array.from(tasksById.values())
            .map((task) => read(task, "chapterId", "ChapterId"))
            .filter((value): value is string => typeof value === "string"),
        ),
      );
      const chapterDetails = await Promise.all(
        chapterIds.map((chapterId) =>
          mangaErpApi
            .getChapter(chapterId)
            .then((chapter) => [chapterId, chapter] as const)
            .catch(() => null),
        ),
      );
      const chaptersById = new Map<string, Record<string, unknown>>();

      chapterDetails.forEach((entry) => {
        if (entry) {
          const [chapterId, chapter] = entry;
          chaptersById.set(chapterId, asRecord(chapter));
        }
      });
      const seriesById = new Map(seriesItems.map((series) => [series.id, series]));
      const seriesIds = Array.from(
        new Set(
          submissionItems
            .map((item) => asRecord(item))
            .flatMap((submission) => {
              const taskId = readRelatedTaskId(submission);
              const task =
                typeof taskId === "string" ? (tasksById.get(taskId) ?? {}) : {};
              const chapterId = read(task, "chapterId", "ChapterId");
              const chapter =
                typeof chapterId === "string"
                  ? (chaptersById.get(chapterId) ?? {})
                  : {};

              return [
                read(submission, "seriesId", "SeriesId"),
                read(task, "seriesId", "SeriesId"),
                read(chapter, "seriesId", "SeriesId"),
              ];
            })
            .filter(
              (value): value is string =>
                typeof value === "string" && !seriesById.has(value),
            ),
        ),
      );
      const seriesDetails = await Promise.all(
        seriesIds.map((seriesId) =>
          mangaErpApi
            .getSeries(seriesId)
            .then((series) => [seriesId, series] as const)
            .catch(() => null),
        ),
      );

      seriesDetails.forEach((entry) => {
        if (entry) {
          const [seriesId, series] = entry;
          seriesById.set(seriesId, series);
        }
      });

      setItems(
        submissionItems.map((item) => {
          const submission = asRecord(item);
          const taskId = readRelatedTaskId(submission);
          const task =
            typeof taskId === "string" ? (tasksById.get(taskId) ?? {}) : {};
          const chapterId = read(task, "chapterId", "ChapterId");
          const chapter =
            typeof chapterId === "string"
              ? (chaptersById.get(chapterId) ?? {})
              : {};
          const seriesId = read(
            submission,
            "seriesId",
            "SeriesId",
          ) ?? read(task, "seriesId", "SeriesId") ?? read(chapter, "seriesId", "SeriesId");
          const seriesTitle =
            read(submission, "seriesTitle", "SeriesTitle") ??
            read(task, "seriesTitle", "SeriesTitle") ??
            read(chapter, "seriesTitle", "SeriesTitle") ??
            (typeof seriesId === "string" ? seriesById.get(seriesId)?.title : null);

          return {
            ...task,
            ...chapter,
            ...submission,
            seriesTitle,
            chapterTitle:
              read(submission, "chapterTitle", "ChapterTitle") ??
              read(task, "chapterTitle", "ChapterTitle") ??
              read(chapter, "title", "Title"),
            chapterNumber:
              read(submission, "chapterNumber", "ChapterNumber") ??
              read(task, "chapterNumber", "ChapterNumber") ??
              read(chapter, "chapterNumber", "ChapterNumber"),
            pageNumber:
              read(submission, "pageNumber", "PageNumber") ??
              read(task, "pageNumber", "PageNumber"),
          };
        }),
      );
    } catch (error) {
      toast.error(
        "Could not load submission history",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.28em] text-cyan-200">
            Assistant - MF2
          </p>
          <h1 className="mt-2 text-3xl font-black text-white">
            Layer submissions
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Your submitted artwork layers and their current review status.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="icon-button"
          title="Refresh"
        >
          <RefreshCw size={17} />
        </button>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/10">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-slate-950 text-xs uppercase tracking-[.14em] text-slate-500">
              <tr>
                <th className="px-5 py-4">Task</th>
                <th className="px-5 py-4">Layer</th>
                <th className="px-5 py-4">Version</th>
                <th className="px-5 py-4">Submitted</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const meta = getSubmissionMeta(item);

                return (
                  <tr
                    key={String(
                      read(item, "id", "layerId", "submissionId") ?? index,
                    )}
                    className="border-t border-slate-800/80 transition hover:bg-slate-800/35"
                  >
                    <td className="px-5 py-4">
                      <p className="text-xs font-bold uppercase tracking-[.14em] text-cyan-200">
                        {meta.seriesTitle}
                      </p>
                      <p className="mt-1 max-w-xl font-semibold text-white">
                        {meta.chapterTitle ??
                          (meta.chapterNumber
                            ? `Chapter ${String(meta.chapterNumber)}`
                            : meta.taskTitle)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-xs font-semibold text-cyan-100">
                          {meta.pageNumber
                            ? `Page ${String(meta.pageNumber)}`
                            : "Page task"}
                        </span>
                        <span className="rounded-md border border-violet-300/20 bg-violet-300/10 px-2 py-1 text-xs font-semibold text-violet-100">
                          {String(meta.layerType ?? "General layer")}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {String(meta.layerType ?? "-")}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-md bg-slate-950 px-2.5 py-1 text-sm font-bold text-slate-200">
                        v{String(meta.version ?? "-")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {formatSubmittedAt(meta.submittedAt)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusClassName(meta.status)}`}
                      >
                        {meta.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {!loading && !items.length ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400">
                    <UploadCloud className="mx-auto mb-3" />
                    No layer submissions yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
