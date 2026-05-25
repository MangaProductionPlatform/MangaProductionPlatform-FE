export default function NotificationsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Notifications</h1>
      <p className="mt-2 text-slate-400">
        Thông báo deadline, bản thảo mới và phản hồi từ tác giả.
      </p>

      <div className="mt-6 space-y-4">
        {[
          "Celestial Blade cần review trước 18:00",
          "Neo Spirit đã gửi bản sửa mới",
          "Moonlit Garden được chuyển vào hàng chờ xuất bản",
        ].map((item) => (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-slate-200">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}