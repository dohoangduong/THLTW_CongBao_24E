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
  BookOpenIcon,
  ClockIcon,
  EyeIcon,
  TrendingUpIcon,
  SmartphoneIcon,
  GridIcon,
  AwardIcon,
} from "@/components/Icons";

const TOKEN_KEY = "access_token";
const FALLBACK_IMAGE = "/images/default-phone.svg";

export default function TrangChuPage() {
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [brandId, setBrandId] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [sort, setSort] = useState("newest");
  const [productTab, setProductTab] = useState("all"); // 'all', 'new', 'bestseller'

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
      axiosClient.get("/banners"),
      axiosClient.get("/posts?per_page=3"),
    ])
      .then(([pRes, bRes, cRes, bannerRes, postRes]) => {
        const prodData = pRes?.data || pRes || [];
        const brandData = bRes?.data || bRes || [];
        const catData = cRes?.data || cRes || [];
        const bannerData = bannerRes?.data || [];
        const postData = postRes?.data || [];

        setProducts(Array.isArray(prodData) ? prodData : []);
        setBrands(Array.isArray(brandData) ? brandData.filter((x) => x.status !== 0) : []);
        setCategories(Array.isArray(catData) ? catData.filter((x) => x.status !== 0) : []);
        setBanners(Array.isArray(bannerData) ? bannerData : []);
        setLatestPosts(Array.isArray(postData) ? postData : []);
        setError("");
      })
      .catch((err) => {
        console.error("Lỗi khi tải dữ liệu trang chủ:", err);
        setError("Không thể kết nối đến máy chủ API. Vui lòng kiểm tra lại dịch vụ Backend.");
      })
      .finally(() => setLoading(false));
  }, []);

  // [THUẬT TOÁN KIỂM TRA TỒN KHO KHI THÊM GIỎ (FUNC-CART-01)]:
  const addToCart = async (p) => {
    if (!token) {
      router.push("/login");
      return;
    }

    if (Number(p.stock) <= 0) {
      showToast(`Sản phẩm «${p.name}» hiện đã hết hàng trong kho!`, false);
      return;
    }

    setAddingId(p.id);
    try {
      await axiosClient.post("/cart/add", {
        product_id: p.id,
        quantity: 1,
      });
      showToast(`Đã thêm «${p.name}» vào giỏ hàng thành công!`);
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

  // Tách Banners từ Database
  const heroBanner = useMemo(() => {
    return banners.find((b) => b.position === "main_hero") || banners[0] || null;
  }, [banners]);

  const subBanners = useMemo(() => {
    return banners.filter((b) => b.position === "sub_banner");
  }, [banners]);

  // Sản phẩm Mới Nhất (Top 4)
  const newestProducts = useMemo(() => {
    return [...products]
      .filter((p) => p.status !== 0)
      .sort((a, b) => b.id - a.id)
      .slice(0, 4);
  }, [products]);

  // Sản phẩm Bán Chạy Nhất (Top 4 theo lượt xem hoặc giá ưu đãi)
  const bestSellerProducts = useMemo(() => {
    return [...products]
      .filter((p) => p.status !== 0)
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 4);
  }, [products]);

  // Lọc danh sách sản phẩm chung
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = products.filter((p) => {
      const matchStatus = p.status !== 0;
      const matchSearch =
        !q || p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q));
      const matchBrand = brandId === null || (p.brand?.id ?? p.brand_id) === brandId;
      const matchCat = categoryId === null || (p.category?.id ?? p.category_id) === categoryId;
      return matchStatus && matchSearch && matchBrand && matchCat;
    });

    if (productTab === "new") {
      list.sort((a, b) => b.id - a.id);
    } else if (productTab === "bestseller") {
      list.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else {
      if (sort === "price-asc") {
        list.sort((a, b) => getFinalPrice(a) - getFinalPrice(b));
      } else if (sort === "price-desc") {
        list.sort((a, b) => getFinalPrice(b) - getFinalPrice(a));
      } else {
        list.sort((a, b) => b.id - a.id);
      }
    }
    return list;
  }, [products, search, brandId, categoryId, sort, productTab]);

  const totalStockCount = useMemo(() => {
    return products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  }, [products]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col font-sans antialiased">
      <StoreHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* =========================================================================
            KHỐI 1: BANNER TRANG CHỦ ĐỘNG TỪ BẢNG `banners` (FUNC-HOME-01)
            ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Hero Banner */}
          <div className="lg:col-span-8 bg-zinc-900 text-white rounded-2xl p-6 lg:p-8 relative overflow-hidden border border-zinc-800 flex flex-col justify-between min-h-[300px] shadow-2xs">
            {heroBanner?.image && (
              <div className="absolute inset-0 z-0 opacity-20 hover:opacity-25 transition-opacity">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroBanner.image}
                  alt={heroBanner.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="relative z-10 space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-zinc-800/90 border border-zinc-700/80 px-2.5 py-1 rounded-md text-[11px] font-mono tracking-wide text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{heroBanner?.badge_text || "FLAGSHIP CHÍNH HÃNG 2026"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                {heroBanner?.title || "iPhone 16 Pro Max - Vươn Tầm Đẳng Cấp Titan Sa Mạc"}
              </h1>
              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                {heroBanner?.subtitle ||
                  "Trang bị chip A18 Pro 3nm vượt trội, Camera Fusion 48MP và chính sách bảo hành 1 đổi 1 trong 30 ngày."}
              </p>
            </div>

            <div className="relative z-10 pt-6 flex flex-wrap items-center gap-3">
              <Link
                href={heroBanner?.link_url || "/products"}
                className="bg-white hover:bg-zinc-100 text-zinc-950 font-bold px-4 py-2.5 rounded-lg text-xs transition shadow-2xs"
              >
                {heroBanner?.button_text || "Khám phá ngay"}
              </Link>
              {isMounted && user?.role === "admin" && (
                <Link
                  href="/admin/banner"
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-4 py-2.5 rounded-lg text-xs border border-zinc-700 transition flex items-center gap-1.5 shadow-2xs"
                >
                  <span>Quản lý Banner (Admin)</span>
                  <ArrowUpRightIcon className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* Sub Banners & Thống kê Kho hàng */}
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {subBanners.length > 0 ? (
              subBanners.slice(0, 2).map((sb) => (
                <div
                  key={sb.id}
                  className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between shadow-2xs relative overflow-hidden"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                      {sb.badge_text || "ƯU ĐÃI"}
                    </span>
                    <h4 className="font-bold text-sm text-zinc-900 mt-2 line-clamp-1">{sb.title}</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{sb.subtitle}</p>
                  </div>
                  <div className="pt-3 border-t border-zinc-100 text-[11px] font-semibold text-zinc-900 flex items-center justify-between">
                    <Link href={sb.link_url || "/products"} className="hover:underline flex items-center gap-1">
                      <span>{sb.button_text || "Xem ngay"}</span>
                      <ArrowUpRightIcon className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
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
                <div className="pt-3 border-t border-zinc-100 text-[11px] font-semibold text-zinc-900">
                  <Link href="/ho-tro" className="hover:underline flex items-center gap-1">
                    <span>Xem điều kiện áp dụng</span>
                    <ArrowUpRightIcon className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}

            {/* Thẻ Kho Hàng */}
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
              <div className="pt-3 border-t border-zinc-100 text-[11px] text-zinc-500 flex justify-between items-center">
                <span>Giao hàng 2h nội thành</span>
                <span className="font-mono font-bold text-emerald-600">Free ship 5tr+</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            KHỐI 2: DANH MỤC NỔI BẬT (FEATURED CATEGORIES KÈM SỐ LƯỢNG)
            ========================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GridIcon className="w-4 h-4 text-zinc-900" />
              <h2 className="font-extrabold text-base sm:text-lg text-zinc-900 tracking-tight">
                Danh Mục Nổi Bật
              </h2>
            </div>
            <Link href="/products" className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition">
              Tất cả danh mục →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const count = products.filter((p) => (p.category?.id ?? p.category_id) === cat.id).length;
              const isSelected = categoryId === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategoryId(isSelected ? null : cat.id);
                    const el = document.getElementById("catalog-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all group ${
                    isSelected
                      ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                      : "bg-white text-zinc-800 border-zinc-200/90 hover:border-zinc-400 hover:shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isSelected ? "text-zinc-400" : "text-zinc-400"
                    }`}>
                      DANH MỤC
                    </span>
                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? "bg-zinc-800 text-white" : "bg-zinc-100 text-zinc-700"
                    }`}>
                      {count} máy
                    </span>
                  </div>
                  <h3 className="font-bold text-sm mt-3 line-clamp-1">{cat.name}</h3>
                  <p className={`text-[11px] mt-1 line-clamp-1 ${isSelected ? "text-zinc-400" : "text-zinc-500"}`}>
                    {cat.description || "Thiết bị chính hãng"}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            KHỐI 3: SẢN PHẨM MỚI NHẤT & SẢN PHẨM BÁN CHẠY (TABS NHANH)
            ========================================================================= */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3">
            <div className="flex items-center gap-2">
              <AwardIcon className="w-4 h-4 text-zinc-900" />
              <h2 className="font-extrabold text-base sm:text-lg text-zinc-900 tracking-tight">
                Sản Phẩm Tâm Điểm
              </h2>
            </div>

            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setProductTab("all")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  productTab === "all" ? "bg-white text-zinc-950 shadow-2xs" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Tất cả ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setProductTab("new")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  productTab === "new" ? "bg-white text-zinc-950 shadow-2xs" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Sản phẩm Mới</span>
              </button>
              <button
                type="button"
                onClick={() => setProductTab("bestseller")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  productTab === "bestseller" ? "bg-white text-zinc-950 shadow-2xs" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <TrendingUpIcon className="w-3.5 h-3.5 text-rose-500" />
                <span>Bán chạy nhất</span>
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================================
            KHỐI 4: DANH SÁCH SẢN PHẨM KÈM BỘ LỌC NHANH (SEARCH, HÃNG, GIÁ)
            ========================================================================= */}
        <section
          id="catalog-section"
          className="bg-white border border-zinc-200 rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3"
        >
          {/* Bộ lọc Hãng */}
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

        {/* Lưới sản phẩm */}
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
                setBrandId(null);
                setCategoryId(null);
                setSort("newest");
                setProductTab("all");
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
                        disabled={addingId === product.id || !isAvailable}
                        onClick={() => addToCart(product)}
                        className={`rounded-lg py-1.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
                          isAvailable
                            ? "bg-zinc-900 hover:bg-zinc-800 text-white"
                            : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                        }`}
                      >
                        <PlusIcon className="w-3.5 h-3.5" />
                        <span>{addingId === product.id ? "Đang thêm..." : isAvailable ? "Giỏ hàng" : "Hết hàng"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* =========================================================================
            KHỐI 5: BÀI VIẾT CÔNG NGHỆ MỚI NHẤT & ĐÁNH GIÁ (FUNC-HOME-01)
            ========================================================================= */}
        {latestPosts.length > 0 && (
          <section className="pt-8 border-t border-zinc-200/80 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-900 border border-zinc-200 text-[10px] font-bold uppercase tracking-wider mb-2">
                  <BookOpenIcon className="w-3.5 h-3.5" />
                  <span>Tin tức &amp; Đánh giá chuyên sâu</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
                  Chuyên Trang Công Nghệ &amp; Đánh Giá
                </h2>
                <p className="text-xs text-zinc-500 mt-1 max-w-xl">
                  Khám phá các bài đánh giá flagship chuyên sâu, mẹo sử dụng thông minh và tin tức thị trường công nghệ mới nhất từ đội ngũ Bảo Công Studio.
                </p>
              </div>

              <Link
                href="/bai-viet"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-2xs transition-all shrink-0 self-start sm:self-auto"
              >
                <span>Xem tất cả bài viết</span>
                <span className="font-bold">➔</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {latestPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/bai-viet/${post.id}`}
                  className="group bg-white rounded-2xl border border-zinc-200/90 overflow-hidden hover:border-zinc-900 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Ảnh bài viết */}
                    <div className="relative h-48 w-full bg-zinc-100 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.thumbnail || "/images/default-phone.svg"}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                        {post.category}
                      </span>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3 text-zinc-400" />
                          <span>{post.reading_time || "5 phút đọc"}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <EyeIcon className="w-3 h-3 text-zinc-400" />
                          <span>{post.views || 0} lượt xem</span>
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-zinc-900 group-hover:text-zinc-600 transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>

                      <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                        {post.summary}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-4 pt-1 flex items-center justify-between text-xs font-semibold text-zinc-900 group-hover:underline">
                    <span>Đọc bài viết</span>
                    <span>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
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
