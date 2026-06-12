import type { ReactNode } from "react";
import type { FormEvent } from "react";
import { useState } from "react";
import { BookOpen, ImagePlus, Save, Send, Tags, Upload } from "lucide-react";
import { mangaErpApi } from "../../shared/api/mangaErpApi";
import { useToast } from "../../shared/components/ToastProvider";

const tagSuggestions = ["Shonen", "Drama", "Mystery", "Romance", "Sports", "Urban Fantasy"];
const publishChecklist = [
  "Series bible prepared",
  "Main cast profiles",
  "Cover concept uploaded",
  "Chapter 1 outline",
] as const;

export default function CreateSeriesPage() {
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("Cyber Fantasy");
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
      const result = await mangaErpApi.createSubmission({
        submitterId: currentUser.userId,
        title,
        description,
        genre,
        coverImageUrl: coverImageUrl || null,
        manuscriptUrl,
      });
      const submissionId = result.submissionId ?? result.SubmissionId;
      toast.success(
        "Proposal submitted",
        submissionId
          ? `Submission ID: ${submissionId}`
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
            Define the title, genre, description, cover, and tags before the
            first chapter enters production.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            <Save size={16} />
            Save Draft
          </button>
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
              <select
                className="input"
                value={genre}
                onChange={(event) => setGenre(event.target.value)}
              >
                <option>Cyber Fantasy</option>
                <option>Slice of Life</option>
                <option>Sports Drama</option>
                <option>Mystery</option>
                <option>Action Comedy</option>
              </select>
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

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
            <Field label="Cover Upload">
              <div className="flex min-h-64 flex-col justify-center rounded-lg border border-dashed border-cyan-300/30 bg-cyan-300/5 p-6 text-center">
                <ImagePlus className="text-cyan-200" size={36} />
                <span className="mt-3 text-sm font-semibold text-white">
                  Cover image URL
                </span>
                <input
                  className="input mt-4"
                  value={coverImageUrl}
                  onChange={(event) => setCoverImageUrl(event.target.value)}
                  placeholder="https://..."
                />
              </div>
            </Field>

            <Field label="Tags">
              <div className="rounded-lg border border-white/10 bg-slate-950/70 p-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <Tags size={16} />
                  <input
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                    placeholder="Add tag"
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tagSuggestions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </Field>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-300 text-slate-950">
                <BookOpen size={18} />
              </span>
              <div>
                <h3 className="font-bold text-white">Series package</h3>
                <p className="text-sm text-slate-400">Draft readiness</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {publishChecklist.map((item, index) => (
                <label
                  key={item}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-200"
                >
                  <input
                    type="checkbox"
                    defaultChecked={index < 2}
                    className="h-4 w-4 accent-cyan-300"
                  />
                  {item}
                </label>
              ))}
            </div>
          </section>

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
              <input className="input" type="file" />
              <input
                required
                className="input"
                value={manuscriptUrl}
                onChange={(event) => setManuscriptUrl(event.target.value)}
                placeholder="Manuscript URL required by backend"
              />
              <input className="input" placeholder="Target first deadline" />
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
