import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileImage,
  ImageOff,
  Send,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useToast } from "../../shared/components/toastContext";
import { WorkflowStatusBadge } from "../../shared/components/WorkflowStatusBadge";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type {
  PageTaskDto,
  SubmitPageLayerPayload,
} from "../../shared/types/mangaErp";
import { getWorkflowStatusMeta } from "../../shared/utils/workflowStatus";
import "./AssistantTaskDetailPage.css";

const layerTypes: SubmitPageLayerPayload["LayerType"][] = [
  "LineArt",
  "Color",
  "Background",
];

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isImageUrl(value: string) {
  if (!isValidHttpUrl(value)) return false;

  const pathname = new URL(value).pathname.toLowerCase();
  return /\.(avif|gif|jpe?g|png|webp)$/.test(pathname);
}

export default function AssistantTaskDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const [task, setTask] = useState<PageTaskDto | null>(null);
  const [layerType, setLayerType] =
    useState<SubmitPageLayerPayload["LayerType"]>("LineArt");
  const [fileUrlOriginal, setFileUrlOriginal] = useState("");
  const [fileUrlOptimized, setFileUrlOptimized] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTask, setIsLoadingTask] = useState(Boolean(id));
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loadError, setLoadError] = useState(
    id ? "" : "This task link does not contain a task ID.",
  );

  useEffect(() => {
    if (!id) return;

    void mangaErpApi
      .getAssignedPageTasks()
      .then((items) => {
        const matchedTask = items.find((item) => item.id === id) ?? null;
        setTask(matchedTask);

        if (matchedTask) {
          setLoadError("");
        } else {
          setLoadError("This task is no longer available in your assigned work.");
          toast.error(
            "Task not found",
            "This task is no longer in your assigned work.",
          );
        }
      })
      .catch((error: unknown) => {
        const detail =
          error instanceof Error ? error.message : "Unknown error";
        setTask(null);
        setLoadError(detail);
        toast.error(
          "Could not load task details",
          detail,
        );
      })
      .finally(() => setIsLoadingTask(false));
  }, [id, toast]);

  const originalUrl = fileUrlOriginal.trim();
  const optimizedUrl = fileUrlOptimized.trim();
  const originalUrlError =
    originalUrl && !isValidHttpUrl(originalUrl)
      ? "Enter a complete HTTP or HTTPS URL."
      : "";
  const optimizedUrlError =
    optimizedUrl && !isValidHttpUrl(optimizedUrl)
      ? "Enter a complete HTTP or HTTPS URL."
      : "";
  const taskStatus = getWorkflowStatusMeta(task?.status);

  const submit = async () => {
    if (!id || !originalUrl || !optimizedUrl) {
      toast.error(
        "Layer URLs are required",
        "Enter both the original artwork URL and optimized preview URL.",
      );
      return;
    }

    if (originalUrlError || optimizedUrlError) {
      toast.error(
        "Check the artwork URLs",
        "Both links must use a valid HTTP or HTTPS address.",
      );
      return;
    }

    setIsSubmitting(true);
    setIsSubmitted(false);

    try {
      await mangaErpApi.submitPageTaskLayer(id, {
        LayerType: layerType,
        FileUrlOriginal: originalUrl,
        FileUrlOptimized: optimizedUrl,
      });
      toast.success(
        taskStatus.label === "Revision Required"
          ? "Corrected layer resubmitted"
          : "Layer submitted",
        "The Mangaka can now review this page task.",
      );
      setIsSubmitted(true);
    } catch (error) {
      toast.error(
        "Could not submit layer",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const taskDescription = isLoadingTask
    ? "Loading task details…"
    : task
      ? `${task.chapterTitle ?? "Chapter"} · Page ${task.pageNumber}`
      : `Task ${id ?? "not found"}`;

  return (
    <div className="assistant-task-detail-page space-y-6">
      <Link
        to="/assistant/tasks"
        className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"
      >
        <ArrowLeft size={16} />
        Back to tasks
      </Link>

      <header className="rounded-2xl border border-slate-800 bg-slate-900 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Assistant · MF2
        </p>
        <h1 className="mt-2 text-3xl font-black text-white">
          Submit Artwork Layer
        </h1>
        <p className="mt-2 text-sm text-slate-400">{taskDescription}</p>

        <div className="task-progress mt-6 grid grid-cols-3 gap-2">
          <ProgressStep label="Assigned" active />
          <ProgressStep
            label="Submitted"
            active={isSubmitted || Boolean(task?.currentLayerVersion)}
          />
          <ProgressStep
            label="Reviewed"
            active={
              taskStatus.label === "Approved" ||
              taskStatus.label === "Revision Required"
            }
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <FileImage size={20} className="text-cyan-300" />
            Assignment
          </h2>

          <dl className="mt-5 space-y-4 text-sm">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <dt className="text-xs text-slate-500">Status</dt>
              <dd className="mt-2">
                <WorkflowStatusBadge status={task?.status ?? "Assigned"} />
              </dd>
            </div>
            <Info label="Page" value={task ? String(task.pageNumber) : "—"} />
            <Info label="Task ID" value={id ?? "—"} technical />
            {task?.rejectionNote ? (
              <Info label="Revision alert" value={task.rejectionNote} alert />
            ) : null}
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Layer submission</h2>
              <p className="mt-2 text-sm text-slate-400">
                Upload the artwork to external storage and paste the URL here.
              </p>
            </div>
            <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">
              URL submission
            </span>
          </div>

          {loadError ? (
            <div className="mt-5 rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">
              {loadError}
            </div>
          ) : null}

          <div className="mt-5 space-y-5">
            <label className="block text-sm text-slate-400">
              Layer type
              <select
                className="input mt-2"
                value={layerType}
                onChange={(event) => {
                  setLayerType(
                    event.target.value as SubmitPageLayerPayload["LayerType"],
                  );
                  setIsSubmitted(false);
                }}
              >
                {layerTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>

            <UrlField
              label="Original artwork URL"
              value={fileUrlOriginal}
              error={originalUrlError}
              placeholder="https://storage.example/page-layer.psd"
              onChange={(value) => {
                setFileUrlOriginal(value);
                setIsSubmitted(false);
              }}
            />

            <UrlField
              label="Optimized preview URL"
              value={fileUrlOptimized}
              error={optimizedUrlError}
              placeholder="https://storage.example/page-preview.webp"
              onChange={(value) => {
                setFileUrlOptimized(value);
                setIsSubmitted(false);
              }}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <ArtworkPreview label="Original" url={originalUrl} />
              <ArtworkPreview label="Optimized" url={optimizedUrl} />
            </div>

            {isSubmitted ? (
              <div className="submission-success flex items-start gap-3 rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-4 text-emerald-100">
                <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" size={20} />
                <div>
                  <p className="font-semibold">Layer submitted successfully</p>
                  <p className="mt-1 text-sm text-emerald-200/75">
                    Your links were sent for Mangaka review. Keep this task open
                    if you need to verify the submitted previews.
                  </p>
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => void submit()}
              disabled={
                isSubmitting ||
                isLoadingTask ||
                !task ||
                !originalUrl ||
                !optimizedUrl ||
                Boolean(originalUrlError || optimizedUrlError)
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={18} />
              {isSubmitting ? "Submitting…" : "Submit layer for review"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

type ProgressStepProps = {
  label: string;
  active?: boolean;
};

function ProgressStep({ label, active = false }: ProgressStepProps) {
  return (
    <div className={active ? "is-active" : ""}>
      <span />
      <p>{label}</p>
    </div>
  );
}

type UrlFieldProps = {
  label: string;
  value: string;
  error: string;
  placeholder: string;
  onChange: (value: string) => void;
};

function UrlField({
  label,
  value,
  error,
  placeholder,
  onChange,
}: UrlFieldProps) {
  return (
    <label className="block text-sm text-slate-400">
      {label}
      <input
        type="url"
        className={`input mt-2 ${error ? "border-rose-400/60" : ""}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
      />
      {error ? (
        <span className="mt-2 block text-xs text-rose-300">{error}</span>
      ) : null}
    </label>
  );
}

type ArtworkPreviewProps = {
  label: string;
  url: string;
};

function ArtworkPreview({ label, url }: ArtworkPreviewProps) {
  const canPreview = isImageUrl(url);
  const canOpen = isValidHttpUrl(url);

  return (
    <div className="artwork-preview-card rounded-xl border border-slate-800 bg-slate-950/80 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        {canOpen ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200"
          >
            Open {label}
            <ExternalLink size={12} />
          </a>
        ) : null}
      </div>

      {canPreview ? (
        <img
          src={url}
          alt={`${label} artwork preview`}
          className="mt-3 h-52 w-full rounded-lg object-contain"
        />
      ) : (
        <div className="mt-3 flex h-52 flex-col items-center justify-center rounded-lg border border-dashed border-slate-800 px-4 text-center text-xs text-slate-500">
          <ImageOff size={24} />
          <p className="mt-2">
            {url
              ? "This file type cannot be previewed in the browser."
              : "Paste a direct image URL to preview it here."}
          </p>
        </div>
      )}
    </div>
  );
}

type InfoProps = {
  label: string;
  value: string;
  alert?: boolean;
  technical?: boolean;
};

function Info({
  label,
  value,
  alert = false,
  technical = false,
}: InfoProps) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        alert
          ? "border-rose-400/20 bg-rose-500/10"
          : "border-slate-800 bg-slate-950"
      }`}
    >
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd
        className={`mt-1 ${
          alert ? "text-rose-200" : "text-slate-200"
        } ${technical ? "break-all font-mono text-xs text-slate-500" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
