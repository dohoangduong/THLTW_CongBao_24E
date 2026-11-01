"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Vô hiệu hóa hoàn toàn cổng đăng nhập Admin Retro cũ:
    // Tự động chuyển hướng ngay lập tức về trang Đăng nhập chuẩn /login
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans text-zinc-900">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-400 text-xs font-mono shadow-2xl">
        Đang chuyển hướng sang trang đăng nhập hệ thống (/login)...
      </div>
    </div>
  );
}
