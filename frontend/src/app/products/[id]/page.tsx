"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axiosClient from "@/services/axiosClient";
import { Product, money } from "@/lib/api";
import { PageShell, ErrorBox, btnPrimary, btnGhost, card } from "@/components/PageShell";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axiosClient
      .get(`/products/${id}`)
      .then((res: any) => {
        const p = res?.data || res;
        setProduct(p);
        setError("");
      })
      .catch((err: any) => {
        console.error("Lỗi khi tải chi tiết sản phẩm:", err);
        setError(err.message || "Không tìm thấy sản phẩm hoặc máy chủ gặp sự cố");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const finalPrice = product
    ? product.sale_price && Number(product.sale_price) > 0 && Number(product.sale_price) < Number(product.price)
      ? Number(product.sale_price)
      : Number(product.price)
    : 0;

  const discountPercent = product && finalPrice < Number(product.price)
    ? Math.round(((Number(product.price) - finalPrice) / Number(product.price)) * 100)
    : 0;

  const handleAddToCart = async (redirectCheckout = false) => {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("token") || localStorage.getItem("access_token")
      : null;

    if (!token) {
      router.push("/login");
      return;
    }

    if (!product) return;

    setIsAdding(true);
    try {
      await axiosClient.post("/cart/add", {
        product_id: product.id,
        quantity: qty,
      });

      if (redirectCheckout) {
        router.push("/checkout");
      } else {
        setToastMsg(`Đã thêm ${qty} sản phẩm vào giỏ hàng!`);
        setTimeout(() => setToastMsg(""), 3000);
      }
    } catch (err: any) {
      if (err?.status === 401) {
        router.push("/login");
      } else {
        alert(err.message || "Không thể thêm sản phẩm vào giỏ hàng");
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <PageShell title="Chi tiết sản phẩm">
      <div className="mb-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-blue-600 font-medium">
          ← Quay lại danh sách sản phẩm
        </Link>
      </div>

      <ErrorBox message={error} />

      {loading ? (
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-6 w-1/3 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-32 animate-pulse rounded-xl bg-slate-200" />
          </div>
        </div>
      ) : product ? (
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Cột hình ảnh sản phẩm */}
          <div className={`${card} flex items-center justify-center bg-slate-50 relative p-8`}>
            {product.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image.startsWith("http") ? product.image : `http://localhost:8000/images/${product.image}`}
                alt={product.name}
                className="max-h-[380px] w-auto object-contain transition-transform hover:scale-105 duration-300"
              />
            ) : (
              <div className="text-slate-400 text-sm font-medium">Chưa có hình ảnh sản phẩm</div>
            )}

            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                Giảm {discountPercent}%
              </span>
            )}
            {product.featured && (
              <span className="absolute top-4 right-4 bg-amber-400 text-amber-950 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                Nổi bật
              </span>
            )}
          </div>

          {/* Cột thông tin chi tiết */}
          <div className={`${card} space-y-5 flex flex-col justify-between`}>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <span>{product.brand?.name || "Thương hiệu"}</span>
                <span>•</span>
                <span>{product.category?.name || "Danh mục"}</span>
                {product.sku && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-slate-400">SKU: {product.sku}</span>
                  </>
                )}
              </div>

              <h2 className="text-2xl font-black text-slate-900 mt-2">{product.name}</h2>

              {/* Giá sản phẩm */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-red-600">{money(finalPrice)}</span>
                {discountPercent > 0 && (
                  <span className="text-base text-slate-400 line-through font-medium">{money(product.price)}</span>
                )}
              </div>

              {/* Trạng thái kho hàng */}
              <div className="mt-3 text-sm">
                <span className="font-medium text-slate-600">Tình trạng: </span>
                {(product.stock ?? 1) > 0 ? (
                  <span className="text-emerald-700 font-bold">Còn hàng (còn {product.stock} máy trong kho)</span>
                ) : (
                  <span className="text-red-600 font-bold">Tạm hết hàng</span>
                )}
              </div>

              {/* Mô tả sản phẩm */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Mô tả sản phẩm</h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
                </p>
              </div>
            </div>

            {/* Bộ chọn số lượng & Thao tác mua hàng */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-700">Số lượng:</span>
                <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-bold text-sm">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                    className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleAddToCart(false)}
                  disabled={(product.stock ?? 1) <= 0 || isAdding}
                  className={`${btnGhost} flex-1 text-center font-bold !py-3 hover:bg-slate-50`}
                >
                  {isAdding ? "Đang xử lý…" : "Thêm vào giỏ hàng"}
                </button>
                <button
                  type="button"
                  onClick={() => handleAddToCart(true)}
                  disabled={(product.stock ?? 1) <= 0 || isAdding}
                  className={`${btnPrimary} flex-1 text-center font-bold !py-3 shadow-md`}
                >
                  Mua ngay
                </button>
              </div>

              {toastMsg && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 text-sm text-center font-medium">
                  ✓ {toastMsg}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
