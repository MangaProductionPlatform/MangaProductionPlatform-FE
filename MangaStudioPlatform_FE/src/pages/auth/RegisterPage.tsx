import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  PencilLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { mangaCovers } from "../../shared/constants/mangakaImages";

const registerBenefits = [
  "Read, vote, and follow favorite series",
  "Publish chapters or support creator tasks",
  "Collaborate through the editorial workflow",
];

const registerRoles = [
  {
    value: "READER",
    label: "Reader/User",
    description: "Read manga, vote, and follow series.",
  },
  {
    value: "MANGAKA",
    label: "Mangaka",
    description: "Create manga and publish chapters.",
  },
  {
    value: "ASSISTANT",
    label: "Assistant",
    description: "Support creators by handling assigned tasks.",
  },
  {
    value: "TANTOU_EDITOR",
    label: "Tantou Editor",
    description: "Edit, review, and coordinate manga releases.",
  },
] as const;

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] =
    useState<(typeof registerRoles)[number]["value"]>("READER");

  const activeRole = registerRoles.find((role) => role.value === selectedRole);

  return (
    <div className="min-h-screen bg-[#050816] text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1fr]">
        <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.2),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.94))] p-8 lg:border-b-0 lg:border-r lg:p-10">
          <div className="absolute inset-0 opacity-45">
            <img
              src={mangaCovers[1].image}
              alt="Manga cover background"
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
                  Start your creator journey
                </p>
              </div>
            </Link>

            <div className="max-w-xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-cyan-100 backdrop-blur-xl">
                <Sparkles size={16} className="text-cyan-300" />
                Choose your role and join the manga workflow
              </div>
<h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl">
                Create your account
              </h1>
              <p className="max-w-lg text-lg leading-8 text-slate-300">
                Register to read manga, publish chapters, support tasks, or
                coordinate releases with editors.
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                {registerBenefits.map((item) => (
                  <div
                    key={item}
                    className="rounded-3xl border border-white/10 bg-slate-950/50 p-4 backdrop-blur-xl"
                  >
                    <p className="text-sm text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { value: "Fast", label: "onboarding", icon: BookOpen },
                { value: "Secure", label: "profile setup", icon: ShieldCheck },
                { value: "Open", label: "creator workflow", icon: PencilLine },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-3xl border border-white/10 bg-slate-950/50 p-4 backdrop-blur-xl"
                  >
                    <Icon size={18} className="text-amber-300" />
                    <p className="mt-3 text-2xl font-bold text-white">
                      {item.value}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <main className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
            <div className="mb-8">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
                Register
              </p>
              <h2 className="mt-2 text-3xl font-bold text-white">
                Create your account
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Choose the role that fits how you want to use MangaStudio.
              </p>
            </div>

            <form className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">
                  Display name
                </span>
                <input
                  type="text"
                  placeholder="Your pen name"
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/70 px-5 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/50"
                />
</label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">
                  Role
                </span>
                <div className="relative">
                  <select
                    name="role"
                    value={selectedRole}
                    onChange={(event) =>
                      setSelectedRole(
                        event.target.value as (typeof registerRoles)[number]["value"],
                      )
                    }
                    className="w-full appearance-none rounded-3xl border border-white/10 bg-slate-950/70 px-5 py-3 pr-12 text-slate-100 outline-none transition focus:border-amber-300/50"
                  >
                    {registerRoles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
                {activeRole ? (
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    {activeRole.description}
                  </p>
                ) : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">
                  Email address
                </span>
                <input
                  type="email"
                  placeholder="creator@mangastudio.com"
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/70 px-5 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">
                  Password
                </span>
                <input
                  type="password"
                  placeholder="Create a password"
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/70 px-5 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">
                  Confirm password
                </span>
                <input
                  type="password"
                  placeholder="Repeat password"
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/70 px-5 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/50"
                />
              </label>
<button className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-amber-300 via-rose-400 to-fuchsia-500 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:scale-[1.01]">
                Create account
                <ArrowRight size={16} />
              </button>

              <p className="text-center text-sm text-slate-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-white transition hover:text-amber-200"
                >
                  Login
                </Link>
              </p>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}