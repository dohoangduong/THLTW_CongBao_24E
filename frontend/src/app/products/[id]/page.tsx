"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ShopShell from "@/components/shop/ShopShell";
import ProductCard from "@/components/shop/ProductCard";
import { discountPercent, finalPrice, getProduct, getProducts, money, type Product } from "@/lib/shop";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setQty(1);
    getProduct(id)
      .then(async (p) => {
        if (cancelled) return;
        setProduct(p);
        // Sản phẩm cùng danh mục
        const r = await getProducts({ category_id: p.category_id ?? p.category?.id, per_page: 5 }).catch(() => null);
        if (!cancelled && r) setRelated(r.items.filter((x) => x.id !== p.id).slice(0, 4));
      })
      .catch(() => {
        if (!cancelled) setError("Không tìm thấy sản phẩm hoặc sản phẩm đã ngừng bán.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <ShopShell>
      {(shop) => {
        if (loading) return <div className="h-96 animate-pulse rounded-3xl bg-slate-200" />;
        if (error || !product)
          return (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="font-semibold">{error || "Không có dữ liệu"}</p>
              <Link href="/" className="mt-4 inline-block rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white">
                Về trang chủ
              </Link>
            </div>
          );

        const pct = discountPercent(product);
        const stock = product.stock ?? 0;
        const out = stock <= 0;

        return (
          <>
            <nav className="mb-4 text-sm text-slate-500" aria-label="Đường dẫn">
              <Link href="/" className="hover:text-blue-600">Cửa hàng</Link>
              {product.category && (
                <>
                  {" / "}
                  <Link href={`/?category=${product.category.id}`} className="hover:text-blue-600">
                    {product.category.name}
                  </Link>
                </>
              )}
              {" / "}
              <span className="text-slate-700">{product.name}</span>
            </nav>

            <div className="grid gap-8 rounded-3xl border border-slate-200 bg-white p-6 md:grid-cols-2">
              <div className="relative grid aspect-square place-items-center rounded-2xl bg-slate-100 p-6">
                {product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.image} alt={product.name} className="h-full w-full object-contain" />
                ) : (
                  <span className="text-slate-400">Chưa có ảnh</span>
                )}
                {pct > 0 && (
                  <span className="absolute left-4 top-4 rounded-md bg-red-600 px-2.5 py-1 text-sm font-bold text-white">
                    -{pct}%
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <p className="text-sm text-slate-500">
                  {product.brand?.name ?? "Điện thoại"}
                  {product.category ? ` · ${product.category.name}` : ""}
                </p>
                <h1 className="mt-1 text-3xl font-extrabold leading-tight">{product.name}</h1>

                <div className="mt-4 flex items-end gap-3">
                  <p className="text-3xl font-extrabold text-red-600">{money(finalPrice(product))}</p>
                  {pct > 0 && <p className="pb-1 text-slate-400 line-through">{money(product.price)}</p>}
                </div>

                <p className={`mt-2 text-sm font-medium ${out ? "text-red-600" : "text-emerald-700"}`}>
                  {out ? "Tạm hết hàng" : `Còn ${stock} máy`}
                </p>

                {product.description && (
                  <p className="mt-4 whitespace-pre-line text-slate-700">{product.description}</p>
                )}

                <div className="mt-6 flex items-center gap-3">
                  <div className="flex items-center rounded-xl border border-slate-300">
                    <button
                      aria-label="Giảm số lượng"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="h-11 w-11 text-lg hover:bg-slate-50"
                    >
                      −
                    </button>
                    <span className="w-10 text-center font-semibold" aria-live="polite">{qty}</span>
                    <button
                      aria-label="Tăng số lượng"
                      onClick={() => setQty((q) => Math.min(Math.max(stock, 1), q + 1))}
                      className="h-11 w-11 text-lg hover:bg-slate-50"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => shop.addToCart(product, qty)}
                    disabled={out || shop.addingId === product.id}
                    className="h-11 flex-1 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {out ? "Hết hàng" : shop.addingId === product.id ? "Đang thêm…" : "Thêm vào giỏ"}
                  </button>
                </div>
              </div>
            </div>

            {related.length > 0 && (
              <section className="mt-12" aria-label="Sản phẩm cùng danh mục">
                <h2 className="mb-4 text-2xl font-extrabold">Sản phẩm cùng danh mục</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {related.map((p) => (
                    <ProductCard key={p.id} product={p} onAdd={shop.addToCart} adding={shop.addingId === p.id} />
                  ))}
                </div>
              </section>
            )}
          </>
        );
      }}
    </ShopShell>
  );
}
