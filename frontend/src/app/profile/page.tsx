"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, clearToken } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { PageShell, ErrorBox, inputCls, btnPrimary, btnGhost, card } from "@/components/PageShell";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [info, setInfo] = useState({ name: "", phone: "", address: "" });
  const [pw, setPw] = useState({ current_password: "", password: "", password_confirmation: "" });
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (user) setInfo({ name: user.name, phone: user.phone ?? "", address: user.address ?? "" });
  }, [user]);

  const saveInfo = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api("/profile", { method: "PUT", body: info });
      setMsg({ text: "Đã lưu thông tin", ok: true });
    } catch (err) {
      setMsg({ text: (err as Error).message, ok: false });
    }
  };

  const changePw = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api("/profile/password", { method: "PUT", body: pw });
      setPw({ current_password: "", password: "", password_confirmation: "" });
      setMsg({ text: "Đã đổi mật khẩu", ok: true });
    } catch (err) {
      setMsg({ text: (err as Error).message, ok: false });
    }
  };

  const logout = async () => {
    await api("/logout", { method: "POST" }).catch(() => {});
    clearToken();
    router.push("/login");
  };

  if (loading) return <PageShell title="Tài khoản"><p>Đang tải…</p></PageShell>;

  return (
    <PageShell title="Tài khoản của tôi">
      <ErrorBox message={msg && !msg.ok ? msg.text : ""} />
      {msg?.ok && <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{msg.text}</p>}
      <div className="grid gap-6 md:grid-cols-2">
        <form onSubmit={saveInfo} className={`${card} space-y-4`}>
          <h2 className="font-semibold">Thông tin cá nhân</h2>
          <p className="text-sm text-slate-500">Email: {user?.email}</p>
          <label className="block text-sm">Họ và tên
            <input required value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} className={`${inputCls} mt-1`} />
          </label>
          <label className="block text-sm">Số điện thoại
            <input value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} className={`${inputCls} mt-1`} />
          </label>
          <label className="block text-sm">Địa chỉ
            <input value={info.address} onChange={(e) => setInfo({ ...info, address: e.target.value })} className={`${inputCls} mt-1`} />
          </label>
          <button className={btnPrimary}>Lưu thay đổi</button>
        </form>

        <form onSubmit={changePw} className={`${card} space-y-4`}>
          <h2 className="font-semibold">Đổi mật khẩu</h2>
          <label className="block text-sm">Mật khẩu hiện tại
            <input type="password" required value={pw.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })} className={`${inputCls} mt-1`} />
          </label>
          <label className="block text-sm">Mật khẩu mới
            <input type="password" required minLength={6} value={pw.password} onChange={(e) => setPw({ ...pw, password: e.target.value })} className={`${inputCls} mt-1`} />
          </label>
          <label className="block text-sm">Nhập lại mật khẩu mới
            <input type="password" required value={pw.password_confirmation} onChange={(e) => setPw({ ...pw, password_confirmation: e.target.value })} className={`${inputCls} mt-1`} />
          </label>
          <button className={btnPrimary}>Đổi mật khẩu</button>
        </form>
      </div>
      <button onClick={logout} className={`${btnGhost} mt-6`}>Đăng xuất</button>
    </PageShell>
  );
}
