"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosClient from "@/services/axiosClient";
import { Brand, Category, Product, UserInfo, money, setToken, clearToken } from "@/lib/api";

const TOKEN_KEY = "access_token";

export default function HomePage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
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
    setTimeout(() => setToast(null), 2500);
  }, []);

  /* Tải sản phẩm, thương hiệu, danh mục từ API thật */
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
        setError("Không thể kết nối đến máy chủ API. Vui lòng kiểm tra lại backend.");
      })
      .finally(() => setLoading(false));
  }, []);

  /* Đọc token, lấy thông tin user và giỏ hàng */
  const loadAccount = useCallback(async () => {
    try {
      const [uRes, cRes]: any[] = await Promise.all([
        axiosClient.get("/user"),
        axiosClient.get("/cart"),
      ]);
      const userData = uRes?.user || uRes?.data || uRes;
      setUser(userData);

      const items = cRes?.cart?.items || [];
      const total = items.reduce((s: number, i: any) => s + (Number(i.quantity) || 1), 0);
      setCartCount(total);
    } catch (err: any) {
      if (err?.status === 401) {
        clearToken();
        setTokenState(null);
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("token") || localStorage.getItem(TOKEN_KEY);
      if (t) {
        setTokenState(t);
        loadAccount();
      }
    }
  }, [loadAccount]);

  /* Thêm sản phẩm vào giỏ hàng qua axiosClient */
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
      showToast(`Đã thêm ${p.name} vào giỏ hàng!`);
    } catch (err: any) {
      if (err?.status === 401) {
        router.push("/login");
      } else {
        showToast(err.message || "Không thể thêm sản phẩm vào giỏ", false);
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
    setTokenState(null);
    setUser(null);
    setCartCount(0);
    showToast("Đã đăng xuất");
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

  /* Lọc và sắp xếp */
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = products.filter((p) => {
      const matchStatus = p.status !== 0;
      const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q));
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

  const chipCls = (active: boolean) =>
    `shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-all focus:outline-none ${
      active
        ? "border-slate-900 bg-slate-900 text-white shadow-sm"
        : "border-slate-300 bg-white text-slate-700 hover:border-slate-900"
    }`;

  return (
    <div className="min-h-screen bg-[#F1F4F2] text-slate-900 flex flex-col font-sans">
      {/* ---------- Header Navigation ---------- */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link href="/" className="text-xl font-extrabold tracking-tight">
            Bảo Công <span className="text-blue-600">Mobile</span>
          </Link>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm điện thoại theo tên, mã SKU…"
            aria-label="Tìm kiếm sản phẩm"
            className="hidden min-w-0 flex-1 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-600 focus:bg-white transition-all sm:block"
          />

          <nav className="ml-auto flex items-center gap-3 text-sm font-medium">
            {user?.role && ["admin", "manager"].includes(user.role) && (
              <Link
                href="/admin"
                className="rounded-full bg-amber-100 px-3.5 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-200 transition-colors"
              >
                Trang Quản trị
              </Link>
            )}

            {token ? (
              <>
                <Link href="/profile" className="hidden text-slate-700 hover:text-blue-600 md:inline">
                  Chào, <b>{user?.name ?? "Khách hàng"}</b>
                </Link>
                <Link href="/orders" className="text-slate-700 hover:text-blue-600">
                  Đơn hàng
                </Link>
                <button onClick={logout} className="text-slate-600 hover:text-red-600">
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-slate-700 hover:text-blue-600">
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-blue-600 px-4 py-1.5 text-white hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Đăng ký
                </Link>
              </>
            )}

            <Link
              href="/cart"
              className="relative flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 hover:border-slate-900 transition-colors"
            >
              <span>Giỏ hàng</span>
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-xs font-bold text-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>
        </div>

        {/* Mobile Search Bar */}
        <div className="px-4 pb-3 sm:hidden">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm điện thoại theo tên…"
            className="w-full rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-600"
          />
        </div>
      </header>

      {/* ---------- Main Content ---------- */}
      <main className="mx-auto max-w-6xl flex-1 px-4 py-8 w-full">
        {/* Banner Section */}
        <section className="rounded-3xl bg-slate-900 px-6 py-10 text-white sm:px-10 shadow-lg">
          <span className="inline-block rounded-full bg-blue-600/30 text-blue-400 px-3 py-1 text-xs font-bold uppercase tracking-wider mb-3">
            Hàng chính hãng 100%
          </span>
          <h1 className="max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl">
            Điện thoại chính hãng, giá cạnh tranh, giao hàng toàn quốc.
          </h1>
          <p className="mt-3 max-w-lg text-slate-300 text-sm sm:text-base">
            Dữ liệu trực tiếp từ cơ sở dữ liệu hệ thống. Xem thông tin chi tiết, khuyến mãi và đặt hàng ngay lập tức.
          </p>
        </section>

        {/* Filters Section */}
        <section className="mt-8 space-y-4" aria-label="Bộ lọc sản phẩm">
          {/* Brands Filter */}
          <div>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Thương hiệu</h2>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button className={chipCls(brandId === null)} onClick={() => setBrandId(null)}>
                Tất cả
              </button>
              {brands.map((b) => (
                <button key={b.id} className={chipCls(brandId === b.id)} onClick={() => setBrandId(b.id)}>
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Filter */}
          {categories.length > 0 && (
            <div>
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Danh mục sản phẩm</h2>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button className={chipCls(categoryId === null)} onClick={() => setCategoryId(null)}>
                  Tất cả
                </button>
                {categories.map((c) => (
                  <button key={c.id} className={chipCls(categoryId === c.id)} onClick={() => setCategoryId(c.id)}>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sort & Count Bar */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-sm font-medium text-slate-600">
              {loading ? "Đang tải dữ liệu từ máy chủ…" : `${visible.length} sản phẩm có sẵn`}
            </p>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-slate-600 font-medium">Sắp xếp:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-600 shadow-sm"
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
              </select>
            </label>
          </div>
        </section>

        {/* Product Grid */}
        <section className="mt-6">
          {error && (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
              <p className="font-bold">Lỗi kết nối:</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-200" />
              ))}
            </div>
          )}

          {!loading && !error && visible.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="text-lg font-bold text-slate-800">Không tìm thấy sản phẩm phù hợp</p>
              <p className="mt-1 text-sm text-slate-500">Hãy thử đổi từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc thương hiệu/danh mục.</p>
              <button
                onClick={() => {
                  setSearch("");
                  setBrandId(null);
                  setCategoryId(null);
                }}
                className="mt-4 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {visible.map((p) => {
              const discount = getDiscountPercent(p);
              const final = getFinalPrice(p);
              const outOfStock = (p.stock ?? 1) <= 0;

              return (
                <article
                  key={p.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Product Image Link */}
                  <Link href={`/products/${p.id}`} className="relative grid aspect-square place-items-center bg-slate-50 p-4 overflow-hidden">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image.startsWith("http") ? p.image : `http://localhost:8000/images/${p.image}`}
                        alt={p.name}
                        loading="lazy"
                        className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">Chưa có ảnh</span>
                    )}

                    {discount > 0 && (
                      <span className="absolute left-3 top-3 rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                        -{discount}%
                      </span>
                    )}
                    {p.featured && (
                      <span className="absolute right-3 top-3 rounded-md bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-950 shadow-sm">
                        Nổi bật
                      </span>
                    )}
                  </Link>

                  {/* Product Details */}
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-xs font-medium text-slate-500">
                      {p.brand?.name ?? (p.category?.name || "Điện thoại")}
                    </p>
                    <Link href={`/products/${p.id}`}>
                      <h3 className="mt-1 line-clamp-2 min-h-[2.75rem] font-bold text-sm leading-snug hover:text-blue-600 transition-colors">
                        {p.name}
                      </h3>
                    </Link>

                    <div className="mt-2.5">
                      <p className="text-base font-extrabold text-red-600">{money(final)}</p>
                      {discount > 0 && (
                        <p className="text-xs text-slate-400 line-through">{money(p.price)}</p>
                      )}
                    </div>

                    <p className={`mt-1 text-xs font-medium ${outOfStock ? "text-red-600" : "text-emerald-700"}`}>
                      {outOfStock ? "Tạm hết hàng" : p.stock !== undefined ? `Còn ${p.stock} máy` : "Còn hàng"}
                    </p>

                    <div className="mt-4 pt-2 border-t border-slate-100 flex gap-2">
                      <Link
                        href={`/products/${p.id}`}
                        className="flex-1 rounded-xl border border-slate-300 bg-white py-2 text-center text-xs font-semibold text-slate-700 hover:border-slate-900 transition-colors"
                      >
                        Chi tiết
                      </Link>
                      <button
                        onClick={() => addToCart(p)}
                        disabled={outOfStock || addingId === p.id}
                        className="flex-1 rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 shadow-sm"
                      >
                        {outOfStock ? "Hết hàng" : addingId === p.id ? "Đang thêm…" : "+ Giỏ hàng"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <p className="font-medium">© {new Date().getFullYear()} Bảo Công Mobile - Đồ án Thực hành lập trình web.</p>
        <p className="mt-1 text-[11px] text-slate-400">Kết nối trực tiếp Database MySQL & Laravel REST API.</p>
      </footer>

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-xl transition-all ${
            toast.ok ? "bg-slate-900" : "bg-red-600"
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}
