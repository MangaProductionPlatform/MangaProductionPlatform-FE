import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import {
  BookOpen,
  ClipboardCheck,
  Crosshair,
  ImagePlus,
  LoaderCircle,
  Plus,
  RefreshCw,
  RotateCcw,
  Send,
  Wand2,
} from "lucide-react";
import { useToast } from "../../shared/components/toastContext";
import { WorkflowStatusBadge } from "../../shared/components/WorkflowStatusBadge";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { ChapterDto, MangaSeriesDto } from "../../shared/types/mangaErp";
import "./TaskAssignmentPage.css";

const guidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  const [samPreviewUrl, setSamPreviewUrl] = useState("");
  const [samEmbedding, setSamEmbedding] = useState<
    Awaited<ReturnType<typeof mangaErpApi.getSamEmbedding>> | null
  >(null);
  const [samMask, setSamMask] = useState<
    Awaited<ReturnType<typeof mangaErpApi.predictSamMask>> | null
  >(null);
  const [samError, setSamError] = useState("");
  const [clickX, setClickX] = useState("");
  const [clickY, setClickY] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isSamBusy, setIsSamBusy] = useState(false);
  const [message, setMessage] = useState("");
  const samInputRef = useRef<HTMLInputElement>(null);

  const selectedChapter = chapters.find((item) => item.id === chapterId);
  const selectedSeries = seriesList.find(
    (item) => item.id === selectedSeriesId,
  );
  const assistantIdError =
    assistantId.trim() && !guidPattern.test(assistantId.trim())
      ? "Enter a valid Assistant user GUID."
      : "";

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
        setMessage("No production series were returned by the backend.");
        return;
      }

      const chapterResult = await mangaErpApi.getChaptersBySeries(firstSeriesId);
      setChapters(chapterResult);

      const firstChapterId = chapterResult[0]?.id || "";
      setChapterId((current) => current || firstChapterId);
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
    // Initial backend fetch; state updates happen after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSeriesAndChapters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => () => {
      if (samPreviewUrl) URL.revokeObjectURL(samPreviewUrl);
    },
    [samPreviewUrl],
  );

  const handleCreateBasePage = async () => {
    if (!chapterId) {
      setMessage("Select a backend chapter before creating a base page.");
      return;
    }

    setIsCreatingPage(true);
    setMessage("");

    try {
      await mangaErpApi.addBasePage(chapterId, pageNumber);
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
      setMessage("Select a backend chapter before assigning the task.");
      return;
    }

    if (!assistantId.trim()) {
      setMessage("Enter the Assistant user ID before assigning the task.");
      return;
    }

    if (assistantIdError) {
      setMessage(assistantIdError);
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

  const handleCreateSamEmbedding = async () => {
    if (!samFile) {
      setMessage("Select a page image before requesting SAM embedding.");
      return;
    }

    setIsSamBusy(true);
    setSamError("");
    setMessage("");

    try {
      const embedding = await mangaErpApi.getSamEmbedding(samFile);
      setSamEmbedding(embedding);
      setSamMask(null);
      setMessage(
        "SAM embedding created. Click coordinates can now predict a region.",
      );
    } catch (err) {
      const detail =
        err instanceof Error ? err.message : "Could not create SAM embedding.";
      setSamError(detail);
      setMessage("");
    } finally {
      setIsSamBusy(false);
    }
  };

  const handlePredictSamRegion = async () => {
    if (!samEmbedding) {
      setMessage("Create SAM embedding first.");
      return;
    }

    if (!clickX || !clickY) {
      setSamError("Click the page preview to select a segmentation point.");
      return;
    }

    setIsSamBusy(true);
    setSamError("");
    setMessage("");

    try {
      const mask = await mangaErpApi.predictSamMask({
        ...samEmbedding,
        x: Number(clickX),
        y: Number(clickY),
      });
      setSamMask(mask);
      setRegionMask(
        JSON.stringify(
          mask.maskRle ?? { bbox: mask.bbox, score: mask.score },
        ),
      );
      setMessage("SAM region predicted. Save the region before assigning the task.");
    } catch (err) {
      const detail =
        err instanceof Error ? err.message : "Could not predict SAM region.";
      setSamError(detail);
      setMessage("");
    } finally {
      setIsSamBusy(false);
    }
  };

  const handleSamFileChange = (file: File | null) => {
    if (samPreviewUrl) URL.revokeObjectURL(samPreviewUrl);

    setSamFile(file);
    setSamPreviewUrl(file ? URL.createObjectURL(file) : "");
    setSamEmbedding(null);
    setSamMask(null);
    setSamError("");
    setClickX("");
    setClickY("");
    setRegionMask("");
  };

  const handleSamImageClick = (event: MouseEvent<HTMLImageElement>) => {
    if (!samEmbedding) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const scaleX = event.currentTarget.naturalWidth / bounds.width;
    const scaleY = event.currentTarget.naturalHeight / bounds.height;
    const x = Math.round((event.clientX - bounds.left) * scaleX);
    const y = Math.round((event.clientY - bounds.top) * scaleY);

    setClickX(String(x));
    setClickY(String(y));
    setSamMask(null);
    setRegionMask("");
    setSamError("");
  };

  const handleResetSam = () => {
    if (samPreviewUrl) URL.revokeObjectURL(samPreviewUrl);
    if (samInputRef.current) samInputRef.current.value = "";

    setSamFile(null);
    setSamPreviewUrl("");
    setSamEmbedding(null);
    setSamMask(null);
    setSamError("");
    setClickX("");
    setClickY("");
    setRegionMask("");
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
    <div className="task-assignment-page space-y-6">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Mangaka Workflow
        </p>

        <h1 className="mt-2 text-3xl font-black text-white">
          Task Assignment
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Create a base page, define its production region, and assign the
          artwork layer to an Assistant.
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
                No chapters were returned for this series.
              </div>
            )}

            {!isLoading && chapters.length === 0 ? (
              <label className="block text-sm text-slate-400">
                Chapter ID fallback
                <input
                  value={chapterId}
                  onChange={(event) => setChapterId(event.target.value)}
                  placeholder="Paste a chapter ID"
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                />
                <span className="mt-2 block text-xs text-slate-500">
                  Use this only when the backend chapter list is unavailable.
                </span>
              </label>
            ) : null}

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

                <WorkflowStatusBadge
                  status={chapter.status}
                  className="mt-2"
                />

                <p className="mt-2 break-all text-xs text-slate-500">
                  Technical ID: {chapter.id}
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
            Create the base page first, then activate the assignment for the
            selected Assistant.
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
                placeholder="Assistant user GUID"
                className={`mt-2 w-full rounded-xl border bg-slate-950 px-4 py-3 text-slate-100 outline-none ${
                  assistantIdError
                    ? "border-rose-400/70"
                    : "border-slate-700"
                }`}
                aria-invalid={Boolean(assistantIdError)}
              />
              {assistantIdError ? (
                <span className="mt-2 block text-xs text-rose-300">
                  {assistantIdError}
                </span>
              ) : (
                <span className="mt-2 block text-xs leading-5 text-slate-500">
                  The backend does not currently provide an Assistant roster.
                  Copy the user GUID from your studio member records.
                </span>
              )}
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

          <div className="assignment-summary mt-5 rounded-xl border border-cyan-400/20 bg-cyan-500/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                  Assignment summary
                </p>
                <h3 className="mt-1 font-bold text-white">
                  {selectedChapter
                    ? `Page ${pageNumber} · ${selectedChapter.title}`
                    : "Select a chapter to prepare the assignment"}
                </h3>
              </div>
              <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
                {taskType}
              </span>
            </div>

            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <dt>Series</dt>
                <dd>{selectedSeries?.title ?? "Not selected"}</dd>
              </div>
              <div>
                <dt>Chapter</dt>
                <dd>
                  {selectedChapter
                    ? `Ch. ${selectedChapter.chapterNumber}`
                    : "Not selected"}
                </dd>
              </div>
              <div>
                <dt>Assistant</dt>
                <dd className="break-all font-mono text-xs">
                  {assistantId.trim() || "Not assigned"}
                </dd>
              </div>
              <div>
                <dt>Chapter ID</dt>
                <dd className="break-all font-mono text-xs text-slate-500">
                  {chapterId || "—"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="sam-workspace mt-5 rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Wand2 size={18} className="text-cyan-300" />
                  <h3 className="font-semibold text-white">SAM Segmentation</h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Upload a manga page, create its embedding, then click the
                  preview to select a region point.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetSam}
                disabled={isSamBusy || !samFile}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 disabled:opacity-40"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                {!samPreviewUrl ? (
                  <label className="sam-upload-area flex min-h-80 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-cyan-400/25 bg-cyan-500/5 p-8 text-center">
                    <ImagePlus size={34} className="text-cyan-300" />
                    <span className="mt-4 font-semibold text-white">
                      Select a manga page image
                    </span>
                    <span className="mt-2 text-sm text-slate-400">
                      PNG, JPEG, or WebP. The image is sent only to the existing
                      SAM embedding endpoint.
                    </span>
                    <input
                      ref={samInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) =>
                        handleSamFileChange(event.target.files?.[0] ?? null)
                      }
                      className="sr-only"
                    />
                  </label>
                ) : (
                  <div className="sam-image-stage rounded-xl border border-slate-800 bg-black/30 p-3">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {samFile?.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {samEmbedding
                            ? "Embedding ready · Click the image to select a point"
                            : "Create an embedding before selecting a point"}
                        </p>
                      </div>
                      <label className="cursor-pointer rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-cyan-400/50">
                        Replace image
                        <input
                          ref={samInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={(event) =>
                            handleSamFileChange(event.target.files?.[0] ?? null)
                          }
                          className="sr-only"
                        />
                      </label>
                    </div>

                    <div className="sam-image-container relative overflow-hidden rounded-lg bg-slate-950">
                      <img
                        src={samPreviewUrl}
                        alt="SAM manga page preview"
                        onClick={handleSamImageClick}
                        className={`max-h-[34rem] w-full object-contain ${
                          samEmbedding ? "cursor-crosshair" : "cursor-default"
                        }`}
                      />
                      {clickX && clickY ? (
                        <span className="sam-selected-point pointer-events-none absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-slate-950/90 px-3 py-1.5 text-xs font-semibold text-cyan-200">
                          <Crosshair size={13} />
                          X {clickX} · Y {clickY}
                        </span>
                      ) : null}
                      {isSamBusy ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/75 backdrop-blur-sm">
                          <LoaderCircle
                            className="animate-spin text-cyan-300"
                            size={28}
                          />
                          <p className="mt-3 text-sm font-semibold text-white">
                            Processing with SAM…
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <label className="block text-sm text-slate-400">
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

                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs text-slate-500">
                    Selected X
                    <input
                      type="number"
                      value={clickX}
                      onChange={(event) => setClickX(event.target.value)}
                      placeholder="—"
                      className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none"
                    />
                  </label>
                  <label className="text-xs text-slate-500">
                    Selected Y
                    <input
                      type="number"
                      value={clickY}
                      onChange={(event) => setClickY(event.target.value)}
                      placeholder="—"
                      className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none"
                    />
                  </label>
                </div>

                {samEmbedding ? (
                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                    <p className="font-semibold text-emerald-100">
                      Embedding ready
                    </p>
                    <p className="mt-1 text-xs leading-5 text-emerald-200/70">
                      Click a point on the image or fine-tune its coordinates,
                      then predict the region.
                    </p>
                  </div>
                ) : null}

                {samMask ? (
                  <div className="sam-mask-preview rounded-xl border border-violet-400/20 bg-violet-500/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                      Mask response preview
                    </p>
                    <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <dt className="text-slate-500">Confidence</dt>
                        <dd className="mt-1 text-white">
                          {Number.isFinite(samMask.score)
                            ? samMask.score.toFixed(3)
                            : "Unknown"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Bounding box</dt>
                        <dd className="mt-1 break-all text-white">
                          {samMask.bbox?.join(", ") || "Not returned"}
                        </dd>
                      </div>
                    </dl>
                    <pre className="mt-3 max-h-32 overflow-auto rounded-lg bg-slate-950 p-3 text-[11px] leading-5 text-slate-400">
                      {JSON.stringify(
                        samMask.maskRle ?? {
                          bbox: samMask.bbox,
                          score: samMask.score,
                        },
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                ) : null}

                {samError ? (
                  <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">
                    {samError}
                  </div>
                ) : null}

                <div className="grid gap-2">
                  <button
                    type="button"
                    disabled={isSamBusy || !samFile}
                    onClick={() => void handleCreateSamEmbedding()}
                    className="rounded-xl border border-white/10 px-3 py-2.5 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-60"
                  >
                    {samEmbedding ? "Recreate embedding" : "Create embedding"}
                  </button>
                  <button
                    type="button"
                    disabled={
                      isSamBusy || !samEmbedding || !clickX || !clickY
                    }
                    onClick={() => void handlePredictSamRegion()}
                    className="rounded-xl border border-cyan-300/30 px-3 py-2.5 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/10 disabled:opacity-60"
                  >
                    Predict selected region
                  </button>
                  <button
                    type="button"
                    disabled={isSamBusy || !chapterId || !regionMask.trim()}
                    onClick={() => void handleSaveRegion()}
                    className="rounded-xl bg-cyan-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-60"
                  >
                    Save region to page
                  </button>
                </div>
              </div>
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
              disabled={
                isAssigning ||
                !chapterId ||
                !assistantId.trim() ||
                Boolean(assistantIdError)
              }
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
