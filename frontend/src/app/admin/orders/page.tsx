"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, dateVN, money, Order, ORDER_STATUS, Paginated } from "@/lib/api";
import { ErrorBox, inputCls, btnGhost, card } from "@/components/PageShell";

export default function AdminOrders() {
  const [data, setData] = useState<Paginated<Order> | null>(null);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    const p = new URLSearchParams({ page: String(page) });
    if (status) p.set("status", status);
    if (q.trim()) p.set("q", q.trim());
    api<Paginated<Order>>(`/admin/orders?${p}`)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [page, status, q]);

  useEffect(() => {
    const t = setTimeout(load, 250); // đợi người dùng gõ xong
    return () => clearTimeout(t);
  }, [load]);

  return (
    <>
      <h1 className="mb-6 text-2xl font-extrabold">Quản lý đơn hàng</h1>
      <ErrorBox message={error} />
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="Tìm theo mã đơn, tên, số điện thoại…"
          className={`${inputCls} max-w-sm`}
        />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={`${inputCls} max-w-[220px]`}>
          <option value="">Tất cả trạng thái</option>
          {Object.entries(ORDER_STATUS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      <div className={`${card} overflow-x-auto !p-0`}>
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="p-3">Mã đơn</th><th>Khách hàng</th><th>Ngày đặt</th><th>Tổng tiền</th><th>Trạng thái</th><th />
            </tr>
          </thead>
          <tbody>
            {data?.data.map((o) => (
              <tr key={o.id} className="border-t border-slate-100">
                <td className="p-3 font-medium">{o.order_code}</td>
                <td>{o.customer_name}<br /><span className="text-xs text-slate-500">{o.customer_phone}</span></td>
                <td>{dateVN(o.created_at)}</td>
                <td className="font-semibold">{money(o.total)}</td>
                <td>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ORDER_STATUS[o.status]?.cls}`}>
                    {ORDER_STATUS[o.status]?.label}
                  </span>
                </td>
                <td className="pr-3 text-right">
                  <Link href={`/admin/orders/${o.id}`} className="font-medium text-blue-600 hover:underline">Xử lý</Link>
                </td>
              </tr>
            ))}
            {data && data.data.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-slate-500">Không có đơn hàng phù hợp</td></tr>
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
