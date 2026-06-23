import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Copy, Mail, Save, ShieldCheck, Trash2 } from "lucide-react";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type { AdminUserDto } from "../../shared/types/mangaErp";
import { useToast } from "../../shared/components/toastContext";

const roles = [
  [0, "Admin"], [1, "EditorialBoard"], [2, "TantouEditor"],
  [3, "Mangaka"], [4, "Assistant"], [99, "Reader"],
] as const;
const statuses = [[0, "PendingActivation"], [1, "Active"], [2, "Suspended"], [3, "Deactivated"]] as const;

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [user, setUser] = useState<AdminUserDto | null>(null);
  const [form, setForm] = useState({ fullName: "", personalEmail: "", phoneNumber: "", managingTantouId: "", role: 1, status: 1 });
  const [busy, setBusy] = useState(false);

  const applyUser = (value: AdminUserDto) => {
    setUser(value);
    setForm({
      fullName: value.fullName ?? "", personalEmail: value.personalEmail ?? "",
      phoneNumber: value.phoneNumber ?? "", managingTantouId: value.managingTantouId ?? "",
      role: roles.find(([, name]) => name === value.role)?.[0] ?? 1,
      status: statuses.find(([, name]) => name === value.accountStatus)?.[0] ?? 1,
    });
  };
  const reload = async () => { if (id) applyUser(await mangaErpApi.getUser(id)); };

  useEffect(() => { let ignore = false; if (!id) return;
    mangaErpApi.getUser(id).then(value => { if (!ignore) applyUser(value); }).catch(error => toast.error("Could not load user", error instanceof Error ? error.message : "Unknown error"));
    return () => { ignore = true; };
  }, [id, toast]);

  const run = async (action: () => Promise<unknown>, success: string, refresh = true) => {
    setBusy(true); try { await action(); toast.success(success); if (refresh) await reload(); return true; }
    catch (error) { toast.error("Admin action failed", error instanceof Error ? error.message : "Unknown error"); return false; }
    finally { setBusy(false); }
  };

  if (!user) return <div className="rounded-lg border border-white/10 bg-slate-900/75 p-5 text-slate-300">Loading user...</div>;

  return <div className="space-y-5">
    <Link to="/admin/users" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200"><ArrowLeft size={16}/>Back to Users</Link>
    <section className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
      <div className="flex flex-wrap justify-between gap-4"><div><p className="text-xs uppercase tracking-[.28em] text-cyan-200">Admin · Account</p><h2 className="mt-2 text-3xl font-black text-white">{user.fullName || user.username}</h2><p className="text-sm text-slate-400">{user.username}</p></div><span className="h-fit rounded-lg bg-cyan-300/10 px-3 py-2 text-cyan-100">{user.accountStatus}</span></div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cyan-300/20 bg-cyan-300/5 p-4">
        <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-200">User ID / Tantou GUID</p><code className="mt-1 block break-all text-sm text-white">{user.userId}</code></div>
        <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-3 py-2 text-sm font-bold text-slate-950" onClick={() => void navigator.clipboard.writeText(user.userId).then(() => toast.success("User ID copied"))}><Copy size={15}/>Copy ID</button>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <label className="text-sm text-slate-400">Full name<input className="input mt-1" value={form.fullName} onChange={e => setForm({...form, fullName:e.target.value})}/></label>
        <label className="text-sm text-slate-400">Personal email<input className="input mt-1" type="email" value={form.personalEmail} onChange={e => setForm({...form, personalEmail:e.target.value})}/></label>
        <label className="text-sm text-slate-400">Phone<input className="input mt-1" value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber:e.target.value})}/></label>
        <label className="text-sm text-slate-400">Managing Tantou ID<input className="input mt-1" value={form.managingTantouId} onChange={e => setForm({...form, managingTantouId:e.target.value})}/></label>
        <label className="text-sm text-slate-400">Role<select className="input mt-1" value={form.role} onChange={e => setForm({...form, role:Number(e.target.value)})}>{roles.map(([value,name])=><option key={value} value={value}>{name}</option>)}</select></label>
        <label className="text-sm text-slate-400">Status<select className="input mt-1" value={form.status} onChange={e => setForm({...form, status:Number(e.target.value)})}>{statuses.map(([value,name])=><option key={value} value={value}>{name}</option>)}</select></label>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-200 disabled:opacity-50" onClick={() => void run(() => mangaErpApi.updateUser(user.userId,{fullName:form.fullName,personalEmail:form.personalEmail,role:form.role,phoneNumber:form.phoneNumber||null,managingTantouId:form.managingTantouId||null}),"Account updated")}><Save size={16}/>Save details</button>
        <button disabled={busy} className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50" onClick={() => void run(() => mangaErpApi.updateUserRole(user.userId,form.role),"Role updated")}><ShieldCheck size={16}/>Apply role</button>
        <button disabled={busy} className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50" onClick={() => void run(() => mangaErpApi.updateUserStatus(user.userId,form.status),"Status updated")}>Apply status</button>
        <button disabled={busy} className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50" onClick={() => void run(() => mangaErpApi.resendActivation(user.userId),"Activation email resent",false)}><Mail size={16}/>Resend activation</button>
        <button disabled={busy} className="inline-flex items-center gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm font-bold text-rose-200" onClick={() => { if (window.confirm(`Delete ${user.username}? This cannot be undone.`)) void run(() => mangaErpApi.deleteUser(user.userId),"Account deleted",false).then(ok => { if (ok) navigate("/admin/users"); }); }}><Trash2 size={16}/>Delete</button>
      </div>
    </section>
  </div>;
}
