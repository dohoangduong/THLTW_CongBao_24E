"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import axiosClient from "@/services/axiosClient";
import {
  BrandLogoIcon,
  AlertCircleIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  SlidersIcon,
} from "@/components/Icons";

export const inputCls =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all";
export const btnPrimary =
  "rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:cursor-not-allowed disabled:bg-zinc-300 shadow-2xs";
export const btnGhost =
  "rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 hover:border-zinc-900 transition-all";
export const card = "rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs";

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
    const token =
      typeof window !== "undefined"
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
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col font-sans antialiased">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-4 py-3.5 text-xs font-medium">
          <Link href="/trangchu" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center border border-zinc-800">
              <BrandLogoIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-extrabold tracking-tight uppercase">
              Bảo Công <span className="font-light text-zinc-400">Studio</span>
            </span>
          </Link>

          <nav className="flex items-center gap-3 sm:gap-4 text-zinc-600">
            <Link href="/trangchu" className="hover:text-zinc-950 transition">
              Cửa hàng
            </Link>
            <Link href="/cart" className="relative hover:text-zinc-950 transition flex items-center gap-1">
              <ShoppingBagIcon className="w-4 h-4" />
              <span>Giỏ hàng</span>
              {cartCount > 0 && (
                <span className="bg-zinc-900 text-white rounded-md px-1.5 py-0.2 text-[10px] font-mono font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link href="/orders" className="hover:text-zinc-950 transition">
              Đơn hàng
            </Link>
            <Link href="/profile" className="hover:text-zinc-950 transition flex items-center gap-1">
              <UserCircleIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Tài khoản</span>
            </Link>

            {user && ["admin", "manager"].includes(user.role || "") && (
              <Link
                href="/admin/don-hang"
                className="rounded-lg bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-zinc-800 transition flex items-center gap-1"
              >
                <SlidersIcon className="w-3 h-3 text-blue-400" />
                <span>Admin</span>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className={`flex-1 mx-auto w-full px-4 py-8 ${narrow ? "max-w-md" : "max-w-6xl"}`}>
        <h1 className="mb-6 text-xl font-extrabold text-zinc-900 tracking-tight">{title}</h1>
        {children}
      </main>

      <footer className="border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-500 mt-auto font-mono">
        © 2026 BẢO CÔNG STUDIO • SWISS BENTO TECH UI
      </footer>
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800 flex items-center gap-2"
    >
      <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
