"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import axiosClient from "@/services/axiosClient";
import {
  GridIcon,
  TagIcon,
  FilterIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
  PlusIcon,
} from "@/components/Icons";

const FALLBACK_IMAGE = "/images/default-phone.svg";

const PRICE_PRESETS = [
  { label: "Tất cả mức giá", min: null, max: null },
  { label: "Dưới 10 triệu", min: null, max: 10000000 },
  { label: "Từ 10 - 20 triệu", min: 10000000, max: 20000000 },
  { label: "Từ 20 - 30 triệu", min: 20000000, max: 30000000 },
  { label: "Trên 30 triệu", min: 30000000, max: null },
];

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const querySearch = searchParams.get("search") || "";
  const queryCategory = searchParams.get("category_id") || "";
  const queryBrand = searchParams.get("brand_id") || "";
  const queryType = searchParams.get("type") || "all";
  const queryMinPrice = searchParams.get("min_price") || "";
  const queryMaxPrice = searchParams.get("max_price") || "";
  const querySort = searchParams.get("sort") || "latest";
  const queryPage = parseInt(searchParams.get("page") || "1", 10);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 9,
  });

  const [customMin, setCustomMin] = useState(queryMinPrice);
  const [customMax, setCustomMax] = useState(queryMaxPrice);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    Promise.all([
      axiosClient.get("/categories?all=1"),
      axiosClient.get("/brands?all=1"),
    ])
      .then(([catRes, brandRes]) => {
        setCategories(Array.isArray(catRes) ? catRes : catRes?.data || []);
        setBrands(Array.isArray(brandRes) ? brandRes : brandRes?.data || []);
      })
      .catch((err) => {
        console.error("Lỗi khi tải bộ lọc:", err);
      });
  }, []);

  useEffect(() => {
    setLoading(true);

    const params = new URLSearchParams();
    if (querySearch) params.append("search", querySearch);
    if (queryCategory) params.append("category_id", queryCategory);
    if (queryBrand) params.append("brand_id", queryBrand);
    if (queryType && queryType !== "all") params.append("type", queryType);
    if (queryMinPrice) params.append("min_price", queryMinPrice);
    if (queryMaxPrice) params.append("max_price", queryMaxPrice);
    if (querySort) params.append("sort", querySort);
    if (queryPage) params.append("page", queryPage.toString());
    params.append("per_page", "9");

    axiosClient
      .get(`/products?${params.toString()}`)
      .then((res) => {
        const prodList = res?.data || (Array.isArray(res) ? res : []);
        setProducts(prodList);

        if (res?.meta) {
          setMeta({
            currentPage: res.meta.current_page || 1,
            lastPage: res.meta.last_page || 1,
            total: res.meta.total || prodList.length,
            perPage: res.meta.per_page || 9,
          });
        } else {
          setMeta({
            currentPage: 1,
            lastPage: 1,
            total: prodList.length,
            perPage: prodList.length,
          });
        }
      })
      .catch((err) => {
        console.error("Lỗi khi tải danh sách sản phẩm:", err);
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    querySearch,
    queryCategory,
    queryBrand,
    queryType,
    queryMinPrice,
    queryMaxPrice,
    querySort,
    queryPage,
  ]);

  const updateQuery = (newParams) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "" || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value.toString());
      }
    });

    if (!("page" in newParams)) {
      params.delete("page");
    }

    router.push(`/products?${params.toString()}`);
  };

  const handleApplyCustomPrice = (e) => {
    e.preventDefault();
    updateQuery({
      min_price: customMin ? customMin : null,
      max_price: customMax ? customMax : null,
    });
  };

  const handleResetFilters = () => {
    setCustomMin("");
    setCustomMax("");
    router.push("/products");
  };

  const handleAddToCart = async (product) => {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("token") || localStorage.getItem("access_token") || localStorage.getItem("admin_token")
      : null;

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      await axiosClient.post("/cart/add", {
        product_id: product.id,
        quantity: 1,
      });
      setToastMsg(`Đã thêm "${product.name}" vào giỏ hàng thành công!`);
      setTimeout(() => setToastMsg(""), 3000);
    } catch (err) {
      if (err?.status === 401) {
        router.push("/login");
      } else {
        alert(err.message || "Không thể thêm sản phẩm vào giỏ hàng");
      }
    }
  };

  const formatPrice = (p) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(p) || 0);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans antialiased text-zinc-900">
      <StoreHeader />

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold border border-zinc-800 animate-in slide-in-from-bottom duration-200">
          <CheckIcon className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
              <Link href="/trangchu" className="hover:text-zinc-900 transition-colors">
                Trang chủ
              </Link>
              <span>/</span>
              <span className="text-zinc-800 font-medium">Sản phẩm</span>
              {queryType === "sale" && (
                <>
                  <span>/</span>
                  <span className="text-rose-600 font-semibold">Khuyến mãi Hot</span>
                </>
              )}
              {queryType === "new" && (
                <>
                  <span>/</span>
                  <span className="text-zinc-900 font-semibold">Sản phẩm mới</span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-black text-zinc-950 tracking-tight flex items-center gap-2">
              {queryType === "sale"
                ? "Sản Phẩm Đang Giảm Giá Hot"
                : queryType === "new"
                ? "Sản Phẩm Mới Nhất 2026"
                : "Tất Cả Sản Phẩm Chính Hãng"}
            </h1>
          </div>

          {(querySearch || queryCategory || queryBrand || queryMinPrice || queryMaxPrice || queryType !== "all") && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200 self-start sm:self-auto"
            >
              <XIcon className="w-3.5 h-3.5" />
              <span>Xóa tất cả bộ lọc</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* CỘT TRÁI: SIDEBAR BỘ LỌC */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-zinc-200/90 shadow-2xs">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 mb-3 pb-2 border-b border-zinc-100">
                <GridIcon className="w-4 h-4 text-zinc-900" />
                <span>Danh mục sản phẩm</span>
              </div>
              <ul className="space-y-1">
                <li>
                  <button
                    type="button"
                    onClick={() => updateQuery({ category_id: null })}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-all ${
                      !queryCategory
                        ? "bg-zinc-900 text-white font-semibold shadow-2xs"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                  >
                    <span>Tất cả danh mục</span>
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onClick={() => updateQuery({ category_id: cat.id })}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-all ${
                        queryCategory === cat.id.toString()
                          ? "bg-zinc-900 text-white font-semibold shadow-2xs"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      {typeof cat.products_count === "number" && (
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                          queryCategory === cat.id.toString()
                            ? "bg-zinc-800 text-zinc-200"
                            : "bg-zinc-100 text-zinc-500"
                        }`}>
                          {cat.products_count}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-zinc-200/90 shadow-2xs">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 mb-3 pb-2 border-b border-zinc-100">
                <TagIcon className="w-4 h-4 text-zinc-900" />
                <span>Thương hiệu</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateQuery({ brand_id: null })}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    !queryBrand
                      ? "bg-zinc-900 text-white border-zinc-900 shadow-2xs"
                      : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                  }`}
                >
                  Tất cả
                </button>
                {brands.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => updateQuery({ brand_id: b.id })}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      queryBrand === b.id.toString()
                        ? "bg-zinc-900 text-white border-zinc-900 shadow-2xs"
                        : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-zinc-200/90 shadow-2xs">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 mb-3 pb-2 border-b border-zinc-100">
                <FilterIcon className="w-4 h-4 text-zinc-900" />
                <span>Khoảng giá</span>
              </div>

              <div className="space-y-1.5 mb-4">
                {PRICE_PRESETS.map((p, idx) => {
                  const isSelected =
                    (!p.min && !p.max && !queryMinPrice && !queryMaxPrice) ||
                    (p.min?.toString() === queryMinPrice && p.max?.toString() === queryMaxPrice) ||
                    (!p.min && p.max?.toString() === queryMaxPrice && !queryMinPrice) ||
                    (!p.max && p.min?.toString() === queryMinPrice && !queryMaxPrice);

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCustomMin(p.min ? p.min.toString() : "");
                        setCustomMax(p.max ? p.max.toString() : "");
                        updateQuery({
                          min_price: p.min,
                          max_price: p.max,
                        });
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-all ${
                        isSelected
                          ? "bg-zinc-900 text-white font-semibold shadow-2xs"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleApplyCustomPrice} className="space-y-2 pt-3 border-t border-zinc-100">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Khoảng giá tự chọn (VNĐ)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Từ giá"
                    value={customMin}
                    onChange={(e) => setCustomMin(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:bg-white focus:border-zinc-900 font-mono"
                  />
                  <input
                    type="number"
                    placeholder="Đến giá"
                    value={customMax}
                    onChange={(e) => setCustomMax(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:bg-white focus:border-zinc-900 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-3 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors shadow-2xs"
                >
                  Áp dụng giá
                </button>
              </form>
            </div>
          </aside>

          {/* CỘT PHẢI: KẾT QUẢ SẢN PHẨM & PHÂN TRANG */}
          <section className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-4 border border-zinc-200/90 shadow-2xs mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-xs text-zinc-600">
                {loading ? (
                  <span>Đang tải dữ liệu sản phẩm...</span>
                ) : (
                  <span>
                    Tìm thấy <strong className="text-zinc-900 font-bold font-mono">{meta.total}</strong> sản phẩm phù hợp
                    {querySearch && (
                      <span> cho từ khóa &quot;<strong className="text-zinc-900 font-bold">{querySearch}</strong>&quot;</span>
                    )}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs text-zinc-400 font-medium">Sắp xếp:</span>
                <select
                  value={querySort}
                  onChange={(e) => updateQuery({ sort: e.target.value })}
                  className="px-3 py-1.5 text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 outline-none focus:border-zinc-900 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="latest">Mới nhất</option>
                  <option value="price_asc">Giá: Thấp đến Cao</option>
                  <option value="price_desc">Giá: Cao đến Thấp</option>
                  <option value="name_asc">Tên: A - Z</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-4 border border-zinc-200/90 animate-pulse space-y-3"
                  >
                    <div className="h-60 bg-zinc-100 rounded-xl" />
                    <div className="h-4 bg-zinc-100 rounded w-3/4" />
                    <div className="h-4 bg-zinc-100 rounded w-1/2" />
                    <div className="h-8 bg-zinc-100 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200/90 shadow-2xs">
                <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 mx-auto mb-3 flex items-center justify-center">
                  <FilterIcon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 mb-1">
                  Không tìm thấy sản phẩm phù hợp
                </h3>
                <p className="text-xs text-zinc-500 mb-4 max-w-sm mx-auto">
                  Hãy thử bỏ bớt bộ lọc thương hiệu, danh mục hoặc mở rộng khoảng giá tìm kiếm.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors shadow-2xs"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map((item) => {
                  const finalPrice =
                    item.sale_price && Number(item.sale_price) > 0
                      ? Number(item.sale_price)
                      : Number(item.price);
                  const isSale =
                    item.sale_price &&
                    Number(item.sale_price) > 0 &&
                    Number(item.sale_price) < Number(item.price);
                  const discountPercent = isSale
                    ? Math.round(((Number(item.price) - finalPrice) / Number(item.price)) * 100)
                    : 0;

                  const pImg = item.image
                    ? item.image.startsWith("http")
                      ? item.image
                      : `http://localhost:8000${item.image.startsWith("/") ? "" : "/"}${item.image}`
                    : FALLBACK_IMAGE;

                  return (
                    <div
                      key={item.id}
                      className="group bg-white rounded-2xl p-4 border border-zinc-200/90 hover:border-zinc-900 hover:shadow-2xs transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-60 w-full bg-zinc-50 overflow-hidden border-b border-zinc-100 flex items-center justify-center p-4 rounded-xl mb-3">
                          {isSale && (
                            <div className="absolute top-2.5 left-2.5 z-10 flex flex-col items-start gap-1">
                              <span className="px-2 py-0.5 text-[10px] font-black tracking-wider uppercase rounded-md bg-rose-600 text-white shadow-2xs">
                                -{discountPercent}%
                              </span>
                            </div>
                          )}

                          {item.sku && (
                            <span className="absolute top-2.5 right-2.5 z-10 font-mono text-[10px] text-zinc-400 uppercase bg-white/80 px-1.5 py-0.5 rounded backdrop-blur-xs">
                              {item.sku}
                            </span>
                          )}

                          <Link href={`/products/${item.id}`} className="w-full h-full flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={pImg}
                              alt={item.name}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = FALLBACK_IMAGE;
                              }}
                              className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                            />
                          </Link>
                        </div>

                        <div className="space-y-1 mb-3">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 font-mono truncate">
                            {item.brand?.name || "BẢO CÔNG"} • {item.category?.name || "THIẾT BỊ"}
                          </div>

                          <Link
                            href={`/products/${item.id}`}
                            className="block font-bold text-sm text-zinc-900 group-hover:text-zinc-600 transition-colors line-clamp-2 min-h-[2.5rem]"
                          >
                            {item.name}
                          </Link>

                          <div className="mt-2 flex items-baseline gap-2">
                            <span className="font-extrabold text-base text-zinc-900 font-mono tabular-nums">
                              {formatPrice(finalPrice)}
                            </span>
                            {isSale && (
                              <span className="text-xs text-zinc-400 line-through font-mono tabular-nums">
                                {formatPrice(item.price)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-zinc-100">
                        <Link
                          href={`/products/${item.id}`}
                          className="text-center border border-zinc-200 hover:bg-zinc-100 text-zinc-900 rounded-lg py-1.5 text-xs font-semibold transition"
                        >
                          Chi tiết
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleAddToCart(item)}
                          disabled={(item.stock ?? 1) <= 0}
                          className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg py-1.5 text-xs font-semibold flex items-center justify-center gap-1 transition shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <PlusIcon className="w-3.5 h-3.5" />
                          <span>+ Giỏ hàng</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {meta.lastPage > 1 && (
              <div className="mt-8 flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  disabled={meta.currentPage <= 1}
                  onClick={() => updateQuery({ page: meta.currentPage - 1 })}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                >
                  <ChevronLeftIcon className="w-3.5 h-3.5" />
                  <span>Trang trước</span>
                </button>

                {Array.from({ length: meta.lastPage }).map((_, idx) => {
                  const pNum = idx + 1;
                  const isCurrent = pNum === meta.currentPage;

                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => updateQuery({ page: pNum })}
                      className={`w-9 h-9 text-xs font-bold rounded-xl transition-all ${
                        isCurrent
                          ? "bg-zinc-900 text-white shadow-2xs"
                          : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={meta.currentPage >= meta.lastPage}
                  onClick={() => updateQuery({ page: meta.currentPage + 1 })}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                >
                  <span>Trang sau</span>
                  <ChevronRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center text-xs text-zinc-500">
          Đang nạp hệ thống sản phẩm...
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
