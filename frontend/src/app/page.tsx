"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import ShopShell from "@/components/shop/ShopShell";
import ProductCard from "@/components/shop/ProductCard";
import ProductSection from "@/components/shop/ProductSection";
import Pagination from "@/components/shop/Pagination";
import {
  getHome,
  getList,
  getProducts,
  type Brand,
  type Category,
  type HomeData,
  type PageResult,
  type Product,
  type ProductFilter,
  type SortKey,
} from "@/lib/shop";

const PER_PAGE = 12;

const TAGS = {
  new: { text: "Mới", cls: "bg-emerald-500 text-white" },
  hot: { text: "Hot", cls: "bg-amber-400 text-amber-950" },
};

const FILTER_TABS: { value: ProductFilter; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "new", label: "Mới nhất" },
  { value: "sale", label: "Đang giảm giá" },
  { value: "hot", label: "Nổi bật" },
];

/* Banner: 3 slide tự chuyển, bấm nút để lọc xuống danh sách bên dưới */
const SLIDES: { title: string; text: string; cta: string; filter: ProductFilter; cls: string }[] = [
  {
    title: "Điện thoại chính hãng, giá rõ ràng, giao nhanh.",
    text: "Chọn theo hãng, theo loại máy hoặc theo tầm giá. Mọi sản phẩm đều hiển thị giá gốc và giá khuyến mãi.",
    cta: "Mua ngay",
    filter: "",
    cls: "from-slate-900 to-slate-700",
  },
  {
    title: "Săn giá sốc, giảm đến hàng triệu đồng.",
    text: "Cập nhật liên tục những mẫu máy đang giảm giá, xếp theo mức giảm nhiều nhất.",
    cta: "Xem khuyến mãi",
    filter: "sale",
    cls: "from-red-700 to-rose-500",
  },
  {
    title: "Máy mới về, hàng mới mỗi tuần.",
    text: "Những mẫu điện thoại vừa lên kệ, sẵn hàng và bảo hành chính hãng.",
    cta: "Xem hàng mới",
    filter: "new",
    cls: "from-blue-700 to-indigo-500",
  },
];

const BENEFITS = [
  { title: "Chính hãng 100%", text: "Bảo hành 12 tháng toàn quốc" },
  { title: "Giao hàng nhanh", text: "Nhận máy trong 1–3 ngày" },
  { title: "Đổi trả dễ dàng", text: "7 ngày nếu lỗi nhà sản xuất" },
  { title: "Thanh toán linh hoạt", text: "COD, chuyển khoản, ví điện tử" },
];

export default function Home() {
  /* ---------- Dữ liệu cho các mục đầu trang ---------- */
  const [home, setHome] = useState<HomeData | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [homeLoading, setHomeLoading] = useState(true);
  const [homeError, setHomeError] = useState("");

  /* ---------- Danh sách sản phẩm: lọc + sắp xếp + phân trang (xử lý ở server) ---------- */
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [brandId, setBrandId] = useState<number | null>(null);
  const [filter, setFilter] = useState<ProductFilter>("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);

  const [result, setResult] = useState<PageResult<Product> | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [slide, setSlide] = useState(0);
  const catalogRef = useRef<HTMLElement>(null);
  const mounted = useRef(false);

  const scrollToCatalog = useCallback(() => {
    catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  /* Đọc bộ lọc từ đường dẫn (vd: /?filter=sale&category=2) khi mở trang */
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const f = sp.get("filter");
    if (f === "new" || f === "sale" || f === "hot") setFilter(f);
    const c = Number(sp.get("category"));
    if (c) setCategoryId(c);
    const b = Number(sp.get("brand"));
    if (b) setBrandId(b);
    const q = sp.get("q");
    if (q) {
      setSearch(q);
      setDebounced(q);
    }
  }, []);

  /* Tải danh mục, thương hiệu và 3 mục mới / giảm giá / nổi bật */
  useEffect(() => {
    Promise.all([getHome(8), getList<Brand>("/brands"), getList<Category>("/categories")])
      .then(([h, b, c]) => {
        setHome(h);
        setBrands(b.filter((x) => x.status !== 0));
        setCategories(c);
      })
      .catch((err) => {
        console.error(err);
        setHomeError(`Không tải được dữ liệu (${err.message}). Hãy kiểm tra backend đang chạy ở cổng 8000.`);
      })
      .finally(() => setHomeLoading(false));
  }, []);

  /* Ô tìm kiếm: chờ 400ms sau khi ngừng gõ rồi mới gọi API */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  /* Tải danh sách mỗi khi đổi bộ lọc / trang */
  useEffect(() => {
    let cancelled = false;
    setListLoading(true);
    getProducts({
      page,
      per_page: PER_PAGE,
      q: debounced,
      category_id: categoryId,
      brand_id: brandId,
      filter,
      sort: filter === "sale" || filter === "hot" ? (sort === "newest" ? undefined : sort) : sort,
    })
      .then((r) => {
        if (cancelled) return;
        setResult(r);
        setListError("");
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setListError(`Không tải được danh sách sản phẩm (${err.message}).`);
      })
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, debounced, categoryId, brandId, filter, sort]);

  /* Tự chuyển banner */
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  /* Cuộn xuống danh sách khi đổi trang (bỏ qua lần tải đầu) */
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    scrollToCatalog();
  }, [page, scrollToCatalog]);

  const applyFilter = (f: ProductFilter) => {
    setFilter(f);
    setPage(1);
  };
  const viewAll = (f: ProductFilter) => {
    applyFilter(f);
    scrollToCatalog();
  };
  const pickCategory = (id: number | null) => {
    setCategoryId(id);
    setPage(1);
  };
  const resetAll = () => {
    setSearch("");
    setDebounced("");
    setCategoryId(null);
    setBrandId(null);
    setFilter("");
    setSort("newest");
    setPage(1);
  };

  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
      active
        ? "border-slate-900 bg-slate-900 text-white"
        : "border-slate-300 bg-white text-slate-700 hover:border-slate-900"
    }`;

  // Danh mục cha đang chọn (hoặc cha của danh mục con đang chọn) -> hiện hàng danh mục con
  const activeParent = categories.find((c) => c.id === categoryId || c.children?.some((k) => k.id === categoryId));
  const children = activeParent?.children ?? [];

  const cur = SLIDES[slide];
  const hasFilter = Boolean(debounced || categoryId || brandId || filter);

  return (
    <ShopShell search={search} onSearch={setSearch}>
      {(shop) => (
        <>
          {/* ---------- Banner ---------- */}
          <section
            aria-roledescription="carousel"
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${cur.cls} px-6 py-12 text-white transition-colors sm:px-10`}
          >
            <h1 className="max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl">{cur.title}</h1>
            <p className="mt-3 max-w-lg text-white/80">{cur.text}</p>
            <button
              onClick={() => viewAll(cur.filter)}
              className="mt-6 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-slate-900 hover:bg-slate-100"
            >
              {cur.cta}
            </button>
            <div className="absolute bottom-4 right-6 flex gap-2">
              {SLIDES.map((s, i) => (
                <button
                  key={s.cta}
                  aria-label={`Banner ${i + 1}`}
                  onClick={() => setSlide(i)}
                  className={`h-2.5 rounded-full transition-all ${i === slide ? "w-6 bg-white" : "w-2.5 bg-white/50"}`}
                />
              ))}
            </div>
          </section>

          {/* ---------- Cam kết ---------- */}
          <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Cam kết của cửa hàng">
            {BENEFITS.map((b) => (
              <div key={b.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-bold">{b.title}</p>
                <p className="mt-0.5 text-xs text-slate-600">{b.text}</p>
              </div>
            ))}
          </section>

          {homeError && (
            <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {homeError}
            </p>
          )}

          {/* ---------- Danh mục ---------- */}
          {categories.length > 0 && (
            <section className="mt-10" aria-label="Danh mục sản phẩm">
              <h2 className="mb-3 text-2xl font-extrabold">Danh mục</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      pickCategory(c.id);
                      scrollToCatalog();
                    }}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-center transition-shadow hover:shadow-md"
                  >
                    <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-slate-100 text-lg font-bold text-slate-500">
                      {c.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        c.name.charAt(0).toUpperCase()
                      )}
                    </span>
                    <span className="text-sm font-semibold leading-tight">{c.name}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* ---------- Thương hiệu ---------- */}
          {brands.length > 0 && (
            <section className="mt-10" aria-label="Thương hiệu">
              <h2 className="mb-3 text-2xl font-extrabold">Thương hiệu</h2>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {brands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setBrandId(b.id);
                      setPage(1);
                      scrollToCatalog();
                    }}
                    className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:border-slate-900"
                  >
                    {b.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.image} alt="" className="h-6 w-6 object-contain" />
                    )}
                    {b.name}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* ---------- Sản phẩm mới / Giảm giá / Nổi bật ---------- */}
          <ProductSection
            title="Sản phẩm mới"
            subtitle="Vừa lên kệ, sẵn hàng"
            badge="text-emerald-700"
            items={home?.new ?? []}
            loading={homeLoading}
            addingId={shop.addingId}
            onAdd={shop.addToCart}
            onViewAll={() => viewAll("new")}
            tag={TAGS.new}
          />
          <ProductSection
            title="Đang giảm giá"
            subtitle="Giảm nhiều nhất xếp trước"
            badge="text-red-600"
            items={home?.sale ?? []}
            loading={homeLoading}
            addingId={shop.addingId}
            onAdd={shop.addToCart}
            onViewAll={() => viewAll("sale")}
          />
          <ProductSection
            title="Nổi bật"
            subtitle="Được chọn và xem nhiều nhất"
            badge="text-amber-600"
            items={home?.hot ?? []}
            loading={homeLoading}
            addingId={shop.addingId}
            onAdd={shop.addToCart}
            onViewAll={() => viewAll("hot")}
            tag={TAGS.hot}
          />

          {/* ---------- Tất cả sản phẩm ---------- */}
          <section id="san-pham" ref={catalogRef} className="mt-14 scroll-mt-24" aria-label="Tất cả sản phẩm">
            <h2 className="mb-4 text-2xl font-extrabold">Tất cả sản phẩm</h2>

            <div className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Lọc nhanh">
                {FILTER_TABS.map((t) => (
                  <button
                    key={t.value}
                    role="tab"
                    aria-selected={filter === t.value}
                    className={chip(filter === t.value)}
                    onClick={() => applyFilter(t.value)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {categories.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-slate-600">Danh mục</h3>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    <button className={chip(categoryId === null)} onClick={() => pickCategory(null)}>
                      Tất cả
                    </button>
                    {categories.map((c) => (
                      <button key={c.id} className={chip(activeParent?.id === c.id)} onClick={() => pickCategory(c.id)}>
                        {c.name}
                      </button>
                    ))}
                  </div>
                  {children.length > 0 && (
                    <div className="mt-2 flex gap-2 overflow-x-auto pb-1 pl-3">
                      <button className={chip(categoryId === activeParent?.id)} onClick={() => pickCategory(activeParent!.id)}>
                        Tất cả {activeParent?.name}
                      </button>
                      {children.map((k) => (
                        <button key={k.id} className={chip(categoryId === k.id)} onClick={() => pickCategory(k.id)}>
                          {k.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {brands.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-slate-600">Hãng</h3>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    <button
                      className={chip(brandId === null)}
                      onClick={() => {
                        setBrandId(null);
                        setPage(1);
                      }}
                    >
                      Tất cả
                    </button>
                    {brands.map((b) => (
                      <button
                        key={b.id}
                        className={chip(brandId === b.id)}
                        onClick={() => {
                          setBrandId(b.id);
                          setPage(1);
                        }}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-600">
                  {listLoading ? "Đang tải…" : `${result?.total ?? 0} sản phẩm`}
                  {hasFilter && (
                    <button onClick={resetAll} className="ml-3 font-semibold text-blue-600 hover:underline">
                      Xóa bộ lọc
                    </button>
                  )}
                </p>
                <label className="flex items-center gap-2 text-sm">
                  <span className="text-slate-600">Sắp xếp</span>
                  <select
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value as SortKey);
                      setPage(1);
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 outline-none focus:border-blue-600"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="popular">Xem nhiều nhất</option>
                    <option value="price-asc">Giá thấp đến cao</option>
                    <option value="price-desc">Giá cao đến thấp</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="mt-4">
              {listError && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                  {listError}
                </p>
              )}

              {listLoading && !result && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-200" />
                  ))}
                </div>
              )}

              {!listLoading && !listError && result?.items.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <p className="font-semibold">Không có sản phẩm phù hợp</p>
                  <p className="mt-1 text-sm text-slate-600">Thử bỏ bớt bộ lọc hoặc đổi từ khóa tìm kiếm.</p>
                  <button
                    onClick={resetAll}
                    className="mt-4 rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              )}

              {result && result.items.length > 0 && (
                <div
                  className={`grid grid-cols-2 gap-4 transition-opacity md:grid-cols-3 lg:grid-cols-4 ${
                    listLoading ? "opacity-50" : ""
                  }`}
                >
                  {result.items.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onAdd={shop.addToCart}
                      adding={shop.addingId === p.id}
                      tag={p.featured ? TAGS.hot : null}
                    />
                  ))}
                </div>
              )}

              <Pagination page={result?.page ?? page} lastPage={result?.lastPage ?? 1} onChange={setPage} />
            </div>
          </section>

          <p className="mt-10 text-center text-sm text-slate-500">
            Cần hỗ trợ? <Link href="/register" className="font-semibold text-blue-600 hover:underline">Tạo tài khoản</Link> để theo dõi đơn hàng của bạn.
          </p>
        </>
      )}
    </ShopShell>
  );
}
