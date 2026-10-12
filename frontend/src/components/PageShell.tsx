"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import axiosClient from "@/services/axiosClient";

export const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all";
export const btnPrimary =
  "rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 active:scale-[0.98] transition-all disabled:cursor-not-allowed disabled:bg-slate-300 shadow-sm";
export const btnGhost =
  "rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-900 transition-all";
export const card = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

export function PageShell({
  title,
  children,
  narrow = false,
}: {
  title: string;
  children: ReactNode;
  narrow?: boolean;
}) {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("token") || localStorage.getItem("access_token")
      : null;

    if (token) {
      axiosClient
        .get("/user")
        .then((res: any) => {
          const u = res?.user || res?.data || res;
          if (u && (u.name || u.role)) setUser(u);
        })
        .catch(() => {});

      axiosClient
        .get("/cart")
        .then((res: any) => {
          const items = res?.cart?.items || [];
          const total = items.reduce((s: number, i: any) => s + (Number(i.quantity) || 1), 0);
          setCartCount(total);
        })
        .catch(() => {});
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F1F4F2] text-slate-900 flex flex-col font-sans">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-4 py-3 text-sm font-medium">
          <Link href="/" className="text-xl font-extrabold tracking-tight">
            Bảo Công <span className="text-blue-600">Mobile</span>
          </Link>

          <nav className="flex items-center gap-4 text-slate-700">
            <Link href="/" className="hover:text-blue-600">
              Cửa hàng
            </Link>
            <Link href="/cart" className="relative hover:text-blue-600">
              Giỏ hàng
              {cartCount > 0 && (
                <span className="absolute -right-3 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link href="/orders" className="hover:text-blue-600">
              Đơn hàng
            </Link>
            <Link href="/profile" className="hover:text-blue-600">
              Tài khoản
            </Link>

            {user && ["admin", "manager"].includes(user.role || "") && (
              <Link
                href="/admin"
                className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 hover:bg-amber-200"
              >
                Trang Admin
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className={`flex-1 mx-auto w-full px-4 py-8 ${narrow ? "max-w-md" : "max-w-6xl"}`}>
        <h1 className="mb-6 text-2xl font-extrabold text-slate-900">{title}</h1>
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500 mt-auto">
        © {new Date().getFullYear()} Bảo Công Mobile. Đồ án Thực hành lập trình web.
      </footer>
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-700"
    >
      ⚠️ {message}
    </div>
  );
}
