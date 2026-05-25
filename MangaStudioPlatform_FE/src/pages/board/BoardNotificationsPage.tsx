export default function BoardNotificationsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Notifications</h1>

      <div className="mt-6 space-y-4">
        {[
          "3 chapters are waiting for final approval.",
          "Celestial Blade reached publishing quality threshold.",
          "Neo Spirit requires board decision before release.",
        ].map((item) => (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-slate-200">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}