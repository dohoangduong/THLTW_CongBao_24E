"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, dateVN, money, Order, ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from "@/lib/api";
import { ErrorBox, btnPrimary, card, inputCls } from "@/components/PageShell";

// Khớp với FLOW trong AdminOrderController
const NEXT: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipping", "cancelled"],
  shipping: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [next, setNext] = useState("");
  const [pay, setPay] = useState("");

  const load = useCallback(() => {
    api<{ data: Order }>(`/admin/orders/${id}`)
      .then((r) => {
        setOrder(r.data);
        setNext("");
        setPay(r.data.payment_status);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  useEffect(load, [load]);

  const save = async () => {
    if (!order) return;
    setError("");
    setOk("");
    try {
      await api(`/admin/orders/${id}/status`, {
        method: "PUT",
        body: { status: next || order.status, payment_status: pay },
      });
      setOk("Đã cập nhật đơn hàng");
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (!order) return <ErrorBox message={error || ""} />;

  const options = NEXT[order.status] ?? [];

  return (
    <>
      <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">← Danh sách đơn hàng</Link>
      <h1 className="mb-6 mt-2 text-2xl font-extrabold">Đơn {order.order_code}</h1>
      <ErrorBox message={error} />
      {ok && <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{ok}</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
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

        <aside className="space-y-4">
          <div className={`${card} space-y-1 text-sm`}>
            <p>Ngày đặt: {dateVN(order.created_at)}</p>
            <p>Người nhận: {order.customer_name}</p>
            <p>Điện thoại: {order.customer_phone}</p>
            <p>Địa chỉ: {order.shipping_address}</p>
            {order.note && <p>Ghi chú: {order.note}</p>}
            <p>Hình thức: {PAYMENT_METHOD[order.payment_method]}</p>
          </div>

          <div className={`${card} space-y-3 text-sm`}>
            <p>
              Trạng thái hiện tại:{" "}
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ORDER_STATUS[order.status]?.cls}`}>
                {ORDER_STATUS[order.status]?.label}
              </span>
            </p>
            {options.length > 0 && (
              <label className="block">Chuyển sang
                <select value={next} onChange={(e) => setNext(e.target.value)} className={`${inputCls} mt-1`}>
                  <option value="">Giữ nguyên</option>
                  {options.map((s) => (
                    <option key={s} value={s}>{ORDER_STATUS[s].label}</option>
                  ))}
                </select>
              </label>
            )}
            <label className="block">Thanh toán
              <select value={pay} onChange={(e) => setPay(e.target.value)} className={`${inputCls} mt-1`}>
                {Object.entries(PAYMENT_STATUS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </label>
            <button onClick={save} className={`${btnPrimary} w-full`}>Lưu cập nhật</button>
          </div>
        </aside>
      </div>
    </>
  );
}
