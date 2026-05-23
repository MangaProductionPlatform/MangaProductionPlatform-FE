export default function ProfilePage() {
  return (
    <div>
      <h2 className="text-3xl font-bold">Profile</h2>
      <p className="mt-1 text-slate-400">Manage user profile and role.</p>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="h-24 w-24 rounded-full bg-slate-700" />
        <div className="mt-6 space-y-4">
          <input className="input" placeholder="Full name" />
          <input className="input" placeholder="Email" />
          <input className="input" placeholder="Role" />
        </div>
      </div>
    </div>
  );
}