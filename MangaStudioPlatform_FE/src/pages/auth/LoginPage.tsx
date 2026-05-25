import {
  ArrowRight,
  BookOpen,
  LockKeyhole,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";

const loginHighlights = [
  "Resume your reading list instantly",
  "Manage creator drafts and submissions",
  "Stay synced with editorial updates",
];

export default function LoginPage() {
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const heroImage = "https://images.unsplash.com/photo-1544717305-996b815c338c?auto=format&fit=crop&w=1200&q=80";

const stats = [
  { label: "Series đang hoạt động", value: "24", delta: "+14%" },
  { label: "Chương hoàn tất", value: "517", delta: "+8%" },
  { label: "Biên tập viên", value: "12", delta: "+3" },
];

const features = [
  { title: "Quản lý storyboard", desc: "Tạo luồng dựng panel, đánh dấu bản thảo và quản lý tiến độ sản xuất." },
  { title: "Theo dõi xuất bản", desc: "Xem lịch phát hành, deadline và trạng thái story trong một trang duy nhất." },
  { title: "Phản hồi biên tập", desc: "Thu thập bình luận, ghi chú nghệ thuật và nhận xét nội dung nhanh chóng." },
];

const trendingSeries = [
  {
    title: "Celestial Blade",
    status: "Ongoing",
    score: "9.2",
    image: "https://images.unsplash.com/photo-1515581283639-30a5d5820b7f?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Neo Spirit",
    status: "Review",
    score: "8.9",
    image: "https://images.unsplash.com/photo-1542377282-4ec6b7eeac83?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Blade of Seasons",
    status: "Published",
    score: "9.5",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=900&q=80",
  },
];

export default function LoginPage() {

  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const accounts = [
    {
      email: "editor@studio.com",
      password: "123456",
      role: "editor",
    },
    {
      email: "admin@studio.com",
      password: "123456",
      role: "admin",
    },
    {
     email: "board@studio.com",
     password: "123456",
     role: "editorial_board",
},
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const account = accounts.find(
      (acc) =>
        acc.email === email &&
        acc.password === password
    );

    if (!account) {
      setError("Sai tài khoản hoặc mật khẩu");
      return;
    }

    localStorage.setItem(
      "currentUser",
      JSON.stringify(account)
    );

    if (account.role === "editor") {
      navigate("/app/editor/dashboard");
    } else if (account.role === "editorial_board") {
      navigate("/app/board/dashboard");
    } else {
     navigate("/app/dashboard");
}
  };

  return (
    <div className="min-h-screen bg-[#050816] text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[1fr_0.95fr]">
        <aside className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.22),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.94))] p-8 lg:border-b-0 lg:border-r lg:p-10">
          <div className="absolute inset-0 opacity-45">
            <img
              src="/images/manga-background.jpg"
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
                Continue reading, track submissions, and keep your manga
                workflow moving without friction.
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
            </div>
<div className="grid gap-4 sm:grid-cols-3">
              {[
                { value: "2.4M", label: "monthly readers", icon: BookOpen },
                { value: "780", label: "creator series", icon: UserRound },
                { value: "24/7", label: "editor coverage", icon: Sparkles },
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

            <form className="space-y-5">
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
                <div className="relative">
                  <LockKeyhole
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-3xl border border-white/10 bg-slate-950/70 px-5 py-3 pl-10 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/50"
                  />
                </div>
              </label>
<button className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-amber-300 via-rose-400 to-fuchsia-500 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:scale-[1.01]">
                Login
                <ArrowRight size={16} />
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm text-slate-400">Email address</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="editor@studio.com"
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-5 py-3 text-slate-100 outline-none transition focus:border-indigo-500"
                />
              </div>

              <div>
              <div className="flex items-center justify-between text-sm text-slate-400">
                <label className="mb-2 block">Password</label>

                <button
                type="button"
                className="text-indigo-400 hover:text-indigo-300"
               > Forgot password? </button>
              </div>

              <input  type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="123456"
               className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-5 py-3 text-slate-100 outline-none transition focus:border-indigo-500"
               />
                {error && ( <p className="mt-2 text-sm text-red-400"> {error}
              </p> )}
              </div>

              <button className="w-full rounded-3xl bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-5 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-violet-500/20 transition hover:scale-[1.02]">
                Đăng nhập
              </button>

              <div className="flex items-center justify-between text-sm text-slate-400">
                <a href="#" className="transition hover:text-white">
                  Forgot password?
                </a>
                <Link to="/register" className="transition hover:text-white">
                  Create account
                </Link>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}