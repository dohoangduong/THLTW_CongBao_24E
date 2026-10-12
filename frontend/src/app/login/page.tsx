"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, setToken, UserInfo } from "@/lib/api";
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
      const r = await api<{ access_token: string; user: UserInfo }>("/login", {
        method: "POST",
        body: { email, password },
        auth: false,
      });
      setToken(r.access_token);
      router.push(r.user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell title="Đăng nhập" narrow>
      <form onSubmit={submit} className={`${card} space-y-4`}>
        <ErrorBox message={error} />
        <label className="block text-sm">
          Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputCls} mt-1`} />
        </label>
        <label className="block text-sm">
          Mật khẩu
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputCls} mt-1`} />
        </label>
        <button disabled={busy} className={`${btnPrimary} w-full`}>{busy ? "Đang đăng nhập…" : "Đăng nhập"}</button>
        <p className="text-center text-sm text-slate-600">
          Chưa có tài khoản? <Link href="/register" className="font-medium text-blue-600">Đăng ký</Link>
        </p>
      </form>
    </PageShell>
  );
}
