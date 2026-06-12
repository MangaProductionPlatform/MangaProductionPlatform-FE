import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import { useToast } from "../../shared/components/toastContext";

const drawingSoftwareOptions = [
  "Clip Studio Paint",
  "Photoshop",
  "Vẽ tay",
] as const;

export default function ActivateAccountPage() {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [penName, setPenName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [drawingSoftwares, setDrawingSoftwares] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activatedUsername, setActivatedUsername] = useState("");

  const toggleSoftware = (value: string) => {
    setDrawingSoftwares((items) =>
      items.includes(value)
        ? items.filter((item) => item !== value)
        : [...items, value],
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      toast.error("Missing token", "Open the activation link from your email.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Password mismatch", "Password confirmation does not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await mangaErpApi.activateAccount({
        token,
        password,
        penName: penName.trim() || null,
        drawingSoftwares,
        bankAccountNumber: bankAccountNumber.trim() || null,
      });
      setActivatedUsername(result.username);
      toast.success("Account activated", "You can now login with your username.");
    } catch (err) {
      toast.error(
        "Could not activate account",
        err instanceof Error ? err.message : "Please check the activation link.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-slate-100">
      <main className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <section className="grid w-full gap-6 lg:grid-cols-[0.85fr_1fr]">
          <div className="rounded-lg border border-white/10 bg-slate-900/75 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
              MangaStudio
            </p>
            <h1 className="mt-3 text-4xl font-black text-white">
              Activate your account
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Set your password and complete your working profile from the email
              activation link.
            </p>
            {activatedUsername ? (
              <div className="mt-6 rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-100">
                <CheckCircle2 size={18} />
                <p className="mt-2 font-semibold">Username: {activatedUsername}</p>
                <Link
                  to="/login"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-950"
                >
                  Go to login
                  <ArrowRight size={15} />
                </Link>
              </div>
            ) : null}
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(2,6,23,0.45)] backdrop-blur-xl"
          >
            <div className="grid gap-5">
              <Field label="New password">
                <input
                  required
                  type="password"
                  className="input"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="New password"
                />
              </Field>
              <Field label="Confirm password">
                <input
                  required
                  type="password"
                  className="input"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm password"
                />
              </Field>
              <Field label="Pen name / display name">
                <input
                  className="input"
                  value={penName}
                  onChange={(event) => setPenName(event.target.value)}
                  placeholder="Display name"
                />
              </Field>
              <Field label="Drawing software">
                <div className="grid gap-2 sm:grid-cols-3">
                  {drawingSoftwareOptions.map((item) => (
                    <label
                      key={item}
                      className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/70 p-3 text-sm text-slate-200"
                    >
                      <input
                        type="checkbox"
                        checked={drawingSoftwares.includes(item)}
                        onChange={() => toggleSoftware(item)}
                        className="h-4 w-4 accent-cyan-300"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="Bank account number">
                <input
                  className="input"
                  value={bankAccountNumber}
                  onChange={(event) => setBankAccountNumber(event.target.value)}
                  placeholder="Bank account number"
                />
              </Field>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !!activatedUsername}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Activating..." : "Complete setup"}
              <ArrowRight size={16} />
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-200">
        {label}
      </span>
      {children}
    </label>
  );
}
