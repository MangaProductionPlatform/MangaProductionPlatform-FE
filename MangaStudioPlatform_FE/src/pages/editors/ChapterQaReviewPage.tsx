import { useEffect, useState } from "react";
import {
  CheckCircle,
  MapPin,
  MessageSquare,
  Plus,
  RefreshCw,
} from "lucide-react";
import { qaService, type QaPin } from "../../shared/services/qaService";

type IssueType = "Visual" | "Content";

export default function ChapterQaReviewPage() {
  const [chapterId, setChapterId] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [xPercent, setXPercent] = useState(50);
  const [yPercent, setYPercent] = useState(50);
  const [issueType, setIssueType] = useState<IssueType>("Visual");
  const [comment, setComment] = useState("");
  const [pins, setPins] = useState<QaPin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingPin, setIsCreatingPin] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadPins() {
    if (!chapterId.trim()) {
      setMessage("Vui lòng nhập Chapter ID thật.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const result = await qaService.getPins(chapterId.trim());
      setPins(Array.isArray(result) ? result : []);
    } catch (err) {
      setPins([]);
      setMessage(
        err instanceof Error ? err.message : "Không thể tải danh sách QA pins."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreatePin() {
    if (!chapterId.trim()) {
      setMessage("Vui lòng nhập Chapter ID thật.");
      return;
    }

    if (!comment.trim()) {
      setMessage("Vui lòng nhập nội dung lỗi cần feedback.");
      return;
    }

    setIsCreatingPin(true);
    setMessage("");

    try {
      await qaService.createPin(chapterId.trim(), {
        PageNumber: pageNumber,
        XPercent: xPercent,
        YPercent: yPercent,
        IssueType: issueType,
        Comment: comment.trim(),
      });

      setComment("");
      setMessage("Đã tạo QA pin thành công.");
      await loadPins();
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Tạo QA pin thất bại."
      );
    } finally {
      setIsCreatingPin(false);
    }
  }

  async function handleApproveChapter() {
    if (!chapterId.trim()) {
      setMessage("Vui lòng nhập Chapter ID thật.");
      return;
    }

    setIsApproving(true);
    setMessage("");

    try {
      await qaService.approveChapter(chapterId.trim());
      setMessage("Editor đã approve chất lượng Chapter thành công.");
      await loadPins();
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Approve Chapter thất bại."
      );
    } finally {
      setIsApproving(false);
    }
  }

  useEffect(() => {
    if (!chapterId.trim()) return;
  }, [chapterId]);

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Editor QA
        </p>

        <h1 className="mt-2 text-3xl font-black text-white">
          Chapter QA Review
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Tantou Editor kiểm tra Chapter, ghim lỗi Visual/Content và approve khi
          tất cả lỗi đã được xử lý.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
          <div>
            <label className="text-sm text-slate-400">Chapter ID</label>
            <input
              value={chapterId}
              onChange={(event) => setChapterId(event.target.value)}
              placeholder="Nhập Chapter ID thật từ backend"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
            />
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => void loadPins()}
            className="self-end inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 font-semibold text-cyan-200 hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={18} />
            {isLoading ? "Loading..." : "Load Pins"}
          </button>

          <button
            type="button"
            disabled={isApproving}
            onClick={() => void handleApproveChapter()}
            className="self-end inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle size={18} />
            {isApproving ? "Approving..." : "Approve Chapter"}
          </button>
        </div>
      </section>

      {message && (
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-200">
          {message}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <MapPin size={20} className="text-cyan-300" />
            QA Pins
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            API: GET /api/v1/qa/chapters/{"{chapterId}"}/pins
          </p>

          <div className="mt-5 space-y-3">
            {isLoading && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-300">
                Loading QA pins...
              </div>
            )}

            {!isLoading && pins.length === 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-400">
                Chưa có lỗi QA nào được ghim cho Chapter này.
              </div>
            )}

            {pins.map((pin) => (
              <div
                key={pin.id}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">
                      Page {pin.pageNumber} · {pin.issueType}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      {pin.comment}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Position: X {pin.xPercent}% · Y {pin.yPercent}%
                    </p>
                  </div>

                  <span className="rounded-lg bg-yellow-500/10 px-3 py-1 text-xs text-yellow-300">
                    {pin.status ?? "Open"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <MessageSquare size={20} className="text-cyan-300" />
            Add QA Pin
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            API: POST /api/v1/qa/chapters/{"{chapterId}"}/pins
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-sm text-slate-400">Page Number</label>
              <input
                type="number"
                min={1}
                value={pageNumber}
                onChange={(event) => setPageNumber(Number(event.target.value))}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-slate-400">X Percent</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={xPercent}
                  onChange={(event) => setXPercent(Number(event.target.value))}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400">Y Percent</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={yPercent}
                  onChange={(event) => setYPercent(Number(event.target.value))}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400">Issue Type</label>
              <select
                value={issueType}
                onChange={(event) =>
                  setIssueType(event.target.value as IssueType)
                }
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
              >
                <option value="Visual">Visual</option>
                <option value="Content">Content</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-400">Comment</label>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Ví dụ: Bong bóng thoại bị lệch / Sai tên nhân vật..."
                className="mt-2 h-32 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none"
              />
            </div>

            <button
              type="button"
              disabled={isCreatingPin}
              onClick={() => void handleCreatePin()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={18} />
              {isCreatingPin ? "Creating..." : "Create QA Pin"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}