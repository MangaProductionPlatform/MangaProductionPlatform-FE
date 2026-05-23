const columns = ["To Do", "In Progress", "Done"];

export default function TaskBoardPage() {
  return (
    <div>
      <h2 className="text-3xl font-bold">Task Board</h2>
      <p className="mt-1 text-slate-400">Manage assistant and editor tasks.</p>

      <div className="mt-8 grid grid-cols-3 gap-5">
        {columns.map((col) => (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h3 className="font-semibold">{col}</h3>
            <div className="mt-5 rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
              No tasks
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}