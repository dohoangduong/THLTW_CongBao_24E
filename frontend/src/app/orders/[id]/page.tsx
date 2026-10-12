"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, dateVN, money, Order, ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { PageShell, ErrorBox, card } from "@/components/PageShell";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api<{ data: Order }>(`/orders/${id}`)
      .then((r) => setOrder(r.data))
      .catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading, load]);

  const cancel = async () => {
    if (!confirm("Bạn chắc chắn muốn hủy đơn hàng này?")) return;
    try {
      await api(`/orders/${id}/cancel`, { method: "PUT" });
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <PageShell title={order ? `Đơn ${order.order_code}` : "Chi tiết đơn hàng"}>
      <ErrorBox message={error} />
      {order && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className={card}>
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr><th className="pb-2">Sản phẩm</th><th>Đơn giá</th><th>SL</th><th className="text-right">Thành tiền</th></tr>
              </thead>
              <tbody>
                {order.details?.map((d) => (
                  <tr key={d.id} className="border-t border-slate-100">
                    <td className="py-2">{d.product_name}</td>
                    <td>{money(d.price)}</td>
                    <td>{d.quantity}</td>
                    <td className="text-right">{money(d.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 space-y-1 text-right text-sm">
              <p>Tạm tính: {money(order.subtotal)}</p>
              <p>Vận chuyển: {order.shipping_fee ? money(order.shipping_fee) : "Miễn phí"}</p>
              <p className="text-lg font-extrabold text-red-600">Tổng: {money(order.total)}</p>
            </div>
          </div>

          <aside className={`${card} h-fit space-y-2 text-sm`}>
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${ORDER_STATUS[order.status]?.cls}`}>
              {ORDER_STATUS[order.status]?.label}
            </span>
            <p>Ngày đặt: {dateVN(order.created_at)}</p>
            <p>Người nhận: {order.customer_name}</p>
            <p>Điện thoại: {order.customer_phone}</p>
            <p>Địa chỉ: {order.shipping_address}</p>
            {order.note && <p>Ghi chú: {order.note}</p>}
            <p>Thanh toán: {PAYMENT_METHOD[order.payment_method]} ({PAYMENT_STATUS[order.payment_status]})</p>
            {order.status === "pending" && (
              <button onClick={cancel} className="mt-3 w-full rounded-xl border border-red-300 py-2 font-medium text-red-600 hover:bg-red-50">
                Hủy đơn hàng
              </button>
            )}
          </aside>
        </div>
      )}
    </PageShell>
  );
}
