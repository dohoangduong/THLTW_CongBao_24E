"use client";

import { useCallback, useEffect, useState } from "react";
import { api, Paginated, UserInfo } from "@/lib/api";
import { ErrorBox, inputCls, btnGhost, card } from "@/components/PageShell";

export default function AdminUsers() {
  const [data, setData] = useState<Paginated<UserInfo> | null>(null);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    const p = new URLSearchParams({ page: String(page) });
    if (role) p.set("role", role);
    if (q.trim()) p.set("q", q.trim());
    api<Paginated<UserInfo>>(`/admin/users?${p}`)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [page, role, q]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const update = async (u: UserInfo, body: Partial<{ role: string; status: boolean }>) => {
    setError("");
    try {
      await api(`/admin/users/${u.id}`, { method: "PUT", body });
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const remove = async (u: UserInfo) => {
    if (!confirm(`Xóa người dùng ${u.email}?`)) return;
    setError("");
    try {
      await api(`/admin/users/${u.id}`, { method: "DELETE" });
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <>
      <h1 className="mb-6 text-2xl font-extrabold">Quản lý người dùng</h1>
      <ErrorBox message={error} />
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="Tìm theo tên, email, số điện thoại…"
          className={`${inputCls} max-w-sm`}
        />
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className={`${inputCls} max-w-[200px]`}>
          <option value="">Tất cả vai trò</option>
          <option value="customer">Khách hàng</option>
          <option value="admin">Quản trị viên</option>
        </select>
      </div>

      <div className={`${card} overflow-x-auto !p-0`}>
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr><th className="p-3">Người dùng</th><th>Điện thoại</th><th>Đơn hàng</th><th>Vai trò</th><th>Trạng thái</th><th /></tr>
          </thead>
          <tbody>
            {data?.data.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="p-3">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </td>
                <td>{u.phone ?? "—"}</td>
                <td>{u.orders_count ?? 0}</td>
                <td>
                  <select value={u.role} onChange={(e) => update(u, { role: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-2 py-1">
                    <option value="customer">Khách hàng</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </td>
                <td>
                  <button
                    onClick={() => update(u, { status: !u.status })}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${u.status ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"}`}
                  >
                    {u.status ? "Đang hoạt động" : "Đã khóa"}
                  </button>
                </td>
                <td className="pr-3 text-right">
                  <button onClick={() => remove(u)} className="text-red-600 hover:underline">Xóa</button>
                </td>
              </tr>
            ))}
            {data && data.data.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-slate-500">Không có người dùng phù hợp</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {data && data.last_page > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className={`${btnGhost} disabled:opacity-40`}>Trang trước</button>
          <span>Trang {data.current_page} / {data.last_page}</span>
          <button disabled={page >= data.last_page} onClick={() => setPage(page + 1)} className={`${btnGhost} disabled:opacity-40`}>Trang sau</button>
        </div>
      )}
    </>
  );
}
