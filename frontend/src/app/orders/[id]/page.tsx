"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axiosClient from "@/services/axiosClient";
import { dateVN, money, Order, ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { PageShell, ErrorBox, card, btnGhost } from "@/components/PageShell";

export default function CustomerOrderDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { loading: authLoading } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const loadOrder = useCallback(() => {
    if (!id) return;
    setLoading(true);
    axiosClient
      .get(`/orders/${id}`)
      .then((res: any) => {
        const o = res?.data || res;
        setOrder(o);
        setError("");
      })
      .catch((err: any) => {
        console.error("Lỗi khi tải chi tiết đơn hàng:", err);
        setError(err.message || "Không tìm thấy thông tin đơn hàng");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!authLoading) {
      loadOrder();
    }
  }, [authLoading, loadOrder]);

  const handleCancelOrder = async () => {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này không? Sau khi hủy không thể hoàn tác.")) return;

    setCancelling(true);
    try {
      await axiosClient.put(`/orders/${id}/cancel`);
      alert("Đã hủy đơn hàng thành công!");
      loadOrder();
    } catch (err: any) {
      alert(err.message || "Không thể hủy đơn hàng");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <PageShell title={order ? `Đơn hàng #${order.order_code}` : "Chi tiết đơn hàng"}>
      <div className="mb-4">
        <Link href="/orders" className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-blue-600 font-medium">
          ← Danh sách đơn hàng
        </Link>
      </div>

      <ErrorBox message={error} />

      {loading ? (
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
      ) : order ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Cột danh sách mặt hàng */}
          <div className={`${card} space-y-4`}>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="font-bold text-base text-slate-900">Chi tiết sản phẩm đã đặt</h2>
              <span className="text-xs text-slate-500 font-medium">{dateVN(order.created_at)}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-bold text-slate-500 border-b border-slate-100">
                    <th className="pb-2.5">Sản phẩm</th>
                    <th className="pb-2.5 text-center">Đơn giá</th>
                    <th className="pb-2.5 text-center">SL</th>
                    <th className="pb-2.5 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.details?.map((d) => (
                    <tr key={d.id}>
                      <td className="py-3">
                        <p className="font-bold text-slate-900">{d.product_name}</p>
                        {d.product_sku && (
                          <p className="text-[11px] font-mono text-slate-400">SKU: {d.product_sku}</p>
                        )}
                      </td>
                      <td className="py-3 text-center text-slate-600">{money(d.price)}</td>
                      <td className="py-3 text-center font-bold">{d.quantity}</td>
                      <td className="py-3 text-right font-bold text-slate-900">{money(d.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bảng tính tổng tiền */}
            <div className="border-t border-slate-100 pt-4 space-y-2 text-sm text-right">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính:</span>
                <span className="font-bold text-slate-900">{money(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Phí vận chuyển:</span>
                <span className="font-bold text-slate-900">
                  {order.shipping_fee ? money(order.shipping_fee) : "Miễn phí"}
                </span>
              </div>
              <div className="flex justify-between text-base border-t border-slate-100 pt-2 font-extrabold text-slate-900">
                <span>Tổng cộng:</span>
                <span className="text-red-600 text-lg">{money(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Cột thông tin người nhận và trạng thái */}
          <aside className={`${card} h-fit space-y-4 text-sm`}>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Trạng thái đơn</span>
              <div className="mt-1">
                <span
                  className={`inline-block rounded-full px-3.5 py-1 text-xs font-bold ${
                    ORDER_STATUS[order.status]?.cls || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {ORDER_STATUS[order.status]?.label ?? order.status}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2">
              <h3 className="font-bold text-slate-900">Thông tin giao hàng</h3>
              <p className="text-slate-700">
                <span className="text-slate-500">Người nhận:</span> <b>{order.customer_name}</b>
              </p>
              <p className="text-slate-700">
                <span className="text-slate-500">Số điện thoại:</span> <b>{order.customer_phone}</b>
              </p>
              <p className="text-slate-700">
                <span className="text-slate-500">Địa chỉ:</span> {order.shipping_address}
              </p>
              {order.note && (
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg text-xs">
                  <span className="font-bold text-slate-600">Ghi chú:</span> {order.note}
                </p>
              )}
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-1.5">
              <h3 className="font-bold text-slate-900">Thanh toán</h3>
              <p className="text-slate-600 text-xs">
                Phương thức: <b>{PAYMENT_METHOD[order.payment_method] || order.payment_method}</b>
              </p>
              <p className="text-slate-600 text-xs">
                Trạng thái:{" "}
                <span className="font-bold text-slate-800">
                  {PAYMENT_STATUS[order.payment_status]?.label || order.payment_status}
                </span>
              </p>
            </div>

            {/* Nút hủy đơn hàng nếu đơn hàng đang ở trạng thái Chờ xác nhận */}
            {order.status === "pending" && (
              <div className="border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="w-full rounded-xl border border-red-300 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {cancelling ? "Đang hủy đơn…" : "Hủy đơn hàng này"}
                </button>
              </div>
            )}
          </aside>
        </div>
      ) : null}
    </PageShell>
  );
}
