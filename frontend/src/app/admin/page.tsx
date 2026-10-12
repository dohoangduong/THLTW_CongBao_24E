"use client";

import { useEffect, useState } from "react";
import { api, money } from "@/lib/api";
import { ErrorBox, card } from "@/components/PageShell";

interface Stats {
  orders_total: number;
  orders_pending: number;
  revenue: number;
  users_total: number;
  products_total: number;
  low_stock: number;
}

export default function AdminHome() {
  const [s, setS] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Stats>("/admin/stats").then(setS).catch((e) => setError(e.message));
  }, []);

  const cells: { label: string; value: string }[] = s
    ? [
        { label: "Doanh thu (đơn hoàn thành)", value: money(s.revenue) },
        { label: "Tổng số đơn hàng", value: String(s.orders_total) },
        { label: "Đơn chờ xác nhận", value: String(s.orders_pending) },
        { label: "Khách hàng", value: String(s.users_total) },
        { label: "Sản phẩm", value: String(s.products_total) },
        { label: "Sản phẩm sắp hết (≤ 5 máy)", value: String(s.low_stock) },
      ]
    : [];

  return (
    <>
      <h1 className="mb-6 text-2xl font-extrabold">Tổng quan</h1>
      <ErrorBox message={error} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cells.map((c) => (
          <div key={c.label} className={card}>
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="mt-1 text-2xl font-extrabold">{c.value}</p>
          </div>
        ))}
      </div>
    </>
  );
}
