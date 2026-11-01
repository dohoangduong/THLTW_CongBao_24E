"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosClient from "@/services/axiosClient";
import { clearToken } from "@/lib/api";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import {
  SearchIcon,
  PlusIcon,
  CheckIcon,
  ArrowUpRightIcon,
  CreditCardIcon,
  AlertCircleIcon,
} from "@/components/Icons";

const TOKEN_KEY = "access_token";
const FALLBACK_IMAGE = "/images/default-phone.svg";

export default function TrangChuPage() {
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [brandId, setBrandId] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [sort, setSort] = useState("newest");

  const [token, setTokenState] = useState(null);
  const [user, setUser] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((text, ok = true) => {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("token") || localStorage.getItem(TOKEN_KEY);
      const uStr = localStorage.getItem("user");
      if (t) setTokenState(t);
      if (uStr) {
        try {
          setUser(JSON.parse(uStr));
        } catch {
          setUser(null);
        }
      }
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axiosClient.get("/products?all=1"),
      axiosClient.get("/brands?all=1"),
      axiosClient.get("/categories?all=1"),
    ])
      .then(([pRes, bRes, cRes]) => {
        const prodData = pRes?.data || pRes || [];
        const brandData = bRes?.data || bRes || [];
        const catData = cRes?.data || cRes || [];

        setProducts(Array.isArray(prodData) ? prodData : []);
        setBrands(Array.isArray(brandData) ? brandData.filter((x) => x.status !== 0) : []);
        setCategories(Array.isArray(catData) ? catData.filter((x) => x.status !== 0) : []);
        setError("");
      })
      .catch((err) => {
        console.error("Lỗi khi tải dữ liệu sản phẩm:", err);
        setError("Không thể kết nối đến máy chủ API. Vui lòng kiểm tra lại dịch vụ Backend.");
      })
      .finally(() => setLoading(false));
  }, []);

  const addToCart = async (p) => {
    if (!token) {
      router.push("/login");
      return;
    }
    setAddingId(p.id);
    try {
      await axiosClient.post("/cart/add", {
        product_id: p.id,
        quantity: 1,
      });
      showToast(`Đã thêm "${p.name}" vào giỏ hàng thành công!`);
    } catch (err) {
      if (err?.status === 401) {
        router.push("/login");
      } else {
        showToast(err.message || "Không thể thêm sản phẩm vào giỏ hàng", false);
      }
    } finally {
      setAddingId(null);
    }
  };

  const getFinalPrice = (p) =>
    p.sale_price && Number(p.sale_price) > 0 && Number(p.sale_price) < Number(p.price)
      ? Number(p.sale_price)
      : Number(p.price);

  const getDiscountPercent = (p) => {
    const final = getFinalPrice(p);
    const orig = Number(p.price);
    return final < orig ? Math.round(((orig - final) / orig) * 100) : 0;
  };

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = products.filter((p) => {
      const matchStatus = p.status !== 0;
      const matchSearch =
        !q || p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q));
      const matchBrand = brandId === null || (p.brand?.id ?? p.brand_id) === brandId;
      const matchCat = categoryId === null || (p.category?.id ?? p.category_id) === categoryId;
      return matchStatus && matchSearch && matchBrand && matchCat;
    });

    if (sort === "price-asc") {
      list.sort((a, b) => getFinalPrice(a) - getFinalPrice(b));
    } else if (sort === "price-desc") {
      list.sort((a, b) => getFinalPrice(b) - getFinalPrice(a));
    } else {
      list.sort((a, b) => b.id - a.id);
    }
    return list;
  }, [products, search, brandId, categoryId, sort]);

  const totalStockCount = useMemo(() => {
    return products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  }, [products]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col font-sans antialiased">
      <StoreHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* HERO BANNER BENTO */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 bg-zinc-900 text-white rounded-2xl p-6 lg:p-8 relative overflow-hidden border border-zinc-800 flex flex-col justify-between min-h-[260px] shadow-2xs">
            <div className="relative z-10 space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-zinc-800 border border-zinc-700/80 px-2.5 py-1 rounded-md text-[11px] font-mono tracking-wide text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>FLAGSHIP CHÍNH HÃNG 2026</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Thế hệ Smartphone mới nhất. <br />
                <span className="text-zinc-400 font-medium text-xl sm:text-2xl">
                  Hiệu năng bứt phá, giá niêm yết minh bạch.
                </span>
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Thiết bị công nghệ phân phối chính hãng 100%. Cam kết bảo hành 12 tháng tại các trung tâm ủy quyền toàn quốc và hỗ trợ 1 đổi 1 trong 30 ngày.
              </p>
            </div>

            <div className="relative z-10 pt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("catalog-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-white hover:bg-zinc-100 text-zinc-950 font-semibold px-4 py-2.5 rounded-lg text-xs transition shadow-2xs"
              >
                Khám phá danh mục
              </button>
              {isMounted && user?.role === "admin" && (
                <Link
                  href="/admin/don-hang"
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-4 py-2.5 rounded-lg text-xs border border-zinc-700 transition flex items-center gap-1.5 shadow-2xs"
                >
                  <span>Bảng điều khiển Quản trị</span>
                  <ArrowUpRightIcon className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-zinc-700/10 blur-3xl pointer-events-none" />
          </div>

          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
                  <CreditCardIcon className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-zinc-900 mt-2">Trả góp 0% Lãi suất</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Hỗ trợ qua thẻ tín dụng và đối tác tài chính uy tín, xét duyệt hồ sơ trực tuyến trong 5 phút.
                </p>
              </div>
              <div className="pt-3 border-t border-zinc-100 text-[11px] font-semibold text-zinc-900 flex items-center gap-1">
                <Link href="/ho-tro" className="hover:underline flex items-center gap-1">
                  <span>Xem điều kiện áp dụng</span>
                  <ArrowUpRightIcon className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-400">
                    KHO HÀNG TRỰC TUYẾN
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <div className="text-2xl font-extrabold text-zinc-950 font-mono tabular-nums">
                  {loading ? "..." : `${products.length} Mẫu`}
                </div>
                <p className="text-xs text-zinc-500">
                  {totalStockCount > 0 ? `${totalStockCount} thiết bị sẵn sàng giao ngay` : "Đang cập nhật kho"}
                </p>
              </div>
              <div className="pt-3 border-t border-zinc-100 text-[11px] text-zinc-500">
                Sẵn sàng giao hàng toàn quốc
              </div>
            </div>
          </div>
        </section>

        {/* BỘ LỌC HỢP NHẤT */}
        <section
          id="catalog-section"
          className="bg-white border border-zinc-200 rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setCategoryId(null)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                categoryId === null
                  ? "bg-white text-zinc-900 shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Tất cả danh mục
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryId(categoryId === c.id ? null : c.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                  categoryId === c.id
                    ? "bg-white text-zinc-900 shadow-2xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              type="button"
              onClick={() => setBrandId(null)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                brandId === null
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
              }`}
            >
              Tất cả hãng
            </button>
            {brands.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBrandId(brandId === b.id ? null : b.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                  brandId === b.id
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-auto">
            <span className="text-xs text-zinc-500 font-mono tabular-nums">
              <b>{visible.length}</b> sản phẩm
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-medium rounded-lg px-2.5 py-1.5 outline-none focus:border-zinc-900 cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
            </select>
          </div>
        </section>

        {/* DANH SÁCH SẢN PHẨM */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-zinc-200 p-4 space-y-3 animate-pulse"
              >
                <div className="bg-zinc-100 h-60 rounded-lg" />
                <div className="h-4 bg-zinc-100 rounded w-2/3" />
                <div className="h-5 bg-zinc-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center space-y-3">
            <SearchIcon className="w-8 h-8 text-zinc-400 mx-auto" />
            <h3 className="font-bold text-zinc-900 text-base">Không tìm thấy sản phẩm phù hợp</h3>
            <p className="text-xs text-zinc-500">
              Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc thương hiệu / danh mục.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSearchInput("");
                setBrandId(null);
                setCategoryId(null);
                setSort("newest");
              }}
              className="bg-zinc-900 text-white font-semibold text-xs px-4 py-2 rounded-lg hover:bg-zinc-800 transition"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {visible.map((product) => {
              const finalPrice = getFinalPrice(product);
              const discount = getDiscountPercent(product);
              const isAvailable = (product.stock ?? 0) > 0;

              const imgSrc = product.image
                ? product.image.startsWith("http")
                  ? product.image
                  : `http://localhost:8000${product.image.startsWith("/") ? "" : "/"}${product.image}`
                : FALLBACK_IMAGE;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-zinc-200/90 hover:border-zinc-900 transition-all duration-200 flex flex-col overflow-hidden group shadow-2xs hover:shadow-xs"
                >
                  <div className="relative h-60 w-full bg-zinc-50 overflow-hidden border-b border-zinc-100 flex items-center justify-center p-4">
                    {discount > 0 && (
                      <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                        -{discount}%
                      </span>
                    )}

                    {product.sku && (
                      <span className="absolute top-2.5 right-2.5 font-mono text-[10px] text-zinc-400 uppercase">
                        {product.sku}
                      </span>
                    )}

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgSrc}
                      alt={product.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                      className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">
                        {product.brand?.name || "CHÍNH HÃNG"} • {product.category?.name || "ĐIỆN THOẠI"}
                      </div>

                      <Link href={`/products/${product.id}`} className="block mt-1">
                        <h3 className="font-bold text-zinc-900 text-sm leading-snug group-hover:text-zinc-600 transition-colors line-clamp-2 min-h-[2.5rem]">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="mt-2.5 flex items-baseline gap-2">
                        <span className="font-extrabold text-base text-zinc-900 font-mono tabular-nums">
                          {finalPrice.toLocaleString("vi-VN")} ₫
                        </span>
                        {discount > 0 && (
                          <span className="text-xs text-zinc-400 line-through font-mono tabular-nums">
                            {Number(product.price).toLocaleString("vi-VN")} ₫
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-500">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isAvailable ? "bg-emerald-500" : "bg-rose-400"
                          }`}
                        />
                        <span>{isAvailable ? `Còn hàng (${product.stock})` : "Tạm hết hàng"}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100">
                      <Link
                        href={`/products/${product.id}`}
                        className="text-center border border-zinc-200 hover:bg-zinc-50 text-zinc-800 rounded-lg py-1.5 text-xs font-semibold transition"
                      >
                        Chi tiết
                      </Link>
                      <button
                        type="button"
                        disabled={addingId === product.id}
                        onClick={() => addToCart(product)}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg py-1.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1 disabled:opacity-60"
                      >
                        <PlusIcon className="w-3.5 h-3.5" />
                        <span>{addingId === product.id ? "Đang thêm..." : "Giỏ hàng"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <StoreFooter />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border ${
              toast.ok
                ? "bg-zinc-900 text-white border-zinc-800"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {toast.ok ? (
              <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircleIcon className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
