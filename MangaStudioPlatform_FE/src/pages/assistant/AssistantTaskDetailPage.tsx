import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ClipboardPenLine,
  Download,
  FileImage,
  Send,
  Upload,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type {
  LayerType,
  NotificationDto,
  PageTaskDto,
  QaBugPinDto,
} from "../../shared/types/mangaErp";

const layerTypes: LayerType[] = [
  "LineArt",
  "Background",
  "Coloring",
  "Text",
  "Effects",
  "Dialogue",
];

function formatTaskTitle(task: PageTaskDto) {
  const chapterName =
    task.chapterTitle ??
    (task.chapterNumber ? `Chapter ${task.chapterNumber}` : "Assigned chapter");
  const pageLabel = task.pageNumber ? `Page ${task.pageNumber}` : "Page task";
  const taskType = task.taskType ?? "General";

  return `${chapterName} - ${pageLabel} - ${taskType}`;
}

export default function AssistantTaskDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const [task, setTask] = useState<PageTaskDto | null>(null);
  const [revisionFeedback, setRevisionFeedback] =
    useState<NotificationDto | null>(null);
  const [qaPin, setQaPin] = useState<QaBugPinDto | null>(null);
  const [layerType, setLayerType] = useState<LayerType>("LineArt");
  const [artworkUrl, setArtworkUrl] = useState("");
  const [submittedArtworkUrl, setSubmittedArtworkUrl] = useState<string | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoadingTask, setIsLoadingTask] = useState(Boolean(id));

  const existingSubmissionImageUrl =
    task?.fileUrlOriginal ??
    task?.fileUrlOptimized ??
    task?.previewCompositeUrl ??
    null;

  const submissionImageUrl =
    artworkUrl || submittedArtworkUrl || existingSubmissionImageUrl;

  // Một số response cũ trả ảnh trang bằng imageUrl; ưu tiên baseImageUrl mới vì đó là ảnh gốc bất biến.
  const originalReferenceImageUrl =
    task?.baseImageUrl ?? task?.imageUrl ?? null;

  useEffect(() => {
    if (!id) return;

    void Promise.all([
      mangaErpApi.getAssignedPageTasks(),
      mangaErpApi.getPageTask(id),
      mangaErpApi.getMyNotifications().catch(() => []),
      mangaErpApi.getTaskQaPin(id).catch(() => null),
    ])
      .then(([items, detail, notifications, pin]) => {
        const summary = items.find((item) => item.id === id);
        setTask({
          ...summary,
          ...detail,
          chapterTitle: detail.chapterTitle ?? summary?.chapterTitle,
          chapterNumber: detail.chapterNumber ?? summary?.chapterNumber,
          currentLayerType:
            detail.currentLayerType ?? summary?.currentLayerType,
          currentLayerVersion:
            detail.currentLayerVersion ?? summary?.currentLayerVersion,
          baseImageUrl: detail.baseImageUrl ?? summary?.baseImageUrl,
          imageUrl: detail.imageUrl ?? summary?.imageUrl,
          fileUrlOriginal: detail.fileUrlOriginal ?? summary?.fileUrlOriginal,
          fileUrlOptimized:
            detail.fileUrlOptimized ?? summary?.fileUrlOptimized,
          previewCompositeUrl:
            detail.previewCompositeUrl ?? summary?.previewCompositeUrl,
          rejectionNote: detail.rejectionNote ?? summary?.rejectionNote,
        });
        const latestRevision = notifications.find(
          (notification) =>
            notification.notifyType.toLowerCase() === "revisionrequired" &&
            notification.relatedEntityType?.toLowerCase() === "pagetask" &&
            notification.relatedEntityId?.toLowerCase() === id.toLowerCase(),
        );
        setRevisionFeedback(latestRevision ?? null);
        if (pin) setQaPin(pin as QaBugPinDto);
      })
      .catch((error: unknown) => {
        setTask(null);
        toast.error(
          "Could not load task details",
          error instanceof Error ? error.message : "Unknown error",
        );
      })
      .finally(() => setIsLoadingTask(false));
  }, [id, toast]);

  const uploadArtwork = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Chỉ lưu URL sau khi upload thành công; URL này được gửi cùng layer khi submit.
      const result = await mangaErpApi.uploadImage(file);
      setArtworkUrl(result.url);
      toast.success("Artwork uploaded", "The layer image is ready to submit.");
    } catch (error) {
      toast.error(
        "Could not upload artwork",
        error instanceof Error
          ? error.message
          : "Please choose a PNG, JPG, JPEG, or WEBP image.",
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const downloadImage = async (imageUrl: string, fileName: string) => {
    setIsDownloading(true);

    try {
      // Tải dữ liệu ảnh về Blob để trình duyệt lưu file thay vì điều hướng sang URL ảnh khác domain.
      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new Error(`Image download failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);

      toast.success(
        "Image download started",
        "The image is being saved to your device.",
      );
    } catch (error) {
      toast.error(
        "Could not download image",
        error instanceof Error
          ? error.message
          : "The image could not be downloaded.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const submit = async () => {
    if (!id || !artworkUrl.trim()) {
      toast.error(
        "Artwork image is required",
        "Upload the completed layer image before submitting.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const submittedUrl = artworkUrl.trim();

      await mangaErpApi.submitPageTaskLayer(id, {
        LayerType: layerType,
        FileUrlOriginal: submittedUrl,
        FileUrlOptimized: submittedUrl,
      });
      if (qaPin?.id) {
        // Layer nộp lại sẽ báo QA pin liên kết đã được Studio sửa, chờ Editor xác minh.
        await mangaErpApi.resolveQaPin(qaPin.id, {});
        setQaPin(null);
      }

      // Giữ lại bản vừa nộp trong giao diện, kể cả khi API chi tiết task chưa kịp trả URL mới.
      setSubmittedArtworkUrl(submittedUrl);
      setTask((currentTask) =>
        currentTask
          ? {
              ...currentTask,
              currentLayerType: layerType,
              fileUrlOriginal: submittedUrl,
              fileUrlOptimized: submittedUrl,
              previewCompositeUrl: submittedUrl,
            }
          : currentTask,
      );

      toast.success(
        task?.status.toLowerCase() === "revisionalert"
          ? "Corrected layer resubmitted"
          : "Layer submitted",
        "The Mangaka can now review this page task.",
      );
      setArtworkUrl("");
    } catch (error) {
      toast.error(
        "Could not submit layer",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        to="/assistant/tasks"
        className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"
      >
        <ArrowLeft size={16} />
        Back to tasks
      </Link>

      <header className="rounded-2xl border border-slate-800 bg-slate-900 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Assistant - MF2
        </p>
        <h1 className="mt-2 text-3xl font-black text-white">
          Submit Artwork Layer
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {isLoadingTask
            ? "Loading task details..."
            : task
              ? formatTaskTitle(task)
              : "Task details are not available"}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <FileImage size={20} className="text-cyan-300" />
            Assignment
          </h2>
          <dl className="mt-5 space-y-4 text-sm">
            <Info label="Status" value={task?.status ?? "Assigned"} />
            <Info label="Page" value={task ? String(task.pageNumber) : "-"} />
            <Info label="Task type" value={task?.taskType ?? "General"} />
            {task?.deadline ? (
              <Info
                label="Deadline"
                value={new Date(task.deadline).toLocaleString()}
              />
            ) : null}
          </dl>

          {originalReferenceImageUrl ? (
            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
                  Original page reference
                </p>
                <button
                  type="button"
                  onClick={() =>
                    void downloadImage(
                      originalReferenceImageUrl,
                      `chapter-${task?.chapterNumber ?? "page"}-page-${task?.pageNumber ?? "task"}-original`,
                    )
                  }
                  disabled={isDownloading}
                  className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/20"
                >
                  <Download size={15} />
                  {isDownloading ? "Downloading..." : "Download image"}
                </button>
              </div>
              <img
                src={originalReferenceImageUrl}
                alt={`Original page ${task?.pageNumber ?? "task"} reference from Mangaka`}
                className="mt-3 max-h-80 w-full rounded-lg object-contain"
              />
            </div>
          ) : null}

          <div className="mt-5 rounded-xl border border-cyan-400/20 bg-cyan-500/10 p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
              <ClipboardPenLine size={16} /> Initial assignment
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-100">
              {task?.description?.trim() ||
                "No initial instructions were provided for this task."}
            </p>
          </div>

          {task?.status.toLowerCase() === "revisionalert" ||
          task?.rejectionNote ||
          revisionFeedback ? (
            <div className="mt-4 rounded-xl border border-rose-400/25 bg-rose-500/10 p-4">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-rose-200">
                <AlertTriangle size={16} /> Revision feedback
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-rose-100">
                {task?.rejectionNote?.trim() ||
                  revisionFeedback?.message?.trim() ||
                  "A revision was requested, but no written comment is available."}
              </p>
              {revisionFeedback?.createdAt ? (
                <p className="mt-3 text-xs text-rose-200/60">
                  Received{" "}
                  {new Date(revisionFeedback.createdAt).toLocaleString()}
                </p>
              ) : null}
            </div>
          ) : null}
          {qaPin ? (
            <div className="mt-4 rounded-xl border border-amber-300/30 bg-amber-400/10 p-4">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-amber-200">
                Open QA pin
              </p>
              <p className="mt-2 text-sm text-amber-50">
                {qaPin.noteMessage ||
                  qaPin.description ||
                  "Editor requested a correction."}
              </p>
              <p className="mt-2 text-xs text-amber-200/75">
                {qaPin.issueType ?? "Issue"} · {qaPin.severity ?? "Normal"} ·
                status: {qaPin.status}
              </p>
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-bold text-white">Layer submission</h2>
          <p className="mt-2 text-sm text-slate-400">
            Submitting again replaces the previous layer for this page task.
          </p>
          <div className="mt-5 space-y-4">
            <label className="block text-sm text-slate-400">
              Layer type
              <select
                className="input mt-2"
                value={layerType}
                onChange={(event) =>
                  setLayerType(event.target.value as LayerType)
                }
              >
                {layerTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>

            {submissionImageUrl ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-200">
                    {artworkUrl
                      ? "Artwork ready to submit"
                      : "Latest submitted artwork"}
                  </p>
                  {!artworkUrl ? (
                    <button
                      type="button"
                      onClick={() =>
                        void downloadImage(
                          submissionImageUrl,
                          `chapter-${task?.chapterNumber ?? "page"}-page-${task?.pageNumber ?? "task"}-artwork`,
                        )
                      }
                      disabled={isDownloading}
                      className="inline-flex items-center gap-2 rounded-lg border border-violet-300/30 bg-violet-300/10 px-3 py-2 text-xs font-semibold text-violet-100 transition hover:bg-violet-300/20"
                    >
                      <Download size={15} />
                      {isDownloading ? "Downloading..." : "Download artwork"}
                    </button>
                  ) : null}
                </div>
                <img
                  src={submissionImageUrl}
                  alt={
                    artworkUrl
                      ? "Artwork layer ready to submit"
                      : "Latest artwork layer submitted by the Assistant"
                  }
                  className="mt-3 max-h-96 w-full rounded-lg object-contain"
                />
              </div>
            ) : null}

            <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 font-semibold text-cyan-100 hover:bg-cyan-300/15">
              <Upload size={18} />
              {isUploading
                ? "Uploading..."
                : artworkUrl
                  ? "Replace artwork image"
                  : "Upload artwork image"}
              <input
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={isUploading || isSubmitting}
                onChange={(event) => void uploadArtwork(event)}
              />
            </label>

            <button
              type="button"
              onClick={() => void submit()}
              disabled={isSubmitting || isUploading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
            >
              <Send size={18} />
              {isSubmitting ? "Submitting..." : "Submit layer"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  alert = false,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${alert ? "border-rose-400/20 bg-rose-500/10" : "border-slate-800 bg-slate-950"}`}
    >
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className={`mt-1 ${alert ? "text-rose-200" : "text-slate-200"}`}>
        {value}
      </dd>
    </div>
  );
}
