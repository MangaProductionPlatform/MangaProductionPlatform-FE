import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { Mail, Save, ShieldCheck, User } from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import { useToast } from "../../shared/components/toastContext";

type StoredUser = {
  userId?: string;
  email?: string;
  role?: string;
};

const drawingSoftwareOptions = [
  "Clip Studio Paint",
  "Photoshop",
  "Procreate",
  "Traditional",
] as const;

export default function ProfilePage() {
  const toast = useToast();
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null") as
    | StoredUser
    | null;
  const [penName, setPenName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [drawingSoftwares, setDrawingSoftwares] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canEditDrawingSoftware = currentUser?.role === "mangaka" || currentUser?.role === "assistant";

  const toggleSoftware = (value: string) => {
    setDrawingSoftwares((items) =>
      items.includes(value)
        ? items.filter((item) => item !== value)
        : [...items, value],
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await mangaErpApi.updateProfile({
        penName: penName.trim() || null,
        drawingSoftwares: canEditDrawingSoftware ? drawingSoftwares : undefined,
        bankAccountNumber: bankAccountNumber.trim() || null,
      });
      toast.success("Profile updated", "Your profile was saved.");
    } catch (err) {
      toast.error(
        "Could not update profile",
        err instanceof Error ? err.message : "Please check your session and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Profile
        </p>
        <h2 className="mt-2 text-3xl font-black text-white">Account profile</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Update the authenticated user's working profile in the Identity service.
        </p>
      </div>

      <section className="grid gap-5 xl:grid-cols-[22rem_1fr]">
        <aside className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 via-rose-300 to-cyan-300 text-3xl font-black text-slate-950">
              {(currentUser?.email?.[0] ?? "U").toUpperCase()}
            </div>
            <h3 className="mt-4 text-xl font-black text-white">
              {currentUser?.email ?? "Unknown user"}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {currentUser?.role ?? "No role"}
            </p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-100">
              <ShieldCheck size={16} />
              Account session
            </span>
          </div>
        </aside>

        <main className="space-y-5">
          <section className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Info icon={<Mail size={16} />} label="Email" value={currentUser?.email ?? "-"} />
              <Info icon={<ShieldCheck size={16} />} label="Role" value={currentUser?.role ?? "-"} />
              <Info icon={<User size={16} />} label="User ID" value={currentUser?.userId ?? "-"} />
            </div>
          </section>

          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-white/10 bg-slate-900/75 p-5"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">
                  Pen name
                </span>
                <input
                  className="input"
                  value={penName}
                  onChange={(event) => setPenName(event.target.value)}
                  placeholder="Display name"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">
                  Bank account number
                </span>
                <input
                  className="input"
                  value={bankAccountNumber}
                  onChange={(event) => setBankAccountNumber(event.target.value)}
                  placeholder="Bank account number"
                />
              </label>
            </div>

            {canEditDrawingSoftware ? (
              <div className="mt-5">
                <span className="mb-2 block text-sm font-semibold text-slate-200">
                  Drawing software
                </span>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
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
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />
              {isSubmitting ? "Saving..." : "Save profile"}
            </button>
          </form>
        </main>
      </section>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="mb-2 flex items-center gap-2 text-cyan-200">
        {icon}
        <p className="text-sm font-semibold text-slate-200">{label}</p>
      </div>
      <p className="break-all font-bold text-white">{value}</p>
    </div>
  );
}
