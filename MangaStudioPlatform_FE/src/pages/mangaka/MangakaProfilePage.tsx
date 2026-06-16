import { User, Mail, ShieldCheck } from "lucide-react";

export default function MangakaProfilePage() {
  const currentUser = JSON.parse(
    localStorage.getItem("currentUser") || "null"
  );

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Mangaka Profile
        </p>

        <h1 className="mt-2 text-3xl font-black text-white">
          Profile
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Thông tin tài khoản Mangaka đang đăng nhập.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-500/10">
            <User size={34} className="text-cyan-300" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Mangaka Account
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Creator responsible for chapter production workflow.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Mail size={16} />
              Email
            </div>

            <p className="mt-2 font-semibold text-white">
              {currentUser?.email ?? "mangaka@studio.com"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck size={16} />
              Role
            </div>

            <p className="mt-2 font-semibold text-cyan-300">
              {currentUser?.role ?? "mangaka"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}