"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import axiosClient from "@/services/axiosClient";
import {
  BrandLogoIcon,
  PackageIcon,
  UsersIcon,
  SmartphoneIcon,
  GridIcon,
  TagIcon,
  TrashIcon,
  ExternalLinkIcon,
  LogOutIcon,
  UserCircleIcon,
  StarIcon,
  HelpCircleIcon,
  MessageSquareIcon,
  BookOpenIcon,
  WarehouseIcon,
  PercentIcon,
  SettingsIcon,
  ImageIcon,
  MenuIcon,
  FileTextIcon,
} from "@/components/Icons";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // [THUẬT TOÁN AUTH GUARD BẢO VỆ PHÂN HỆ QUẢN TRỊ ADMIN]:
  useEffect(() => {
    if (pathname === "/admin/login") {
      setLoadingAuth(false);
      return;
    }

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      const savedUserStr = localStorage.getItem("user");

      if (!token || !savedUserStr) {
        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        setIsAuthorized(false);
        setLoadingAuth(false);
        router.replace("/login");
        return;
      }

      let userObj = null;
      try {
        userObj = JSON.parse(savedUserStr);
      } catch {
        userObj = null;
      }

      if (!userObj || userObj.role !== "admin") {
        setIsAuthorized(false);
        setLoadingAuth(false);
        router.replace("/trangchu");
        return;
      }

      setCurrentUser(userObj);
      setIsAuthorized(true);
      setLoadingAuth(false);

      axiosClient
        .get("/user")
        .then((res) => {
          const freshUser = res?.user || res?.data || res;
          if (freshUser && freshUser.role === "admin") {
            setCurrentUser(freshUser);
            localStorage.setItem("user", JSON.stringify(freshUser));
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
            setIsAuthorized(false);
            router.replace("/login");
          }
        })
        .catch((err) => {
          console.error("Lỗi khi kiểm tra phiên đăng nhập Admin:", err);
          localStorage.removeItem("token");
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          setIsAuthorized(false);
          router.replace("/login");
        });
    }
  }, [pathname, router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loadingAuth || !isAuthorized) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
          <div className="w-10 h-10 border-2 border-zinc-400 border-t-white rounded-full animate-spin mx-auto" />
          <div className="space-y-1">
            <h3 className="text-white font-bold text-sm tracking-tight">Xác thực quyền Quản trị viên</h3>
            <p className="text-zinc-500 text-xs">Vui lòng đợi trong giây lát...</p>
          </div>
        </div>
      </div>
    );
  }

  // Danh mục quản lý chia nhóm logic chuẩn Swiss Monochrome Back-office
  const menuGroups = [
    {
      group: "Bán hàng & Khách hàng",
      items: [
        { name: "Quản lý Đơn hàng", path: "/admin/don-hang", icon: PackageIcon },
        { name: "Quản lý Kho hàng", path: "/admin/kho-hang", icon: WarehouseIcon },
        { name: "Mã Khuyến mãi", path: "/admin/khuyen-mai", icon: PercentIcon },
        { name: "Quản lý Người dùng", path: "/admin/nguoi-dung", icon: UsersIcon },
      ],
    },
    {
      group: "Quản lý Sản phẩm",
      items: [
        { name: "Sản phẩm", path: "/admin/san-pham", icon: SmartphoneIcon },
        { name: "Danh mục", path: "/admin/danh-muc", icon: GridIcon },
        { name: "Thương hiệu", path: "/admin/thuong-hieu", icon: TagIcon },
        { name: "Đánh giá sản phẩm", path: "/admin/danh-gia", icon: StarIcon },
      ],
    },
    {
      group: "Nội dung & Tương tác",
      items: [
        { name: "Bài viết công nghệ", path: "/admin/bai-viet", icon: BookOpenIcon },
        { name: "Chủ đề bài viết", path: "/admin/chu-de-bai-viet", icon: TagIcon },
        { name: "Thảo luận bài viết", path: "/admin/thao-luan", icon: MessageSquareIcon },
        { name: "Trang đơn / Tĩnh", path: "/admin/trang-don", icon: FileTextIcon },
        { name: "Hỗ trợ khách hàng", path: "/admin/ho-tro", icon: HelpCircleIcon },
      ],
    },
    {
      group: "Giao diện & Cài đặt",
      items: [
        { name: "Banner trang chủ", path: "/admin/banner", icon: ImageIcon },
        { name: "Menu điều hướng", path: "/admin/menu", icon: MenuIcon },
        { name: "Cấu hình website", path: "/admin/cau-hinh", icon: SettingsIcon },
        { name: "Thùng rác", path: "/admin/thung-rac", icon: TrashIcon },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      await axiosClient.post("/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setCurrentUser(null);
      setIsAuthorized(false);
      router.replace("/login");
    }
  };

  const getPageTitle = () => {
    for (const grp of menuGroups) {
      const found = grp.items.find((m) => pathname === m.path || pathname.startsWith(m.path + "/"));
      if (found) return found.name;
    }
    return "Hệ thống Quản trị";
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex font-sans antialiased text-zinc-900">
      {/* 1. HIGH-DENSITY LINEAR SIDEBAR */}
      <aside className="w-64 bg-zinc-950 text-zinc-400 min-h-screen flex flex-col justify-between shrink-0 border-r border-zinc-800">
        <div className="overflow-y-auto max-h-[calc(100vh-80px)] no-scrollbar">
          {/* Brand Header */}
          <div className="p-5 border-b border-zinc-800 flex items-center gap-3 sticky top-0 bg-zinc-950/95 backdrop-blur z-10">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center border border-zinc-700/80">
              <BrandLogoIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-sm tracking-tight">BẢO CÔNG</span>
                <span className="text-[10px] bg-zinc-800 text-zinc-300 font-mono font-bold px-1.5 py-0.2 rounded border border-zinc-700">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 font-mono">High-Density v2.0</p>
            </div>
          </div>

          {/* Grouped Navigation */}
          <nav className="p-3 space-y-4">
            {menuGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider px-3 py-1">
                  {group.group}
                </div>
                {group.items.map((item) => {
                  const IconComp = item.icon;
                  const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center gap-2.5 px-3 py-1.5 text-xs transition-colors ${
                        isActive
                          ? "bg-zinc-800/90 text-white border-l-2 border-white rounded-r-lg font-medium"
                          : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 rounded-lg"
                      }`}
                    >
                      <IconComp className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-3 border-t border-zinc-800 space-y-2 shrink-0">
          <Link
            href="/trangchu"
            className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800/90 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-800 transition"
          >
            <div className="flex items-center gap-2">
              <ExternalLinkIcon className="w-3.5 h-3.5 text-zinc-400" />
              <span>Xem Cửa hàng</span>
            </div>
            <span className="text-zinc-500 font-mono text-[10px]">↗</span>
          </Link>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Modern Topbar */}
        <header className="bg-white border-b border-zinc-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-base font-extrabold text-zinc-900 tracking-tight">
              {getPageTitle()}
            </h1>
            <p className="text-[11px] text-zinc-500 font-mono">
              BẢNG ĐIỀU KHIỂN HỆ THỐNG • KẾT NỐI TRỰC TIẾP MYSQL
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-100/80 px-3 py-1.5 rounded-lg border border-zinc-200">
              <UserCircleIcon className="w-4 h-4 text-zinc-600" />
              <span className="text-xs font-semibold text-zinc-800">
                {currentUser?.name ? `QTV: ${currentUser.name}` : "Quản Trị Viên"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
            >
              <LogOutIcon className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* Page Content Canvas */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
