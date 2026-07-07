import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import { useToast } from "../../shared/components/toastContext";
import ModeToggle from "../../shared/components/ModeToggle";
import { mangaPlanningImage } from "../../shared/visuals/mangaVisuals";
import "./LoginPage.css";

const loginHighlights = [
  "Role-based routing after authentication",
  "Protected access for company accounts",
  "Connected to MangaERP Identity service",
] as const;

export default function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const account = await mangaErpApi.login(email, password);
      localStorage.setItem("currentUser", JSON.stringify(account));
      toast.success("Login successful", "Opening your workspace.");

      if (account.role === "admin") {
        navigate("/admin/dashboard");
        return;
      }

      if (account.role === "editor") {
        navigate("/app/editor/dashboard");
        return;
      }

      if (account.role === "editorial_board" || account.role === "editor_in_chief") {
        navigate("/app/board/dashboard");
        return;
      }

      if (account.role === "assistant") {
        navigate("/assistant/dashboard");
        return;
      }

      if (account.role === "mangaka") {
        navigate("/mangaka/dashboard");
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
    <div className="app-shell">
      <div className="grid min-h-screen lg:grid-cols-[1fr_0.9fr]">
        <aside className="login-visual relative overflow-hidden border-b border-white/10 bg-slate-950 p-8 lg:border-b-0 lg:border-r lg:p-10">
          <div className="absolute inset-0">
            <img
              src={mangaPlanningImage}
              alt=""
              className="h-full w-full object-cover opacity-70"
            />
            <div className="login-visual__overlay absolute inset-0" />
          </div>

          <div className="relative flex h-full flex-col justify-between gap-10">
            <Link to="/" className="inline-flex items-center gap-3 self-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-rose-400 to-fuchsia-500 text-sm font-black text-slate-950">
                M
              </div>
              <div>
                <p className="text-lg font-semibold">MangaStudio</p>
                <p className="text-sm text-slate-300">
                  Company operations portal
                </p>
              </div>
            </Link>

            <div className="max-w-xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-cyan-100 backdrop-blur-xl">
                <ShieldCheck size={16} className="text-cyan-300" />
                Authorized staff access
              </div>

              <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl">
                Sign in to MangaStudio ERP
              </h1>
              <p className="max-w-lg text-lg leading-8 text-slate-300">
                Access the internal workspace for submissions, editorial board reviews,
                chapter production, QA handoff, and administration.
              </p>

              <div className="grid gap-3">
                {loginHighlights.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/50 p-4 backdrop-blur-xl"
                  >
                    <UserRoundCheck size={17} className="shrink-0 text-cyan-200" />
                    <p className="text-sm text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950/50 p-5 backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
                Access policy
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Use only company-issued accounts. New users must be provisioned by an administrator before signing in.
              </p>
            </div>
          </div>
        </aside>

        <main className="flex items-center justify-center p-6 sm:p-10">
          <div className="login-panel w-full max-w-md rounded-xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <Link to="/" className="text-sm font-semibold text-slate-300 transition hover:text-white">
                MangaStudio ERP
              </Link>
              <ModeToggle />
            </div>
            <div className="mb-8">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
                Secure login
              </p>
              <h2 className="mt-2 text-3xl font-bold text-white">
                Access your workspace
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Enter your company account credentials.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">
                  Email address
                </span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@company.com"
                  className="input"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">
                  Password
                </span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter password"
                    className="input pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-2 top-1/2 inline-flex min-h-10 min-w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary inline-flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
                <ArrowRight size={16} />
              </button>

              <p className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs leading-5 text-slate-400">
                Password reset and account provisioning are handled by the platform administrator.
              </p>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
