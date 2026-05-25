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
    <div className="relative min-h-screen overflow-hidden bg-[#030814] text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="absolute -left-20 top-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <span className="absolute right-0 top-1/3 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <span className="absolute left-1/2 top-[80%] h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-slate-800/70 bg-slate-950/70 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-slate-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-lg font-bold text-white shadow-lg shadow-indigo-500/20">
              M
            </div>
            <div>
              <p className="font-semibold">Manga Studio</p>
              <p className="text-xs text-slate-500">Creator workflow for manga teams</p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#trending" className="transition hover:text-white">Trending</a>
            <a href="#contact" className="transition hover:text-white">Contact</a>
          </nav>

          <button
            onClick={() => setShowForm(true)}
            className="rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-violet-500/20 transition hover:scale-[1.02]"
          >
            Login
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <section className="grid gap-10 xl:grid-cols-[1.25fr_0.95fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-4 py-2 text-sm text-slate-300 ring-1 ring-slate-700">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              Manga creation workflow optimized for speed.
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-white sm:text-6xl">
                Quản lý manga studio từ bản thảo đến xuất bản.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-400">
                Nền tảng dành cho nhóm truyện tranh: theo dõi storyboarding, phân công art, biên tập nội dung và phát hành ngay trong một dashboard.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-8 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-violet-500/20 transition hover:scale-[1.02]"
              >
                Đăng nhập ngay
              </button>
              <a
                href="#trending"
                className="inline-flex items-center justify-center rounded-3xl border border-slate-700 px-8 py-3 text-base text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                Xem dữ liệu giả
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-slate-800 bg-slate-900/85 p-5 shadow-xl shadow-slate-950/20 transition hover:-translate-y-1 hover:border-violet-500/40"
                >
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                  <span className="mt-2 inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs text-emerald-400">{item.delta}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
            <div className="absolute inset-0 opacity-40">
              <img src={heroImage} alt="Manga illustration" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
            </div>
            <div className="relative space-y-6">
              <div className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-950/80 p-4 text-slate-300 shadow-inner shadow-slate-950/20">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Studio preview</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Dashboard demo</h2>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">Live mock</span>
              </div>
              <div className="grid gap-4">
                <div className="rounded-3xl border border-slate-800 bg-slate-950/85 p-5">
                  <p className="text-sm text-slate-400">Latest chapter</p>
                  <p className="mt-3 text-lg font-semibold text-white">Celestial Blade - Chapter 27</p>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-950/85 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Next deadline</p>
                      <p className="mt-2 text-lg font-semibold text-white">3 days</p>
                    </div>
                    <div className="rounded-full bg-slate-800 px-4 py-2 text-sm text-emerald-300">On track</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="trending" className="mt-20 space-y-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Trending manga</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Dữ liệu giả series nổi bật</h2>
            </div>
            <div className="rounded-full border border-slate-800 bg-slate-900/80 px-4 py-2 text-sm text-slate-400">
              100% mock data, chỉ để demo giao diện
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            {trendingSeries.map((item) => (
              <div
                key={item.title}
                className="group overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-900/85 shadow-xl shadow-slate-950/20 transition hover:-translate-y-1 hover:border-indigo-500/40 hover:bg-slate-900"
              >
                <div className="overflow-hidden rounded-[1.5rem] border-b border-slate-800 bg-slate-950/90">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-white">{item.title}</p>
                      <p className="mt-2 text-sm text-slate-400">Status: {item.status}</p>
                    </div>
                    <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">{item.score}</div>
                  </div>
                  <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/90 p-4 text-slate-400">
                    <p>Số lượt review giả: 1.2k</p>
                    <p className="mt-3 text-sm">Editor peak: 4</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="mt-20 grid gap-6 lg:grid-cols-3">
          {features.map((item) => (
            <div
              key={item.title}
              className="rounded-[2rem] border border-slate-800 bg-slate-900/85 p-7 shadow-xl shadow-slate-950/20 transition hover:-translate-y-1 hover:border-cyan-500/30"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Feature</p>
              <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-slate-400">{item.desc}</p>
            </div>
          ))}
        </section>
      </main>

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[2rem] border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/60">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Welcome back</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">Login to your studio</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-400 transition hover:bg-slate-800"
              >
                Close
              </button>
            </div>

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

              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="h-px flex-1 bg-slate-700" />
                <span>or login with</span>
                <span className="h-px flex-1 bg-slate-700" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 transition hover:border-indigo-500">
                  Sign in with Apple
                </button>
                <button className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 transition hover:border-indigo-500">
                  Login with Google
                </button>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-400">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-indigo-500" />
                <span>I understand the terms</span>
              </div>

              <p className="text-center text-sm text-slate-400">
                Đây là giao diện demo cho Manga Studio, dữ liệu giả để bạn thử nghiệm ngay.
              </p>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
