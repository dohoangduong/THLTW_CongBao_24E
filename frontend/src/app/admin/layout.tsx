"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/useAuth";

const TABS = [
  { href: "/admin", label: "Tổng quan" },
  { href: "/admin/orders", label: "Đơn hàng" },
  { href: "/admin/users", label: "Người dùng" },
  { href: "/admin/products", label: "Sản phẩm" },
  { href: "/admin/categories", label: "Danh mục" },
  { href: "/admin/brands", label: "Thương hiệu" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth({ admin: true });

  if (loading || !user) {
    return <div className="grid min-h-screen place-items-center bg-[#F1F4F2] text-slate-600">Đang kiểm tra quyền quản trị…</div>;
  }

  return (
    <div className="min-h-screen bg-[#F1F4F2] text-slate-900">
      <header className="bg-slate-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-6 px-4 py-3 text-sm">
          <span className="text-lg font-extrabold">Quản trị</span>
          <nav className="flex flex-wrap gap-1">
            {TABS.map((t) => {
              const active = t.href === "/admin" ? pathname === "/admin" : pathname.startsWith(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`rounded-full px-4 py-1.5 font-medium ${active ? "bg-white text-slate-900" : "text-slate-300 hover:text-white"}`}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
          <Link href="/" className="ml-auto text-slate-300 hover:text-white">Về cửa hàng</Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
