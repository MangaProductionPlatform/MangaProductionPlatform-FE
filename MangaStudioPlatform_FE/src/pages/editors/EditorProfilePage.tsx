export default function EditorProfilePage() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Editor Profile</h1>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-slate-400">Email</p>
        <h2 className="mt-1 text-xl font-semibold text-white">
          {currentUser?.email}
        </h2>

        <p className="mt-5 text-slate-400">Role</p>
        <h2 className="mt-1 text-xl font-semibold text-indigo-300">
          {currentUser?.role}
        </h2>
      </div>
    </div>
  );
}