"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axiosClient from "@/services/axiosClient";
import StoreHeader from "@/components/StoreHeader";
import {
  FilterIcon,
  TagIcon,
  GridIcon,
  ShoppingBagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
  CheckIcon,
} from "@/components/Icons";

interface Product {
  id: number;
  name: string;
  slug?: string;
  sku?: string;
  price: number | string;
  sale_price?: number | string | null;
  image?: string;
  category_id?: number;
  brand_id?: number;
  category?: { id: number; name: string };
  brand?: { id: number; name: string };
  stock?: number;
  created_at?: string;
}

interface Category {
  id: number;
  name: string;
  slug?: string;
  products_count?: number;
}

interface Brand {
  id: number;
  name: string;
  slug?: string;
  products_count?: number;
}

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

  // Đọc các tham số tìm kiếm từ URL
  const querySearch = searchParams.get("search") || "";
  const queryCategory = searchParams.get("category_id") || "";
  const queryBrand = searchParams.get("brand_id") || "";
  const queryType = searchParams.get("type") || "all";
  const queryMinPrice = searchParams.get("min_price") || "";
  const queryMaxPrice = searchParams.get("max_price") || "";
  const querySort = searchParams.get("sort") || "latest";
  const queryPage = parseInt(searchParams.get("page") || "1", 10);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 9,
  });

  // State cục bộ cho khoảng giá tùy chỉnh
  const [customMin, setCustomMin] = useState(queryMinPrice);
  const [customMax, setCustomMax] = useState(queryMaxPrice);
  const [toastMsg, setToastMsg] = useState("");

  // Tải danh mục và thương hiệu thật từ Database
  useEffect(() => {
    Promise.all([
      axiosClient.get("/categories?all=1"),
      axiosClient.get("/brands?all=1"),
    ])
      .then(([catRes, brandRes]: any) => {
        setCategories(Array.isArray(catRes) ? catRes : catRes?.data || []);
        setBrands(Array.isArray(brandRes) ? brandRes : brandRes?.data || []);
      })
      .catch((err) => {
        console.error("Lỗi tải danh mục / thương hiệu:", err);
      });
  }, []);

  // [THUẬT TOÁN TẢI DỮ LIỆU SẢN PHẨM PHÂN TRANG VÀ LỌC ĐA TIÊU CHÍ]:
  // Gửi request kèm đầy đủ tham số tìm kiếm, danh mục, hãng, khoảng giá, loại (sale/mới) và sắp xếp.
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
    params.append("page", queryPage.toString());
    params.append("per_page", "9");

    axiosClient
      .get(`/products?${params.toString()}`)
      .then((res: any) => {
        const items = Array.isArray(res) ? res : res?.data || [];
        setProducts(items);

        // Đọc thông tin phân trang chuẩn Laravel
        const cur = res?.meta?.current_page || res?.current_page || 1;
        const last = res?.meta?.last_page || res?.last_page || 1;
        const tot = res?.meta?.total || res?.total || items.length;
        setMeta({
          currentPage: cur,
          lastPage: last,
          total: tot,
          perPage: 9,
        });
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

  // Cập nhật URL khi người dùng thay đổi bộ lọc
  const updateQuery = (newParams: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "" || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value.toString());
      }
    });

    // Reset về trang 1 nếu đổi tiêu chí lọc (trừ khi đang chuyển trang)
    if (!("page" in newParams)) {
      params.delete("page");
    }

    router.push(`/products?${params.toString()}`);
  };

  const handleApplyCustomPrice = (e: React.FormEvent) => {
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

  const handleAddToCart = async (product: Product) => {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("token") || localStorage.getItem("access_token")
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
      setToastMsg(`Đã thêm ${product.name} vào giỏ hàng!`);
      setTimeout(() => setToastMsg(""), 3000);
    } catch (err: any) {
      if (err?.status === 401) {
        router.push("/login");
      } else {
        alert(err.message || "Không thể thêm sản phẩm vào giỏ hàng");
      }
    }
  };

  const formatPrice = (p: number | string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(p) || 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <StoreHeader />

      {/* Toast thông báo */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm border border-slate-700 animate-in slide-in-from-bottom duration-200">
          <CheckIcon className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb & Tiêu đề trang */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Link href="/trangchu" className="hover:text-blue-600 transition-colors">
                Trang chủ
              </Link>
              <span>/</span>
              <span className="text-slate-700 font-medium">Sản phẩm</span>
              {queryType === "sale" && (
                <>
                  <span>/</span>
                  <span className="text-rose-600 font-semibold">Khuyến mãi Hot</span>
                </>
              )}
              {queryType === "new" && (
                <>
                  <span>/</span>
                  <span className="text-blue-600 font-semibold">Sản phẩm mới</span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {queryType === "sale"
                ? "Sản Phẩm Đang Giảm Giá Hot"
                : queryType === "new"
                ? "Sản Phẩm Mới Nhất 2026"
                : "Tất Cả Sản Phẩm Chính Hãng"}
            </h1>
          </div>

          {/* Tag lọc đang áp dụng */}
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

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* CỘT TRÁI: SIDEBAR BỘ LỌC */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Box 1: Menu Danh mục sản phẩm */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
                <GridIcon className="w-4 h-4 text-blue-600" />
                <span>Danh mục sản phẩm</span>
              </div>
              <ul className="space-y-1">
                <li>
                  <button
                    type="button"
                    onClick={() => updateQuery({ category_id: null })}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-all ${
                      !queryCategory
                        ? "bg-blue-50 text-blue-600 font-bold"
                        : "text-slate-600 hover:bg-slate-50"
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
                          ? "bg-blue-50 text-blue-600 font-bold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      {typeof cat.products_count === "number" && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-mono">
                          {cat.products_count}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Box 2: Thương hiệu */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
                <TagIcon className="w-4 h-4 text-blue-600" />
                <span>Thương hiệu</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateQuery({ brand_id: null })}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    !queryBrand
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
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
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Box 3: Lọc khoảng giá */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
                <FilterIcon className="w-4 h-4 text-blue-600" />
                <span>Khoảng giá</span>
              </div>

              {/* Các mức chọn nhanh */}
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
                          ? "bg-blue-50 text-blue-600 font-bold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Nhập khoảng giá tùy chỉnh */}
              <form onSubmit={handleApplyCustomPrice} className="space-y-2 pt-3 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Khoảng giá tự chọn (VNĐ)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Từ giá"
                    value={customMin}
                    onChange={(e) => setCustomMin(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600"
                  />
                  <input
                    type="number"
                    placeholder="Đến giá"
                    value={customMax}
                    onChange={(e) => setCustomMax(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Áp dụng giá
                </button>
              </form>
            </div>
          </aside>

          {/* CỘT PHẢI: KẾT QUẢ SẢN PHẨM & PHÂN TRANG */}
          <section className="lg:col-span-3">
            {/* Top Toolbar: Đếm số lượng + Sắp xếp */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-slate-600">
                {loading ? (
                  <span>Đang tải dữ liệu...</span>
                ) : (
                  <span>
                    Tìm thấy <strong className="text-slate-900 font-bold">{meta.total}</strong> sản phẩm phù hợp
                    {querySearch && (
                      <span> cho từ khóa &quot;<strong className="text-blue-600">{querySearch}</strong>&quot;</span>
                    )}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs text-slate-400 font-medium">Sắp xếp:</span>
                <select
                  value={querySort}
                  onChange={(e) => updateQuery({ sort: e.target.value })}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="latest">Mới nhất</option>
                  <option value="price_asc">Giá: Thấp đến Cao</option>
                  <option value="price_desc">Giá: Cao đến Thấp</option>
                  <option value="name_asc">Tên: A - Z</option>
                </select>
              </div>
            </div>

            {/* Lưới sản phẩm */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-4 border border-slate-200/80 animate-pulse space-y-3"
                  >
                    <div className="h-60 bg-slate-100 rounded-xl" />
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                    <div className="h-8 bg-slate-100 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto mb-3 flex items-center justify-center">
                  <FilterIcon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  Không tìm thấy sản phẩm phù hợp
                </h3>
                <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                  Hãy thử bỏ bớt bộ lọc thương hiệu, danh mục hoặc mở rộng khoảng giá tìm kiếm.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
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
                  const savedAmount = isSale ? Number(item.price) - finalPrice : 0;

                  return (
                    <div
                      key={item.id}
                      className="group bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Ảnh sản phẩm + Badge */}
                        <div className="relative h-60 w-full bg-zinc-50 overflow-hidden border-b border-zinc-100 flex items-center justify-center p-4 rounded-xl mb-3">
                          {isSale && (
                            <div className="absolute top-2.5 left-2.5 z-10 flex flex-col items-start gap-1">
                              <span className="px-2 py-0.5 text-[10px] font-black tracking-wider uppercase rounded-md bg-rose-500 text-white shadow-xs">
                                -{discountPercent}%
                              </span>
                              <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                Tiết kiệm {formatPrice(savedAmount)}
                              </span>
                            </div>
                          )}

                          <Link href={`/products/${item.id}`} className="w-full h-full flex items-center justify-center">
                            {item.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <span className="text-xs text-slate-400 font-mono">Chưa có ảnh</span>
                            )}
                          </Link>
                        </div>

                        {/* Thông tin sản phẩm */}
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>{item.brand?.name || "Bảo Công Mobile"}</span>
                            {item.sku && <span className="font-mono">SKU: {item.sku}</span>}
                          </div>

                          <Link
                            href={`/products/${item.id}`}
                            className="block font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2"
                          >
                            {item.name}
                          </Link>
                        </div>
                      </div>

                      {/* Giá & Nút hành động */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-base font-black text-blue-600 leading-tight">
                            {formatPrice(finalPrice)}
                          </div>
                          {isSale && (
                            <div className="text-xs text-slate-400 line-through">
                              {formatPrice(item.price)}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAddToCart(item)}
                            className="p-2 text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-xl transition-colors"
                            title="Thêm vào giỏ"
                          >
                            <ShoppingBagIcon className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/products/${item.id}`}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-white bg-slate-100 hover:bg-slate-900 rounded-xl transition-colors"
                          >
                            Chi tiết
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* THANH PHÂN TRANG (PAGINATION) */}
            {meta.lastPage > 1 && (
              <div className="mt-8 flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  disabled={meta.currentPage <= 1}
                  onClick={() => updateQuery({ page: meta.currentPage - 1 })}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
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
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
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
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                >
                  <span>Trang sau</span>
                  <ChevronRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">
          Đang nạp hệ thống sản phẩm...
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
