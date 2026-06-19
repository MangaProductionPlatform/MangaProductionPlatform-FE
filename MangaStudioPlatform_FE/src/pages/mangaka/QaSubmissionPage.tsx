import { useState } from "react";
import { FileCheck, Send } from "lucide-react";
import { chapterService } from "../../shared/services/chapterService";

export default function QaSubmissionPage() {
  const [chapterId, setChapterId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmitForQa = async () => {
    if (!chapterId.trim()) {
      setMessage("Vui lòng nhập Chapter ID thật từ backend.");
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
          Nhập Chapter ID thật từ backend để gửi chapter sang Editorial QA.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center gap-3">
          <FileCheck size={22} className="text-cyan-300" />
          <h2 className="text-xl font-bold text-white">
            Submit QA Request
          </h2>
        </div>

        <div className="mt-5">
          <label className="text-sm text-slate-400">
            Chapter ID
          </label>

          <input
            value={chapterId}
            onChange={(event) => setChapterId(event.target.value)}
            placeholder="Ví dụ: 2f046169-0b4c-42c3-a1b5-1bc888f9f0d4"
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
          />
        </div>

        {message && (
          <div className="mt-5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-200">
            {message}
          </div>
        )}

        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleSubmitForQa}
          className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send size={18} />
          {isSubmitting ? "Submitting..." : "Submit to Editorial QA"}
        </button>

        <p className="mt-4 text-xs text-slate-500">
          API: POST /api/v1/chapters/{"{chapterId}"}/submit-for-qa
        </p>
      </section>
    </div>
  );
}