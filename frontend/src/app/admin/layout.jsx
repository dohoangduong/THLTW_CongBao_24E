"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import axiosClient from '@/services/axiosClient';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('access_token')) : null;
    if (token) {
      axiosClient.get('/user')
        .then((res) => {
          const userData = res?.user || res?.data || res;
          if (userData && (userData.role || userData.name)) {
            setCurrentUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        })
        .catch((err) => {
          console.error('Lỗi khi tải thông tin tài khoản:', err);
        });
    }
  }, [pathname]);

  // Bỏ qua Layout Sidebar/Header nếu đang ở trang Đăng nhập
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const isManager = currentUser?.role === 'manager';

  const menuItems = [
    { name: 'Quản lý Đơn hàng', path: '/admin/don-hang' },
    ...(!isManager ? [{ name: 'Quản lý Người dùng', path: '/admin/nguoi-dung' }] : []),
    { name: 'Quản lý Sản phẩm', path: '/admin/san-pham' },
    { name: 'Quản lý Danh mục', path: '/admin/danh-muc' },
    { name: 'Quản lý Thương hiệu', path: '/admin/thuong-hieu' },
    { name: 'Thùng rác', path: '/admin/thung-rac' },
  ];

  const handleLogout = async () => {
    try {
      await axiosClient.post('/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
      router.push('/admin/login');
    }
  };

  return (
    <div className="admin-retro min-h-screen bg-[#d4d0c8] flex flex-col font-sans text-xs text-black select-none">
      {/* Top Titlebar */}
      <div className="retro-titlebar">
        <div className="font-bold tracking-wide">
          ADMIN PANEL - Hệ thống Quản trị Website Bán Hàng (v1.0)
        </div>
        <div className="flex items-center gap-2 text-xs font-normal">
          {currentUser ? (
            currentUser.role === 'admin' ? (
              <span>
                <span style={{ color: 'red', fontWeight: 'bold' }}>QTV: </span>
                <span style={{ color: 'black', fontWeight: 'bold' }}>{currentUser.name}</span>
              </span>
            ) : currentUser.role === 'manager' ? (
              <span>
                <span style={{ color: 'black', fontWeight: 'bold' }}>QLY: </span>
                <span style={{ color: 'black', fontWeight: 'bold' }}>{currentUser.name}</span>
              </span>
            ) : (
              <span>
                <span style={{ color: 'black', fontWeight: 'bold' }}>NV: </span>
                <span style={{ color: 'black', fontWeight: 'bold' }}>{currentUser.name}</span>
              </span>
            )
          ) : (
            <span style={{ color: 'black' }}>
              Đang tải...
            </span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="retro-btn text-red-700 font-bold !py-0.5"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Retro Left Navigation Sidebar */}
        <aside className="w-56 bg-[#d4d0c8] border-r-2 border-[#808080] p-2 flex flex-col justify-between">
          <div>
            <div className="border border-[#808080] bg-white p-2 mb-3">
              <div className="font-bold text-black border-b border-[#808080] pb-1 mb-2 text-xs">
                MENU ĐIỀU HƯỚNG
              </div>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={
                        isActive
                          ? "block bg-[#0a246a] text-white font-bold px-2 py-1 !no-underline"
                          : "block text-[#0000ee] underline hover:text-red-600 px-2 py-1"
                      }
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Retro Quick Links Box */}
            <div className="border border-[#808080] bg-[#ece9d8] p-2 text-xs">
              <div className="font-bold text-black border-b border-[#808080] pb-1 mb-1.5">
                THÔNG TIN HỆ THỐNG
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-800">
                <li>Giao diện: Web 1.0 Retro</li>
                <li>Máy chủ: PHP / Laravel API</li>
                <li>Frontend: Next.js v16</li>
                <li>Độ phân giải: 1024 x 768</li>
                <li className="pt-1 border-t border-[#808080]"><Link href="/" className="text-[#0000ee] underline hover:text-red-600 font-bold">» Mở Website Khách Hàng</Link></li>
              </ul>
            </div>
          </div>

          <div className="text-[10px] text-gray-600 text-center border-t border-[#808080] pt-2">
            © 2000-2026 Admin Panel. All Rights Reserved.
          </div>
        </aside>

        {/* Right Content Canvas inside Sunken Panel */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#d4d0c8] p-2">
          <div className="retro-sunken flex-1 p-4 overflow-auto bg-white select-text">
            {children}
          </div>
        </main>
      </div>

      {/* Classic Windows 98/2000 Bottom Status Bar */}
      <footer className="bg-[#d4d0c8] border-t border-[#ffffff] px-1 py-0.5 flex items-center gap-1 text-[11px]">
        <div className="retro-statusbar-panel flex-1">
          Sẵn sàng.
        </div>
        <div className="retro-statusbar-panel w-48">
          Máy chủ: Trực tuyến (API OK)
        </div>
        <div className="retro-statusbar-panel w-32 text-center">
          CAPS | NUM
        </div>
      </footer>
    </div>
  );
}
