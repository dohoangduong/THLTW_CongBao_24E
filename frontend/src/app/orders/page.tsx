"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axiosClient from "@/services/axiosClient";
import { dateVN, money, Order, ORDER_STATUS } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { PageShell, ErrorBox, btnPrimary, card } from "@/components/PageShell";

export default function CustomerOrdersPage() {
  const { loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    axiosClient
      .get("/orders")
      .then((res: any) => {
        const list = res?.data || res || [];
        setOrders(Array.isArray(list) ? list : []);
        setError("");
      })
      .catch((err: any) => {
        console.error("Lỗi khi tải danh sách đơn hàng:", err);
        setError(err.message || "Không thể tải danh sách đơn hàng của bạn");
      })
      .finally(() => setLoading(false));
  }, [authLoading]);

  return (
    <PageShell title="Lịch sử đơn hàng của tôi">
      <ErrorBox message={error} />

      {loading ? (
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      ) : orders.length === 0 ? (
        <div className={`${card} text-center py-12`}>
          <p className="text-lg font-bold text-slate-800">Bạn chưa có đơn hàng nào</p>
          <p className="text-sm text-slate-500 mt-1">Mọi đơn hàng bạn đặt sẽ được lưu trữ và theo dõi tại đây.</p>
          <Link href="/trangchu" className={`${btnPrimary} mt-5 inline-block`}>
            Khám phá sản phẩm ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/orders/${o.id}`}
              className={`${card} flex flex-wrap items-center justify-between gap-4 hover:border-blue-600 transition-all hover:shadow-md`}
            >
              <div>
                <p className="font-extrabold text-base text-slate-900">{o.order_code}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ngày đặt: {dateVN(o.created_at)} • {o.details_count ?? o.details?.length ?? 1} món hàng
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    ORDER_STATUS[o.status]?.cls || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {ORDER_STATUS[o.status]?.label ?? o.status}
                </span>

                <p className="text-base font-extrabold text-red-600 w-28 text-right">
                  {money(o.total)}
                </p>

                <span className="text-slate-400 font-bold">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
