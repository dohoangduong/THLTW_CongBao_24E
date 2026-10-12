"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosClient from "@/services/axiosClient";
import { money, PAYMENT_METHOD } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { PageShell, ErrorBox, inputCls, btnPrimary, card } from "@/components/PageShell";

interface CartItem {
  id: number;
  quantity: number;
  price: number | string;
  product?: { name: string; price: number | string; image?: string | null } | null;
}

const FREE_SHIP_FROM = 5000000;
const SHIPPING_FEE = 30000;

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [f, setF] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    shipping_address: "",
    note: "",
    payment_method: "cod",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cartLoading, setCartLoading] = useState(true);

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
      .then((res: any) => {
        const cartItems = res?.cart?.items || [];
        setItems(cartItems);
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
  const total = subtotal + shipping;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError("Giỏ hàng đang trống, không thể đặt hàng!");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const res: any = await axiosClient.post("/orders", f);
      const newOrder = res?.data || res?.order || res;
      if (newOrder?.id) {
        router.push(`/orders/${newOrder.id}`);
      } else {
        router.push("/orders");
      }
    } catch (err: any) {
      console.error("Lỗi khi đặt hàng:", err);
      setError(err.message || "Đặt hàng thất bại. Vui lòng thử lại!");
      setBusy(false);
    }
  };

  const handleChange = (k: keyof typeof f) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setF({ ...f, [k]: e.target.value });
  };

  return (
    <PageShell title="Xác nhận & Thanh toán đơn hàng">
      {cartLoading ? (
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
      ) : items.length === 0 ? (
        <div className={`${card} text-center py-12`}>
          <p className="text-lg font-bold text-slate-800">Bạn chưa có sản phẩm nào trong giỏ để đặt hàng</p>
          <Link href="/" className={`${btnPrimary} mt-5 inline-block`}>
            Quay lại chọn sản phẩm
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Thông tin giao hàng */}
          <div className={`${card} space-y-4`}>
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2.5">
              Thông tin nhận hàng
            </h2>

            <ErrorBox message={error} />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Họ và tên người nhận <span className="text-red-600">*</span>
                <input
                  required
                  value={f.customer_name}
                  onChange={handleChange("customer_name")}
                  className={`${inputCls} mt-1`}
                  placeholder="Ví dụ: Nguyễn Văn A"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Số điện thoại liên hệ <span className="text-red-600">*</span>
                <input
                  required
                  value={f.customer_phone}
                  onChange={handleChange("customer_phone")}
                  className={`${inputCls} mt-1`}
                  placeholder="Ví dụ: 0912345678"
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Email nhận thông báo (tùy chọn)
              <input
                type="email"
                value={f.customer_email}
                onChange={handleChange("customer_email")}
                className={`${inputCls} mt-1`}
                placeholder="email@example.com"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Địa chỉ nhận hàng chi tiết <span className="text-red-600">*</span>
              <input
                required
                value={f.shipping_address}
                onChange={handleChange("shipping_address")}
                className={`${inputCls} mt-1`}
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
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
              <label className="block text-sm font-medium text-slate-700">
                Hình thức thanh toán <span className="text-red-600">*</span>
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

          {/* Cột tóm tắt đơn hàng */}
          <aside className={`${card} h-fit space-y-4`}>
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2.5">
              Đơn hàng ({items.length} món)
            </h2>

            <ul className="space-y-3 max-h-60 overflow-y-auto pr-1 text-sm divide-y divide-slate-100">
              {items.map((item) => (
                <li key={item.id} className="pt-2 flex justify-between gap-2 items-center">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 truncate">{item.product?.name}</p>
                    <p className="text-xs text-slate-500">Số lượng: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-slate-800 shrink-0">
                    {money(Number(item.price) * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-slate-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính</span>
                <span className="font-bold text-slate-900">{money(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Phí vận chuyển</span>
                <span className={shipping === 0 ? "text-emerald-700 font-bold" : "font-bold text-slate-900"}>
                  {shipping === 0 ? "Miễn phí" : money(shipping)}
                </span>
              </div>
              {subtotal < FREE_SHIP_FROM && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg">
                  💡 Mẹo: Mua thêm {money(FREE_SHIP_FROM - subtotal)} để được MIỄN PHÍ vận chuyển!
                </p>
              )}
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
              <span className="font-bold text-slate-900">Tổng thanh toán:</span>
              <span className="text-xl font-extrabold text-red-600">{money(total)}</span>
            </div>

            <button
              type="submit"
              disabled={busy || items.length === 0}
              className={`${btnPrimary} w-full font-bold !py-3 shadow-md mt-2`}
            >
              {busy ? "Đang xử lý đặt hàng…" : "Xác nhận đặt hàng ngay"}
            </button>

            <Link href="/cart" className="block text-center text-xs font-medium text-slate-500 hover:text-slate-800">
              ← Sửa giỏ hàng
            </Link>
          </aside>
        </form>
      )}
    </PageShell>
  );
}
