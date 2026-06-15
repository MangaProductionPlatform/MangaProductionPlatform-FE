import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import { useToast } from "../../shared/components/toastContext";
import CoverMarquee from "../../shared/components/CoverMarquee";
import { mangaHeroImage } from "../../shared/visuals/mangaVisuals";

const loginHighlights = [
  "Resume your reading list instantly",
  "Manage creator drafts and submissions",
  "Stay synced with editorial updates",
] as const;

export default function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const account = await mangaErpApi.login(email, password);
      localStorage.setItem("currentUser", JSON.stringify(account));
      toast.success("Login successful", "Welcome back to MangaStudio.");

      if (account.role === "admin") {
        navigate("/admin/dashboard");
        return;
      }

      if (account.role === "editor") {
        navigate("/app/editor/dashboard");
        return;
      }

      if (account.role === "editorial_board") {
        navigate("/app/board/dashboard");
        return;
      }

      if (account.role === "assistant") {
        navigate("/assistant/dashboard");
        return;
      }

      navigate("/app/dashboard");
    } catch (err) {
      toast.error(
        "Login failed",
        err instanceof Error ? err.message : "Invalid email or password",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[1fr_0.95fr]">
        <aside className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.22),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.94))] p-8 lg:border-b-0 lg:border-r lg:p-10">
          <div className="absolute inset-0 opacity-45">
            <img
              src={mangaHeroImage}
              alt="Manga background"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,22,0.25),rgba(5,8,22,0.96))]" />
          </div>

          <div className="relative flex h-full flex-col justify-between gap-10">
            <Link to="/" className="inline-flex items-center gap-3 self-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-rose-400 to-fuchsia-500 text-sm font-black text-slate-950">
                M
              </div>
              <div>
                <p className="text-lg font-semibold">MangaStudio</p>
                <p className="text-sm text-slate-300">
                  Sign in to your workspace
                </p>
              </div>
            </Link>

            <div className="max-w-xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-amber-100 backdrop-blur-xl">
                <Sparkles size={16} className="text-amber-300" />
                Readers, creators and editors in one place
              </div>

              <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl">
                Welcome back to MangaStudio
              </h1>
              <p className="max-w-lg text-lg leading-8 text-slate-300">
                Continue reading, track submissions, and keep your manga workflow
                moving without friction.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {loginHighlights.map((item) => (
                  <div
                    key={item}
                    className="rounded-3xl border border-white/10 bg-slate-950/50 p-4 backdrop-blur-xl"
                  >
                    <p className="text-sm text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
              <CoverMarquee compact />
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5 backdrop-blur-xl">
              <Sparkles size={18} className="text-amber-300" />
              <p className="mt-3 text-lg font-bold text-white">
                Connected to Identity API
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Login uses your backend account and routes by the returned role.
              </p>
            </div>
          </div>
        </aside>

        <main className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
            <div className="mb-8">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
                Login
              </p>
              <h2 className="mt-2 text-3xl font-bold text-white">
                Access your account
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Use your email and password to continue.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">
                  Email address
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="editor@studio.com"
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/70 px-5 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">
                  Password
                </span>
                <div className="relative">
                  <LockKeyhole
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="123456"
                    className="w-full rounded-3xl border border-white/10 bg-slate-950/70 px-5 py-3 pl-10 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/50"
                  />
                </div>
              </label>

              <button
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-amber-300 via-rose-400 to-fuchsia-500 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Logging in..." : "Login"}
                <ArrowRight size={16} />
              </button>

              <div className="flex justify-center text-sm text-slate-400">
                <button
                  type="button"
                  className="transition hover:text-white"
                >
                  Forgot password?
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
