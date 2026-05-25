import { BookOpen, CheckCircle, Clock, FileText } from "lucide-react";

const stats = [
  { label: "Total Series", value: "0", icon: BookOpen },
  { label: "Pending Approval", value: "0", icon: Clock },
  { label: "Approved Series", value: "0", icon: CheckCircle },
  { label: "Active Tasks", value: "0", icon: FileText },
  
];

export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-3xl font-bold">Dashboard</h2>
      <p className="mt-1 text-slate-400">
        Overview of manga workflow and publishing progress.
      </p>

      <div className="mt-8 grid grid-cols-4 gap-5">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">{item.label}</p>
                <Icon className="text-indigo-400" />
              </div>
              <h3 className="mt-4 text-3xl font-bold">{item.value}</h3>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h3 className="text-xl font-semibold">Recent Activities</h3>
        <Empty text="No activities yet." />
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
      {text}
    </div>
  );
}