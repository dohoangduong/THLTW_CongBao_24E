"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosClient from "@/services/axiosClient";
import { money, PAYMENT_METHOD } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { PageShell, ErrorBox, inputCls, btnPrimary, card } from "@/components/PageShell";
import { TagIcon, CheckIcon } from "@/components/Icons";

const FREE_SHIP_FROM = 5000000;
const SHIPPING_FEE = 30000;

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [f, setF] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    shipping_address: "",
    note: "",
    payment_method: "cod",
    coupon_code: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cartLoading, setCartLoading] = useState(true);

  // Mã khuyến mãi
  const [couponInput, setCouponInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMsg, setPromoMsg] = useState("");

  useEffect(() => {
    if (authLoading || !user) return;
    setF((prev) => ({
      ...prev,
      customer_name: user.name || "",
      customer_phone: user.phone || "",
      customer_email: user.email || "",
      shipping_address: user.address || "",
    }));

    axiosClient
      .get("/cart")
      .then((res) => {
        const cartItems = res?.cart?.items || [];
        setItems(cartItems);

        // Đọc mã khuyến mãi đã chọn từ trang giỏ hàng (nếu có)
        if (typeof window !== "undefined") {
          const savedCouponStr = localStorage.getItem("applied_coupon");
          if (savedCouponStr) {
            try {
              const saved = JSON.parse(savedCouponStr);
              if (saved?.coupon_code) {
                setAppliedPromo(saved);
                setCouponInput(saved.coupon_code);
                setF((prev) => ({ ...prev, coupon_code: saved.coupon_code }));
              }
            } catch {}
          }
        }
      })
      .catch((err) => {
        console.error("Lỗi khi tải giỏ hàng:", err);
      })
      .finally(() => setCartLoading(false));
  }, [authLoading, user]);

  const subtotal = items.reduce((sum, item) => {
    return sum + Number(item.price) * (item.quantity || 1);
  }, 0);

  const shipping = subtotal >= FREE_SHIP_FROM || subtotal === 0 ? 0 : SHIPPING_FEE;
  const discountAmount = appliedPromo ? Number(appliedPromo.discount || 0) : 0;
  const total = Math.max(0, subtotal + shipping - discountAmount);

  // Áp dụng mã khuyến mãi trực tiếp tại Checkout
  const handleApplyPromo = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setError("Vui lòng nhập mã khuyến mãi!");
      return;
    }

    setPromoLoading(true);
    setError("");
    setPromoMsg("");

    try {
      const res = await axiosClient.post("/promotions/apply", {
        code,
        amount: subtotal,
      });

      setAppliedPromo(res);
      setF((prev) => ({ ...prev, coupon_code: res.coupon_code }));
      setPromoMsg(res?.message || `Đã áp dụng mã «${code}»!`);
      if (typeof window !== "undefined") {
        localStorage.setItem("applied_coupon", JSON.stringify(res));
      }
    } catch (err) {
      setAppliedPromo(null);
      setF((prev) => ({ ...prev, coupon_code: "" }));
      setError(err.message || "Không thể áp dụng mã này");
    } finally {
      setPromoLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setError("Giỏ hàng đang trống, không thể đặt hàng!");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const res = await axiosClient.post("/orders", f);
      const newOrder = res?.data || res?.order || res;

      // Xóa coupon đã lưu sau khi đặt hàng thành công
      if (typeof window !== "undefined") {
        localStorage.removeItem("applied_coupon");
      }

      if (newOrder?.id) {
        router.push(`/orders/${newOrder.id}`);
      } else {
        router.push("/orders");
      }
    } catch (err) {
      console.error("Lỗi khi đặt hàng:", err);
      setError(err.message || "Đặt hàng thất bại. Vui lòng kiểm tra lại thông tin và số lượng tồn kho!");
      setBusy(false);
    }
  };

  const handleChange = (k) => (e) => {
    setF({ ...f, [k]: e.target.value });
  };

  return (
    <PageShell title="Xác nhận & Thanh toán đơn hàng">
      {cartLoading ? (
        <div className="h-64 animate-pulse rounded-2xl bg-zinc-100" />
      ) : items.length === 0 ? (
        <div className={`${card} text-center py-12`}>
          <p className="text-lg font-bold text-zinc-800">Bạn chưa có sản phẩm nào trong giỏ để đặt hàng</p>
          <Link href="/trangchu" className={`${btnPrimary} mt-5 inline-block`}>
            Quay lại chọn sản phẩm
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Thông tin giao hàng */}
          <div className={`${card} space-y-4`}>
            <h2 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2.5">
              Thông tin nhận hàng
            </h2>

            <ErrorBox message={error} />
            {promoMsg && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{promoMsg}</span>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-semibold text-zinc-700">
                Họ và tên người nhận <span className="text-rose-600">*</span>
                <input
                  required
                  value={f.customer_name}
                  onChange={handleChange("customer_name")}
                  className={`${inputCls} mt-1`}
                  placeholder="Ví dụ: Nguyễn Văn A"
                />
              </label>

              <label className="block text-xs font-semibold text-zinc-700">
                Số điện thoại liên hệ <span className="text-rose-600">*</span>
                <input
                  required
                  value={f.customer_phone}
                  onChange={handleChange("customer_phone")}
                  className={`${inputCls} mt-1`}
                  placeholder="Ví dụ: 0912345678"
                />
              </label>
            </div>

            <label className="block text-xs font-semibold text-zinc-700">
              Email nhận thông báo (tùy chọn)
              <input
                type="email"
                value={f.customer_email}
                onChange={handleChange("customer_email")}
                className={`${inputCls} mt-1`}
                placeholder="email@example.com"
              />
            </label>

            <label className="block text-xs font-semibold text-zinc-700">
              Địa chỉ nhận hàng chi tiết <span className="text-rose-600">*</span>
              <input
                required
                value={f.shipping_address}
                onChange={handleChange("shipping_address")}
                className={`${inputCls} mt-1`}
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
              />
            </label>

            <label className="block text-xs font-semibold text-zinc-700">
              Ghi chú đơn hàng (nếu có)
              <textarea
                rows={2}
                value={f.note}
                onChange={handleChange("note")}
                className={`${inputCls} mt-1`}
                placeholder="Lời nhắn cho shipper hoặc cửa hàng (giao giờ hành chính, gọi trước khi đến...)"
              />
            </label>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-zinc-700">
                Hình thức thanh toán <span className="text-rose-600">*</span>
                <select
                  value={f.payment_method}
                  onChange={handleChange("payment_method")}
                  className={`${inputCls} mt-1 font-medium`}
                >
                  {Object.entries(PAYMENT_METHOD).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Cột tóm tắt đơn hàng & Mã khuyến mãi */}
          <aside className="space-y-4">
            {/* Khung nhập Coupon */}
            <div className={`${card} space-y-3`}>
              <div className="flex items-center gap-1.5 font-bold text-xs text-zinc-900">
                <TagIcon className="w-4 h-4 text-zinc-900" />
                <span>Mã khuyến mãi / Coupon</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Nhập mã giảm giá"
                  className={`${inputCls} font-mono uppercase text-xs`}
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={promoLoading || !couponInput.trim()}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-3 py-2 rounded-lg transition shrink-0 disabled:opacity-40"
                >
                  {promoLoading ? "..." : "Áp dụng"}
                </button>
              </div>
            </div>

            {/* Bảng chi tiết tính tiền */}
            <div className={`${card} h-fit space-y-4`}>
              <h2 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2.5">
                Đơn hàng ({items.length} món)
              </h2>

              <ul className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs divide-y divide-zinc-100">
                {items.map((item) => (
                  <li key={item.id} className="pt-2 flex justify-between gap-2 items-center">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-zinc-900 truncate">{item.product?.name}</p>
                      <p className="text-[11px] text-zinc-500 font-mono">Số lượng: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-zinc-900 font-mono shrink-0">
                      {money(Number(item.price) * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-zinc-100 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Tạm tính</span>
                  <span className="font-bold text-zinc-900 font-mono">{money(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Giảm giá ({appliedPromo?.coupon_code})</span>
                    <span className="font-bold font-mono">-{money(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-600">
                  <span>Phí vận chuyển</span>
                  <span className={shipping === 0 ? "text-emerald-600 font-bold" : "font-bold text-zinc-900 font-mono"}>
                    {shipping === 0 ? "Miễn phí" : money(shipping)}
                  </span>
                </div>

                {subtotal < FREE_SHIP_FROM && (
                  <p className="text-[11px] text-zinc-700 bg-zinc-50 border border-zinc-200 p-2 rounded-lg">
                    Mẹo: Mua thêm {money(FREE_SHIP_FROM - subtotal)} để được MIỄN PHÍ vận chuyển!
                  </p>
                )}
              </div>

              <div className="border-t border-zinc-100 pt-3 flex justify-between items-baseline">
                <span className="font-bold text-zinc-900 text-xs">Tổng thanh toán:</span>
                <span className="text-lg font-extrabold text-zinc-950 font-mono">{money(total)}</span>
              </div>

              <button
                type="submit"
                disabled={busy || items.length === 0}
                className={`${btnPrimary} w-full font-bold !py-2.5 shadow-2xs mt-2`}
              >
                {busy ? "Đang xử lý đặt hàng…" : "Xác nhận đặt hàng ngay"}
              </button>

              <Link href="/cart" className="block text-center text-xs font-medium text-zinc-500 hover:text-zinc-900">
                ← Sửa giỏ hàng
              </Link>
            </div>
          </aside>
        </form>
      )}
    </PageShell>
  );
}
