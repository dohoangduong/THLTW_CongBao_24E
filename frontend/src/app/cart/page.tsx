"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import axiosClient from "@/services/axiosClient";
import { money } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { PageShell, ErrorBox, btnPrimary, btnGhost, card } from "@/components/PageShell";

interface CartItem {
  id: number;
  quantity: number;
  price: number | string;
  product?: {
    id: number;
    name: string;
    image?: string | null;
    stock: number;
    price: number | string;
    sale_price?: number | string | null;
  } | null;
}

export default function CartPage() {
  const { loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadCart = useCallback(async () => {
    try {
      const res: any = await axiosClient.get("/cart");
      const cartItems = res?.cart?.items || [];
      setItems(cartItems);
      setError("");
    } catch (err: any) {
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

  const changeQty = async (item: CartItem, newQty: number) => {
    if (newQty < 1) return;
    setUpdatingId(item.id);
    setError("");
    try {
      await axiosClient.put(`/cart/${item.id}`, { quantity: newQty });
      await loadCart();
    } catch (err: any) {
      setError(err.message || "Không thể cập nhật số lượng");
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (item: CartItem) => {
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm ${item.product?.name || ""} khỏi giỏ hàng?`)) return;
    setUpdatingId(item.id);
    try {
      await axiosClient.delete(`/cart/${item.id}`);
      await loadCart();
    } catch (err: any) {
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
    } catch (err: any) {
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
          <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      ) : items.length === 0 ? (
        <div className={`${card} text-center py-12`}>
          <p className="text-lg font-bold text-slate-800">Giỏ hàng của bạn đang trống</p>
          <p className="text-sm text-slate-500 mt-1">Hãy khám phá các mẫu điện thoại mới nhất và thêm vào giỏ.</p>
          <Link href="/" className={`${btnPrimary} mt-5 inline-block`}>
            Khám phá điện thoại ngay
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Danh sách các sản phẩm trong giỏ */}
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-slate-600 font-medium">{items.length} mặt hàng</span>
              <button onClick={clearAll} className="text-xs text-red-600 hover:underline font-semibold">
                Xóa toàn bộ giỏ hàng
              </button>
            </div>

            {items.map((item) => (
              <div key={item.id} className={`${card} flex items-center gap-4 relative`}>
                {/* Ảnh sản phẩm */}
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-slate-100 overflow-hidden">
                  {item.product?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product.image.startsWith("http") ? item.product.image : `http://localhost:8000/images/${item.product.image}`}
                      alt={item.product.name}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">Không có ảnh</span>
                  )}
                </div>

                {/* Thông tin sản phẩm */}
                <div className="min-w-0 flex-1">
                  <Link href={`/products/${item.product?.id || ""}`} className="font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1">
                    {item.product?.name ?? "Sản phẩm không xác định"}
                  </Link>
                  <p className="text-sm font-extrabold text-red-600 mt-0.5">{money(item.price)}</p>

                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                      <button
                        onClick={() => changeQty(item, item.quantity - 1)}
                        disabled={updatingId === item.id || item.quantity <= 1}
                        className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs disabled:opacity-30"
                        aria-label="Giảm số lượng"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => changeQty(item, item.quantity + 1)}
                        disabled={updatingId === item.id}
                        className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs disabled:opacity-30"
                        aria-label="Tăng số lượng"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item)}
                      disabled={updatingId === item.id}
                      className="ml-3 text-xs font-medium text-red-600 hover:underline"
                    >
                      Xóa
                    </button>
                  </div>
                </div>

                {/* Tổng tiền từng sản phẩm */}
                <div className="text-right">
                  <p className="text-sm font-extrabold text-slate-900">
                    {money(Number(item.price) * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tóm tắt đơn hàng & Nút thanh toán */}
          <aside className={`${card} h-fit space-y-4`}>
            <h2 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">Tóm tắt đơn hàng</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính</span>
                <span className="font-bold text-slate-900">{money(total)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Phí vận chuyển</span>
                <span className="text-emerald-700 font-medium">
                  {total >= 5000000 ? "Miễn phí (đơn từ 5tr)" : "Tính ở bước thanh toán"}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
              <span className="font-bold text-slate-900">Tổng thanh toán:</span>
              <span className="text-xl font-extrabold text-red-600">{money(total)}</span>
            </div>

            <Link href="/checkout" className={`${btnPrimary} block text-center font-bold !py-3 shadow-md`}>
              Tiến hành đặt hàng →
            </Link>

            <Link href="/" className="block text-center text-xs font-medium text-slate-500 hover:text-slate-800">
              ← Tiếp tục mua sắm
            </Link>
          </aside>
        </div>
      )}
    </PageShell>
  );
}
