"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosClient from "@/services/axiosClient";
import { setToken, UserInfo } from "@/lib/api";
import { PageShell, ErrorBox, inputCls, btnPrimary, card } from "@/components/PageShell";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // [THUẬT TOÁN ĐĂNG NHẬP PHÂN QUYỀN RBAC & CHẶN TÀI KHOẢN KHÓA]:
  // Gọi POST /api/login -> Kiểm tra trạng thái khóa (status) -> Chuyển hướng theo role:
  // - Admin (user.role === 'admin') -> vào thẳng /admin
  // - Khách hàng (user.role !== 'admin') -> về /trangchu
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const res: any = await axiosClient.post("/login", { email, password });
      const token = res?.access_token || res?.token;
      const user: UserInfo = res?.user;

      if (!token || !user) {
        throw new Error("Không nhận được token xác thực từ máy chủ");
      }

      // Kiểm tra trạng thái khóa tài khoản
      const isBlocked =
        Number(user.status) === 0 ||
        String((user as any).status) === "blocked" ||
        Boolean((user as any).is_blocked);

      if (isBlocked) {
        throw new Error(
          "Tài khoản của bạn đã bị khóa bởi Quản trị viên! Vui lòng liên hệ bộ phận CSKH để được hỗ trợ."
        );
      }

      // Lưu trữ phiên đăng nhập đồng bộ
      setToken(token);
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        localStorage.setItem("access_token", token);
        localStorage.setItem("user", JSON.stringify(user));
      }

      // Phân quyền chuyển hướng (Role-Based Redirect)
      if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/trangchu");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Email hoặc mật khẩu không chính xác. Vui lòng thử lại!");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell title="Đăng nhập tài khoản" narrow>
      <form onSubmit={submit} className={`${card} space-y-4`}>
        <ErrorBox message={error} />

        <label className="block text-xs font-semibold text-zinc-700">
          Địa chỉ Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${inputCls} mt-1.5`}
            placeholder="email@example.com"
          />
        </label>

        <label className="block text-xs font-semibold text-zinc-700">
          Mật khẩu
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputCls} mt-1.5`}
            placeholder="••••••••"
          />
        </label>

        <button disabled={busy} className={`${btnPrimary} w-full font-bold !py-2.5 mt-2`}>
          {busy ? "Đang xác thực…" : "Đăng nhập ngay"}
        </button>

        {/* Chân form tối giản theo chuẩn Swiss Monochrome Tech: Xóa bỏ hoàn toàn link Admin Retro */}
        <div className="pt-2 text-center text-xs text-zinc-600">
          <p>
            Chưa có tài khoản?{" "}
            <Link href="/register" className="font-semibold text-zinc-950 hover:underline">
              Đăng ký tài khoản mới
            </Link>
          </p>
        </div>
      </form>
    </PageShell>
  );
}
