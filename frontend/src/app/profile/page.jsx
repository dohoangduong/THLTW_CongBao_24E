"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosClient from "@/services/axiosClient";
import { clearToken } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { PageShell, ErrorBox, inputCls, btnPrimary, card } from "@/components/PageShell";
import { LogOutIcon, CheckIcon, SlidersIcon } from "@/components/Icons";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, setUser } = useAuth();
  const [info, setInfo] = useState({ name: "", phone: "", address: "" });
  const [pw, setPw] = useState({ current_password: "", password: "", password_confirmation: "" });
  const [msg, setMsg] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);

  useEffect(() => {
    if (user) {
      setInfo({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const saveInfo = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg(null);
    try {
      const res = await axiosClient.put("/profile", info);
      const updated = res?.user || res?.data || res;
      if (updated) setUser(updated);
      setMsg({ text: "Đã cập nhật thông tin cá nhân thành công!", ok: true });
    } catch (err) {
      setMsg({ text: err.message || "Cập nhật thông tin thất bại", ok: false });
    } finally {
      setIsSaving(false);
    }
  };

  const changePw = async (e) => {
    e.preventDefault();
    if (pw.password !== pw.password_confirmation) {
      setMsg({ text: "Mật khẩu xác nhận không khớp!", ok: false });
      return;
    }
    setIsChangingPw(true);
    setMsg(null);
    try {
      await axiosClient.put("/profile/password", pw);
      setPw({ current_password: "", password: "", password_confirmation: "" });
      setMsg({ text: "Đổi mật khẩu thành công! Các phiên đăng nhập khác đã được thu hồi.", ok: true });
    } catch (err) {
      setMsg({ text: err.message || "Đổi mật khẩu thất bại", ok: false });
    } finally {
      setIsChangingPw(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axiosClient.post("/logout");
    } catch {}
    clearToken();
    router.push("/login");
  };

  if (loading) {
    return (
      <PageShell title="Tài khoản của tôi">
        <div className="h-64 animate-pulse rounded-2xl bg-zinc-100" />
      </PageShell>
    );
  }

  return (
    <PageShell title="Thông tin tài khoản">
      <ErrorBox message={msg && !msg.ok ? msg.text : ""} />
      {msg?.ok && (
        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg.text}</span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Form thông tin cá nhân */}
        <form onSubmit={saveInfo} className={`${card} space-y-4`}>
          <h2 className="font-bold text-sm text-zinc-900 border-b border-zinc-100 pb-2">
            Thông tin cá nhân
          </h2>
          <p className="text-xs text-zinc-500">
            Email tài khoản: <b className="text-zinc-900 font-mono">{user?.email}</b>
          </p>

          <label className="block text-xs font-semibold text-zinc-700">
            Họ và tên <span className="text-rose-600">*</span>
            <input
              required
              value={info.name}
              onChange={(e) => setInfo({ ...info, name: e.target.value })}
              className={`${inputCls} mt-1`}
            />
          </label>

          <label className="block text-xs font-semibold text-zinc-700">
            Số điện thoại
            <input
              value={info.phone}
              onChange={(e) => setInfo({ ...info, phone: e.target.value })}
              className={`${inputCls} mt-1`}
              placeholder="0912345678"
            />
          </label>

          <label className="block text-xs font-semibold text-zinc-700">
            Địa chỉ giao hàng mặc định
            <input
              value={info.address}
              onChange={(e) => setInfo({ ...info, address: e.target.value })}
              className={`${inputCls} mt-1`}
              placeholder="Số nhà, tên đường, phường/xã..."
            />
          </label>

          <button disabled={isSaving} className={`${btnPrimary} w-full mt-2 font-bold`}>
            {isSaving ? "Đang lưu…" : "Lưu thay đổi thông tin"}
          </button>
        </form>

        {/* Form đổi mật khẩu */}
        <form onSubmit={changePw} className={`${card} space-y-4`}>
          <h2 className="font-bold text-sm text-zinc-900 border-b border-zinc-100 pb-2">
            Đổi mật khẩu
          </h2>

          <label className="block text-xs font-semibold text-zinc-700">
            Mật khẩu hiện tại <span className="text-rose-600">*</span>
            <input
              type="password"
              required
              value={pw.current_password}
              onChange={(e) => setPw({ ...pw, current_password: e.target.value })}
              className={`${inputCls} mt-1`}
              placeholder="••••••••"
            />
          </label>

          <label className="block text-xs font-semibold text-zinc-700">
            Mật khẩu mới (ít nhất 6 ký tự) <span className="text-rose-600">*</span>
            <input
              type="password"
              required
              minLength={6}
              value={pw.password}
              onChange={(e) => setPw({ ...pw, password: e.target.value })}
              className={`${inputCls} mt-1`}
              placeholder="••••••••"
            />
          </label>

          <label className="block text-xs font-semibold text-zinc-700">
            Nhập lại mật khẩu mới <span className="text-rose-600">*</span>
            <input
              type="password"
              required
              value={pw.password_confirmation}
              onChange={(e) => setPw({ ...pw, password_confirmation: e.target.value })}
              className={`${inputCls} mt-1`}
              placeholder="••••••••"
            />
          </label>

          <button disabled={isChangingPw} className={`${btnPrimary} w-full mt-2 font-bold`}>
            {isChangingPw ? "Đang xử lý…" : "Cập nhật mật khẩu mới"}
          </button>
        </form>
      </div>

      {/* Hành động tài khoản & Quản trị */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200/80 pt-6">
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition-colors shadow-2xs"
        >
          <LogOutIcon className="w-4 h-4" />
          <span>Đăng xuất tài khoản</span>
        </button>

        {user?.role === "admin" && (
          <button
            onClick={() => router.push("/admin/don-hang")}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 shadow-2xs transition-colors"
          >
            <SlidersIcon className="w-3.5 h-3.5 text-amber-300" />
            <span>Chuyển đến Bảng Quản trị Hệ thống →</span>
          </button>
        )}
      </div>
    </PageShell>
  );
}

