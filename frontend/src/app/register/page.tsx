"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosClient from "@/services/axiosClient";
import { setToken, UserInfo } from "@/lib/api";
import { PageShell, ErrorBox, inputCls, btnPrimary, card } from "@/components/PageShell";

export default function RegisterPage() {
  const router = useRouter();
  const [f, setF] = useState({
    fullname: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF({ ...f, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (f.password !== f.confirm) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }
    setBusy(true);
    setError("");

    try {
      const res: any = await axiosClient.post("/register", {
        fullname: f.fullname,
        name: f.fullname,
        email: f.email,
        phone: f.phone || null,
        address: f.address || null,
        password: f.password,
      });

      const token = res?.access_token || res?.token;
      const user: UserInfo = res?.user;

      if (token) {
        setToken(token);
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(user));
        }
        router.push("/");
      } else {
        router.push("/login");
      }
    } catch (err: any) {
      console.error("Register error:", err);
      setError(err.message || "Đăng ký tài khoản không thành công. Vui lòng thử lại!");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell title="Đăng ký tài khoản mới" narrow>
      <form onSubmit={submit} className={`${card} space-y-4`}>
        <ErrorBox message={error} />

        <label className="block text-sm font-medium text-slate-700">
          Họ và tên <span className="text-red-600">*</span>
          <input
            required
            value={f.fullname}
            onChange={set("fullname")}
            className={`${inputCls} mt-1`}
            placeholder="Nguyễn Văn A"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Địa chỉ Email <span className="text-red-600">*</span>
          <input
            type="email"
            required
            value={f.email}
            onChange={set("email")}
            className={`${inputCls} mt-1`}
            placeholder="email@example.com"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Số điện thoại
          <input
            value={f.phone}
            onChange={set("phone")}
            className={`${inputCls} mt-1`}
            placeholder="0912345678"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Địa chỉ nhận hàng mặc định
          <input
            value={f.address}
            onChange={set("address")}
            className={`${inputCls} mt-1`}
            placeholder="Địa chỉ của bạn"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Mật khẩu (tối thiểu 6 ký tự) <span className="text-red-600">*</span>
          <input
            type="password"
            required
            minLength={6}
            value={f.password}
            onChange={set("password")}
            className={`${inputCls} mt-1`}
            placeholder="••••••••"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Xác nhận mật khẩu <span className="text-red-600">*</span>
          <input
            type="password"
            required
            value={f.confirm}
            onChange={set("confirm")}
            className={`${inputCls} mt-1`}
            placeholder="••••••••"
          />
        </label>

        <button disabled={busy} className={`${btnPrimary} w-full font-bold !py-3 mt-2 shadow-md`}>
          {busy ? "Đang tạo tài khoản…" : "Tạo tài khoản mới"}
        </button>

        <p className="pt-2 text-center text-xs text-slate-600">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-bold text-blue-600 hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </form>
    </PageShell>
  );
}
