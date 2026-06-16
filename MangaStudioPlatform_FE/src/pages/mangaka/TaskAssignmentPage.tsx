import { useState } from "react";
import { BookOpen, ClipboardCheck, Plus, Send } from "lucide-react";
import { chapterService } from "../../shared/services/chapterService";

const chapters = [
  {
    id: "chapter-001",
    title: "Celestial Blade - Chapter 27",
    totalPages: 20,
    status: "Drafting",
  },
  {
    id: "chapter-002",
    title: "Neo Spirit - Chapter 13",
    totalPages: 18,
    status: "In Progress",
  },
];

const assistants = [
  { id: "assistant-001", name: "Assistant A" },
  { id: "assistant-002", name: "Assistant B" },
  { id: "assistant-003", name: "Assistant C" },
];

export default function TaskAssignmentPage() {
  const [chapterId, setChapterId] = useState(chapters[0].id);
  const [pageNumber, setPageNumber] = useState(1);
  const [assistantId, setAssistantId] = useState(assistants[0].id);
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [message, setMessage] = useState("");

  const selectedChapter = chapters.find((item) => item.id === chapterId);

  const handleCreateBasePage = async () => {
    setIsCreatingPage(true);
    setMessage("");

    try {
      await chapterService.createBasePage(chapterId, {
        PageNumber: pageNumber,
      });

      setMessage("Tạo base page thành công.");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Tạo base page thất bại."
      );
    } finally {
      setIsCreatingPage(false);
    }
  };

  const handleActivateTask = async () => {
    setIsAssigning(true);
    setMessage("");

    try {
      await chapterService.activatePageTask(chapterId, {
        PageNumber: pageNumber,
        AssignedAssistantId: assistantId,
      });

      setMessage("Phân công task cho Assistant thành công.");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Phân công task thất bại."
      );
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Mangaka Workflow
        </p>

        <h1 className="mt-2 text-3xl font-black text-white">
          Task Assignment
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Mangaka xác định base page và phân công Assistant thực hiện artwork layer.
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <BookOpen size={20} className="text-cyan-300" />
            Select Chapter
          </h2>

          <div className="mt-5 space-y-4">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                type="button"
                onClick={() => setChapterId(chapter.id)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  chapterId === chapter.id
                    ? "border-cyan-400 bg-cyan-400/10"
                    : "border-slate-800 bg-slate-950 hover:border-cyan-400/50"
                }`}
              >
                <h3 className="font-semibold text-white">{chapter.title}</h3>

                <p className="mt-2 text-sm text-slate-400">
                  Total pages: {chapter.totalPages}
                </p>

                <p className="mt-1 text-sm text-cyan-300">
                  Status: {chapter.status}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <ClipboardCheck size={20} className="text-cyan-300" />
            Create Page Task
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            API: POST /api/v1/chapters/{"{chapterId}"}/pages và POST
            /api/v1/chapters/{"{chapterId}"}/pages/activate
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-400">Chapter</label>

              <select
                value={chapterId}
                onChange={(event) => setChapterId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
              >
                {chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.title}
                  </option>
                ))}
              </select>
            </div>

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

            <div>
              <label className="text-sm text-slate-400">Assistant</label>

              <select
                value={assistantId}
                onChange={(event) => setAssistantId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
              >
                {assistants.map((assistant) => (
                  <option key={assistant.id} value={assistant.id}>
                    {assistant.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-400">Selected Chapter</label>

              <div className="mt-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100">
                {selectedChapter?.title}
              </div>
            </div>
          </div>

          <textarea
            placeholder="Mô tả yêu cầu layer cho Assistant..."
            className="mt-5 h-32 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none"
          />

          {message && (
            <div className="mt-5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-200">
              {message}
            </div>
          )}

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <button
              type="button"
              disabled={isCreatingPage}
              onClick={handleCreateBasePage}
              className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 font-semibold text-cyan-200 hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={18} />
              {isCreatingPage ? "Creating..." : "Create Base Page"}
            </button>

            <button
              type="button"
              disabled={isAssigning}
              onClick={handleActivateTask}
              className="flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={18} />
              {isAssigning ? "Assigning..." : "Activate & Assign Task"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}