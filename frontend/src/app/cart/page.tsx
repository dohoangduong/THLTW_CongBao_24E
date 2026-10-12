"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, money } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { PageShell, ErrorBox, btnPrimary, btnGhost, card } from "@/components/PageShell";

interface CartItem {
  id: number;
  quantity: number;
  price: number | string;
  product?: { id: number; name: string; image?: string | null; stock: number } | null;
}

export default function CartPage() {
  const { loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await api<{ cart: { items: CartItem[] } }>("/cart");
      setItems(r.cart.items ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading, load]);

  const changeQty = async (item: CartItem, qty: number) => {
    if (qty < 1) return;
    setError("");
    try {
      await api(`/cart/${item.id}`, { method: "PUT", body: { quantity: qty } });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const remove = async (item: CartItem) => {
    await api(`/cart/${item.id}`, { method: "DELETE" });
    await load();
  };

  const total = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);

  return (
    <PageShell title="Giỏ hàng">
      <ErrorBox message={error} />
      {loading ? (
        <p className="text-slate-600">Đang tải giỏ hàng…</p>
      ) : items.length === 0 ? (
        <div className={`${card} text-center`}>
          <p className="font-semibold">Giỏ hàng đang trống</p>
          <Link href="/" className={`${btnPrimary} mt-4 inline-block`}>Chọn điện thoại</Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {items.map((i) => (
              <div key={i.id} className={`${card} flex items-center gap-4`}>
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-lg bg-slate-100">
                  {i.product?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={i.product.image} alt={i.product.name} className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-xs text-slate-400">Chưa có ảnh</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{i.product?.name ?? "Sản phẩm đã bị xóa"}</p>
                  <p className="text-sm text-red-600">{money(i.price)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => changeQty(i, i.quantity - 1)} className={`${btnGhost} !px-3 !py-1`} aria-label="Giảm">−</button>
                    <span className="w-8 text-center text-sm">{i.quantity}</span>
                    <button onClick={() => changeQty(i, i.quantity + 1)} className={`${btnGhost} !px-3 !py-1`} aria-label="Tăng">+</button>
                    <button onClick={() => remove(i)} className="ml-3 text-sm text-red-600 hover:underline">Xóa</button>
                  </div>
                </div>
                <p className="font-bold">{money(Number(i.price) * i.quantity)}</p>
              </div>
            ))}
          </div>
          <aside className={`${card} h-fit`}>
            <p className="flex justify-between text-sm"><span>Tạm tính</span><span>{money(total)}</span></p>
            <p className="mt-1 text-xs text-slate-500">Phí vận chuyển được tính ở bước thanh toán.</p>
            <Link href="/checkout" className={`${btnPrimary} mt-5 block text-center`}>Tiến hành đặt hàng</Link>
          </aside>
        </div>
      )}
    </PageShell>
  );
}
