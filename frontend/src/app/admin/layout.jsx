"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Sản phẩm', path: '/admin/san-pham' },
    { name: 'Danh mục', path: '/admin/danh-muc' },
    { name: 'Thương hiệu', path: '/admin/thuong-hieu' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col shadow-xl z-20">
        <div className="h-16 flex items-center justify-center border-b border-slate-700/50 bg-slate-950/30">
          <h1 className="text-xl font-bold tracking-wider text-blue-400">ADMIN PANEL</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path + '/'));
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`block px-4 py-2.5 rounded-lg transition-all duration-200 font-medium ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                    : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 z-10">
          <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Quản trị hệ thống</h2>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-600">Admin</span>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                A
              </div>
            </div>
            <div className="w-px h-6 bg-gray-200"></div>
            <button className="text-sm text-red-500 font-medium hover:text-red-700 transition-colors">
              Đăng xuất
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
