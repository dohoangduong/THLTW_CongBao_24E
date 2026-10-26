"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useShop, type Shop } from "@/lib/useShop";

interface Props {
  /** Nếu truyền vào, ô tìm kiếm trên header sẽ hoạt động (dùng ở trang chủ). */
  search?: string;
  onSearch?: (value: string) => void;
  children: (shop: Shop) => ReactNode;
}

/** Khung chung cho các trang của khách: header (đăng nhập, giỏ hàng), footer, thông báo. */
export default function ShopShell({ search, onSearch, children }: Props) {
  const shop = useShop();
  const { token, user, cartCount, toast, logout } = shop;

  const searchBox = (cls: string) =>
    onSearch ? (
      <input
        type="search"
        value={search ?? ""}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Tìm điện thoại theo tên…"
        aria-label="Tìm điện thoại"
        className={cls}
      />
    ) : null;

  return (
    <div className="min-h-screen bg-[#F1F4F2] text-slate-900">
      {/* ---------- Thanh điều hướng ---------- */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link href="/" className="text-xl font-extrabold tracking-tight">
            Bảo Công <span className="text-blue-600">Mobile</span>
          </Link>

          {searchBox(
            "hidden min-w-0 flex-1 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-600 sm:block"
          )}

          <nav className="ml-auto flex items-center gap-3 text-sm font-medium">
            {user?.role === "admin" && (
              <Link href="/admin" className="rounded-full bg-amber-100 px-3 py-1.5 text-amber-900 hover:bg-amber-200">
                Quản trị
              </Link>
            )}
            {token ? (
              <>
                <Link href="/orders" className="hidden text-slate-700 hover:text-blue-600 md:inline">
                  Đơn hàng
                </Link>
                <Link href="/profile" className="hidden text-slate-600 hover:text-blue-600 md:inline">
                  Chào, {user?.name ?? "bạn"}
                </Link>
                <button onClick={logout} className="text-slate-700 hover:text-blue-600">
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-slate-700 hover:text-blue-600">
                  Đăng nhập
                </Link>
                <Link href="/register" className="rounded-full bg-blue-600 px-4 py-1.5 text-white hover:bg-blue-700">
                  Đăng ký
                </Link>
              </>
            )}
            <Link href="/cart" className="relative rounded-full border border-slate-300 px-3 py-1.5 hover:border-slate-900">
              Giỏ hàng
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-xs text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
        {onSearch && (
          <div className="px-4 pb-3 sm:hidden">
            {searchBox(
              "w-full rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-600"
            )}
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children(shop)}</main>

      {/* ---------- Chân trang ---------- */}
      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-extrabold text-slate-900">
              Bảo Công <span className="text-blue-600">Mobile</span>
            </p>
            <p className="mt-2">Điện thoại chính hãng, giá rõ ràng, giao nhanh toàn quốc.</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Mua sắm</p>
            <ul className="mt-2 space-y-1">
              <li><Link href="/" className="hover:text-blue-600">Cửa hàng</Link></li>
              <li><Link href="/cart" className="hover:text-blue-600">Giỏ hàng</Link></li>
              <li><Link href="/orders" className="hover:text-blue-600">Đơn hàng của tôi</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Tài khoản</p>
            <ul className="mt-2 space-y-1">
              <li><Link href="/login" className="hover:text-blue-600">Đăng nhập</Link></li>
              <li><Link href="/register" className="hover:text-blue-600">Đăng ký</Link></li>
              <li><Link href="/profile" className="hover:text-blue-600">Thông tin cá nhân</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Chính sách</p>
            <ul className="mt-2 space-y-1">
              <li>Bảo hành chính hãng 12 tháng</li>
              <li>Đổi trả trong 7 ngày nếu lỗi nhà sản xuất</li>
              <li>Thanh toán khi nhận hàng (COD)</li>
            </ul>
          </div>
        </div>
        <p className="border-t border-slate-100 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Bảo Công Mobile. Đồ án Thực hành lập trình web.
        </p>
      </footer>

      {/* ---------- Thông báo ---------- */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-lg ${
            toast.ok ? "bg-slate-900" : "bg-red-600"
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}
