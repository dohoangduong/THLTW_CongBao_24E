"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import SmartSearchBar from "@/components/SmartSearchBar";
import {
  BrandLogoIcon,
  ShoppingBagIcon,
  SlidersIcon,
  LogOutIcon,
  PackageIcon,
} from "@/components/Icons";
import axiosClient from "@/services/axiosClient";

function NavigationBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = searchParams ? searchParams.get("type") : null;

  // Danh sách 5 mục điều hướng chuẩn của shop
  const NAV_ITEMS = [
    {
      label: "Trang chủ",
      href: "/trangchu",
      isActive: pathname === "/trangchu" || pathname === "/",
    },
    {
      label: "Tất cả sản phẩm",
      href: "/products",
      isActive: pathname === "/products" && !currentType,
    },
    {
      label: "Sản phẩm mới",
      href: "/products?type=new",
      isActive: pathname === "/products" && currentType === "new",
      badge: "MỚI",
    },
    {
      label: "Sale / Khuyến mãi",
      href: "/products?type=sale",
      isActive: pathname === "/products" && currentType === "sale",
      badge: "HOT",
      badgeCls: "bg-rose-500 text-white",
    },
    {
      label: "Hỗ trợ",
      href: "/ho-tro",
      isActive: pathname === "/ho-tro",
    },
  ];

  return (
    <nav className="bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2 text-sm font-medium">
          {NAV_ITEMS.map((item) => (
            <li key={item.label} className="flex-shrink-0">
              <Link
                href={item.href}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                  item.isActive
                    ? "bg-blue-600 text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                      item.badgeCls || "bg-amber-500 text-white"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default function StoreHeader() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [cartCount, setCartCount] = useState<number>(0);

  // Đọc thông tin user sau khi Mount ở Client để chống lỗi Hydration
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      const uStr = localStorage.getItem("user");
      if (token && uStr) {
        try {
          setUser(JSON.parse(uStr));
        } catch {
          setUser(null);
        }
      }
    }
  }, []);

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
      localStorage.removeItem("user");
    }
    setUser(null);
    router.push("/trangchu");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Header: Logo + Smart Search Bar + User Auth + Cart */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          {/* Logo */}
          <Link
            href="/trangchu"
            className="flex items-center gap-2.5 flex-shrink-0 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
              <BrandLogoIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 tracking-tight">
                Bảo Công <span className="text-blue-600">Mobile</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Chính Hãng & Uy Tín
              </span>
            </div>
          </Link>

          {/* Smart Search Bar */}
          <div className="flex-1 max-w-xl mx-2 hidden md:block">
            <SmartSearchBar />
          </div>

          {/* Right actions: Auth + Cart */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {isMounted && user ? (
              <div className="flex items-center gap-2">
                {user.role === "admin" && (
                  <Link
                    href="/admin/don-hang"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                  >
                    <SlidersIcon className="w-3.5 h-3.5 text-amber-600" />
                    <span>Quản trị Admin</span>
                  </Link>
                )}

                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-800 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {user.role === "admin" ? "Quản trị viên" : "Khách hàng"}
                  </span>
                </div>

                <Link
                  href="/orders"
                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Đơn mua của tôi"
                >
                  <PackageIcon className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Đăng xuất"
                >
                  <LogOutIcon className="w-4 h-4" />
                </button>
              </div>
            ) : isMounted ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                >
                  Đăng ký
                </Link>
              </div>
            ) : (
              <div className="w-20 h-7 bg-slate-100 rounded-lg animate-pulse" />
            )}

            {/* Giỏ hàng */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-medium text-xs transition-colors"
            >
              <ShoppingBagIcon className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Giỏ hàng</span>
              {cartCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-600 text-white min-w-[18px] text-center">
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

      {/* Bottom Bar: 5 Navigation Items bọc trong Suspense an toàn tuyệt đối */}
      <Suspense fallback={<div className="bg-slate-50 border-t border-slate-200/80 h-10" />}>
        <NavigationBar />
      </Suspense>
    </header>
  );
}
