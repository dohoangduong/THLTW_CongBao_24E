"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosClient from "@/services/axiosClient";
import { clearToken } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { PageShell, ErrorBox, inputCls, btnPrimary, btnGhost, card } from "@/components/PageShell";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, setUser } = useAuth();
  const [info, setInfo] = useState({ name: "", phone: "", address: "" });
  const [pw, setPw] = useState({ current_password: "", password: "", password_confirmation: "" });
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
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

  const saveInfo = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg(null);
    try {
      const res: any = await axiosClient.put("/profile", info);
      const updated = res?.user || res?.data || res;
      if (updated) setUser(updated);
      setMsg({ text: "Đã cập nhật thông tin thành công!", ok: true });
    } catch (err: any) {
      setMsg({ text: err.message || "Cập nhật thông tin thất bại", ok: false });
    } finally {
      setIsSaving(false);
    }
  };

  const changePw = async (e: FormEvent) => {
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
      setMsg({ text: "Đổi mật khẩu thành công! Các phiên đăng nhập khác đã được đăng xuất.", ok: true });
    } catch (err: any) {
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
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
      </PageShell>
    );
  }

  return (
    <PageShell title="Thông tin tài khoản">
      <ErrorBox message={msg && !msg.ok ? msg.text : ""} />
      {msg?.ok && (
        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-sm font-medium text-emerald-800">
          ✓ {msg.text}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Form thông tin cá nhân */}
        <form onSubmit={saveInfo} className={`${card} space-y-4`}>
          <h2 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
            Thông tin cá nhân
          </h2>
          <p className="text-xs text-slate-500">
            Email đăng ký: <b className="text-slate-800">{user?.email}</b>
          </p>

          <label className="block text-sm font-medium text-slate-700">
            Họ và tên <span className="text-red-600">*</span>
            <input
              required
              value={info.name}
              onChange={(e) => setInfo({ ...info, name: e.target.value })}
              className={`${inputCls} mt-1`}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Số điện thoại
            <input
              value={info.phone}
              onChange={(e) => setInfo({ ...info, phone: e.target.value })}
              className={`${inputCls} mt-1`}
              placeholder="0912345678"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Địa chỉ giao hàng mặc định
            <input
              value={info.address}
              onChange={(e) => setInfo({ ...info, address: e.target.value })}
              className={`${inputCls} mt-1`}
              placeholder="Địa chỉ nhận hàng"
            />
          </label>

          <button disabled={isSaving} className={`${btnPrimary} w-full mt-2 font-bold`}>
            {isSaving ? "Đang lưu…" : "Lưu thay đổi thông tin"}
          </button>
        </form>

        {/* Form đổi mật khẩu */}
        <form onSubmit={changePw} className={`${card} space-y-4`}>
          <h2 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
            Đổi mật khẩu
          </h2>

          <label className="block text-sm font-medium text-slate-700">
            Mật khẩu hiện tại <span className="text-red-600">*</span>
            <input
              type="password"
              required
              value={pw.current_password}
              onChange={(e) => setPw({ ...pw, current_password: e.target.value })}
              className={`${inputCls} mt-1`}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Mật khẩu mới (ít nhất 6 ký tự) <span className="text-red-600">*</span>
            <input
              type="password"
              required
              minLength={6}
              value={pw.password}
              onChange={(e) => setPw({ ...pw, password: e.target.value })}
              className={`${inputCls} mt-1`}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Nhập lại mật khẩu mới <span className="text-red-600">*</span>
            <input
              type="password"
              required
              value={pw.password_confirmation}
              onChange={(e) => setPw({ ...pw, password_confirmation: e.target.value })}
              className={`${inputCls} mt-1`}
            />
          </label>

          <button disabled={isChangingPw} className={`${btnPrimary} w-full mt-2 font-bold`}>
            {isChangingPw ? "Đang xử lý…" : "Cập nhật mật khẩu mới"}
          </button>
        </form>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <button onClick={handleLogout} className={`${btnGhost} text-red-600 font-bold hover:bg-red-50 hover:border-red-300`}>
          Đăng xuất tài khoản
        </button>

        {user && ["admin", "manager"].includes(user.role || "") && (
          <button
            onClick={() => router.push("/admin")}
            className="rounded-xl bg-amber-100 border border-amber-300 px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-200"
          >
            Chuyển đến Trang Quản trị Retro →
          </button>
        )}
      </div>
    </PageShell>
  );
}
