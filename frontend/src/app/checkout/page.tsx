"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, money, Order, PAYMENT_METHOD } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { PageShell, ErrorBox, inputCls, btnPrimary, card } from "@/components/PageShell";

interface CartItem {
  id: number;
  quantity: number;
  price: number | string;
  product?: { name: string } | null;
}

// Khớp với OrderController ở backend
const FREE_SHIP_FROM = 5000000;
const SHIPPING_FEE = 30000;

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [f, setF] = useState({ customer_name: "", customer_phone: "", shipping_address: "", note: "", payment_method: "cod" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    setF((p) => ({
      ...p,
      customer_name: user.name,
      customer_phone: user.phone ?? "",
      shipping_address: user.address ?? "",
    }));
    api<{ cart: { items: CartItem[] } }>("/cart").then((r) => setItems(r.cart.items ?? []));
  }, [authLoading, user]);

  const subtotal = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const shipping = subtotal >= FREE_SHIP_FROM || subtotal === 0 ? 0 : SHIPPING_FEE;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await api<{ data: Order }>("/orders", { method: "POST", body: f });
      router.push(`/orders/${r.data.id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });

  return (
    <PageShell title="Đặt hàng">
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className={`${card} space-y-4`}>
          <ErrorBox message={error} />
          <label className="block text-sm">Người nhận
            <input required value={f.customer_name} onChange={set("customer_name")} className={`${inputCls} mt-1`} />
          </label>
          <label className="block text-sm">Số điện thoại
            <input required value={f.customer_phone} onChange={set("customer_phone")} className={`${inputCls} mt-1`} />
          </label>
          <label className="block text-sm">Địa chỉ giao hàng
            <input required value={f.shipping_address} onChange={set("shipping_address")} className={`${inputCls} mt-1`} />
          </label>
          <label className="block text-sm">Ghi chú cho cửa hàng
            <textarea rows={3} value={f.note} onChange={set("note")} className={`${inputCls} mt-1`} />
          </label>
          <label className="block text-sm">Hình thức thanh toán
            <select value={f.payment_method} onChange={set("payment_method")} className={`${inputCls} mt-1`}>
              {Object.entries(PAYMENT_METHOD).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>
        </div>

        <aside className={`${card} h-fit`}>
          <h2 className="mb-3 font-semibold">Đơn hàng của bạn</h2>
          <ul className="space-y-1 text-sm">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-2">
                <span className="truncate">{i.product?.name} × {i.quantity}</span>
                <span>{money(Number(i.price) * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <hr className="my-3" />
          <p className="flex justify-between text-sm"><span>Tạm tính</span><span>{money(subtotal)}</span></p>
          <p className="flex justify-between text-sm"><span>Vận chuyển</span><span>{shipping ? money(shipping) : "Miễn phí"}</span></p>
          <p className="mt-2 flex justify-between text-lg font-extrabold"><span>Tổng</span><span className="text-red-600">{money(subtotal + shipping)}</span></p>
          <button disabled={busy || items.length === 0} className={`${btnPrimary} mt-5 w-full`}>
            {busy ? "Đang đặt hàng…" : "Xác nhận đặt hàng"}
          </button>
        </aside>
      </form>
    </PageShell>
  );
}
