"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosClient from "@/services/axiosClient";
import { dateVN, money, ORDER_STATUS } from "@/lib/api";
import { PageShell, ErrorBox, btnPrimary, card } from "@/components/PageShell";

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || localStorage.getItem("access_token")
        : null;

    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    axiosClient
      .get("/orders")
      .then((res) => {
        const list = res?.data || res || [];
        setOrders(Array.isArray(list) ? list : []);
        setError("");
      })
      .catch((err) => {
        console.error("Lỗi khi tải danh sách đơn hàng:", err);
        setError(err.message || "Không thể tải danh sách đơn hàng của bạn");
      })
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <PageShell title="Lịch sử đơn hàng của tôi">
      <ErrorBox message={error} />

      {loading ? (
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-2xl bg-zinc-100" />
          <div className="h-24 animate-pulse rounded-2xl bg-zinc-100" />
        </div>
      ) : orders.length === 0 ? (
        <div className={`${card} text-center py-12`}>
          <p className="text-lg font-bold text-zinc-900">Bạn chưa có đơn hàng nào</p>
          <p className="text-xs text-zinc-500 mt-1">Mọi đơn hàng bạn đặt sẽ được lưu trữ và theo dõi tại đây.</p>
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
              className={`${card} flex flex-wrap items-center justify-between gap-4 hover:border-zinc-900 transition-all hover:shadow-xs group !p-5`}
            >
              <div>
                <p className="font-extrabold text-sm text-zinc-900 font-mono group-hover:text-zinc-600 transition-colors">
                  {o.order_code}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Ngày đặt: {dateVN(o.created_at)} • {o.details_count ?? o.details?.length ?? 1} sản phẩm
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    ORDER_STATUS[o.status]?.cls || "bg-zinc-100 text-zinc-700"
                  }`}
                >
                  {ORDER_STATUS[o.status]?.label ?? o.status}
                </span>

                <p className="text-sm font-extrabold text-zinc-950 font-mono w-28 text-right">
                  {money(o.total)}
                </p>

                <span className="text-zinc-400 font-bold group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
