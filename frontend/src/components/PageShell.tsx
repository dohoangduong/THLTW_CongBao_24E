import Link from "next/link";
import type { ReactNode } from "react";

/** Style chuẩn cho ô nhập liệu (input, select, textarea): viền xám, focus xanh */
export const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600";

/** Nút bấm hành động chính: nền xanh blue-600, hover xanh đậm, mờ khi disabled */
export const btnPrimary =
  "rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300";

/** Nút bấm phụ: nền trắng viền xám, đổi viền đậm khi hover */
export const btnGhost =
  "rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-900";

/** Khung thẻ trắng bo góc 2xl viền mảnh có padding p-5 */
export const card = "rounded-2xl border border-slate-200 bg-white p-5";

/**
 * Khung giao diện tĩnh/tối giản cho các trang con, trang chức năng và form.
 * @param title Tiêu đề hiển thị ở thẻ h1 đầu trang
 * @param children Nội dung bên trong trang
 * @param narrow Nếu true sẽ thu hẹp chiều rộng về max-w-md (dùng cho form Login/Register), mặc định false (max-w-6xl)
 */
export function PageShell({ title, children, narrow = false }: { title: string; children: ReactNode; narrow?: boolean }) {
  return (
    <div className="min-h-screen bg-[#F1F4F2] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-5 px-4 py-3 text-sm font-medium">
          <Link href="/" className="text-xl font-extrabold tracking-tight">
            Bảo Công <span className="text-blue-600">Mobile</span>
          </Link>
          <nav className="ml-auto flex gap-4 text-slate-700">
            <Link href="/" className="hover:text-blue-600">Cửa hàng</Link>
            <Link href="/cart" className="hover:text-blue-600">Giỏ hàng</Link>
            <Link href="/orders" className="hover:text-blue-600">Đơn hàng</Link>
            <Link href="/profile" className="hover:text-blue-600">Tài khoản</Link>
          </nav>
        </div>
      </header>
      <main className={`mx-auto px-4 py-8 ${narrow ? "max-w-md" : "max-w-6xl"}`}>
        <h1 className="mb-6 text-2xl font-extrabold">{title}</h1>
        {children}
      </main>
    </div>
  );
}

/**
 * Hộp hiển thị thông báo lỗi nền đỏ nhạt. Trả về null nếu message rỗng.
 * @param message Nội dung thông báo lỗi
 */
export function ErrorBox({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {message}
    </p>
  );
}
