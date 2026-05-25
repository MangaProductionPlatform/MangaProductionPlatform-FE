import { Archive, HardDrive, RotateCcw, Trash2 } from "lucide-react";
import { storageItems } from "../../shared/constants/adminWorkSpace";

export default function AdminStoragePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            Storage
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Manga asset storage
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Large chapter files, inactive assets, archive packages, and backup
            status.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-100">
          <HardDrive size={16} />
          2.4 TB used
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Total Storage" value="3.2 TB" />
        <Metric label="Used" value="2.4 TB" />
        <Metric label="Inactive Assets" value="186 GB" />
        <Metric label="Backup Status" value="Healthy" />
      </section>

      <section className="rounded-lg border border-white/10 bg-slate-900 p-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr className="border-b border-white/10">
                <th className="py-3 pr-4">File</th>
                <th className="py-3 pr-4">Type</th>
                <th className="py-3 pr-4">Size</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {storageItems.map((item) => (
                <tr key={item.name} className="border-b border-white/10">
                  <td className="py-4 pr-4 font-bold text-white">{item.name}</td>
                  <td className="py-4 pr-4 text-slate-300">{item.type}</td>
                  <td className="py-4 pr-4 text-slate-300">{item.size}</td>
                  <td className="py-4 pr-4">
                    <span className={statusTone(item.status)}>{item.status}</span>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex gap-2">
                      <button className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-200 hover:bg-white/10" title="Archive">
                        <Archive size={16} />
                      </button>
                      <button className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-200 hover:bg-white/10" title="Restore">
                        <RotateCcw size={16} />
                      </button>
<button className="rounded-lg border border-white/10 bg-white/5 p-2 text-rose-200 hover:bg-rose-500/10" title="Cleanup">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-white/10 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-black text-white">{value}</p>
    </article>
  );
}

function statusTone(status: string) {
  if (status === "Flagged") {
    return "rounded-md border border-rose-300/30 bg-rose-300/10 px-2 py-1 text-xs font-bold text-rose-100";
  }

  if (status === "Cleanup ready") {
    return "rounded-md border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs font-bold text-amber-100";
  }

  return "rounded-md border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 text-xs font-bold text-emerald-100";
}
