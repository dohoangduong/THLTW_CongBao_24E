"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axiosClient from "@/services/axiosClient";
import { dateVN, money, ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from "@/lib/api";
import { PageShell, ErrorBox, card } from "@/components/PageShell";

const FALLBACK_IMAGE = "/images/default-phone.svg";

export default function CustomerOrderDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const loadOrder = useCallback(() => {
    if (!id) return;
    setLoading(true);
    axiosClient
      .get(`/orders/${id}`)
      .then((res) => {
        const o = res?.data || res;
        setOrder(o);
        setError("");
      })
      .catch((err) => {
        console.error("Lỗi khi tải chi tiết đơn hàng:", err);
        setError(err.message || "Không tìm thấy thông tin đơn hàng");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || localStorage.getItem("access_token")
        : null;

    if (!token) {
      router.push("/login");
      return;
    }

    loadOrder();
  }, [loadOrder, router]);

  const handleCancelOrder = async () => {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này không? Sau khi hủy không thể hoàn tác.")) return;

    setCancelling(true);
    try {
      await axiosClient.put(`/orders/${id}/cancel`);
      alert("Đã hủy đơn hàng thành công!");
      loadOrder();
    } catch (err) {
      alert(err.message || "Không thể hủy đơn hàng");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <PageShell title={order ? `Đơn hàng #${order.order_code}` : "Chi tiết đơn hàng"}>
      <div className="mb-4">
        <Link href="/orders" className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-950 font-medium transition-colors">
          ← Danh sách đơn hàng
        </Link>
      </div>

      <ErrorBox message={error} />

      {loading ? (
        <div className="h-64 animate-pulse rounded-2xl bg-zinc-100" />
      ) : order ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Cột danh sách mặt hàng */}
          <div className={`${card} space-y-4`}>
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <h2 className="font-bold text-sm text-zinc-900">Chi tiết sản phẩm đã đặt</h2>
              <span className="text-xs text-zinc-500 font-mono">{dateVN(order.created_at)}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left font-bold text-zinc-400 border-b border-zinc-100 uppercase tracking-wider text-[11px]">
                    <th className="pb-2.5">Sản phẩm</th>
                    <th className="pb-2.5 text-center">Đơn giá</th>
                    <th className="pb-2.5 text-center">SL</th>
                    <th className="pb-2.5 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {order.details?.map((d) => {
                    const pImg = d.product?.image
                      ? d.product.image.startsWith("http")
                        ? d.product.image
                        : `http://localhost:8000${d.product.image.startsWith("/") ? "" : "/"}${d.product.image}`
                      : FALLBACK_IMAGE;
                    const pId = d.product?.id || d.product_id;

                    return (
                      <tr key={d.id}>
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-zinc-50 border border-zinc-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={pImg}
                                alt={d.product_name}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = FALLBACK_IMAGE;
                                }}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div>
                              {pId ? (
                                <Link
                                  href={`/products/${pId}`}
                                  className="font-bold text-zinc-900 hover:text-zinc-600 transition-colors line-clamp-1"
                                >
                                  {d.product_name}
                                </Link>
                              ) : (
                                <p className="font-bold text-zinc-900 line-clamp-1">{d.product_name}</p>
                              )}
                              {d.product_sku && (
                                <p className="text-[10px] font-mono text-zinc-400">SKU: {d.product_sku}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-center text-zinc-700 font-mono">{money(d.price)}</td>
                        <td className="py-3 text-center font-bold font-mono">{d.quantity}</td>
                        <td className="py-3 text-right font-bold text-zinc-950 font-mono">{money(d.subtotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bảng tính tổng tiền */}
            <div className="border-t border-zinc-100 pt-4 space-y-2 text-xs text-right">
              <div className="flex justify-between text-zinc-600">
                <span>Tạm tính:</span>
                <span className="font-bold text-zinc-900 font-mono">{money(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Phí vận chuyển:</span>
                <span className="font-bold text-zinc-900 font-mono">
                  {order.shipping_fee ? money(order.shipping_fee) : "Miễn phí"}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t border-zinc-100 pt-2 font-extrabold text-zinc-900">
                <span>Tổng cộng:</span>
                <span className="text-zinc-950 font-mono text-base">{money(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Cột thông tin người nhận và trạng thái */}
          <aside className={`${card} h-fit space-y-4 text-xs`}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Trạng thái đơn</span>
              <div className="mt-1">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                    ORDER_STATUS[order.status]?.cls || "bg-zinc-100 text-zinc-700"
                  }`}
                >
                  {ORDER_STATUS[order.status]?.label ?? order.status}
                </span>
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-3 space-y-2">
              <h3 className="font-bold text-zinc-900">Thông tin giao hàng</h3>
              <p className="text-zinc-700">
                <span className="text-zinc-500">Người nhận:</span> <b>{order.customer_name}</b>
              </p>
              <p className="text-zinc-700">
                <span className="text-zinc-500">Số điện thoại:</span> <b>{order.customer_phone}</b>
              </p>
              <p className="text-zinc-700">
                <span className="text-zinc-500">Địa chỉ:</span> {order.shipping_address}
              </p>
              {order.note && (
                <p className="text-zinc-700 bg-zinc-50 p-2.5 rounded-lg text-xs">
                  <span className="font-bold text-zinc-600">Ghi chú:</span> {order.note}
                </p>
              )}
            </div>

            <div className="border-t border-zinc-100 pt-3 space-y-1.5">
              <h3 className="font-bold text-zinc-900">Thanh toán</h3>
              <p className="text-zinc-600">
                Phương thức: <b>{PAYMENT_METHOD[order.payment_method] || order.payment_method}</b>
              </p>
              <p className="text-zinc-600">
                Trạng thái:{" "}
                <span className="font-bold text-zinc-800">
                  {PAYMENT_STATUS[order.payment_status]?.label || order.payment_status}
                </span>
              </p>
            </div>

            {order.status === "pending" && (
              <div className="border-t border-zinc-100 pt-3">
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="w-full rounded-xl border border-rose-300 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
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
