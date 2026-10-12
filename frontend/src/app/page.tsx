"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ------------------------------------------------------------------ */
/* Cấu hình – sửa cho khớp dự án của bạn                               */
/* ------------------------------------------------------------------ */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";
// Key lưu access_token ở trang đăng nhập. Nếu trang login của bạn lưu tên khác, đổi ở đây.
const TOKEN_KEY = "access_token";

/* ------------------------------------------------------------------ */
/* Kiểu dữ liệu (khớp ProductResource / BrandResource / CategoryResource) */
/* ------------------------------------------------------------------ */
interface Brand {
  id: number;
  name: string;
  slug?: string;
  status?: number;
}
interface Category {
  id: number;
  name: string;
  slug?: string;
}
interface Product {
  id: number;
  name: string;
  slug?: string;
  image?: string | null;
  price: number | string;
  sale_price?: number | string | null;
  stock?: number;
  status?: number;
  featured?: boolean;
  category_id?: number;
  brand_id?: number;
  category?: Category | null;
  brand?: Brand | null;
}
interface User {
  name: string;
  role: "admin" | "customer";
}

type SortKey = "newest" | "price-asc" | "price-desc";

/* ------------------------------------------------------------------ */
/* Hàm tiện ích                                                        */
/* ------------------------------------------------------------------ */
const money = (v: number | string) =>
  Number(v).toLocaleString("vi-VN") + " ₫";

const finalPrice = (p: Product) =>
  p.sale_price && Number(p.sale_price) > 0 && Number(p.sale_price) < Number(p.price)
    ? Number(p.sale_price)
    : Number(p.price);

const discountPercent = (p: Product) => {
  const f = finalPrice(p);
  const o = Number(p.price);
  return f < o ? Math.round(((o - f) / o) * 100) : 0;
};

// Laravel Resource trả về { data: [...] }, còn lại trả về mảng thẳng
async function getList<T>(path: string): Promise<T[]> {
  const res = await fetch(`${API_URL}${path}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`${path} trả về ${res.status}`);
  const json = await res.json();
  return Array.isArray(json) ? json : json.data ?? [];
}

function authFetch(path: string, token: string, init: RequestInit = {}) {
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
}

/* ------------------------------------------------------------------ */
/* Trang chủ                                                           */
/* ------------------------------------------------------------------ */
export default function Home() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [brandId, setBrandId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [sort, setSort] = useState<SortKey>("newest");

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);

  const showToast = useCallback((text: string, ok = true) => {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 2500);
  }, []);

  /* Tải sản phẩm, thương hiệu, danh mục */
  useEffect(() => {
    Promise.all([
      getList<Product>("/products"),
      getList<Brand>("/brands"),
      getList<Category>("/categories"),
    ])
      .then(([p, b, c]) => {
        setProducts(p);
        setBrands(b.filter((x) => x.status !== 0));
        setCategories(c);
      })
      .catch((err) => {
        console.error(err);
        setError(`Không tải được dữ liệu (${err.message}). Mở F12 để xem chi tiết.`);
      })
      .finally(() => setLoading(false));
  }, []);

  /* Đọc token, lấy thông tin user và số lượng giỏ hàng */
  const loadAccount = useCallback(async (t: string) => {
    try {
      const [u, c] = await Promise.all([authFetch("/user", t), authFetch("/cart", t)]);
      if (u.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        return;
      }
      setUser(await u.json());
      const cart = (await c.json()).cart;
      const total = (cart?.items ?? []).reduce(
        (s: number, i: { quantity: number }) => s + i.quantity,
        0
      );
      setCartCount(total);
    } catch {
      /* bỏ qua, giao diện vẫn dùng được */
    }
  }, []);

  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) {
      setToken(t);
      loadAccount(t);
    }
  }, [loadAccount]);

  /* Thêm vào giỏ */
  const addToCart = async (p: Product) => {
    if (!token) {
      router.push("/login");
      return;
    }
    setAddingId(p.id);
    try {
      const res = await authFetch("/cart/add", token, {
        method: "POST",
        body: JSON.stringify({ product_id: p.id, quantity: 1 }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.push("/login");
      } else if (!res.ok) {
        showToast(json.message ?? "Không thêm được vào giỏ", false);
      } else {
        setCartCount((n) => n + 1);
        showToast(`Đã thêm ${p.name} vào giỏ`);
      }
    } catch {
      showToast("Mất kết nối máy chủ", false);
    } finally {
      setAddingId(null);
    }
  };

  /* Đăng xuất */
  const logout = async () => {
    if (token) await authFetch("/logout", token, { method: "POST" }).catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setCartCount(0);
    showToast("Đã đăng xuất");
  };

  /* Lọc + sắp xếp */
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = products.filter(
      (p) =>
        p.status !== 0 &&
        (!q || p.name.toLowerCase().includes(q)) &&
        (brandId === null || (p.brand?.id ?? p.brand_id) === brandId) &&
        (categoryId === null || (p.category?.id ?? p.category_id) === categoryId)
    );
    if (sort === "price-asc") list.sort((a, b) => finalPrice(a) - finalPrice(b));
    if (sort === "price-desc") list.sort((a, b) => finalPrice(b) - finalPrice(a));
    return list;
  }, [products, search, brandId, categoryId, sort]);

  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
      active
        ? "border-slate-900 bg-slate-900 text-white"
        : "border-slate-300 bg-white text-slate-700 hover:border-slate-900"
    }`;

  return (
    <div className="min-h-screen bg-[#F1F4F2] text-slate-900">
      {/* ---------- Thanh điều hướng ---------- */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link href="/" className="text-xl font-extrabold tracking-tight">
            Bảo Công <span className="text-blue-600">Mobile</span>
          </Link>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm điện thoại theo tên…"
            aria-label="Tìm điện thoại"
            className="hidden min-w-0 flex-1 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-600 sm:block"
          />

          <nav className="ml-auto flex items-center gap-3 text-sm font-medium">
            {user?.role === "admin" && (
              <Link href="/admin" className="rounded-full bg-amber-100 px-3 py-1.5 text-amber-900 hover:bg-amber-200">
                Quản trị
              </Link>
            )}
            {token ? (
              <>
                <span className="hidden text-slate-600 md:inline">Chào, {user?.name ?? "bạn"}</span>
                <button onClick={logout} className="text-slate-700 hover:text-blue-600">
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-slate-700 hover:text-blue-600">
                  Đăng nhập
                </Link>
                <Link href="/register" className="rounded-full bg-blue-600 px-4 py-1.5 text-white hover:bg-blue-700">
                  Đăng ký
                </Link>
              </>
            )}
            <Link href="/cart" className="relative rounded-full border border-slate-300 px-3 py-1.5 hover:border-slate-900">
              Giỏ hàng
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-xs text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
        {/* Ô tìm kiếm trên điện thoại */}
        <div className="px-4 pb-3 sm:hidden">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm điện thoại theo tên…"
            aria-label="Tìm điện thoại"
            className="w-full rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-600"
          />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* ---------- Phần đầu trang ---------- */}
        <section className="rounded-3xl bg-slate-900 px-6 py-10 text-white sm:px-10">
          <h1 className="max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl">
            Điện thoại chính hãng, giá rõ ràng, giao nhanh.
          </h1>
          <p className="mt-3 max-w-lg text-slate-300">
            Chọn theo hãng, theo loại máy hoặc theo tầm giá. Mọi sản phẩm đều hiển thị giá gốc và giá khuyến mãi.
          </p>
        </section>

        {/* ---------- Bộ lọc ---------- */}
        <section className="mt-8 space-y-4" aria-label="Bộ lọc sản phẩm">
          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-600">Hãng</h2>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button className={chip(brandId === null)} onClick={() => setBrandId(null)}>
                Tất cả
              </button>
              {brands.map((b) => (
                <button key={b.id} className={chip(brandId === b.id)} onClick={() => setBrandId(b.id)}>
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {categories.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-semibold text-slate-600">Loại sản phẩm</h2>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button className={chip(categoryId === null)} onClick={() => setCategoryId(null)}>
                  Tất cả
                </button>
                {categories.map((c) => (
                  <button key={c.id} className={chip(categoryId === c.id)} onClick={() => setCategoryId(c.id)}>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              {loading ? "Đang tải…" : `${visible.length} sản phẩm`}
            </p>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-slate-600">Sắp xếp</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 outline-none focus:border-blue-600"
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
              </select>
            </label>
          </div>
        </section>

        {/* ---------- Lưới sản phẩm ---------- */}
        <section className="mt-4">
          {error && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </p>
          )}

          {loading && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-200" />
              ))}
            </div>
          )}

          {!loading && !error && visible.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="font-semibold">Không có sản phẩm phù hợp</p>
              <p className="mt-1 text-sm text-slate-600">Thử bỏ bớt bộ lọc hoặc đổi từ khóa tìm kiếm.</p>
              <button
                onClick={() => {
                  setSearch("");
                  setBrandId(null);
                  setCategoryId(null);
                }}
                className="mt-4 rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {visible.map((p) => {
              const pct = discountPercent(p);
              const out = (p.stock ?? 1) <= 0;
              return (
                <article
                  key={p.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="relative grid aspect-square place-items-center bg-slate-100 p-4">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-sm text-slate-400">Chưa có ảnh</span>
                    )}
                    {pct > 0 && (
                      <span className="absolute left-3 top-3 rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                        -{pct}%
                      </span>
                    )}
                    {p.featured && (
                      <span className="absolute right-3 top-3 rounded-md bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-950">
                        Nổi bật
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-xs text-slate-500">{p.brand?.name ?? "Điện thoại"}</p>
                    <h3 className="mt-0.5 line-clamp-2 min-h-[2.75rem] font-semibold leading-snug">{p.name}</h3>

                    <div className="mt-2">
                      <p className="text-lg font-extrabold text-red-600">{money(finalPrice(p))}</p>
                      {pct > 0 && (
                        <p className="text-sm text-slate-400 line-through">{money(p.price)}</p>
                      )}
                    </div>

                    <p className={`mt-1 text-xs ${out ? "text-red-600" : "text-emerald-700"}`}>
                      {out ? "Tạm hết hàng" : p.stock !== undefined ? `Còn ${p.stock} máy` : "Còn hàng"}
                    </p>

                    <button
                      onClick={() => addToCart(p)}
                      disabled={out || addingId === p.id}
                      className="mt-auto rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {out ? "Hết hàng" : addingId === p.id ? "Đang thêm…" : "Thêm vào giỏ"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="mt-12 border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Bảo Công Mobile. Đồ án Thực hành lập trình web.
      </footer>

      {/* ---------- Thông báo ---------- */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-lg ${
            toast.ok ? "bg-slate-900" : "bg-red-600"
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}
