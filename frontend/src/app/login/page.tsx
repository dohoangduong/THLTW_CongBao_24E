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

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const res: any = await axiosClient.post("/login", { email, password });
      const token = res?.access_token || res?.token;
      const user: UserInfo = res?.user;

      if (token) {
        setToken(token);
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(user));
        }

        if (user && ["admin", "manager"].includes(user.role)) {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        throw new Error("Không nhận được token xác thực từ máy chủ");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Email hoặc mật khẩu không chính xác!");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell title="Đăng nhập tài khoản" narrow>
      <form onSubmit={submit} className={`${card} space-y-4`}>
        <ErrorBox message={error} />

        <label className="block text-sm font-medium text-slate-700">
          Địa chỉ Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${inputCls} mt-1`}
            placeholder="email@example.com"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Mật khẩu
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputCls} mt-1`}
            placeholder="••••••••"
          />
        </label>

        <button disabled={busy} className={`${btnPrimary} w-full font-bold !py-3 mt-2 shadow-md`}>
          {busy ? "Đang xác thực…" : "Đăng nhập ngay"}
        </button>

        <div className="pt-2 text-center text-xs text-slate-600 space-y-2">
          <p>
            Chưa có tài khoản?{" "}
            <Link href="/register" className="font-bold text-blue-600 hover:underline">
              Đăng ký tài khoản mới
            </Link>
          </p>
          <p>
            Quản trị viên / Quản lý?{" "}
            <Link href="/admin/login" className="font-semibold text-slate-800 hover:underline">
              Đăng nhập Admin Retro
            </Link>
          </p>
        </div>
      </form>
    </PageShell>
  );
}
