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
  ShieldCheckIcon,
  BoltIcon,
  RefreshCwIcon,
  AwardIcon,
  UserCircleIcon,
} from "@/components/Icons";
import axiosClient from "@/services/axiosClient";

function NavigationFallback() {
  return (
    <nav className="bg-white border-t border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2 text-xs font-medium">
          {[
            { label: "Trang chủ", href: "/trangchu" },
            { label: "Tất cả sản phẩm", href: "/products" },
            { label: "Sản phẩm mới", href: "/products?type=new", dot: "bg-emerald-500" },
            { label: "Sale / Khuyến mãi", href: "/products?type=sale", dot: "bg-rose-500" },
            { label: "Bài viết công nghệ", href: "/bai-viet" },
            { label: "Trung tâm hỗ trợ", href: "/ho-tro" },
          ].map((item) => (
            <li key={item.label} className="flex-shrink-0">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-zinc-600">
                <span>{item.label}</span>
                {item.dot && <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function NavigationBar({ dynamicMenus = [] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const type = mounted && searchParams ? searchParams.get("type") : null;

  const isHome = pathname === "/trangchu" || pathname === "/";
  const isAll = pathname === "/products" && (!type || type === "all");
  const isNew = pathname === "/products" && type === "new";
  const isSale = pathname === "/products" && type === "sale";
  const isPosts = pathname.startsWith("/bai-viet");
  const isSupport = pathname === "/ho-tro";

  const defaultNavItems = [
    { label: "Trang chủ", href: "/trangchu", isActive: isHome },
    { label: "Tất cả sản phẩm", href: "/products", isActive: isAll },
    { label: "Sản phẩm mới", href: "/products?type=new", isActive: isNew, dot: "bg-emerald-500" },
    { label: "Sale / Khuyến mãi", href: "/products?type=sale", isActive: isSale, dot: "bg-rose-500" },
    { label: "Bài viết công nghệ", href: "/bai-viet", isActive: isPosts },
    { label: "Trung tâm hỗ trợ", href: "/ho-tro", isActive: isSupport },
  ];

  // Nếu có Menu động từ MySQL (`menus` table position = 'header'), ưu tiên hiển thị đồng bộ
  const navItems =
    Array.isArray(dynamicMenus) && dynamicMenus.length > 0
      ? dynamicMenus.map((m) => ({
          label: m.name,
          href: m.url,
          isActive: pathname === m.url,
          dot: m.url.includes("new")
            ? "bg-emerald-500"
            : m.url.includes("sale")
            ? "bg-rose-500"
            : null,
        }))
      : defaultNavItems;

  return (
    <nav className="bg-white border-t border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2 text-xs font-medium">
          {navItems.map((item) => (
            <li key={item.label} className="flex-shrink-0">
              <Link
                href={item.href}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
                  item.isActive
                    ? "bg-zinc-900 text-white font-semibold shadow-2xs"
                    : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                }`}
              >
                <span>{item.label}</span>
                {item.dot && <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />}
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

  const [user, setUser] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [settings, setSettings] = useState(null);
  const [headerMenus, setHeaderMenus] = useState([]);

  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== "undefined") {
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
    }
  }, []);

  // Tải cấu hình website & Menu điều hướng động từ MySQL
  useEffect(() => {
    axiosClient
      .get("/settings")
      .then((res) => {
        const s = res?.data || res;
        if (s) setSettings(s);
      })
      .catch(() => {});

    axiosClient
      .get("/menus")
      .then((res) => {
        const hMenus = res?.header || (Array.isArray(res?.data) ? res.data.filter((m) => m.position === "header") : []);
        if (Array.isArray(hMenus) && hMenus.length > 0) {
          setHeaderMenus(hMenus);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isMounted || !user) {
      setCartCount(0);
      return;
    }

    axiosClient
      .get("/cart")
      .then((res) => {
        const items = res?.items || res?.data?.items || res?.cart?.items || [];
        const count = items.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);
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
    router.push("/login");
  };

  const siteName = settings?.site_name || "BẢO CÔNG STUDIO";
  const hotline = settings?.hotline || "1900 8888";

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

          {/* Phải: Hotline dịch vụ & Thông tin hỗ trợ */}
          <div className="flex items-center gap-4 text-[11px] shrink-0 font-medium">
            <div className="hidden sm:flex items-center gap-1.5 text-zinc-400">
              <span>
                Hotline: <b className="text-white font-mono">{hotline}</b> • Giao nhanh 2h nội thành
              </span>
            </div>
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
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-2xs border border-zinc-800 group-hover:border-zinc-700 transition-colors">
              <BrandLogoIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-black text-zinc-900 tracking-tight text-lg uppercase">
                  {siteName.split(" ")[0] || "BẢO CÔNG"}
                </span>
                <span className="font-semibold text-zinc-500 text-lg uppercase">
                  {siteName.split(" ").slice(1).join(" ") || "STUDIO"}
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

          {/* Right actions: Auth + Orders + Cart */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {isMounted && user ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Nút Admin nếu là Admin */}
                {user?.role === "admin" && (
                  <Link
                    href="/admin/don-hang"
                    className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <SlidersIcon className="w-3.5 h-3.5 text-amber-300" />
                    <span className="hidden sm:inline">Quản trị</span>
                  </Link>
                )}

                {/* Tài khoản */}
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors"
                  title="Thông tin tài khoản"
                >
                  <UserCircleIcon className="w-4 h-4 text-zinc-700" />
                  <span className="max-w-[100px] truncate hidden md:inline">
                    {user?.name || user?.email?.split("@")[0]}
                  </span>
                </Link>

                {/* Đơn hàng cá nhân */}
                <Link
                  href="/orders"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors"
                  title="Lịch sử đơn hàng"
                >
                  <PackageIcon className="w-4 h-4 text-zinc-700" />
                  <span className="hidden lg:inline">Đơn hàng</span>
                </Link>

                {/* Đăng xuất */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                  title="Đăng xuất"
                >
                  <LogOutIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors shadow-2xs"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Giỏ hàng Icon Pill */}
            <Link
              href="/cart"
              className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-xs font-semibold text-zinc-800 transition shadow-2xs"
            >
              <ShoppingBagIcon className="w-4 h-4 text-zinc-900" />
              <span className="hidden sm:inline">Giỏ</span>
              {cartCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-mono font-bold leading-none text-white bg-zinc-900 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="mt-3 md:hidden">
          <SmartSearchBar />
        </div>
      </div>

      {/* 3. NAVIGATION BAR (Categories & Quick Links) */}
      <Suspense fallback={<NavigationFallback />}>
        <NavigationBar dynamicMenus={headerMenus} />
      </Suspense>
    </header>
  );
}
