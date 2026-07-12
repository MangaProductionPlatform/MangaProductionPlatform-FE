import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Pencil, RefreshCw, Rocket, Send, Trash2 } from "lucide-react";
import { useToast } from "./toastContext";
import { mangaErpApi } from "../services/mangaErpService";
import type { PublicationType, PublishingScheduleItemDto, ReadyForPublishChapterDto } from "../types/mangaErp";

const issueTypes: PublicationType[] = ["Weekly", "Monthly", "Special"];

const isPublicationType = (value?: string | null): value is PublicationType => (
  value === "Weekly" || value === "Monthly" || value === "Special"
);

export function ChapterPublishingPanel() {
  const toast = useToast();
  const [readyChapters, setReadyChapters] = useState<ReadyForPublishChapterDto[]>([]);
  const [scheduledChapters, setScheduledChapters] = useState<PublishingScheduleItemDto[]>([]);
  const [chapterId, setChapterId] = useState("");
  const [seriesId, setSeriesId] = useState("");
  const [issueType, setIssueType] = useState<PublicationType>("Weekly");
  const [publishDate, setPublishDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [editingScheduleId, setEditingScheduleId] = useState("");

  const selectedChapter = useMemo(
    () => readyChapters.find((chapter) => chapter.chapterId === chapterId) ?? null,
    [chapterId, readyChapters],
  );

  const loadReadyChapters = async (showToast = false, showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const [items, scheduled] = await Promise.all([mangaErpApi.getReadyForPublish(), mangaErpApi.getPublishingSchedule()]);
      setReadyChapters(items);
      setScheduledChapters(scheduled);
      if (showToast) toast.success("Ready chapters refreshed", `${items.length} chapter(s) returned.`);
    } catch (error) {
      toast.error("Could not load ready chapters", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadInitialReadyChapters() {
      try {
        const [items, scheduled] = await Promise.all([mangaErpApi.getReadyForPublish(), mangaErpApi.getPublishingSchedule()]);
        if (!ignore) {
          setReadyChapters(items);
          setScheduledChapters(scheduled);
        }
      } catch (error) {
        if (!ignore) toast.error("Could not load ready chapters", error instanceof Error ? error.message : "Unknown error");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    void loadInitialReadyChapters();
    return () => {
      ignore = true;
    };
    // Initial backend load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectChapter = (id: string) => {
    setEditingScheduleId("");
    setChapterId(id);
    const chapter = readyChapters.find((item) => item.chapterId === id);
    if (!chapter) return;
    setSeriesId(chapter.seriesId);
    setIssueType(isPublicationType(chapter.issueType) ? chapter.issueType : "Weekly");
    if (chapter.scheduledPublishAt) {
      setPublishDate(chapter.scheduledPublishAt.slice(0, 16));
    }
  };

  const schedule = async () => {
    const trimmedChapterId = chapterId.trim();
    const trimmedSeriesId = seriesId.trim();
    if (!trimmedChapterId || !trimmedSeriesId || !publishDate) {
      toast.error("Schedule details are incomplete", "Select a chapter, confirm its series, and choose a future publish time.");
      return;
    }

    setIsScheduling(true);
    setLastResult(null);
    try {
      const isoPublishDate = new Date(publishDate).toISOString();
      const payload = {
        ChapterId: trimmedChapterId,
        SeriesId: trimmedSeriesId,
        IssueType: issueType,
        ScheduledPublishAt: isoPublishDate,
      };
      if (editingScheduleId) {
        await mangaErpApi.updatePublicationSchedule(editingScheduleId, payload);
      } else {
        await mangaErpApi.schedulePublication(payload);
      }
      setLastResult(`${editingScheduleId ? "Updated" : "Scheduled"} ${issueType} publication for ${new Date(isoPublishDate).toLocaleString()}.`);
      toast.success(editingScheduleId ? "Publication schedule updated" : "Publication scheduled", `${issueType} at ${new Date(isoPublishDate).toLocaleString()}`);
      setEditingScheduleId("");
      await loadReadyChapters(false, false);
    } catch (error) {
      toast.error("Schedule failed", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsScheduling(false);
    }
  };

  const editSchedule = (chapter: PublishingScheduleItemDto) => {
    setEditingScheduleId(chapter.chapterId);
    setChapterId(chapter.chapterId);
    setSeriesId(chapter.seriesId);
    setIssueType(isPublicationType(chapter.issueType) ? chapter.issueType : "Weekly");
    setPublishDate(chapter.scheduledPublishAt.slice(0, 16));
  };

  const cancelSchedule = async (chapter: PublishingScheduleItemDto) => {
    if (!window.confirm(`Cancel publication schedule for ${chapter.title}?`)) return;
    try {
      await mangaErpApi.cancelPublicationSchedule(chapter.chapterId);
      if (editingScheduleId === chapter.chapterId) setEditingScheduleId("");
      toast.success("Publication schedule cancelled", chapter.title);
      await loadReadyChapters(false, false);
    } catch (error) {
      toast.error("Could not cancel schedule", error instanceof Error ? error.message : "Unknown error");
    }
  };

  const publishNow = async () => {
    const trimmedChapterId = chapterId.trim();
    if (!trimmedChapterId) {
      toast.error("Chapter is required", "Select an approved chapter before publishing.");
      return;
    }
    if (!window.confirm("Publish this approved chapter now?")) return;

    setIsPublishing(true);
    setLastResult(null);
    try {
      const result = await mangaErpApi.publishChapter(trimmedChapterId);
      setLastResult(`Published at ${new Date(result.publishedAt).toLocaleString()}. ${result.publicationUrl}`);
      toast.success("Chapter published", result.publicationUrl || result.status);
      await loadReadyChapters(false, false);
    } catch (error) {
      toast.error("Publish failed", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="rounded-2xl border border-cyan-300/15 bg-cyan-500/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Editorial Board publishing</p>
            <h2 className="mt-2 text-xl font-bold text-white">Chapter release control</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Select an approved chapter, choose Weekly, Monthly, or Special release, then schedule automated publishing or publish immediately.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-xl bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-200">
            <CalendarClock size={17} />
            MF3 Publishing
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">Approved chapters</p>
          <p className="mt-1 text-xs text-slate-500">{readyChapters.length} chapter(s) ready or scheduled</p>
        </div>
        <button
          type="button"
          onClick={() => void loadReadyChapters(true)}
          disabled={isLoading}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <label className="text-sm text-slate-400">
          Ready chapter
          <select className="input mt-2" value={chapterId} onChange={(event) => selectChapter(event.target.value)}>
            <option value="">Select approved chapter</option>
            {readyChapters.map((chapter) => (
              <option key={chapter.chapterId} value={chapter.chapterId}>
                Ch. {chapter.chapterNumber} - {chapter.title}
                {chapter.scheduledPublishAt ? ` (scheduled ${new Date(chapter.scheduledPublishAt).toLocaleString()})` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-slate-400">
          Release type
          <select className="input mt-2" value={issueType} onChange={(event) => setIssueType(event.target.value as PublicationType)}>
            {issueTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <label className="text-sm text-slate-400">
          Chapter ID
          <input
            className="input mt-2"
            value={chapterId}
            onChange={(event) => setChapterId(event.target.value)}
            placeholder="Approved chapter ID"
          />
        </label>
        <label className="text-sm text-slate-400">
          Series ID
          <input
            className="input mt-2"
            value={seriesId}
            onChange={(event) => setSeriesId(event.target.value)}
            placeholder="Enter series ID"
          />
        </label>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <label className="text-sm text-slate-400">
          Scheduled publish time
          <input className="input mt-2" type="datetime-local" value={publishDate} onChange={(event) => setPublishDate(event.target.value)} />
        </label>
        <div className="rounded-xl border border-white/10 bg-slate-950 p-4">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-slate-500">Selected chapter</p>
          <p className="mt-2 font-semibold text-white">
            {selectedChapter ? `Ch. ${selectedChapter.chapterNumber} - ${selectedChapter.title}` : "No chapter selected"}
          </p>
          <p className="mt-1 break-all text-xs text-slate-500">Series: {seriesId || "-"}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void schedule()}
          disabled={!chapterId.trim() || !seriesId.trim() || !publishDate || isScheduling || isPublishing}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={18} />
          {isScheduling ? "Scheduling..." : editingScheduleId ? "Update schedule" : "Schedule publication"}
        </button>
        <button
          type="button"
          onClick={() => void publishNow()}
          disabled={!chapterId.trim() || isScheduling || isPublishing}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Rocket size={18} />
          {isPublishing ? "Publishing..." : "Publish now"}
        </button>
        {lastResult ? (
          <span className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200">
            {lastResult}
          </span>
        ) : null}
      </div>

      {!isLoading && readyChapters.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed border-slate-700 p-5 text-center text-sm text-slate-400">
          No approved chapters are ready for publishing yet.
        </p>
      ) : null}

      <section className="mt-8 border-t border-white/10 pt-6">
        <h3 className="text-lg font-bold text-white">Scheduled publications</h3>
        <div className="mt-4 space-y-3">
          {scheduledChapters.map((chapter) => <article key={chapter.chapterId} className="flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-slate-950 p-4">
            <div><p className="font-semibold text-white">Ch. {chapter.chapterNumber}: {chapter.title}</p><p className="mt-1 text-sm text-slate-400">{chapter.issueType || "Weekly"} · {new Date(chapter.scheduledPublishAt).toLocaleString()}</p></div>
            <div className="flex gap-2"><button type="button" title="Edit schedule" onClick={() => editSchedule(chapter)} className="icon-button"><Pencil size={16}/></button><button type="button" title="Cancel schedule" onClick={() => void cancelSchedule(chapter)} className="icon-button text-rose-200"><Trash2 size={16}/></button></div>
          </article>)}
          {!isLoading && !scheduledChapters.length ? <p className="text-sm text-slate-500">No publications are currently scheduled.</p> : null}
        </div>
      </section>
    </section>
  );
}
