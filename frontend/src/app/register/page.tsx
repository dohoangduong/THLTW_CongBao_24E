"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, setToken, UserInfo } from "@/lib/api";
import { PageShell, ErrorBox, inputCls, btnPrimary, card } from "@/components/PageShell";

export default function RegisterPage() {
  const router = useRouter();
  const [f, setF] = useState({ fullname: "", email: "", phone: "", address: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (f.password !== f.confirm) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const r = await api<{ access_token: string; user: UserInfo }>("/register", {
        method: "POST",
        body: { fullname: f.fullname, email: f.email, phone: f.phone || null, address: f.address || null, password: f.password },
        auth: false,
      });
      setToken(r.access_token);
      router.push("/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell title="Đăng ký tài khoản" narrow>
      <form onSubmit={submit} className={`${card} space-y-4`}>
        <ErrorBox message={error} />
        <label className="block text-sm">Họ và tên
          <input required value={f.fullname} onChange={set("fullname")} className={`${inputCls} mt-1`} />
        </label>
        <label className="block text-sm">Email
          <input type="email" required value={f.email} onChange={set("email")} className={`${inputCls} mt-1`} />
        </label>
        <label className="block text-sm">Số điện thoại
          <input value={f.phone} onChange={set("phone")} className={`${inputCls} mt-1`} />
        </label>
        <label className="block text-sm">Địa chỉ
          <input value={f.address} onChange={set("address")} className={`${inputCls} mt-1`} />
        </label>
        <label className="block text-sm">Mật khẩu (ít nhất 6 ký tự)
          <input type="password" required minLength={6} value={f.password} onChange={set("password")} className={`${inputCls} mt-1`} />
        </label>
        <label className="block text-sm">Nhập lại mật khẩu
          <input type="password" required value={f.confirm} onChange={set("confirm")} className={`${inputCls} mt-1`} />
        </label>
        <button disabled={busy} className={`${btnPrimary} w-full`}>{busy ? "Đang tạo tài khoản…" : "Đăng ký"}</button>
        <p className="text-center text-sm text-slate-600">
          Đã có tài khoản? <Link href="/login" className="font-medium text-blue-600">Đăng nhập</Link>
        </p>
      </form>
    </PageShell>
  );
}
