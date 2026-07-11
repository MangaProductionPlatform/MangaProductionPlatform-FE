import { useEffect, useState } from "react";
import { LockKeyhole, RefreshCw, ShieldCheck } from "lucide-react";
import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { AdminRoleDto } from "../../shared/types/mangaErp";

// Role dictionary được đọc từ backend để giao diện không hard-code danh sách quyền.
export default function AdminRolesPage() {
  const toast = useToast();
  const [roles, setRoles] = useState<AdminRoleDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRoles = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      setRoles(await mangaErpApi.getAdminRoles());
    } catch (error) {
      toast.error("Could not load roles", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadInitialRoles() {
      try {
        const result = await mangaErpApi.getAdminRoles();
        if (!ignore) setRoles(result);
      } catch (error) {
        if (!ignore) toast.error("Could not load roles", error instanceof Error ? error.message : "Unknown error");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    void loadInitialRoles();
    return () => {
      ignore = true;
    };
    // Initial backend load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Admin</p>
          <h2 className="mt-2 text-3xl font-black text-white">Roles and permissions</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Static system roles returned by the backend for account provisioning and access review.
          </p>
        </div>
        <button type="button" onClick={() => void loadRoles()} disabled={isLoading} className="btn-secondary inline-flex items-center gap-2">
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((role) => (
          <article key={role.value} className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[.18em] text-slate-500">Role value {role.value}</p>
                <h3 className="mt-2 text-xl font-bold text-white">{role.name}</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-200">
                <ShieldCheck size={18} />
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-400">{role.description ?? "No description returned."}</p>
          </article>
        ))}
      </section>

      {!isLoading && roles.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
          <LockKeyhole className="mx-auto text-slate-500" />
          <p className="mt-3">No roles returned by the backend.</p>
        </div>
      ) : null}

      <p className="rounded-lg border border-amber-300/20 bg-amber-500/10 p-4 text-sm text-amber-100">
        Permission editing is not exposed by the backend yet; this page is intentionally read-only.
      </p>
    </div>
  );
}
