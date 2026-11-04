"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosClient from "@/services/axiosClient";
import { PageShell, ErrorBox, inputCls, btnPrimary, card } from "@/components/PageShell";
import { CheckIcon, ArrowLeftIcon } from "@/components/Icons";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (password !== passwordConfirmation) {
      setError("Mật khẩu xác nhận không trùng khớp!");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu mới phải có tối thiểu 6 ký tự!");
      return;
    }

    setBusy(true);

    try {
      const res = await axiosClient.post("/forgot-password", {
        email,
        phone,
        password,
        password_confirmation: passwordConfirmation,
      });

      setSuccessMsg(res?.message || "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay với mật khẩu mới.");
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.message || "Đặt lại mật khẩu thất bại. Vui lòng kiểm tra lại thông tin Email và Số điện thoại!");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell title="Khôi phục & Đặt lại mật khẩu" narrow>
      <div className="mb-4">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-950 transition-colors"
        >
          <span>← Quay lại đăng nhập</span>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className={`${card} space-y-4`}>
        <div className="border-b border-zinc-100 pb-3">
          <h2 className="text-sm font-bold text-zinc-900">Xác minh danh tính thành viên</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Nhập chính xác Email và Số điện thoại đã đăng ký để đặt mật khẩu mới trực tiếp vào hệ thống.
          </p>
        </div>

        <ErrorBox message={error} />

        {successMsg && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <label className="block text-xs font-semibold text-zinc-700">
          Địa chỉ Email đăng ký <span className="text-rose-600">*</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${inputCls} mt-1`}
            placeholder="email@example.com"
          />
        </label>

        <label className="block text-xs font-semibold text-zinc-700">
          Số điện thoại xác minh <span className="text-rose-600">*</span>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`${inputCls} mt-1`}
            placeholder="Ví dụ: 0901234567"
          />
        </label>

        <label className="block text-xs font-semibold text-zinc-700">
          Mật khẩu mới (tối thiểu 6 ký tự) <span className="text-rose-600">*</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputCls} mt-1`}
            placeholder="••••••••"
          />
        </label>

        <label className="block text-xs font-semibold text-zinc-700">
          Xác nhận mật khẩu mới <span className="text-rose-600">*</span>
          <input
            type="password"
            required
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className={`${inputCls} mt-1`}
            placeholder="••••••••"
          />
        </label>

        <button disabled={busy} className={`${btnPrimary} w-full font-bold !py-2.5 mt-2`}>
          {busy ? "Đang xử lý…" : "Xác nhận đặt lại mật khẩu"}
        </button>

        <div className="pt-2 text-center text-xs text-zinc-500">
          Cần hỗ trợ trực tiếp? Hotline CSKH: <b className="text-zinc-900">1900 8888</b>
        </div>
      </form>
    </PageShell>
  );
}

