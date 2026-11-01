"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosClient from "@/services/axiosClient";
import { Brand, Category, Product, UserInfo, money, clearToken } from "@/lib/api";
import StoreHeader from "@/components/StoreHeader";
import {
  BrandLogoIcon,
  SearchIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  SlidersIcon,
  ShieldCheckIcon,
  BoltIcon,
  RefreshCwIcon,
  AwardIcon,
  PlusIcon,
  CheckIcon,
  ArrowUpRightIcon,
  CreditCardIcon,
  AlertCircleIcon,
  XIcon,
} from "@/components/Icons";

const TOKEN_KEY = "access_token";
const FALLBACK_IMAGE = "/images/default-phone.svg";

export default function TrangChuPage() {
  const router = useRouter();

  // Khắc phục triệt để lỗi Hydration bằng cờ isMounted
  const [isMounted, setIsMounted] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [brandId, setBrandId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [sort, setSort] = useState<"newest" | "price-asc" | "price-desc">("newest");

  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);

  const showToast = useCallback((text: string, ok = true) => {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Chỉ đọc thông tin từ localStorage sau khi component đã Mount ở Client
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

  /* Tải sản phẩm, thương hiệu, danh mục từ API */
  useEffect(() => {
    setLoading(true);
    Promise.all([
      axiosClient.get("/products?all=1"),
      axiosClient.get("/brands?all=1"),
      axiosClient.get("/categories?all=1"),
    ])
      .then(([pRes, bRes, cRes]: any[]) => {
        const prodData = pRes?.data || pRes || [];
        const brandData = bRes?.data || bRes || [];
        const catData = cRes?.data || cRes || [];

        setProducts(Array.isArray(prodData) ? prodData : []);
        setBrands(Array.isArray(brandData) ? brandData.filter((x: Brand) => x.status !== 0) : []);
        setCategories(Array.isArray(catData) ? catData.filter((x: Category) => x.status !== 0) : []);
        setError("");
      })
      .catch((err) => {
        console.error("Lỗi khi tải dữ liệu sản phẩm:", err);
        setError("Không thể kết nối đến máy chủ API. Vui lòng kiểm tra lại Backend Laravel.");
      })
      .finally(() => setLoading(false));
  }, []);

  /* Đọc thông tin user & giỏ hàng từ server nếu đã có token */
  const loadAccount = useCallback(async () => {
    try {
      const [uRes, cRes]: any[] = await Promise.all([
        axiosClient.get("/user"),
        axiosClient.get("/cart"),
      ]);
      const userData = uRes?.user || uRes?.data || uRes;
      setUser(userData);
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(userData));
      }

      const items = cRes?.cart?.items || [];
      const total = items.reduce((s: number, i: any) => s + (Number(i.quantity) || 1), 0);
      setCartCount(total);
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) {
        clearToken();
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
        }
        setTokenState(null);
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted && token) {
      loadAccount();
    }
  }, [isMounted, token, loadAccount]);

  /* Thêm sản phẩm vào giỏ hàng */
  const addToCart = async (p: Product) => {
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
      setCartCount((n) => n + 1);
      showToast(`Đã thêm "${p.name}" vào giỏ hàng thành công!`);
    } catch (err: any) {
      if (err?.status === 401) {
        router.push("/login");
      } else {
        showToast(err.message || "Không thể thêm sản phẩm vào giỏ hàng", false);
      }
    } finally {
      setAddingId(null);
    }
  };

  /* Đăng xuất */
  const logout = async () => {
    try {
      await axiosClient.post("/logout");
    } catch {}
    clearToken();
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    }
    setTokenState(null);
    setUser(null);
    setCartCount(0);
    showToast("Đã đăng xuất tài khoản thành công!");
  };

  /* Tính giá và % giảm giá */
  const getFinalPrice = (p: Product) =>
    p.sale_price && Number(p.sale_price) > 0 && Number(p.sale_price) < Number(p.price)
      ? Number(p.sale_price)
      : Number(p.price);

  const getDiscountPercent = (p: Product) => {
    const final = getFinalPrice(p);
    const orig = Number(p.price);
    return final < orig ? Math.round(((orig - final) / orig) * 100) : 0;
  };

  /* Lọc và sắp xếp sản phẩm */
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const totalStockCount = useMemo(() => {
    return products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  }, [products]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col font-sans antialiased">
      {/* Header điều hướng chuẩn 5 mục + Thanh tìm kiếm thông minh */}
      <StoreHeader />

      

      {/* =========================================================================
          3. MAIN CONTENT: BENTO TECH STORE
          ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Thông báo lỗi nếu có */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* BENTO HERO GỌN SẮC NÉT (LƯỚI 12 CỘT CHỈ CAO VỪA TẦM MẮT) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Khối Trái (8 cột) - Card tối màu Flagship sắc nét */}
          <div className="lg:col-span-8 bg-zinc-900 text-white rounded-2xl p-6 lg:p-8 relative overflow-hidden border border-zinc-800 bg-grid-tech flex flex-col justify-between min-h-[260px]">
            <div className="relative z-10 space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-zinc-800 border border-zinc-700/80 px-2.5 py-1 rounded-md text-[11px] font-mono tracking-wide text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>FLASHSALE 2026 • CHÍNH HÃNG</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Thế hệ Smartphone mới nhất. <br />
                <span className="text-zinc-400 font-medium text-xl sm:text-2xl">
                  Hiệu năng bứt phá, giá niêm yết minh bạch.
                </span>
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Đồng bộ trực tiếp từ cơ sở dữ liệu hệ thống. Bảo hành chính hãng 12 tháng tại các trung tâm ủy quyền toàn quốc.
              </p>
            </div>

            <div className="relative z-10 pt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("catalog-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-white hover:bg-zinc-100 text-zinc-950 font-semibold px-4 py-2.5 rounded-lg text-xs transition"
              >
                Khám phá danh mục
              </button>
              {isMounted && user?.role === "admin" && (
                <Link
                  href="/admin/don-hang"
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-4 py-2.5 rounded-lg text-xs border border-zinc-700 transition flex items-center gap-1.5"
                >
                  <span>Bảng điều khiển Admin</span>
                  <ArrowUpRightIcon className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {/* Subtle decorative glow */}
            <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          </div>

          {/* Khối Phải (4 cột) - 2 Thẻ xếp dọc */}
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {/* Thẻ 1: Ưu đãi trả góp 0% */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
                  <CreditCardIcon className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-zinc-900 mt-2">Trả góp 0% Lãi suất</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Hỗ trợ qua thẻ tín dụng và đối tác tài chính, xét duyệt hồ sơ trực tuyến trong 5 phút.
                </p>
              </div>
              <div className="pt-3 border-t border-zinc-100 text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                <span>Xem điều kiện áp dụng</span>
                <ArrowUpRightIcon className="w-3 h-3" />
              </div>
            </div>

            {/* Thẻ 2: Thống kê kho hàng thực tế */}
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
              <div className="pt-3 border-t border-zinc-100 text-[11px] text-zinc-500 font-mono">
                Cập nhật tức thời từ MySQL
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. THANH BỘ LỌC HỢP NHẤT (UNIFIED FILTER TOOLBAR)
            ========================================================================= */}
        <section
          id="catalog-section"
          className="bg-white border border-zinc-200 rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3"
        >
          {/* Bên trái: Danh mục dạng Segmented Control */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setCategoryId(null)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                categoryId === null
                  ? "bg-white text-zinc-900 shadow-xs"
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
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Ở giữa: Dải lọc Thương hiệu dạng Chip viền mảnh */}
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

          {/* Bên phải: Bộ đếm & Dropdown Sắp xếp */}
          <div className="flex items-center gap-3 shrink-0 ml-auto">
            <span className="text-xs text-zinc-500 font-mono tabular-nums">
              <b>{visible.length}</b> sản phẩm
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-medium rounded-lg px-2.5 py-1.5 outline-none focus:border-zinc-900 cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
            </select>
          </div>
        </section>

        {/* =========================================================================
            5. PRODUCT GRID (CARD CHUẨN FLAGSHIP STORE)
            ========================================================================= */}
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
                  {/* Khung ảnh nền trắng xám nhẹ */}
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

                  {/* Phần thân thẻ */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      {/* Meta: Thương hiệu • Danh mục */}
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">
                        {product.brand?.name || "CHÍNH HÃNG"} • {product.category?.name || "ĐIỆN THOẠI"}
                      </div>

                      {/* Tên sản phẩm */}
                      <Link href={`/products/${product.id}`} className="block mt-1">
                        <h3 className="font-bold text-zinc-900 text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[2.5rem]">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Giá bán & Trạng thái tồn kho */}
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

                    {/* Chân thẻ: Nút Chi tiết & Thêm vào giỏ */}
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
                        className="bg-zinc-900 hover:bg-blue-600 text-white rounded-lg py-1.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1 disabled:opacity-60"
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

      {/* =========================================================================
          6. FOOTER SWISS TECH MINIMALIST
          ========================================================================= */}
      <footer className="mt-auto border-t border-zinc-200 bg-white text-zinc-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BrandLogoIcon className="w-5 h-5 text-zinc-900" />
                <span className="font-extrabold text-sm text-zinc-900">BẢO CÔNG STUDIO</span>
              </div>
              <p className="text-zinc-500 text-[11px] leading-relaxed">
                Hệ sinh thái thiết bị di động chính hãng, cam kết chất lượng, bảo hành 12 tháng minh bạch.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-zinc-900 mb-2 uppercase tracking-wider text-[11px]">Sản phẩm</h4>
              <ul className="space-y-1.5 text-zinc-500 text-[11px]">
                <li>Apple iPhone Series</li>
                <li>Samsung Galaxy Series</li>
                <li>Xiaomi Flagship</li>
                <li>Phụ kiện & Trả góp 0%</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-zinc-900 mb-2 uppercase tracking-wider text-[11px]">Chính sách</h4>
              <ul className="space-y-1.5 text-zinc-500 text-[11px]">
                <li>Bảo hành chính hãng 12 tháng</li>
                <li>Đổi mới 30 ngày lỗi nhà sản xuất</li>
                <li>Vận chuyển hỏa tốc 2 giờ</li>
                <li>Bảo mật thông tin khách hàng</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-zinc-900 mb-2 uppercase tracking-wider text-[11px]">Kỹ thuật hệ thống</h4>
              <p className="text-zinc-500 text-[11px] leading-relaxed">
                Phát triển theo kiến trúc Headless: Backend Laravel 11 REST API kết hợp Next.js 16 Client.
              </p>
              <div className="mt-2 text-[10px] font-mono text-zinc-400">
                STATUS: DIRECT CONNECT OK
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-100 flex flex-wrap items-center justify-between text-zinc-400 text-[11px]">
            <div>© 2026 Bảo Công Studio. Đồ án Thực hành lập trình web.</div>
            <div className="font-mono">SWISS BENTO TECH UI</div>
          </div>
        </div>
      </footer>

      {/* Modern Toast Notification */}
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
