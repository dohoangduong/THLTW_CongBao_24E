"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import SmartSearchBar from "@/components/SmartSearchBar";
import {
  BrandLogoIcon,
  ShoppingBagIcon,
  SlidersIcon,
  LogOutIcon,
  PackageIcon,
  ShieldCheckIcon,
  BoltIcon,
  RefreshCwIcon,
  AwardIcon,
} from "@/components/Icons";
import axiosClient from "@/services/axiosClient";

export default function StoreHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [currentType, setCurrentType] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);

  // Đọc thông tin user & query type sau khi Mount ở Client để chống hoàn toàn lỗi Hydration
  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== "undefined") {
      // 1. Đọc type query param an toàn không làm lệch DOM SSR
      const updateQueryType = () => {
        try {
          const params = new URLSearchParams(window.location.search);
          setCurrentType(params.get("type"));
        } catch {
          setCurrentType(null);
        }
      };
      updateQueryType();
      window.addEventListener("popstate", updateQueryType);

      // 2. Kiểm tra tất cả các key token/user trong localStorage
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("admin_token");
      const uStr =
        localStorage.getItem("user") ||
        localStorage.getItem("admin_user");

      if (token && uStr) {
        try {
          setUser(JSON.parse(uStr));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }

      return () => {
        window.removeEventListener("popstate", updateQueryType);
      };
    }
  }, [pathname]);

  // Lấy số lượng giỏ hàng thực tế từ database
  useEffect(() => {
    if (!isMounted || !user) {
      setCartCount(0);
      return;
    }

    axiosClient
      .get("/cart")
      .then((res: any) => {
        const items = res?.items || res?.data?.items || res?.cart?.items || [];
        const count = items.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 1), 0);
        setCartCount(count);
      })
      .catch(() => {
        setCartCount(0);
      });
  }, [isMounted, user]);

  const handleLogout = async () => {
    try {
      await axiosClient.post("/logout");
    } catch {}
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("admin_token");
      localStorage.removeItem("user");
      localStorage.removeItem("admin_user");
    }
    setUser(null);
    router.push("/trangchu");
  };

  // 5 Mục điều hướng chuẩn Flagship Monochrome Tech
  const navItems = [
    {
      label: "Trang chủ",
      href: "/trangchu",
      isActive: pathname === "/trangchu" || pathname === "/",
    },
    {
      label: "Tất cả sản phẩm",
      href: "/products",
      isActive: pathname === "/products" && (!isMounted || !currentType),
    },
    {
      label: "Sản phẩm mới",
      href: "/products?type=new",
      isActive: isMounted && pathname === "/products" && currentType === "new",
      dot: "bg-emerald-500",
    },
    {
      label: "Sale / Khuyến mãi",
      href: "/products?type=sale",
      isActive: isMounted && pathname === "/products" && currentType === "sale",
      dot: "bg-rose-500",
    },
    {
      label: "Hỗ trợ",
      href: "/ho-tro",
      isActive: pathname === "/ho-tro",
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 shadow-2xs">
      {/* 1. TOP UTILITY BAR (Monochrome Carbon) */}
      <div className="bg-zinc-950 text-zinc-300 text-xs py-2 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
          {/* Trái: 4 cam kết dịch vụ */}
          <div className="flex items-center gap-4 sm:gap-6 text-[11px] font-medium text-zinc-300 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 shrink-0">
              <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chính hãng 100%</span>
            </div>
            <span className="text-zinc-700 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <BoltIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Giao hỏa tốc 2h</span>
            </div>
            <span className="text-zinc-700 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <RefreshCwIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>1 đổi 1 trong 30 ngày</span>
            </div>
            <span className="text-zinc-700 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <AwardIcon className="w-3.5 h-3.5 text-violet-400" />
              <span>Bảo hành 12 tháng</span>
            </div>
          </div>

          {/* Phải: Trạng thái kết nối hệ thống + Nút Quản trị Hệ thống */}
          <div className="flex items-center gap-4 text-[11px] shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Hệ thống trực tuyến</span>
            </div>
            {isMounted && user?.role === "admin" && (
              <Link
                href="/admin/don-hang"
                className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 font-semibold transition-colors"
              >
                <SlidersIcon className="w-3 h-3" />
                <span>Quản trị Hệ thống (/admin/don-hang)</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER: Brand Logo + Smart Search Bar + User Auth + Cart */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          {/* Logo Đen Carbon Bảo Công Studio */}
          <Link
            href="/trangchu"
            className="flex items-center gap-3 flex-shrink-0 group"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs border border-zinc-800 group-hover:border-zinc-700 transition-colors">
              <BrandLogoIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-black text-zinc-900 tracking-tight text-lg">
                  BẢO CÔNG
                </span>
                <span className="font-semibold text-zinc-500 text-lg">
                  STUDIO
                </span>
              </div>
              <div className="text-[10px] tracking-widest text-zinc-400 font-semibold uppercase leading-none">
                FLAGSHIP &amp; CERTIFIED TECH
              </div>
            </div>
          </Link>

          {/* Smart Search Bar */}
          <div className="flex-1 max-w-xl mx-2 hidden md:block">
            <SmartSearchBar />
          </div>

          {/* Right actions: Auth + Cart */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {isMounted && user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {user.role === "admin" && (
                  <Link
                    href="/admin/don-hang"
                    className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg px-3 py-1.5 text-xs font-semibold shadow-xs transition-colors"
                  >
                    <SlidersIcon className="w-3.5 h-3.5 text-zinc-300" />
                    <span>Quản trị Admin</span>
                  </Link>
                )}

                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-semibold text-zinc-900 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {user.role === "admin" ? "Quản trị viên" : "Khách hàng"}
                  </span>
                </div>

                <Link
                  href="/orders"
                  className="p-2 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors"
                  title="Đơn mua của tôi"
                >
                  <PackageIcon className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Đăng xuất"
                >
                  <LogOutIcon className="w-4 h-4" />
                </button>
              </div>
            ) : isMounted ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950 rounded-lg hover:bg-zinc-100 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-xs transition-colors"
                >
                  Đăng ký
                </Link>
              </div>
            ) : (
              <div className="w-24 h-7 bg-zinc-100 rounded-lg animate-pulse" />
            )}

            {/* Giỏ hàng */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200/80 text-zinc-900 font-medium text-xs transition-colors"
            >
              <ShoppingBagIcon className="w-4 h-4 text-zinc-900" />
              <span className="hidden sm:inline font-semibold">Giỏ hàng</span>
              {cartCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-zinc-900 text-white min-w-[18px] text-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-3 md:hidden">
          <SmartSearchBar />
        </div>
      </div>

      {/* 3. NAVIGATION BAR (Static & Hydration-Safe, No Suspense Mismatch) */}
      <nav className="bg-white border-t border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2 text-xs font-medium">
            {navItems.map((item) => (
              <li key={item.label} className="flex-shrink-0">
                <Link
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
                    item.isActive
                      ? "bg-zinc-900 text-white font-semibold shadow-xs"
                      : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.dot && (
                    <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
