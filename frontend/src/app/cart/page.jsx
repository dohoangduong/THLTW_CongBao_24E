"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import axiosClient from "@/services/axiosClient";
import { money } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { PageShell, ErrorBox, btnPrimary, card, inputCls } from "@/components/PageShell";
import { TagIcon, CheckIcon, AlertCircleIcon } from "@/components/Icons";

const FALLBACK_IMAGE = "/images/default-phone.svg";

export default function CartPage() {
  const { loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Mã khuyến mãi (FUNC-ORDER-02)
  const [couponInput, setCouponInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [availablePromos, setAvailablePromos] = useState([]);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoSuccessMsg, setPromoSuccessMsg] = useState("");

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

  // Tải danh sách mã khuyến mãi đang có sẵn
  useEffect(() => {
    axiosClient
      .get("/promotions")
      .then((res) => {
        const promos = res?.data || [];
        setAvailablePromos(Array.isArray(promos) ? promos : []);
      })
      .catch(() => {});
  }, []);

  const total = items.reduce((sum, item) => {
    const unitPrice = Number(item.price) || 0;
    return sum + unitPrice * (item.quantity || 1);
  }, 0);

  // [THUẬT TOÁN KIỂM TRA TỒN KHO NHẤT QUÁN KHI ĐỔI SỐ LƯỢNG (FUNC-CART-01, 02)]:
  const changeQty = async (item, newQty) => {
    if (newQty < 1) return;

    const availableStock = Number(item.product?.stock ?? 0);
    if (newQty > availableStock) {
      setError(`Sản phẩm «${item.product?.name}» chỉ còn ${availableStock} máy trong kho! Không thể tăng thêm.`);
      return;
    }

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
      setAppliedPromo(null);
    } catch (err) {
      setError(err.message || "Không thể làm trống giỏ hàng");
    }
  };

  // [THUẬT TOÁN ÁP DỤNG MÃ KHUYẾN MÃI (FUNC-ORDER-02)]:
  const handleApplyCoupon = async (codeToApply = couponInput) => {
    const code = (codeToApply || "").trim().toUpperCase();
    if (!code) {
      setError("Vui lòng nhập mã khuyến mãi!");
      return;
    }

    setPromoLoading(true);
    setError("");
    setPromoSuccessMsg("");

    try {
      const res = await axiosClient.post("/promotions/apply", {
        code,
        amount: total,
      });

      setAppliedPromo(res);
      setPromoSuccessMsg(res?.message || `Đã áp dụng mã «${code}» thành công!`);
      // Lưu vào localStorage để trang checkout đọc tự động
      if (typeof window !== "undefined") {
        localStorage.setItem("applied_coupon", JSON.stringify(res));
      }
    } catch (err) {
      setAppliedPromo(null);
      setError(err.message || "Không thể áp dụng mã khuyến mãi này!");
    } finally {
      setPromoLoading(false);
    }
  };

  const discountAmount = appliedPromo ? Number(appliedPromo.discount || 0) : 0;
  const finalTotal = Math.max(0, total - discountAmount);

  return (
    <PageShell title="Giỏ hàng của bạn">
      <ErrorBox message={error} />

      {promoSuccessMsg && (
        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{promoSuccessMsg}</span>
        </div>
      )}

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
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
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

              const inStock = Number(item.product?.stock ?? 0);

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
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Kho còn: <b className="font-mono text-zinc-700">{inStock}</b> máy
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
                          disabled={updatingId === item.id || item.quantity >= inStock}
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

          {/* Cột tóm tắt & Khung mã khuyến mãi (Coupon) */}
          <aside className="space-y-4">
            {/* KHUNG NHẬP MÃ KHUYẾN MÃI (FUNC-ORDER-02) */}
            <div className={`${card} space-y-3`}>
              <div className="flex items-center gap-1.5 font-bold text-xs text-zinc-900">
                <TagIcon className="w-4 h-4 text-zinc-900" />
                <span>Mã khuyến mãi &amp; Giảm giá</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Nhập mã (VD: BAOCONG500K)"
                  className={`${inputCls} font-mono uppercase text-xs`}
                />
                <button
                  type="button"
                  onClick={() => handleApplyCoupon()}
                  disabled={promoLoading || !couponInput.trim()}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-3 py-2 rounded-lg transition shrink-0 disabled:opacity-40"
                >
                  {promoLoading ? "..." : "Áp dụng"}
                </button>
              </div>

              {/* Danh sách mã đang có sẵn để bấm chọn nhanh */}
              {availablePromos.length > 0 && (
                <div className="pt-2 border-t border-zinc-100 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                    MÃ CÓ SẴN (BẤM CHỌN NHANH):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {availablePromos.map((p) => (
                      <button
                        key={p.code}
                        type="button"
                        onClick={() => {
                          setCouponInput(p.code);
                          handleApplyCoupon(p.code);
                        }}
                        className={`text-[11px] font-mono px-2 py-1 rounded-md border text-left transition ${
                          appliedPromo?.coupon_code === p.code
                            ? "bg-zinc-900 text-white border-zinc-900 font-bold"
                            : "bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border-zinc-200"
                        }`}
                      >
                        <b>{p.code}</b> ({p.discount_type === "percent" ? `-${p.discount_value}%` : `-${money(p.discount_value)}`})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* BẢNG TÍNH TIỀN */}
            <div className={`${card} space-y-4`}>
              <h2 className="font-bold text-sm text-zinc-900 border-b border-zinc-100 pb-3">Tóm tắt đơn hàng</h2>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Tạm tính</span>
                  <span className="font-bold text-zinc-900 font-mono">{money(total)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Giảm giá ({appliedPromo?.coupon_code})</span>
                    <span className="font-bold font-mono">-{money(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-600">
                  <span>Phí vận chuyển</span>
                  <span className="text-emerald-600 font-semibold">
                    {total >= 5000000 ? "Miễn phí (đơn từ 5tr)" : "Tính ở bước thanh toán"}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 pt-3 flex justify-between items-baseline">
                <span className="font-bold text-zinc-900 text-xs">Tổng thanh toán:</span>
                <span className="text-lg font-extrabold text-zinc-950 font-mono">{money(finalTotal)}</span>
              </div>

              <Link href="/checkout" className={`${btnPrimary} block text-center font-bold !py-2.5 shadow-2xs`}>
                Tiến hành đặt hàng →
              </Link>

              <Link href="/trangchu" className="block text-center text-xs font-medium text-zinc-500 hover:text-zinc-900">
                ← Tiếp tục mua sắm
              </Link>
            </div>
          </aside>
        </div>
      )}
    </PageShell>
  );
}
