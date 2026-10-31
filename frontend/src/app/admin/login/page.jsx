"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosClient from "@/services/axiosClient";
import { BrandLogoIcon, AlertCircleIcon, ExternalLinkIcon } from "@/components/Icons";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "admin@baocong.com", password: "password" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Nếu đã đăng nhập Admin từ trước, tự động chuyển vào /admin/don-hang
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      const savedUser = localStorage.getItem("user");
      if (token && savedUser) {
        try {
          const u = JSON.parse(savedUser);
          if (u?.role === "admin") {
            router.replace("/admin/don-hang");
          }
        } catch {}
      }
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axiosClient.post("/login", formData);
      const token = response.access_token || response.token;
      const user = response.user;

      if (!token || !user) {
        throw new Error("Đăng nhập thất bại: Không nhận được mã xác thực từ máy chủ.");
      }

      // Kiểm tra quyền Admin
      if (user.role !== "admin") {
        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        setError("Truy cập bị từ chối: Tài khoản này không có quyền Quản trị viên (Admin) để đăng nhập Admin Panel!");
        return;
      }

      // Kiểm tra trạng thái hoạt động của tài khoản
      if (user.status === 0 || user.status === false) {
        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        setError("Tài khoản của bạn đã bị khóa hoặc tạm ngừng hoạt động. Vui lòng liên hệ quản trị viên cấp cao!");
        return;
      }

      // Lưu đồng bộ token và user vào localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("access_token", token);
      localStorage.setItem("user", JSON.stringify(user));
      axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Chuyển hướng sang trang Quản lý Đơn hàng
      router.replace("/admin/don-hang");
    } catch (err) {
      if (err.status === 401 || err.response?.status === 401) {
        setError("Địa chỉ Email hoặc Mật khẩu không chính xác. Vui lòng kiểm tra lại!");
      } else if (err.status === 403 || err.response?.status === 403) {
        setError("Tài khoản đã bị vô hiệu hóa hoặc không có quyền truy cập!");
      } else {
        setError(err.message || "Không thể kết nối đến máy chủ API. Vui lòng kiểm tra lại Backend Laravel.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans text-zinc-900">
      <div className="w-full max-w-sm bg-white rounded-2xl p-7 sm:p-8 shadow-2xl border border-zinc-200 space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-zinc-950 text-white flex items-center justify-center mx-auto border border-zinc-800">
            <BrandLogoIcon className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-lg font-extrabold text-zinc-950 tracking-tight">
            BẢO CÔNG ADMIN
          </h2>
          <p className="text-xs text-zinc-500 font-mono">
            HỆ THỐNG QUẢN TRỊ DỮ LIỆU BÁN HÀNG
          </p>
        </div>

        {/* Thông báo lỗi Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2">
            <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Đăng nhập */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700">Email quản trị viên</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 font-mono transition"
              placeholder="admin@baocong.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700">Mật khẩu xác thực</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 font-mono transition"
              placeholder="••••••••"
            />
          </div>

          {/* Quick Helper Credentials */}
          <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-200 text-[11px] text-zinc-600 space-y-1 font-mono">
            <span className="font-bold text-zinc-800 block font-sans">Tài khoản Admin mẫu sẵn có:</span>
            <div>• Email: <code className="font-bold text-zinc-900">admin@baocong.com</code> | MK: <code className="font-bold text-zinc-900">password</code></div>
            <div>• Email: <code className="font-bold text-zinc-900">admin@example.com</code> | MK: <code className="font-bold text-zinc-900">password</code></div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-2.5 rounded-lg text-xs transition disabled:bg-zinc-300"
          >
            {loading ? "Đang xác thực hệ thống..." : "Đăng nhập Quản trị"}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-zinc-100">
          <Link
            href="/trangchu"
            className="text-xs text-zinc-500 hover:text-zinc-900 transition flex items-center justify-center gap-1"
          >
            <ExternalLinkIcon className="w-3.5 h-3.5" />
            <span>Quay lại Cửa hàng Khách hàng</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
