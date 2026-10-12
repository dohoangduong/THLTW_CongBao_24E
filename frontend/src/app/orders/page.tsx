"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, dateVN, money, Order, ORDER_STATUS } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { PageShell, ErrorBox, btnPrimary, card } from "@/components/PageShell";

export default function OrdersPage() {
  const { loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    api<{ data: Order[] }>("/orders")
      .then((r) => setOrders(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [authLoading]);

  return (
    <PageShell title="Đơn hàng của tôi">
      <ErrorBox message={error} />
      {loading ? (
        <p className="text-slate-600">Đang tải…</p>
      ) : orders.length === 0 ? (
        <div className={`${card} text-center`}>
          <p className="font-semibold">Bạn chưa có đơn hàng nào</p>
          <Link href="/" className={`${btnPrimary} mt-4 inline-block`}>Mua sắm ngay</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link key={o.id} href={`/orders/${o.id}`} className={`${card} flex flex-wrap items-center justify-between gap-3 hover:border-slate-900`}>
              <div>
                <p className="font-semibold">{o.order_code}</p>
                <p className="text-sm text-slate-500">{dateVN(o.created_at)} · {o.details_count} sản phẩm</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ORDER_STATUS[o.status]?.cls}`}>
                {ORDER_STATUS[o.status]?.label ?? o.status}
              </span>
              <p className="font-bold text-red-600">{money(o.total)}</p>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
