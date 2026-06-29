import { useState } from "react";
import {
  CheckCircle,
  MessageSquare,
  Pin,
  RefreshCw,
  Send,
} from "lucide-react";
import {
  qaService,
  type QaIssueType,
} from "../../shared/services/qaService";

const issueTypes: QaIssueType[] = ["Lineart", "Coloring", "Text", "Layout"];

function createBatchToken(): string {
  return crypto.randomUUID();
}

export default function ChapterQaReviewPage() {
  const [chapterId, setChapterId] = useState("");
  const [pageTaskId, setPageTaskId] = useState("");
  const [coordinateX, setCoordinateX] = useState(50);
  const [coordinateY, setCoordinateY] = useState(50);
  const [issueType, setIssueType] = useState<QaIssueType>("Lineart");
  const [noteMessage, setNoteMessage] = useState("");
  const [batchToken, setBatchToken] = useState<string>(createBatchToken());
  const [pinId, setPinId] = useState("");

  const [isCreatingPin, setIsCreatingPin] = useState(false);
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [isResolvingPin, setIsResolvingPin] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [message, setMessage] = useState("");

  const handleCreatePin = async () => {
    if (!chapterId.trim()) {
      setMessage("Vui lòng nhập Chapter ID.");
      return;
    }

    if (!pageTaskId.trim()) {
      setMessage("Vui lòng nhập Page Task ID.");
      return;
    }

    if (!noteMessage.trim()) {
      setMessage("Vui lòng nhập nội dung lỗi.");
      return;
    }

    setIsCreatingPin(true);
    setMessage("");

    try {
      const result = await qaService.createPin(chapterId.trim(), {
        pageTaskId: pageTaskId.trim(),
        coordinateX,
        coordinateY,
        noteMessage: noteMessage.trim(),
        issueType,
        batchToken: batchToken.trim(),
      });

      const createdPinId =
        result.pinId ?? result.id ?? "";

      if (createdPinId) {
        setPinId(createdPinId);
      }

      setMessage("Tạo Bug Pin thành công.");
      setNoteMessage("");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Tạo Bug Pin thất bại."
      );
    } finally {
      setIsCreatingPin(false);
    }
  };

  const handleSendFeedback = async () => {
    if (!chapterId.trim()) {
      setMessage("Vui lòng nhập Chapter ID.");
      return;
    }

    if (!batchToken.trim()) {
      setMessage("Vui lòng nhập Batch Token.");
      return;
    }

    setIsSendingFeedback(true);
    setMessage("");

    try {
      await qaService.sendFeedback(chapterId.trim(), batchToken.trim());
      setMessage("Đã gửi feedback lỗi cho Mangaka.");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Gửi feedback thất bại."
      );
    } finally {
      setIsSendingFeedback(false);
    }
  };

  const handleResolvePin = async () => {
    if (!pinId.trim()) {
      setMessage("Vui lòng nhập Pin ID.");
      return;
    }

    setIsResolvingPin(true);
    setMessage("");

    try {
      await qaService.resolvePin(pinId.trim());
      setMessage("Đã resolve pin thành công.");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Resolve pin thất bại."
      );
    } finally {
      setIsResolvingPin(false);
    }
  };

  const handleApproveChapter = async () => {
    if (!chapterId.trim()) {
      setMessage("Vui lòng nhập Chapter ID.");
      return;
    }

    setIsApproving(true);
    setMessage("");

    try {
      await qaService.approveChapter(chapterId.trim());
      setMessage("Editor đã approve Chapter thành công.");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Approve Chapter thất bại."
      );
    } finally {
      setIsApproving(false);
    }
  };

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
          Tantou Editor ghim lỗi trên page task, gửi feedback cho Mangaka,
          resolve lỗi sau khi sửa và approve Chapter.
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-200">
          {message}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <Pin size={20} className="text-cyan-300" />
            Create Bug Pin
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            API: POST /api/v1/qa/chapters/{"{chapterId}"}/pins
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-sm text-slate-400">Chapter ID</label>
              <input
                value={chapterId}
                onChange={(event) => setChapterId(event.target.value)}
                placeholder="Nhập Chapter ID thật"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">Page Task ID</label>
              <input
                value={pageTaskId}
                onChange={(event) => setPageTaskId(event.target.value)}
                placeholder="Nhập pageTaskId của trang bị lỗi"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-slate-400">Coordinate X</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={coordinateX}
                  onChange={(event) =>
                    setCoordinateX(Number(event.target.value))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400">Coordinate Y</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={coordinateY}
                  onChange={(event) =>
                    setCoordinateY(Number(event.target.value))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400">Issue Type</label>
              <select
                value={issueType}
                onChange={(event) =>
                  setIssueType(event.target.value as QaIssueType)
                }
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
              >
                {issueTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-400">Note Message</label>
              <textarea
                value={noteMessage}
                onChange={(event) => setNoteMessage(event.target.value)}
                placeholder='Ví dụ: "Lem màu tóc", "Sai chính tả"...'
                className="mt-2 h-28 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">Batch Token</label>
              <div className="mt-2 flex gap-3">
                <input
                  value={batchToken}
                  onChange={(event) => setBatchToken(event.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                />

                <button
                  type="button"
                  onClick={() => setBatchToken(createBatchToken())}
                  className="rounded-xl border border-slate-700 px-4 text-slate-200 hover:bg-slate-800"
                >
                  New
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled={isCreatingPin}
              onClick={() => void handleCreatePin()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Pin size={18} />
              {isCreatingPin ? "Creating..." : "Create Bug Pin"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
              <Send size={20} className="text-cyan-300" />
              Send Feedback Batch
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              API: POST /api/v1/qa/chapters/{"{chapterId}"}/send-feedback
            </p>

            <button
              type="button"
              disabled={isSendingFeedback}
              onClick={() => void handleSendFeedback()}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-600 px-5 py-3 font-semibold text-white hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MessageSquare size={18} />
              {isSendingFeedback ? "Sending..." : "Send Feedback"}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
              <RefreshCw size={20} className="text-cyan-300" />
              Resolve Pin
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              API: POST /api/v1/qa/pins/{"{pinId}"}/resolve
            </p>

            <input
              value={pinId}
              onChange={(event) => setPinId(event.target.value)}
              placeholder="Nhập Pin ID cần resolve"
              className="mt-5 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
            />

            <button
              type="button"
              disabled={isResolvingPin}
              onClick={() => void handleResolvePin()}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 font-semibold text-cyan-200 hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={18} />
              {isResolvingPin ? "Resolving..." : "Resolve Pin"}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
              <CheckCircle size={20} className="text-emerald-300" />
              Approve Chapter
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              API: POST /api/v1/qa/chapters/{"{chapterId}"}/approve
            </p>

            <button
              type="button"
              disabled={isApproving}
              onClick={() => void handleApproveChapter()}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircle size={18} />
              {isApproving ? "Approving..." : "Approve Chapter"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}