import { useEffect, useState } from "react";
import { BookOpen, ClipboardCheck, Plus, RefreshCw, Send, Wand2 } from "lucide-react";
import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { ChapterDto, MangaSeriesDto } from "../../shared/types/mangaErp";

export default function TaskAssignmentPage() {
  const toast = useToast();
  const [seriesList, setSeriesList] = useState<MangaSeriesDto[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState("");
  const [chapters, setChapters] = useState<ChapterDto[]>([]);
  const [chapterId, setChapterId] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [assistantId, setAssistantId] = useState("");
  const [taskType, setTaskType] = useState("Background");
  const [regionMask, setRegionMask] = useState("");
  const [samFile, setSamFile] = useState<File | null>(null);
  const [samEmbedding, setSamEmbedding] = useState<Awaited<ReturnType<typeof mangaErpApi.getSamEmbedding>> | null>(null);
  const [clickX, setClickX] = useState("0");
  const [clickY, setClickY] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isSamBusy, setIsSamBusy] = useState(false);
  const [message, setMessage] = useState("");

  const selectedChapter = chapters.find((item) => item.id === chapterId);

  async function loadSeriesAndChapters() {
    setIsLoading(true);
    setMessage("");

    try {
      const seriesResult = await mangaErpApi.getMySeries();
      setSeriesList(seriesResult);

      const firstSeriesId = selectedSeriesId || seriesResult[0]?.id || "";
      setSelectedSeriesId(firstSeriesId);

      if (!firstSeriesId) {
        setChapters([]);
        setChapterId("");
        setMessage("Không tìm thấy series nào từ backend.");
        return;
      }

      const chapterResult = await mangaErpApi.getChaptersBySeries(firstSeriesId);
      setChapters(chapterResult);

      const firstChapterId = chapterResult[0]?.id || "";
      setChapterId((current) => current || firstChapterId);
    } catch (err) {
      setChapters([]);
      setChapterId("");
      const detail = err instanceof Error ? err.message : "Could not load chapters.";
      setMessage(detail);
      toast.error("Could not load chapter workspace", detail);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadChaptersBySeries(seriesId: string) {
    setIsLoading(true);
    setMessage("");

    try {
      const chapterResult = await mangaErpApi.getChaptersBySeries(seriesId);
      setChapters(chapterResult);
      setChapterId(chapterResult[0]?.id || "");
    } catch (err) {
      setChapters([]);
      setChapterId("");
      const detail = err instanceof Error ? err.message : "Could not load chapters.";
      setMessage(detail);
      toast.error("Could not load series chapters", detail);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // Initial backend fetch; state updates happen after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSeriesAndChapters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateBasePage = async () => {
    if (!chapterId) {
      setMessage("Vui lòng chọn chapter thật từ backend.");
      return;
    }

    setIsCreatingPage(true);
    setMessage("");

    try {
      await mangaErpApi.addBasePage(chapterId, pageNumber);
      setMessage("");
      toast.success("Base page created", `Page ${pageNumber} is ready for task assignment.`);
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Unknown error";
      setMessage(detail);
      toast.error("Could not create base page", detail);
    } finally {
      setIsCreatingPage(false);
    }
  };

  const handleActivateTask = async () => {
    if (!chapterId) {
      setMessage("Vui lòng chọn chapter thật từ backend.");
      return;
    }

    if (!assistantId.trim()) {
      setMessage("Vui lòng nhập Assistant user ID thật.");
      return;
    }

    setIsAssigning(true);
    setMessage("");

    try {
      await mangaErpApi.activatePage(chapterId, {
        PageNumber: pageNumber,
        AssignedAssistantId: assistantId.trim(),
      });
      setMessage("");
      toast.success("Page task assigned", `Page ${pageNumber} is now in the Assistant task inbox.`);
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Unknown error";
      setMessage(detail);
      toast.error("Could not assign page task", detail);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCreateSamEmbedding = async () => {
    if (!samFile) {
      setMessage("Select a page image before requesting SAM embedding.");
      return;
    }

    setIsSamBusy(true);
    setMessage("");

    try {
      const embedding = await mangaErpApi.getSamEmbedding(samFile);
      setSamEmbedding(embedding);
      setMessage("SAM embedding created. Click coordinates can now predict a region.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not create SAM embedding.");
    } finally {
      setIsSamBusy(false);
    }
  };

  const handlePredictSamRegion = async () => {
    if (!samEmbedding) {
      setMessage("Create SAM embedding first.");
      return;
    }

    setIsSamBusy(true);
    setMessage("");

    try {
      const mask = await mangaErpApi.predictSamMask({
        ...samEmbedding,
        x: Number(clickX),
        y: Number(clickY),
      });
      setRegionMask(JSON.stringify(mask.maskRle ?? { bbox: mask.bbox, score: mask.score }));
      setMessage("SAM region predicted. Save the region before assigning the task.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not predict SAM region.");
    } finally {
      setIsSamBusy(false);
    }
  };

  const handleSaveRegion = async () => {
    if (!chapterId) {
      setMessage("Select a backend chapter first.");
      return;
    }

    if (!regionMask.trim()) {
      setMessage("Region mask JSON is required.");
      return;
    }

    setIsSamBusy(true);
    setMessage("");

    try {
      await mangaErpApi.setPageRegion(chapterId, {
        pageNumber,
        regionMask: regionMask.trim(),
        taskType,
      });
      setMessage("SAM region and task type saved for this page.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save SAM region.");
    } finally {
      setIsSamBusy(false);
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
          Mangaka tạo base page rồi phân công Assistant thực hiện artwork layer.
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
              <BookOpen size={20} className="text-cyan-300" />
              Select Chapter
            </h2>

            <button
              type="button"
              onClick={() => void loadSeriesAndChapters()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-60"
            >
              <RefreshCw size={16} />
              Reload
            </button>
          </div>

          <div className="mt-5">
            <label className="text-sm text-slate-400">Series</label>

            <select
              value={selectedSeriesId}
              onChange={(event) => {
                const seriesId = event.target.value;
                setSelectedSeriesId(seriesId);
                void loadChaptersBySeries(seriesId);
              }}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
            >
              <option value="">Select backend series</option>
              {seriesList.map((series) => (
                <option key={series.id} value={series.id}>
                  {series.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 space-y-4">
            {isLoading && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
                Loading chapters...
              </div>
            )}

            {!isLoading && chapters.length === 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                Không có chapter nào từ backend.
              </div>
            )}

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
                <h3 className="font-semibold text-white">
                  Ch. {chapter.chapterNumber} - {chapter.title}
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Total pages: {chapter.totalPages}
                </p>

                <p className="mt-1 text-sm text-cyan-300">
                  Status: {chapter.status}
                </p>

                <p className="mt-2 break-all text-xs text-slate-500">
                  ID: {chapter.id}
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
                <option value="">Select backend chapter</option>
                {chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    Ch. {chapter.chapterNumber} - {chapter.title}
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
              <label className="text-sm text-slate-400">Assistant user ID</label>

              <input
                value={assistantId}
                onChange={(event) => setAssistantId(event.target.value)}
                placeholder="Nhập GUID của Assistant"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">Selected Chapter</label>

              <div className="mt-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100">
                {selectedChapter
                  ? `Ch. ${selectedChapter.chapterNumber} - ${selectedChapter.title}`
                  : "No chapter selected"}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center gap-2">
              <Wand2 size={18} className="text-cyan-300" />
              <h3 className="font-semibold text-white">SAM region</h3>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm text-slate-400">
                Page image
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => setSamFile(event.target.files?.[0] ?? null)}
                  className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100"
                />
              </label>

              <label className="text-sm text-slate-400">
                Task type
                <select
                  value={taskType}
                  onChange={(event) => setTaskType(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                >
                  <option value="General">General</option>
                  <option value="Background">Background</option>
                  <option value="Shading">Shading</option>
                  <option value="Inking">Inking</option>
                  <option value="Effect">Effect</option>
                  <option value="Coloring">Coloring</option>
                </select>
              </label>

              <input
                type="number"
                value={clickX}
                onChange={(event) => setClickX(event.target.value)}
                placeholder="Click X"
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
              />

              <input
                type="number"
                value={clickY}
                onChange={(event) => setClickY(event.target.value)}
                placeholder="Click Y"
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
              />
            </div>

            <textarea
              value={regionMask}
              onChange={(event) => setRegionMask(event.target.value)}
              placeholder="Region mask JSON from SAM"
              className="mt-3 h-28 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none"
            />

            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <button
                type="button"
                disabled={isSamBusy || !samFile}
                onClick={() => void handleCreateSamEmbedding()}
                className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-60"
              >
                Create embedding
              </button>
              <button
                type="button"
                disabled={isSamBusy || !samEmbedding}
                onClick={() => void handlePredictSamRegion()}
                className="rounded-xl border border-cyan-300/30 px-3 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/10 disabled:opacity-60"
              >
                Predict region
              </button>
              <button
                type="button"
                disabled={isSamBusy || !chapterId || !regionMask.trim()}
                onClick={() => void handleSaveRegion()}
                className="rounded-xl bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-60"
              >
                Save region
              </button>
            </div>
          </div>

          {message && (
            <div className="mt-5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-200">
              {message}
            </div>
          )}

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <button
              type="button"
              disabled={isCreatingPage || !chapterId}
              onClick={handleCreateBasePage}
              className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 font-semibold text-cyan-200 hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={18} />
              {isCreatingPage ? "Creating..." : "Create Base Page"}
            </button>

            <button
              type="button"
              disabled={isAssigning || !chapterId}
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
