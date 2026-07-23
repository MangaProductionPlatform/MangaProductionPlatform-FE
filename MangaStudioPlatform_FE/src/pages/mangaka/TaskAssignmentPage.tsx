import { useEffect, useState } from "react";
import { BookOpen, ClipboardCheck, Plus, RefreshCw, Send } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type {
  ChapterDto,
  MangaSeriesDto,
  RecommendedAssistantDto,
} from "../../shared/types/mangaErp";

type TaskAssignmentNavigationState = {
  seriesId?: string;
  chapterId?: string;
};

export default function TaskAssignmentPage() {
  const toast = useToast();
  const location = useLocation();
  const navigationState =
    location.state as TaskAssignmentNavigationState | null;
  const [seriesList, setSeriesList] = useState<MangaSeriesDto[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState("");
  const [chapters, setChapters] = useState<ChapterDto[]>([]);
  const [chapterId, setChapterId] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [assistantId, setAssistantId] = useState("");
  const [recommendedAssistants, setRecommendedAssistants] = useState<
    RecommendedAssistantDto[]
  >([]);
  const [taskType, setTaskType] = useState("Background");
  const [taskDescription, setTaskDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [originalPageFile, setOriginalPageFile] = useState<File | null>(null);
  const [originalPagePreviewUrl, setOriginalPagePreviewUrl] = useState("");
  const [baseImageUrl, setBaseImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [message, setMessage] = useState("");

  async function loadSeriesAndChapters() {
    // Khởi tạo workspace bằng series/chapter đầu tiên mà Mangaka đang sở hữu.
    setIsLoading(true);
    setMessage("");

    try {
      const seriesResult = await mangaErpApi.getMySeries();
      setSeriesList(seriesResult);

      const requestedSeriesId = navigationState?.seriesId;
      const preferredSeriesId =
        requestedSeriesId &&
        seriesResult.some((series) => series.id === requestedSeriesId)
          ? requestedSeriesId
          : selectedSeriesId || seriesResult[0]?.id || "";

      setSelectedSeriesId(preferredSeriesId);

      if (!preferredSeriesId) {
        setChapters([]);
        setChapterId("");
        setMessage("Không tìm thấy series nào trong workspace của bạn.");
        return;
      }

      const chapterResult =
        await mangaErpApi.getChaptersBySeries(preferredSeriesId);
      setChapters(chapterResult);

      const requestedChapterId = navigationState?.chapterId;
      const preferredChapterId =
        requestedChapterId &&
        chapterResult.some((chapter) => chapter.id === requestedChapterId)
          ? requestedChapterId
          : chapterResult[0]?.id || "";

      setChapterId(preferredChapterId);
    } catch (err) {
      setChapters([]);
      setChapterId("");
      const detail =
        err instanceof Error ? err.message : "Could not load chapters.";
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
      const detail =
        err instanceof Error ? err.message : "Could not load chapters.";
      setMessage(detail);
      toast.error("Could not load series chapters", detail);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // Chỉ tải dữ liệu khởi tạo một lần khi mở màn hình.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSeriesAndChapters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!chapterId) {
        setRecommendedAssistants([]);
        return;
      }
      // Danh sách này chỉ gợi ý; Mangaka vẫn là người quyết định Assistant nhận task.
      void mangaErpApi
        .getRecommendedAssistants(chapterId)
        .then(setRecommendedAssistants)
        .catch(() => setRecommendedAssistants([]));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [chapterId]);

  useEffect(() => {
    if (!originalPagePreviewUrl) return undefined;
    return () => URL.revokeObjectURL(originalPagePreviewUrl);
  }, [originalPagePreviewUrl]);

  const handleCreateBasePage = async () => {
    if (!chapterId) {
      setMessage("Vui lòng chọn chapter trước khi tiếp tục.");
      return;
    }

    if (!originalPageFile) {
      const detail =
        "Choose the original page image before creating a base page.";
      setMessage(detail);
      toast.error("Original page image is required", detail);
      return;
    }

    setIsCreatingPage(true);
    setMessage("");

    try {
      // BaseImageUrl is immutable source material; upload it once before the page exists.
      let uploadedBaseImageUrl = baseImageUrl;

      if (!uploadedBaseImageUrl) {
        const uploadResult = await mangaErpApi.uploadImage(originalPageFile);
        uploadedBaseImageUrl = uploadResult.url;
        setBaseImageUrl(uploadedBaseImageUrl);
      }

      await mangaErpApi.addBasePage(
        chapterId,
        pageNumber,
        uploadedBaseImageUrl,
      );
      setMessage("");
      toast.success(
        "Base page created",
        `Page ${pageNumber} is ready for task assignment.`,
      );
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
      setMessage("Vui lòng chọn chapter trước khi tiếp tục.");
      return;
    }

    if (!assistantId.trim()) {
      setMessage("Vui lòng nhập Assistant user ID thật.");
      return;
    }

    if (!deadline) {
      const detail = "Set a deadline before assigning this page task.";
      setMessage(detail);
      toast.error("Deadline is required", detail);
      return;
    }

    const deadlineValue = new Date(deadline);

    if (Number.isNaN(deadlineValue.getTime())) {
      const detail = "Choose a valid task deadline before assigning the task.";
      setMessage(detail);
      toast.error("Invalid deadline", detail);
      return;
    }

    if (deadlineValue.getTime() <= Date.now()) {
      const detail = "The task deadline must be later than the current time.";
      setMessage(detail);
      toast.error("Invalid deadline", detail);
      return;
    }

    setIsAssigning(true);
    setMessage("");

    try {
      await mangaErpApi.activatePage(chapterId, {
        PageNumber: pageNumber,
        AssignedAssistantId: assistantId.trim(),
        Description: taskDescription.trim() || null,
        Deadline: deadlineValue.toISOString(),
      });
      setMessage("");
      setTaskDescription("");
      setDeadline("");
      toast.success(
        "Page task assigned",
        `Page ${pageNumber} is now in the Assistant task inbox.`,
      );
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Unknown error";
      setMessage(detail);
      toast.error("Could not assign page task", detail);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleOriginalPageFileChange = (file: File | null) => {
    setOriginalPageFile(file);
    setOriginalPagePreviewUrl(file ? URL.createObjectURL(file) : "");
    setBaseImageUrl("");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Mangaka Workflow
        </p>

        <h1 className="mt-2 text-3xl font-black text-white">Task Assignment</h1>

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
              <option value="">Select series</option>
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
                Không có chapter nào trong series này.
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

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-400">Chapter</label>

              <select
                value={chapterId}
                onChange={(event) => setChapterId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
              >
                <option value="">Select chapter</option>
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
              <label className="text-sm text-slate-400">
                Assistant accepted for this series
              </label>

              <select
                value={
                  recommendedAssistants.some(
                    (assistant) => assistant.assistantId === assistantId,
                  )
                    ? assistantId
                    : ""
                }
                onChange={(event) => setAssistantId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
              >
                <option value="">
                  Select an Assistant accepted for this series
                </option>
                {recommendedAssistants.map((assistant) => (
                  <option
                    key={assistant.assistantId}
                    value={assistant.assistantId}
                  >
                    {assistant.assistantName}
                    {assistant.penName ? ` (${assistant.penName})` : ""} ·{" "}
                    {assistant.activeTasksCount} active task(s)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-400">
                Assistant user ID
              </label>

              <input
                value={assistantId}
                onChange={(event) => setAssistantId(event.target.value)}
                placeholder="Nhập GUID của Assistant"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">
                Task deadline <span className="text-rose-300">*</span>
              </label>

              <input
                type="datetime-local"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
              />

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Required. Assistant will see this deadline in the assigned task
                details.
              </p>
            </div>
          </div>

          <label className="mt-5 block text-sm text-slate-400">
            Task note for Assistant
            <textarea
              value={taskDescription}
              onChange={(event) => setTaskDescription(event.target.value)}
              maxLength={2000}
              placeholder="Describe the work requirements, expected result, colors, or details the Assistant should follow..."
              className="mt-2 h-28 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none focus:border-cyan-400"
            />
          </label>

          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm text-slate-400">
                Original page image
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) =>
                    handleOriginalPageFileChange(
                      event.target.files?.[0] ?? null,
                    )
                  }
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
            </div>

            {originalPagePreviewUrl ? (
              <img
                src={originalPagePreviewUrl}
                alt="Original page selected for this task"
                className="mt-4 max-h-72 w-full rounded-xl border border-slate-700 object-contain"
              />
            ) : null}

            <p className="mt-3 text-xs leading-5 text-slate-400">
              This image is uploaded as the immutable original page when you
              create the base page. Assistant layers and composite previews will
              not replace it.
            </p>
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
              {isCreatingPage
                ? "Uploading & creating..."
                : "Upload & Create Base Page"}
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
