"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import axiosClient from "@/services/axiosClient";
import { money } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { PageShell, ErrorBox, btnPrimary, card } from "@/components/PageShell";

const FALLBACK_IMAGE = "/images/default-phone.svg";

export default function CartPage() {
  const { loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadCart = useCallback(async () => {
    try {
      const res = await axiosClient.get("/cart");
      const cartItems = res?.cart?.items || [];
      setItems(cartItems);
      setError("");
    } catch (err) {
      console.error("Lỗi khi tải giỏ hàng:", err);
      setError(err.message || "Không thể tải thông tin giỏ hàng");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      loadCart();
    }
  }, [authLoading, loadCart]);

  const changeQty = async (item, newQty) => {
    if (newQty < 1) return;
    setUpdatingId(item.id);
    setError("");
    try {
      await axiosClient.put(`/cart/${item.id}`, { quantity: newQty });
      await loadCart();
    } catch (err) {
      setError(err.message || "Không thể cập nhật số lượng");
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (item) => {
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm ${item.product?.name || ""} khỏi giỏ hàng?`)) return;
    setUpdatingId(item.id);
    try {
      await axiosClient.delete(`/cart/${item.id}`);
      await loadCart();
    } catch (err) {
      setError(err.message || "Không thể xóa sản phẩm khỏi giỏ");
    } finally {
      setUpdatingId(null);
    }
  };

  const clearAll = async () => {
    if (!confirm("Bạn có chắc muốn làm trống toàn bộ giỏ hàng?")) return;
    try {
      await axiosClient.delete("/cart");
      await loadCart();
    } catch (err) {
      setError(err.message || "Không thể làm trống giỏ hàng");
    }
  };

  const total = items.reduce((sum, item) => {
    const unitPrice = Number(item.price) || 0;
    return sum + unitPrice * (item.quantity || 1);
  }, 0);

  return (
    <PageShell title="Giỏ hàng của bạn">
      <ErrorBox message={error} />

      {loading ? (
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-2xl bg-zinc-100" />
          <div className="h-24 animate-pulse rounded-2xl bg-zinc-100" />
        </div>
      ) : items.length === 0 ? (
        <div className={`${card} text-center py-12`}>
          <p className="text-lg font-bold text-zinc-900">Giỏ hàng của bạn đang trống</p>
          <p className="text-xs text-zinc-500 mt-1">Hãy khám phá các mẫu điện thoại mới nhất và thêm vào giỏ.</p>
          <Link href="/trangchu" className={`${btnPrimary} mt-5 inline-block`}>
            Khám phá điện thoại ngay
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-zinc-600 font-semibold">{items.length} mặt hàng</span>
              <button onClick={clearAll} className="text-xs text-rose-600 hover:underline font-semibold">
                Xóa toàn bộ giỏ hàng
              </button>
            </div>

            {items.map((item) => {
              const pImg = item.product?.image
                ? item.product.image.startsWith("http")
                  ? item.product.image
                  : `http://localhost:8000${item.product.image.startsWith("/") ? "" : "/"}${item.product.image}`
                : FALLBACK_IMAGE;

              return (
                <div key={item.id} className={`${card} flex items-center gap-4 relative !p-4`}>
                  <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-zinc-50 border border-zinc-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pImg}
                      alt={item.product?.name || "Product"}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                      className="h-full w-full object-contain p-2"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.product?.id || ""}`}
                      className="font-bold text-zinc-900 hover:text-zinc-600 transition-colors line-clamp-1 text-sm"
                    >
                      {item.product?.name ?? "Sản phẩm không xác định"}
                    </Link>
                    <p className="text-sm font-extrabold text-zinc-900 font-mono mt-0.5">
                      {money(item.price)}
                    </p>

                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden bg-white">
                        <button
                          onClick={() => changeQty(item, item.quantity - 1)}
                          disabled={updatingId === item.id || item.quantity <= 1}
                          className="px-2.5 py-1 text-zinc-600 hover:bg-zinc-100 font-bold text-xs disabled:opacity-30"
                          aria-label="Giảm số lượng"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-xs font-bold font-mono">{item.quantity}</span>
                        <button
                          onClick={() => changeQty(item, item.quantity + 1)}
                          disabled={updatingId === item.id}
                          className="px-2.5 py-1 text-zinc-600 hover:bg-zinc-100 font-bold text-xs disabled:opacity-30"
                          aria-label="Tăng số lượng"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item)}
                        disabled={updatingId === item.id}
                        className="ml-3 text-xs font-medium text-rose-600 hover:underline"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-extrabold text-zinc-900 font-mono">
                      {money(Number(item.price) * item.quantity)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className={`${card} h-fit space-y-4`}>
            <h2 className="font-bold text-sm text-zinc-900 border-b border-zinc-100 pb-3">Tóm tắt đơn hàng</h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Tạm tính</span>
                <span className="font-bold text-zinc-900 font-mono">{money(total)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Phí vận chuyển</span>
                <span className="text-emerald-600 font-semibold">
                  {total >= 5000000 ? "Miễn phí (đơn từ 5tr)" : "Tính ở bước thanh toán"}
                </span>
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-3 flex justify-between items-baseline">
              <span className="font-bold text-zinc-900 text-xs">Tổng thanh toán:</span>
              <span className="text-lg font-extrabold text-zinc-950 font-mono">{money(total)}</span>
            </div>

            <Link href="/checkout" className={`${btnPrimary} block text-center font-bold !py-2.5 shadow-2xs`}>
              Tiến hành đặt hàng →
            </Link>

            <Link href="/trangchu" className="block text-center text-xs font-medium text-zinc-500 hover:text-zinc-900">
              ← Tiếp tục mua sắm
            </Link>
          </aside>
        </div>
      )}
    </PageShell>
  );
}
