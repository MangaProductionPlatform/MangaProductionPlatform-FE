import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ClipboardList, Copy, Send, Upload } from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { ChapterDto, MangaSeriesDto } from "../../shared/types/mangaErp";
import { useToast } from "../../shared/components/toastContext";

type ChapterLike = ChapterDto & {
  chapterId?: string;
  ChapterId?: string;
  Id?: string;
};

type ChapterManagementNavigationState = {
  seriesId?: string;
};

function getChapterId(chapter: ChapterLike | null | undefined) {
  return (
    chapter?.id ?? chapter?.chapterId ?? chapter?.ChapterId ?? chapter?.Id ?? ""
  );
}

export default function ChapterManagementPage() {
  const toast = useToast();
  const location = useLocation();
  const navigationState =
    location.state as ChapterManagementNavigationState | null;
  const requestedSeriesId = navigationState?.seriesId;
  const [seriesList, setSeriesList] = useState<MangaSeriesDto[]>([]);
  const [chapters, setChapters] = useState<ChapterDto[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<ChapterDto | null>(
    null,
  );
  const [selectedSeriesId, setSelectedSeriesId] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterNumber, setChapterNumber] = useState("1");
  const [totalPages, setTotalPages] = useState("24");
  const [detailChapterId, setDetailChapterId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingQA, setIsSubmittingQA] = useState(false);

  const currentUser = JSON.parse(
    localStorage.getItem("currentUser") || "null",
  ) as { userId?: string } | null;

  useEffect(() => {
    let ignore = false;

    async function load() {
      setIsLoading(true);

      try {
        const seriesResult = await mangaErpApi.getMySeries();

        if (ignore) return;

        setSeriesList(seriesResult);

        const preferredSeriesId =
          requestedSeriesId &&
          seriesResult.some((item) => item.id === requestedSeriesId)
            ? requestedSeriesId
            : (seriesResult[0]?.id ?? "");

        setSelectedSeriesId(preferredSeriesId);

        if (!preferredSeriesId) {
          setChapters([]);
          setSelectedChapter(null);
          setDetailChapterId("");
          return;
        }

        const chapterResult =
          await mangaErpApi.getChaptersBySeries(preferredSeriesId);

        if (ignore) return;

        setChapters(chapterResult);

        const firstChapterId = getChapterId(chapterResult[0] as ChapterLike);

        setDetailChapterId(firstChapterId);

        if (firstChapterId) {
          const detail = await mangaErpApi.getChapter(firstChapterId);
          if (!ignore) setSelectedChapter(detail);
        } else {
          setSelectedChapter(null);
        }
      } catch (err) {
        if (!ignore) {
          setSeriesList([]);
          setChapters([]);
          setSelectedChapter(null);
          setDetailChapterId("");

          toast.error(
            "Could not load chapters",
            err instanceof Error
              ? err.message
              : "Please check that Series service is running.",
          );
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, [currentUser?.userId, requestedSeriesId, toast]);

  useEffect(() => {
    if (!selectedSeriesId) return;

    let ignore = false;

    async function loadChaptersBySeries() {
      try {
        const result = await mangaErpApi.getChaptersBySeries(selectedSeriesId);

        if (ignore) return;

        setChapters(result);

        const firstChapterId = getChapterId(result[0] as ChapterLike);

        setDetailChapterId(firstChapterId);
        setSelectedChapter(null);

        if (firstChapterId) {
          const detail = await mangaErpApi.getChapter(firstChapterId);
          if (!ignore) setSelectedChapter(detail);
        }
      } catch (err) {
        if (!ignore) {
          setChapters([]);
          setSelectedChapter(null);
          setDetailChapterId("");

          toast.error(
            "Could not load chapters",
            err instanceof Error ? err.message : "Please try again.",
          );
        }
      }
    }

    void loadChaptersBySeries();

    return () => {
      ignore = true;
    };
  }, [selectedSeriesId, toast]);

  useEffect(() => {
    if (!detailChapterId) return;

    let ignore = false;

    async function loadChapterDetail() {
      try {
        const result = await mangaErpApi.getChapter(detailChapterId);

        if (!ignore) setSelectedChapter(result);
      } catch (err) {
        if (!ignore) {
          setSelectedChapter(null);

          toast.error(
            "Could not load chapter detail",
            err instanceof Error ? err.message : "Please try again.",
          );
        }
      }
    }

    void loadChapterDetail();

    return () => {
      ignore = true;
    };
  }, [detailChapterId, toast]);

  const handleCreateChapter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedSeriesId) {
      toast.error(
        "No series selected",
        "Create or approve a series before creating chapters.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await mangaErpApi.createChapter({
        SeriesId: selectedSeriesId,
        Title: chapterTitle,
        ChapterNumber: Number(chapterNumber),
        TotalPages: Number(totalPages),
      });

      toast.success(
        "Chapter created",
        `${chapterTitle} has been added to this series.`,
      );

      const createdTitle = chapterTitle;
      setChapterTitle("");

      const chapterResult =
        await mangaErpApi.getChaptersBySeries(selectedSeriesId);

      setChapters(chapterResult);

      const created = chapterResult.find(
        (chapter) => chapter.title === createdTitle,
      );
      const createdId = getChapterId(created as ChapterLike);

      if (createdId) setDetailChapterId(createdId);
    } catch (err) {
      toast.error(
        "Could not create chapter",
        err instanceof Error
          ? err.message
          : "Please check the form and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitForQA = async () => {
    if (!detailChapterId) {
      toast.error(
        "No chapter selected",
        "Select a chapter before submitting QA.",
      );
      return;
    }

    if (!currentUser?.userId) {
      toast.error("Login required", "Please login again before submitting QA.");
      return;
    }

    setIsSubmittingQA(true);

    try {
      await mangaErpApi.submitChapterForQA(detailChapterId);

      toast.success(
        "Submitted for QA",
        "The chapter has been sent to the editorial QA queue.",
      );

      const detail = await mangaErpApi.getChapter(detailChapterId);
      setSelectedChapter(detail);
    } catch (err) {
      toast.error(
        "Could not submit for QA",
        err instanceof Error
          ? err.message
          : "All pages may need approval before QA submission.",
      );
    } finally {
      setIsSubmittingQA(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Chapter Management
          </p>

          <h2 className="mt-2 text-3xl font-black text-white">
            Chapter management
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Create chapters, track their progress, and prepare them for QA.
          </p>
        </div>

        <button
          type="button"
          disabled={isSubmittingQA || !detailChapterId}
          onClick={handleSubmitForQA}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send size={16} />
          {isSubmittingQA ? "Submitting..." : "Submit for QA"}
        </button>
      </div>

      <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
        <article className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
          <div>
            <h3 className="text-lg font-bold text-white">Current Chapters</h3>

            <p className="mt-1 text-sm text-slate-400">
              Review your chapters, pages, and production progress.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {isLoading ? (
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                Loading chapters...
              </div>
            ) : null}

            {!isLoading && chapters.length === 0 ? (
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                No chapters have been created yet.
              </div>
            ) : null}

            {!isLoading &&
              chapters.map((chapter) => {
                const chapterId = getChapterId(chapter as ChapterLike);

                return (
                  <article
                    key={chapterId}
                    className="rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-slate-950/80 px-2 py-1 text-xs font-semibold text-slate-300">
                            Chapter {chapter.chapterNumber}
                          </span>

                          <span className={statusTone(chapter.status)}>
                            {chapter.status}
                          </span>
                        </div>

                        <h4 className="mt-3 text-xl font-bold text-white">
                          {chapter.title}
                        </h4>

                        <p className="mt-1 text-sm text-slate-400">
                          {chapter.totalPages} pages
                        </p>

                        <p className="mt-2 break-all text-xs text-slate-500">
                          ID: {chapterId || "-"}
                        </p>
                        {chapterId ? (
                          <button
                            type="button"
                            onClick={() =>
                              void navigator.clipboard
                                .writeText(chapterId)
                                .then(() => toast.success("Chapter ID copied"))
                            }
                            className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-xs font-semibold text-cyan-100"
                          >
                            <Copy size={13} /> Copy Chapter ID
                          </button>
                        ) : null}
                      </div>

                      <dl className="grid grid-cols-3 gap-2 text-sm sm:min-w-80">
                        <Info
                          label="Pages"
                          value={String(chapter.totalPages)}
                        />
                        <Info
                          label="Editor"
                          value={chapter.assignedEditorId ?? "-"}
                        />
                        <Info
                          label="Created"
                          value={
                            chapter.createdAt
                              ? new Date(chapter.createdAt).toLocaleDateString()
                              : "-"
                          }
                        />
                      </dl>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setDetailChapterId(chapterId)}
                        disabled={!chapterId}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <ClipboardList size={15} />
                        Detail
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!chapterId) {
                            toast.error(
                              "Missing chapter ID",
                              "The chapter could not be identified. Please try again.",
                            );
                            return;
                          }

                          setDetailChapterId(chapterId);

                          void mangaErpApi
                            .submitChapterForQA(chapterId)
                            .then(() =>
                              toast.success(
                                "Submitted for QA",
                                "The chapter has been sent to the editorial QA queue.",
                              ),
                            )
                            .catch((err) =>
                              toast.error(
                                "Could not submit for QA",
                                err instanceof Error
                                  ? err.message
                                  : "Please check your role and page status.",
                              ),
                            );
                        }}
                        disabled={!currentUser?.userId || !chapterId}
                        className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Send size={15} />
                        Submit QA
                      </button>
                    </div>
                  </article>
                );
              })}
          </div>
        </article>

        <aside className="space-y-5">
          <form
            onSubmit={handleCreateChapter}
            className="rounded-lg border border-white/10 bg-slate-900/75 p-5"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
                <Upload size={18} />
              </span>

              <div>
                <h3 className="font-bold text-white">Create Chapter</h3>
                <p className="text-sm text-slate-400">
                  Add a new chapter to the selected series.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <select
                className="input"
                value={selectedSeriesId}
                onChange={(event) => setSelectedSeriesId(event.target.value)}
              >
                <option value="">Select series</option>

                {seriesList.map((series) => (
                  <option key={series.id} value={series.id}>
                    {series.title}
                  </option>
                ))}
              </select>

              <input
                required
                className="input"
                value={chapterTitle}
                onChange={(event) => setChapterTitle(event.target.value)}
                placeholder="Chapter title"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  className="input"
                  min="1"
                  step="0.1"
                  type="number"
                  value={chapterNumber}
                  onChange={(event) => setChapterNumber(event.target.value)}
                  placeholder="Chapter no."
                />

                <input
                  required
                  className="input"
                  min="1"
                  type="number"
                  value={totalPages}
                  onChange={(event) => setTotalPages(event.target.value)}
                  placeholder="Total pages"
                />
              </div>

              <button
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Upload size={16} />
                {isSubmitting ? "Creating..." : "Create Chapter"}
              </button>
            </div>
          </form>

          <section className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-300 text-slate-950">
                <ClipboardList size={18} />
              </span>

              <div>
                <h3 className="font-bold text-white">Chapter Detail</h3>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <select
                className="input"
                value={detailChapterId}
                onChange={(event) => {
                  const chapterId = event.target.value;
                  setDetailChapterId(chapterId);

                  if (!chapterId) {
                    setSelectedChapter(null);
                  }
                }}
              >
                <option value="">Select chapter detail</option>

                {chapters.map((chapter) => {
                  const chapterId = getChapterId(chapter as ChapterLike);

                  return (
                    <option key={chapterId} value={chapterId}>
                      Ch. {chapter.chapterNumber} - {chapter.title}
                    </option>
                  );
                })}
              </select>

              {detailChapterId ? (
                <Link
                  to="/mangaka/task-assignment"
                  state={{
                    seriesId: selectedSeriesId,
                    chapterId: detailChapterId,
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100"
                >
                  <ClipboardList size={16} />
                  Open Task Assignment
                </Link>
              ) : (
                <p className="text-sm text-slate-400">
                  Select a chapter to continue to task assignment.
                </p>
              )}

              {selectedChapter ? (
                <div className="rounded-lg border border-white/10 bg-slate-950/60 p-4">
                  <p className="font-bold text-white">
                    {selectedChapter.title}
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    {selectedChapter.totalPages} pages ·{" "}
                    {selectedChapter.status}
                  </p>

                  <p className="mt-2 break-all text-xs text-slate-500">
                    ID: {getChapterId(selectedChapter as ChapterLike)}
                  </p>

                  <div className="mt-4 space-y-2">
                    {(selectedChapter.pageTasks ?? []).length ? (
                      selectedChapter.pageTasks?.map((task) => (
                        <div
                          key={task.id}
                          className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-semibold text-white">
                              Page {task.pageNumber}
                            </span>

                            <span className="text-slate-300">
                              {task.status}
                            </span>
                          </div>

                          <p className="mt-1 break-all text-xs text-slate-500">
                            Assistant: {task.assignedAssistantId ?? "-"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                        No page tasks have been created yet.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                  No chapter detail selected.
                </div>
              )}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

function statusTone(status: string) {
  if (status === "Completed") {
    return "rounded-md border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 text-xs font-semibold text-emerald-100";
  }

  if (status === "Review") {
    return "rounded-md border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs font-semibold text-amber-100";
  }

  if (status === "In Progress") {
    return "rounded-md border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-xs font-semibold text-cyan-100";
  }

  return "rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-300";
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/50 p-2">
      <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 truncate font-semibold text-slate-100">{value}</dd>
    </div>
  );
}
