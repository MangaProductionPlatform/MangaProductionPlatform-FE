import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileCheck,
  RefreshCw,
  Send,
} from "lucide-react";
import { chapterService } from "../../shared/services/chapterService";

const chaptersReadyForQa = [
  {
    id: "chapter-001",
    title: "Celestial Blade - Chapter 27",
    totalPages: 20,
    completedPages: 20,
    approvedTasks: 20,
    pendingTasks: 0,
    status: "Ready For QA",
  },
  {
    id: "chapter-002",
    title: "Neo Spirit - Chapter 13",
    totalPages: 18,
    completedPages: 15,
    approvedTasks: 15,
    pendingTasks: 3,
    status: "Not Ready",
  },
];

export default function QaSubmissionPage() {
  const [chapterId, setChapterId] = useState(chaptersReadyForQa[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const selectedChapter = chaptersReadyForQa.find(
    (chapter) => chapter.id === chapterId
  );

  const isReady = selectedChapter ? selectedChapter.pendingTasks === 0 : false;

  const handleSubmitForQa = async () => {
    if (!chapterId.trim()) {
      setMessage("Vui lòng nhập hoặc chọn Chapter ID.");
      return;
    }

    if (!isReady) {
      setMessage("Chapter này chưa đủ điều kiện để gửi sang Editorial QA.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      await chapterService.submitForQa(chapterId.trim());

      setMessage("Gửi Chapter sang Editorial QA thành công.");
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "Gửi Chapter sang Editorial QA thất bại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Mangaka Workflow
        </p>

        <h1 className="mt-2 text-3xl font-black text-white">
          Submit Chapter to Editorial QA
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Khi toàn bộ page task và layer đã được duyệt, Mangaka gửi chapter sang Editorial QA.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div>
            <label className="text-sm text-slate-400">
              Chapter ID
            </label>

            <input
              value={chapterId}
              onChange={(event) => setChapterId(event.target.value)}
              placeholder="Nhập chapterId"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
            />
          </div>

          <button
            type="button"
            className="self-end inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-200 hover:bg-slate-800"
          >
            <RefreshCw size={18} />
            Check Status
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          API: POST /api/v1/chapters/{"{chapterId}"}/submit-for-qa
        </p>
      </section>

      {message && (
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-200">
          {message}
        </div>
      )}

      <div className="space-y-4">
        {chaptersReadyForQa.map((chapter) => {
          const ready = chapter.pendingTasks === 0;
          const selected = chapter.id === chapterId;

          return (
            <button
              key={chapter.id}
              type="button"
              onClick={() => setChapterId(chapter.id)}
              className={`w-full rounded-2xl border p-6 text-left transition ${
                selected
                  ? "border-cyan-400 bg-cyan-400/10"
                  : "border-slate-800 bg-slate-900 hover:border-cyan-400/50"
              }`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <FileCheck
                      size={22}
                      className={ready ? "text-emerald-300" : "text-yellow-300"}
                    />

                    <h2 className="text-xl font-bold text-white">
                      {chapter.title}
                    </h2>
                  </div>

                  <p className="mt-3 text-sm text-slate-400">
                    Chapter ID: {chapter.id}
                  </p>
                </div>

                <span
                  className={`rounded-xl px-4 py-2 text-sm ${
                    ready
                      ? "bg-emerald-500/10 text-emerald-300"
                      : "bg-yellow-500/10 text-yellow-300"
                  }`}
                >
                  {chapter.status}
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <InfoCard label="Total Pages" value={String(chapter.totalPages)} />
                <InfoCard
                  label="Completed Pages"
                  value={String(chapter.completedPages)}
                />
                <InfoCard
                  label="Approved Tasks"
                  value={String(chapter.approvedTasks)}
                />
                <InfoCard label="Pending Tasks" value={String(chapter.pendingTasks)} />
              </div>

              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm text-slate-400">
                  <span>Completion Progress</span>
                  <span>
                    {chapter.completedPages}/{chapter.totalPages}
                  </span>
                </div>

                <div className="h-3 rounded-full bg-slate-800">
                  <div
                    className={`h-3 rounded-full ${
                      ready ? "bg-emerald-500" : "bg-yellow-500"
                    }`}
                    style={{
                      width: `${(chapter.completedPages / chapter.totalPages) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {!ready ? (
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-200">
                  <AlertCircle size={18} />
                  Chapter này chưa thể gửi QA vì vẫn còn task/layer chưa được duyệt.
                </div>
              ) : (
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                  <CheckCircle2 size={18} />
                  Chapter này đã hoàn tất toàn bộ layer và có thể gửi sang Editorial QA.
                </div>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!isReady || isSubmitting}
        onClick={handleSubmitForQa}
        className={`flex items-center gap-2 rounded-xl px-5 py-3 font-semibold ${
          isReady && !isSubmitting
            ? "bg-emerald-600 text-white hover:bg-emerald-500"
            : "cursor-not-allowed bg-slate-700 text-slate-400"
        }`}
      >
        <Send size={18} />
        {isSubmitting ? "Submitting..." : "Submit Selected Chapter to Editorial QA"}
      </button>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}