import type { ReactNode } from "react";
import type { FormEvent } from "react";
import { useState } from "react";
import { ImagePlus, Send, Upload } from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import { useToast } from "../../shared/components/toastContext";

export default function CreateSeriesPage() {
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [manuscriptUrl, setManuscriptUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null") as
    | { userId?: string }
    | null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentUser?.userId) {
      toast.error("Login required", "Please login again before submitting a series proposal.");
      return;
    }

    if (!manuscriptUrl.trim()) {
      toast.error("Manuscript URL required", "Paste a manuscript URL before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await mangaErpApi.createDraftSubmission({
        title,
        description,
        genre,
        coverImageUrl: coverImageUrl || null,
        manuscriptUrl,
      });
      const submissionId = result.submissionId ?? result.SubmissionId;
      if (submissionId) {
        await mangaErpApi.submitSubmission(submissionId);
      }
      toast.success(
        "Proposal submitted",
        submissionId
          ? `Submission ID: ${submissionId}. Sent to Tantou Editor review.`
          : "Your proposal was sent to the backend.",
      );
    } catch (err) {
      toast.error(
        "Could not submit proposal",
        err instanceof Error ? err.message : "Please check the form and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Series Proposal
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Submit a new manga proposal
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Define the title, genre, description, cover, and manuscript URL.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            form="series-proposal-form"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={16} />
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      <form
        id="series-proposal-form"
        onSubmit={handleSubmit}
        className="grid gap-5 xl:grid-cols-[1fr_22rem]"
      >
        <section className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Title">
              <input
                required
                className="input"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Series title"
              />
            </Field>
            <Field label="Genre">
              <input
                className="input"
                value={genre}
                onChange={(event) => setGenre(event.target.value)}
                placeholder="Genre"
              />
            </Field>
          </div>

          <div className="mt-5">
            <Field label="Description">
              <textarea
                className="input min-h-40 resize-y"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="A concise story pitch, target audience, key hook, and long-term arc."
              />
            </Field>
          </div>

          <div className="mt-5">
            <Field label="Cover Upload">
              <div className="flex min-h-64 flex-col justify-center rounded-lg border border-dashed border-cyan-300/30 bg-cyan-300/5 p-6 text-center">
                {coverImageUrl ? (
                  <img
                    src={coverImageUrl}
                    alt="Cover preview"
                    className="mx-auto aspect-[2/3] max-h-72 rounded-lg border border-white/10 object-cover shadow-xl shadow-slate-950/30"
                  />
                ) : (
                  <>
                    <ImagePlus className="mx-auto text-cyan-200" size={36} />
                    <span className="mt-3 text-sm font-semibold text-white">
                      Cover image URL
                    </span>
                  </>
                )}
                <input
                  className="input mt-4"
                  value={coverImageUrl}
                  onChange={(event) => setCoverImageUrl(event.target.value)}
                  placeholder="https://..."
                />
              </div>
            </Field>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
                <Upload size={18} />
              </span>
              <div>
                <h3 className="font-bold text-white">Initial assets</h3>
                <p className="text-sm text-slate-400">Optional launch files</p>
</div>
            </div>
            <div className="mt-5 space-y-3">
              <input
                required
                className="input"
                value={manuscriptUrl}
                onChange={(event) => setManuscriptUrl(event.target.value)}
                placeholder="Manuscript URL required by backend"
              />
            </div>
          </section>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-200">
        {label}
      </span>
      {children}
    </div>
  );
}
