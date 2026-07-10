import { useState } from "react";
import { CalendarClock, Send } from "lucide-react";
import { useToast } from "./toastContext";
import { mangaErpApi } from "../services/mangaErpService";

export function ChapterPublishingPanel() {
  const toast = useToast();
  const [chapterId, setChapterId] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [platforms, setPlatforms] = useState<string[]>(["Web"]);
  const [isPremium, setIsPremium] = useState(false);
  const [promotionNote, setPromotionNote] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);

  const togglePlatform = (platform: string) => {
    setPlatforms((current) => current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform]);
  };

  const schedule = async () => {
    const trimmedChapterId = chapterId.trim();
    if (!trimmedChapterId || !publishDate || platforms.length === 0) {
      toast.error("Schedule details are incomplete", "Enter a chapter ID, choose a publish time, and select at least one platform.");
      return;
    }
    setIsScheduling(true);
    setScheduledAt(null);
    try {
      const isoPublishDate = new Date(publishDate).toISOString();
      await mangaErpApi.schedulePublication({
        ChapterId: trimmedChapterId,
        PublishDate: isoPublishDate,
        Platforms: platforms,
        IsPremium: isPremium,
        PromotionNote: promotionNote.trim() || null,
      });
      setScheduledAt(isoPublishDate);
      toast.success("Publication scheduled", new Date(isoPublishDate).toLocaleString());
    } catch (error) {
      toast.error("Schedule failed", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="rounded-2xl border border-cyan-300/15 bg-cyan-500/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Editorial Board publishing</p>
            <h2 className="mt-2 text-xl font-bold text-white">Schedule approved chapter</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Enter the chapter ID that has completed QA. This screen uses the MF3 publishing API directly, so Editorial Board does not need chapter-detail access.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-xl bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-200">
            <CalendarClock size={17} />
            MF3 Publishing
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <label className="text-sm text-slate-400">
          Chapter ID
          <input
            className="input mt-2"
            value={chapterId}
            onChange={(event) => setChapterId(event.target.value)}
            placeholder="Enter ReadyForPublishing chapter ID"
          />
        </label>
        <label className="text-sm text-slate-400">
          Publish date
          <input className="input mt-2" type="datetime-local" value={publishDate} onChange={(event) => setPublishDate(event.target.value)} />
        </label>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <label className="text-sm text-slate-400">
          Promotion note
          <input
            className="input mt-2"
            value={promotionNote}
            onChange={(event) => setPromotionNote(event.target.value)}
            placeholder="Chương có cảnh chiến đấu hoành tráng nhất Arc"
          />
        </label>
        <div>
          <p className="text-sm text-slate-400">Platforms</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            {["Web", "MobileApp"].map((platform) => (
              <label key={platform} className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-300">
                <input type="checkbox" className="accent-cyan-300" checked={platforms.includes(platform)} onChange={() => togglePlatform(platform)} />
                {platform}
              </label>
            ))}
            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-300">
              <input type="checkbox" className="accent-cyan-300" checked={isPremium} onChange={(event) => setIsPremium(event.target.checked)} />
              Premium
            </label>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void schedule()}
          disabled={!chapterId.trim() || !publishDate || platforms.length === 0 || isScheduling}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={18} />
          {isScheduling ? "Scheduling…" : "Schedule publication"}
        </button>
        {scheduledAt ? (
          <span className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200">
            Scheduled for {new Date(scheduledAt).toLocaleString()}
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        If the chapter is not ReadyForPublishing, the backend will reject the schedule request. The FE intentionally does not call chapter-detail APIs here because this is an Editorial Board function.
      </p>
    </section>
  );
}
