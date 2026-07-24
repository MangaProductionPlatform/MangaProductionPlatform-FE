import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Eye, FileText, RefreshCw, Save, Send, Upload } from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type {
  FeedbackPinDto,
  SubmissionDetailDto,
  SubmissionSummaryDto,
} from "../../shared/types/mangaErp";
import { useToast } from "../../shared/components/toastContext";
import WorkflowEmptyState from "../../shared/components/WorkflowEmptyState";

export default function SubmissionPage() {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<SubmissionSummaryDto[]>([]);
  const [selected, setSelected] = useState<SubmissionDetailDto | null>(null);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [manuscriptUrl, setManuscriptUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingManuscript, setIsUploadingManuscript] = useState(false);
  const [feedbackPins, setFeedbackPins] = useState<FeedbackPinDto[]>([]);
  const [reviewResults, setReviewResults] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [isLoadingReviewResults, setIsLoadingReviewResults] = useState(false);
  const linkedSubmissionId = searchParams.get("id") ?? searchParams.get("submissionId");
  const isDraftSelected = selected?.status === "Draft";

  const fillForm = (detail: SubmissionDetailDto | null) => {
    setSelected(detail);
    setTitle(detail?.title ?? "");
    setGenre(detail?.genre ?? "");
    setDescription(detail?.description ?? "");
    setCoverImageUrl(detail?.coverImageUrl ?? "");
    setManuscriptUrl(detail?.manuscriptUrl ?? "");
  };

  const openSubmission = async (id: string) => {
    try {
      const [detail, pins] = await Promise.all([
        mangaErpApi.getSubmission(id),
        mangaErpApi.getSubmissionFeedbackPins(id).catch(() => []),
      ]);
      fillForm(detail);
      setFeedbackPins(pins);
      setReviewResults(null);
    } catch (err) {
      toast.error(
        "Could not open submission",
        err instanceof Error ? err.message : "Please try again.",
      );
    }
  };

  const loadSubmissions = async (submissionIdToOpen?: string | null) => {
    const targetSubmissionId = submissionIdToOpen ?? selected?.id ?? null;
    setIsLoading(true);
    try {
      const result = await mangaErpApi.getMySubmissions();
      setItems(result);

      if (targetSubmissionId && result.some((item) => item.id === targetSubmissionId)) {
        await openSubmission(targetSubmissionId);
      } else if (targetSubmissionId) {
        fillForm(null);
        setFeedbackPins([]);
        setReviewResults(null);
      }
    } catch (err) {
      setItems([]);
      toast.error(
        "Could not load submissions",
        err instanceof Error
          ? err.message
          : "Please check your Mangaka session.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSubmissions(null);
    // Initial backend load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (linkedSubmissionId) {
      void openSubmission(linkedSubmissionId);
    }
    // React to notification deep links only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkedSubmissionId]);

  const loadReviewResults = async () => {
    if (!selected) return;
    setIsLoadingReviewResults(true);
    try {
      setReviewResults(
        await mangaErpApi.getSubmissionReviewResults(selected.id),
      );
    } catch (err) {
      toast.error(
        "Could not load review results",
        err instanceof Error
          ? err.message
          : "No review results are available yet.",
      );
    } finally {
      setIsLoadingReviewResults(false);
    }
  };

  const handleCreateDraft = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!coverImageUrl.trim()) {
      toast.error("Cover image required", "Upload a cover image before creating the draft.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await mangaErpApi.createDraftSubmission({
        title,
        genre: genre || null,
        description: description || null,
        coverImageUrl: coverImageUrl.trim(),
        manuscriptUrl: manuscriptUrl || null,
      });
      const id = result.submissionId ?? result.SubmissionId;
      toast.success(
        "Draft created",
        id ? `Submission ID: ${id}` : "Draft saved.",
      );
      await loadSubmissions(id ?? null);
    } catch (err) {
      toast.error(
        "Could not create draft",
        err instanceof Error
          ? err.message
          : "Please check the form and try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const updateMetadata = async () => {
    if (!selected) {
      toast.error(
        "No draft selected",
        "Open a submission before updating metadata.",
      );
      return;
    }

    if (!isDraftSelected) {
      toast.error("Metadata locked", "Only Draft submissions can be edited.");
      return;
    }

    setIsSaving(true);
    try {
      await mangaErpApi.updateSubmissionMetadata(selected.id, {
        title,
        genre: genre || null,
        description: description || null,
        coverImageUrl: coverImageUrl.trim() || null,
      });
      toast.success("Metadata updated", "Draft metadata was saved.");
      await loadSubmissions(selected.id);
    } catch (err) {
      toast.error(
        "Could not update metadata",
        err instanceof Error
          ? err.message
          : "Only Draft submissions can be edited.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const updateManuscript = async () => {
    if (!selected) {
      toast.error(
        "No draft selected",
        "Open a submission before updating manuscript.",
      );
      return;
    }

    if (!isDraftSelected) {
      toast.error("Manuscript locked", "Only Draft submissions can be edited.");
      return;
    }

    if (!manuscriptUrl.trim()) {
      toast.error("Manuscript required", "Upload a manuscript image first.");
      return;
    }

    setIsSaving(true);
    try {
      await mangaErpApi.updateSubmissionManuscript(selected.id, {
        manuscriptUrl: manuscriptUrl.trim(),
      });
      toast.success(
        "Manuscript updated",
        "The uploaded manuscript image was saved.",
      );
      await loadSubmissions(selected.id);
    } catch (err) {
      toast.error(
        "Could not update manuscript",
        err instanceof Error
          ? err.message
          : "Only Draft submissions can be edited.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const uploadCoverImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const result = await mangaErpApi.uploadImage(file);
      setCoverImageUrl(result.url);
      toast.success(
        "Cover uploaded",
        selected
          ? "Click Update metadata to save it."
          : "Create the draft to save it.",
      );
    } catch (err) {
      toast.error(
        "Could not upload cover",
        err instanceof Error
          ? err.message
          : "Please choose a PNG, JPG, JPEG, or WEBP image.",
      );
    } finally {
      setIsUploadingCover(false);
      event.target.value = "";
    }
  };

  const uploadManuscriptImage = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingManuscript(true);
    try {
      const result = await mangaErpApi.uploadImage(file);
      setManuscriptUrl(result.url);
      toast.success(
        "Manuscript uploaded",
        selected
          ? "Click Update manuscript to save it."
          : "Create the draft to save it.",
      );
    } catch (err) {
      toast.error(
        "Could not upload manuscript",
        err instanceof Error
          ? err.message
          : "Please choose a PNG, JPG, JPEG, or WEBP image.",
      );
    } finally {
      setIsUploadingManuscript(false);
      event.target.value = "";
    }
  };

  const submitSelected = async () => {
    if (!selected) {
      toast.error("No submission selected", "Open a draft before submitting.");
      return;
    }

    if (!isDraftSelected) {
      toast.error("Submission locked", "Only Draft submissions can be submitted.");
      return;
    }

    setIsSaving(true);
    try {
      await mangaErpApi.submitSubmission(selected.id);
      toast.success(
        "Submitted",
        "The submission was sent to Editorial Board review.",
      );
      await loadSubmissions(selected.id);
    } catch (err) {
      toast.error(
        "Could not submit",
        err instanceof Error
          ? err.message
          : "Only Draft submissions can be submitted.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Mangaka
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Series submissions
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Draft, edit, and submit series proposals through the MF1
            review workflow.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadSubmissions()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <section className="grid gap-5 xl:grid-cols-[1fr_26rem]">
        <div className="space-y-3">
          {isLoading ? (
            <div className="rounded-lg border border-white/10 bg-slate-900/75 p-5 text-sm text-slate-300">
              Loading submissions...
            </div>
          ) : null}

          {!isLoading && items.length === 0 ? (
            <WorkflowEmptyState
              icon={FileText}
              title="No submissions yet"
              description="Create a draft to start your series proposal and Editorial Board review."
              actionLabel="Create draft"
              actionTo="/mangaka/submissions"
              onRefresh={() => void loadSubmissions()}
            />
          ) : null}

          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-lg border border-white/10 bg-slate-900/75 p-4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <span className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-xs font-semibold text-cyan-100">
                    {item.status}
                  </span>
                  <h3 className="mt-3 text-xl font-black text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {item.genre ?? "Uncategorized"}
                  </p>
                  {item.feedbackMessage ? (
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {item.feedbackMessage}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => void openSubmission(item.id)}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
                >
                  <Eye size={15} />
                  Open
                </button>
              </div>
            </article>
          ))}
        </div>

        <form
          onSubmit={handleCreateDraft}
          className="rounded-lg border border-white/10 bg-slate-900/75 p-5"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
              <FileText size={18} />
            </span>
            <div>
              <h3 className="font-bold text-white">
                {selected ? "Selected submission" : "New draft"}
              </h3>
              <p className="break-all text-xs text-slate-400">
                {selected?.id ?? "New draft — not saved yet"}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {coverImageUrl ? (
              <img
                src={coverImageUrl}
                alt="Submission cover preview"
                className="mx-auto aspect-[2/3] max-h-72 rounded-lg border border-white/10 object-cover shadow-xl shadow-slate-950/30"
              />
            ) : null}
            <input
              required
              className="input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Title"
            />
            <input
              className="input"
              value={genre}
              onChange={(event) => setGenre(event.target.value)}
              placeholder="Genre"
            />
            <textarea
              className="input min-h-28 resize-y"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description"
            />
            <input
              className="input"
              value={coverImageUrl}
              onChange={(event) => setCoverImageUrl(event.target.value)}
              placeholder="Cover image URL"
            />
            <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/15">
              <Upload size={16} />
              {isUploadingCover
                ? "Uploading..."
                : coverImageUrl
                  ? "Replace cover image"
                  : "Upload cover image"}
              <input
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={isUploadingCover || isSaving}
                onChange={(event) => void uploadCoverImage(event)}
              />
            </label>
            {manuscriptUrl ? (
              <img
                src={manuscriptUrl}
                alt="Manuscript preview"
                className="mx-auto max-h-72 rounded-lg border border-white/10 object-contain shadow-xl shadow-slate-950/30"
              />
            ) : null}
            <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/15">
              <Upload size={16} />
              {isUploadingManuscript
                ? "Uploading..."
                : manuscriptUrl
                  ? "Replace manuscript image"
                  : "Upload manuscript image"}
              <input
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={isUploadingManuscript || isSaving}
                onChange={(event) => void uploadManuscriptImage(event)}
              />
            </label>
          </div>

          <div className="mt-5 grid gap-2">
            <button
              type="submit"
              disabled={isSaving || Boolean(selected)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />
              {isSaving ? "Saving..." : selected ? "Draft created" : "Create draft"}
            </button>
            <button
              type="button"
              disabled={isSaving || !selected || !isDraftSelected}
              onClick={() => void updateMetadata()}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />
              Update metadata
            </button>
            <button
              type="button"
              disabled={isSaving || !selected || !isDraftSelected}
              onClick={() => void updateManuscript()}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload size={16} />
              Update manuscript
            </button>
            <button
              type="button"
              disabled={isSaving || !selected || !isDraftSelected}
              onClick={() => void submitSelected()}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={16} />
              Submit
            </button>
          </div>
          {selected ? (
            <div className="mt-5 rounded-lg border border-white/10 bg-slate-950/50 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-400">
                  Feedback pins ({feedbackPins.length})
                </p>
                <button
                  type="button"
                  className="text-xs font-semibold text-cyan-200"
                  onClick={() =>
                    void mangaErpApi
                      .getSubmissionFeedbackPins(selected.id, true)
                      .then(setFeedbackPins)
                      .catch((e) =>
                        toast.error(
                          "Could not load pin history",
                          e instanceof Error ? e.message : "Unknown error",
                        ),
                      )
                  }
                >
                  Load history
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {feedbackPins.map((pin) => (
                  <div
                    key={pin.id}
                    className="rounded-md border border-white/10 p-2 text-xs text-slate-300"
                  >
                    <b className="text-white">
                      {pin.pageIdentifier} · {pin.category}
                    </b>
                    <p className="mt-1">{pin.comment}</p>
                  </div>
                ))}
                {!feedbackPins.length ? (
                  <p className="text-xs text-slate-500">No feedback pins.</p>
                ) : null}
              </div>
            </div>
          ) : null}
          {selected ? (
            <div className="mt-4 rounded-lg border border-fuchsia-300/20 bg-fuchsia-500/10 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[.16em] text-fuchsia-100">
                    Board review results
                  </p>
                  <p className="mt-1 text-xs text-slate-300">
                    Decision, feedback, annotations and review status.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void loadReviewResults()}
                  disabled={isLoadingReviewResults}
                  className="rounded-md border border-fuchsia-200/30 px-3 py-2 text-xs font-semibold text-fuchsia-100 disabled:opacity-50"
                >
                  {isLoadingReviewResults ? "Loading..." : "Load results"}
                </button>
              </div>
              {reviewResults ? (
                <dl className="mt-3 space-y-2">
                  {Object.entries(reviewResults).map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-md border border-fuchsia-100/10 bg-slate-950/40 p-2"
                    >
                      <dt className="text-[11px] uppercase tracking-[.12em] text-fuchsia-100/70">
                        {key}
                      </dt>
                      <dd className="mt-1 whitespace-pre-wrap break-words text-xs text-slate-100">
                        {typeof value === "object"
                          ? JSON.stringify(value, null, 2)
                          : String(value ?? "—")}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-3 text-xs text-slate-400">
                  Load the result after Editorial Board review is available.
                </p>
              )}
            </div>
          ) : null}
        </form>
      </section>
    </div>
  );
}
