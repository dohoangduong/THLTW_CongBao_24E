"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import axiosClient from "@/services/axiosClient";
import {
  SearchIcon,
  BookOpenIcon,
  EyeIcon,
  MessageSquareIcon,
  ClockIcon,
  CalendarIcon,
  ArrowRightIcon,
  PinIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/Icons";

const CATEGORIES = [
  "Tất cả chuyên mục",
  "Đánh giá Flagship",
  "Tin tức công nghệ",
  "Mẹo & Thủ thuật",
  "Khuyến mãi & Sự kiện",
];

const SORT_OPTIONS = [
  { value: "latest", label: "Mới nhất" },
  { value: "views", label: "Xem nhiều nhất" },
  { value: "comments", label: "Thảo luận sôi nổi nhất" },
];

export default function TechArticlesPage() {
  const [posts, setPosts] = useState([]);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 9,
    total: 0,
  });

  const [category, setCategory] = useState("Tất cả chuyên mục");
  const [categoriesList, setCategoriesList] = useState(CATEGORIES);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  // Tải danh mục bài viết động từ MySQL
  useEffect(() => {
    axiosClient
      .get("/post-categories")
      .then((res) => {
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list) && list.length > 0) {
          const names = ["Tất cả chuyên mục", ...list.map((c) => c.name)];
          setCategoriesList(names);
        }
      })
      .catch(() => {});
  }, []);

  // Debounce tìm kiếm 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPagination((prev) => ({ ...prev, current_page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Tải danh sách bài viết theo chuyên mục, từ khóa, sắp xếp và phân trang
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const params = new URLSearchParams();
    if (category && category !== "Tất cả chuyên mục") {
      params.append("category", category);
    }
    if (searchQuery) {
      params.append("search", searchQuery);
    }
    if (sortBy) {
      params.append("sort", sortBy);
    }
    params.append("page", pagination.current_page.toString());
    params.append("per_page", "9");

    axiosClient
      .get(`/posts?${params.toString()}`)
      .then((res) => {
        if (!isCancelled) {
          startTransition(() => {
            setPosts(res.data || []);
            if (res.meta) {
              setPagination(res.meta);
            }
            if (res.featured) {
              setFeaturedPost(res.featured);
            }
            if (res.trending) {
              setTrendingPosts(res.trending);
            }
            setLoading(false);
          });
        }
      })
      .catch((err) => {
        console.error("Lỗi khi tải danh sách bài viết:", err);
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [category, searchQuery, sortBy, pagination.current_page]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans text-zinc-900 antialiased">
      <StoreHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        {/* =========================================================================
            1. TIÊU ĐỀ TRANG & KHỐI BENTO HERO TÂM ĐIỂM
            ========================================================================= */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-zinc-200 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 text-white text-xs font-mono font-medium tracking-wide mb-3">
                <BookOpenIcon className="w-3.5 h-3.5" />
                <span>CHUYÊN TRANG CÔNG NGHỆ BẢO CÔNG</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
                Góc nhìn Công nghệ & Đánh giá Chuyên sâu
              </h1>
              <p className="text-zinc-600 text-sm sm:text-base mt-1 max-w-2xl">
                Cập nhật nhanh tin tức phần cứng mới nhất, các bài test hiệu năng flagship trung thực và cẩm nang thủ thuật độc quyền từ đội ngũ kỹ thuật.
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">
                Tổng lưu trữ
              </span>
              <span className="text-2xl font-black font-mono text-zinc-900">
                {loading ? "..." : `${pagination.total || posts.length} BÀI VIẾT`}
              </span>
            </div>
          </div>

          {/* KHỐI BENTO HERO: 8 Cột Featured Trái + 4 Cột Trending Phải */}
          {loading && !featuredPost ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
              <div className="lg:col-span-8 bg-zinc-900 rounded-3xl h-96 p-8" />
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-zinc-200 rounded-2xl h-44" />
                <div className="bg-zinc-200 rounded-2xl h-44" />
              </div>
            </div>
          ) : featuredPost ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Bài viết tâm điểm (8 Cột) */}
              <div className="lg:col-span-8">
                <Link
                  href={`/bai-viet/${featuredPost.id}`}
                  className="group relative block bg-zinc-950 text-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-zinc-800 overflow-hidden h-full shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  {/* Background overlay image with dark gradient */}
                  {featuredPost.thumbnail && (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:scale-105 transition-transform duration-700 ease-out"
                      style={{ backgroundImage: `url(${featuredPost.thumbnail})` }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/85 to-zinc-950/40" />

                  <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-mono font-bold border border-amber-400/30">
                          <PinIcon className="w-3 h-3 text-amber-400" />
                          ★ TIÊU ĐIỂM CÔNG NGHỆ NỔI BẬT
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-300 text-xs font-mono">
                          {featuredPost.category}
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight group-hover:text-zinc-200 transition-colors">
                        {featuredPost.title}
                      </h2>

                      <p className="text-zinc-300 text-sm sm:text-base line-clamp-3 leading-relaxed max-w-2xl">
                        {featuredPost.summary}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-400">
                      <div className="flex items-center gap-4">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarIcon className="w-3.5 h-3.5 text-zinc-500" />
                          {formatDate(featuredPost.created_at)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <ClockIcon className="w-3.5 h-3.5 text-zinc-500" />
                          {featuredPost.reading_time || "5 phút đọc"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <EyeIcon className="w-3.5 h-3.5 text-zinc-500" />
                          {featuredPost.views?.toLocaleString()} lượt xem
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MessageSquareIcon className="w-3.5 h-3.5 text-zinc-500" />
                          {featuredPost.visible_comments_count || 0} thảo luận
                        </span>
                      </div>

                      <div className="inline-flex items-center gap-2 text-white font-sans font-bold group-hover:translate-x-1 transition-transform">
                        <span>Đọc toàn bộ bài viết</span>
                        <ArrowRightIcon className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* 2 Bài viết phụ cột phải (4 Cột) */}
              <div className="lg:col-span-4 flex flex-col gap-6 justify-between">
                {trendingPosts.length > 0 ? (
                  trendingPosts.slice(0, 2).map((tp, idx) => (
                    <Link
                      key={tp.id}
                      href={`/bai-viet/${tp.id}`}
                      className="group bg-white rounded-2xl p-5 border border-zinc-200/90 hover:border-zinc-900 transition-all shadow-sm hover:shadow-md flex flex-col justify-between h-full space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                            {tp.category}
                          </span>
                          {tp.is_featured ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <PinIcon className="w-2.5 h-2.5 text-amber-500" />
                              ★ TIÊU ĐIỂM
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                              XU HƯỚNG #{idx + 1}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-zinc-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-black transition-colors">
                          {tp.title}
                        </h3>
                        <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed">
                          {tp.summary}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                        <span className="inline-flex items-center gap-1">
                          <EyeIcon className="w-3 h-3 text-zinc-400" />
                          {tp.views?.toLocaleString()}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageSquareIcon className="w-3 h-3 text-zinc-400" />
                          {tp.visible_comments_count || 0} thảo luận
                        </span>
                        <span className="font-sans font-semibold text-zinc-900 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          Xem ngay <ArrowRightIcon className="w-3 h-3" />
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 text-center text-zinc-500 text-xs font-mono">
                    Đang đồng bộ danh mục xu hướng...
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </section>

        {/* =========================================================================
            2. THANH CÔNG CỤ LỌC & TÌM KIẾM SWISS BENTO TOOLBAR
            ========================================================================= */}
        <section className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-200/90 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Thanh tìm kiếm tức thì */}
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm bài đánh giá, cẩm nang thủ thuật, tin đồn..."
                className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-900 focus:bg-white transition-all text-zinc-900 placeholder-zinc-400 font-sans"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                  title="Xóa tìm kiếm"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sắp xếp bài viết */}
            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <span className="text-xs font-mono text-zinc-500 uppercase">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPagination((prev) => ({ ...prev, current_page: 1 }));
                }}
                className="text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 focus:outline-none focus:border-zinc-900 font-sans cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dải Chip danh mục */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-zinc-100">
            {categoriesList.map((cat) => {
              const isActive = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setPagination((prev) => ({ ...prev, current_page: 1 }));
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-zinc-900 text-white shadow-sm"
                      : "bg-zinc-100/80 text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-900 border border-zinc-200/60"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            3. LƯỚI BÀI VIẾT (BENTO GRID)
            ========================================================================= */}
        <section className="space-y-6">
          {loading ? (
            /* Skeleton Loading Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-4 border border-zinc-200 space-y-4 animate-pulse"
                >
                  <div className="aspect-video bg-zinc-200 rounded-xl w-full" />
                  <div className="space-y-2">
                    <div className="h-4 bg-zinc-200 rounded w-1/3" />
                    <div className="h-5 bg-zinc-200 rounded w-5/6" />
                    <div className="h-3 bg-zinc-200 rounded w-full" />
                    <div className="h-3 bg-zinc-200 rounded w-2/3" />
                  </div>
                  <div className="h-4 bg-zinc-200 rounded w-1/2 pt-2" />
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="group bg-white rounded-2xl border border-zinc-200/90 hover:border-zinc-900 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    {/* Thumbnail 16:9 */}
                    <Link
                      href={`/bai-viet/${post.id}`}
                      className="block relative aspect-video bg-zinc-100 overflow-hidden"
                    >
                      {post.thumbnail ? (
                        <img
                          src={post.thumbnail}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400">
                          <BookOpenIcon className="w-10 h-10" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-md bg-zinc-900/90 backdrop-blur-sm text-white text-[11px] font-mono font-medium shadow-sm">
                          {post.category}
                        </span>
                      </div>
                    </Link>

                    {/* Nội dung tóm lược */}
                    <div className="p-5 space-y-3">
                      {/* Meta stats */}
                      <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500">
                        <span className="inline-flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3 text-zinc-400" />
                          {formatDate(post.created_at)}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <ClockIcon className="w-3 h-3 text-zinc-400" />
                          {post.reading_time || "5 phút đọc"}
                        </span>
                      </div>

                      <h2 className="text-base sm:text-lg font-bold text-zinc-900 leading-snug line-clamp-2 group-hover:text-black">
                        <Link href={`/bai-viet/${post.id}`}>{post.title}</Link>
                      </h2>

                      <p className="text-zinc-600 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                        {post.summary}
                      </p>
                    </div>
                  </div>

                  {/* Footer card */}
                  <div className="px-5 py-3.5 bg-zinc-50/70 border-t border-zinc-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500">
                      <span className="inline-flex items-center gap-1">
                        <EyeIcon className="w-3 h-3 text-zinc-400" />
                        {post.views?.toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquareIcon className="w-3 h-3 text-zinc-400" />
                        {post.visible_comments_count || 0}
                      </span>
                    </div>

                    <Link
                      href={`/bai-viet/${post.id}`}
                      className="font-semibold text-zinc-900 hover:text-black inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                    >
                      <span>Đọc bài viết</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            /* Trạng thái trống */
            <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center space-y-3 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
                <BookOpenIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900">Không tìm thấy bài viết nào</h3>
              <p className="text-xs text-zinc-500">
                Không có bài viết nào khớp với từ khóa hoặc chuyên mục bạn đã chọn. Vui lòng thử lại với từ khóa khác.
              </p>
              <button
                onClick={() => {
                  setCategory("Tất cả chuyên mục");
                  setSearchInput("");
                  setSearchQuery("");
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-medium hover:bg-black transition-colors"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          )}

          {/* =========================================================================
              4. PHÂN TRANG (PAGINATION)
              ========================================================================= */}
          {pagination.last_page > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    current_page: Math.max(1, prev.current_page - 1),
                  }))
                }
                disabled={pagination.current_page <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                <span>Trước</span>
              </button>

              <div className="flex items-center gap-1">
                {[...Array(pagination.last_page)].map((_, i) => {
                  const pageNum = i + 1;
                  const isCur = pageNum === pagination.current_page;
                  return (
                    <button
                      key={pageNum}
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, current_page: pageNum }))
                      }
                      className={`w-8 h-8 rounded-lg text-xs font-mono font-medium transition-colors ${
                        isCur
                          ? "bg-zinc-900 text-white"
                          : "border border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    current_page: Math.min(pagination.last_page, prev.current_page + 1),
                  }))
                }
                disabled={pagination.current_page >= pagination.last_page}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <span>Sau</span>
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>
      </main>

      <StoreFooter />
    </div>
  );
}

