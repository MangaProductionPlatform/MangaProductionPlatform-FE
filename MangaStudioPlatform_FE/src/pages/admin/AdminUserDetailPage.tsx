import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, Mail, Phone, UserRound } from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { AdminUserDto } from "../../shared/types/mangaErp";
import { useToast } from "../../shared/components/toastContext";

export default function AdminUserDetailPage() {
  const params = useParams();
  const toast = useToast();
  const [user, setUser] = useState<AdminUserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    let ignore = false;

    async function loadUser() {
      setIsLoading(true);
      try {
        const result = await mangaErpApi.getUser(params.id!);
        if (!ignore) setUser(result);
      } catch (err) {
        if (!ignore) {
          setUser(null);
          toast.error(
            "Could not load user",
            err instanceof Error ? err.message : "Please check the user ID.",
          );
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadUser();
    return () => {
      ignore = true;
    };
  }, [params.id, toast]);

  return (
    <div className="space-y-5">
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 hover:text-cyan-100"
      >
        <ArrowLeft size={16} />
        Back to Users
      </Link>

      {isLoading ? (
        <div className="rounded-lg border border-white/10 bg-slate-900/75 p-5 text-sm text-slate-300">
          Loading user...
        </div>
      ) : null}

      {!isLoading && !user ? (
        <div className="rounded-lg border border-white/10 bg-slate-900/75 p-5 text-sm text-slate-300">
          User not found.
        </div>
      ) : null}

      {!isLoading && user ? (
        <section className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                Admin
              </p>
              <h2 className="mt-2 text-3xl font-black text-white">
                {user.fullName ?? user.username}
              </h2>
              <p className="mt-1 text-sm text-slate-400">{user.username}</p>
            </div>
            <span className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-100">
              {user.accountStatus}
            </span>
          </div>

          <dl className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Info icon={<BadgeCheck size={16} />} label="Role" value={user.role} />
            <Info icon={<Mail size={16} />} label="Email" value={user.personalEmail ?? "-"} />
            <Info icon={<Phone size={16} />} label="Phone" value={user.phoneNumber ?? "-"} />
            <Info icon={<UserRound size={16} />} label="Pen name" value={user.penName ?? "-"} />
          </dl>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Panel title="Drawing software">
              {user.drawingSoftwares?.length ? user.drawingSoftwares.join(", ") : "-"}
            </Panel>
            <Panel title="Bank account">
              {user.bankAccountNumber ?? "-"}
            </Panel>
            <Panel title="Managing Tantou ID">
              {user.managingTantouId ?? "-"}
            </Panel>
            <Panel title="Created">
              {new Date(user.createdAt).toLocaleString()}
            </Panel>
          </div>
        </section>
      ) : null}
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
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <dt className="text-xs uppercase tracking-[0.16em]">{label}</dt>
      </div>
      <dd className="mt-2 break-words font-semibold text-slate-100">{value}</dd>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-100">{children}</p>
    </div>
  );
}
