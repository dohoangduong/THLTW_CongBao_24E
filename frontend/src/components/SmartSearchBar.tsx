"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosClient from "@/services/axiosClient";
import { SearchIcon, XIcon, ArrowUpRightIcon } from "@/components/Icons";

interface ProductPreview {
  id: number;
  name: string;
  sku?: string;
  price: number | string;
  sale_price?: number | string | null;
  image?: string;
}

const SEARCH_SUGGESTIONS = [
  "Tìm điện thoại: iPhone 16 Pro Max...",
  "Tìm điện thoại: Samsung Galaxy S24 Ultra...",
  "Tìm điện thoại: Xiaomi 14 Ultra...",
  "Tìm điện thoại: OPPO Find X7...",
  "Tìm điện thoại: Realme GT5 Pro...",
];

const BRAND_JUMPS = [
  { label: "iPhone", brandId: 1, query: "Apple" },
  { label: "Samsung", brandId: 2, query: "Samsung" },
  { label: "Xiaomi", brandId: 3, query: "Xiaomi" },
  { label: "OPPO", brandId: 4, query: "OPPO" },
  { label: "Realme", brandId: 5, query: "Realme" },
  { label: "Vivo", brandId: 6, query: "Vivo" },
];

export default function SmartSearchBar() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<ProductPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // [THUẬT TOÁN NHẢY GỢI Ý TÌM KIẾM LUÂN PHIÊN (ROTATING SEARCH SUGGESTIONS)]:
  // Sử dụng setInterval mỗi 2.5 giây để đổi placeholder mượt mà giữa các dòng máy hot.
  useEffect(() => {
    const timer = setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % SEARCH_SUGGESTIONS.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // [THUẬT TOÁN TÌM KIẾM THỜI GIAN THỰC (DEBOUNCE 300MS)]:
  // Trì hoãn 300ms sau khi người dùng dừng gõ phím mới gọi API để tối ưu băng thông và giảm tải máy chủ.
  useEffect(() => {
    if (!keyword.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      axiosClient
        .get(`/products?search=${encodeURIComponent(keyword.trim())}&per_page=5`)
        .then((res: any) => {
          const list = Array.isArray(res) ? res : res?.data || [];
          setResults(list.slice(0, 5));
        })
        .catch(() => {
          setResults([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [keyword]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    setIsOpen(false);
    router.push(`/products?search=${encodeURIComponent(keyword.trim())}`);
  };

  const handleBrandJump = (brand: typeof BRAND_JUMPS[0]) => {
    setIsOpen(false);
    router.push(`/products?brand_id=${brand.brandId}`);
  };

  const formatPrice = (p: number | string) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(p) || 0);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={SEARCH_SUGGESTIONS[suggestionIndex]}
          className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 border border-slate-200 focus:border-blue-600 rounded-full outline-none transition-all duration-200 shadow-inner focus:shadow-md"
        />

        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <SearchIcon className="w-4 h-4" />
        </div>

        {keyword && (
          <button
            type="button"
            onClick={() => {
              setKeyword("");
              setResults([]);
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {/* Dropdown Live Search & Brand Jump */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden divide-y divide-slate-100 animate-in fade-in-50 duration-150">
          {/* Hàng trên: Dải nút Đề xuất nhảy nhanh theo Hãng */}
          <div className="p-3 bg-slate-50/70">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1">
              Nhảy nhanh theo Hãng
            </div>
            <div className="flex flex-wrap gap-1.5">
              {BRAND_JUMPS.map((brand) => (
                <button
                  key={brand.label}
                  type="button"
                  onClick={() => handleBrandJump(brand)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200 rounded-lg transition-all"
                >
                  {brand.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hàng dưới: Kết quả tìm kiếm thời gian thực */}
          <div className="p-2">
            {loading ? (
              <div className="py-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Đang tìm sản phẩm phù hợp...
              </div>
            ) : keyword.trim() && results.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-500">
                Không tìm thấy sản phẩm nào khớp với &quot;<span className="font-semibold text-slate-700">{keyword}</span>&quot;
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 py-1">
                  Sản phẩm gợi ý
                </div>
                {results.map((item) => {
                  const finalPrice = item.sale_price && Number(item.sale_price) > 0 ? Number(item.sale_price) : Number(item.price);
                  const isSale = item.sale_price && Number(item.sale_price) > 0 && Number(item.sale_price) < Number(item.price);

                  return (
                    <Link
                      key={item.id}
                      href={`/products/${item.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">NO IMG</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                          {item.name}
                        </div>
                        {item.sku && (
                          <div className="text-[11px] font-mono text-slate-400">
                            SKU: {item.sku}
                          </div>
                        )}
                      </div>

                      <div className="text-right flex-shrink-0 pl-2">
                        <div className="text-sm font-bold text-blue-600">
                          {formatPrice(finalPrice)}
                        </div>
                        {isSale && (
                          <div className="text-xs text-slate-400 line-through">
                            {formatPrice(item.price)}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full mt-2 py-2 px-3 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Xem tất cả kết quả cho &quot;{keyword}&quot; tại trang Sản phẩm</span>
                  <ArrowUpRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
