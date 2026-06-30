import { useState } from "react";
import { CalendarClock, Rocket, Send } from "lucide-react";
import {
  publishingService,
  type ReleaseType,
} from "../../shared/services/publishingService";
import "./PublishingManagementPage.css";

export default function PublishingManagementPage() {
  const [chapterId, setChapterId] = useState("");
  const [releaseType, setReleaseType] = useState<ReleaseType>("Weekly");
  const [publishAt, setPublishAt] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState("");

  const handleSchedule = async () => {
    if (!chapterId.trim() || !publishAt) {
      setMessage("Vui lòng nhập Chapter ID và thời gian publish.");
      return;
    }

    setIsScheduling(true);
    setMessage("");

    try {
      await publishingService.schedulePublication({
        ChapterId: chapterId.trim(),
        ReleaseType: releaseType,
        PublishAt: new Date(publishAt).toISOString(),
      });

      setMessage("Đã lên lịch xuất bản chapter thành công.");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Lên lịch xuất bản thất bại."
      );
    } finally {
      setIsScheduling(false);
    }
  };

  const handlePublishNow = async () => {
    if (!chapterId.trim()) {
      setMessage("Vui lòng nhập Chapter ID.");
      return;
    }

    setIsPublishing(true);
    setMessage("");

    try {
      await publishingService.publish(chapterId.trim());
      setMessage("Đã publish chapter thành công.");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Publish chapter thất bại."
      );
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Editorial Board
        </p>

        <h1 className="mt-2 text-3xl font-black text-white">
          Publishing Management
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Editorial Board chọn loại phát hành, đặt lịch xuất bản hoặc publish thủ công
          cho chapter đã được Editor QA approve.
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <CalendarClock size={20} className="text-cyan-300" />
            Schedule Publication
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            API: POST /api/v1/publishing/schedule
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-sm text-slate-400">Chapter ID</label>
              <input
                value={chapterId}
                onChange={(event) => setChapterId(event.target.value)}
                placeholder="Nhập Chapter ID đã được QA approve"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">Release Type</label>
              <select
                value={releaseType}
                onChange={(event) => setReleaseType(event.target.value as ReleaseType)}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Special">Special</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-400">Publish At</label>
              <input
                type="datetime-local"
                value={publishAt}
                onChange={(event) => setPublishAt(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
              />
            </div>

            <button
              type="button"
              disabled={isScheduling}
              onClick={handleSchedule}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={18} />
              {isScheduling ? "Scheduling..." : "Schedule Publication"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <Rocket size={20} className="text-emerald-300" />
            Manual Publish
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            API: POST /api/v1/publishing/publish
          </p>

          <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            Dùng để test publish thủ công. Trong thực tế, API này có thể được gọi
            bởi Hangfire/background job khi đến lịch publish.
          </div>

          <button
            type="button"
            disabled={isPublishing}
            onClick={handlePublishNow}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Rocket size={18} />
            {isPublishing ? "Publishing..." : "Publish Now"}
          </button>

          {message && (
            <div className="mt-5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-200">
              {message}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}