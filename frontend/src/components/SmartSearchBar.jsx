"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosClient from "@/services/axiosClient";
import { SearchIcon, XIcon, ArrowUpRightIcon } from "@/components/Icons";

const SEARCH_SUGGESTIONS = [
  "Tìm kiếm: iPhone 16 Pro Max...",
  "Tìm kiếm: Samsung Galaxy S24 Ultra...",
  "Tìm kiếm: Xiaomi 14 Ultra...",
  "Tìm kiếm: OPPO Find X7...",
  "Tìm kiếm: iPad Pro M4...",
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
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % SEARCH_SUGGESTIONS.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

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
        .then((res) => {
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

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    setIsOpen(false);
    router.push(`/products?search=${encodeURIComponent(keyword.trim())}`);
  };

  const handleBrandJump = (brand) => {
    setIsOpen(false);
    router.push(`/products?brand_id=${brand.brandId}`);
  };

  const formatPrice = (p) => {
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
          className="w-full pl-10 pr-10 py-2 text-xs bg-zinc-100 hover:bg-zinc-50 focus:bg-white text-zinc-900 placeholder-zinc-400 border border-zinc-200 focus:border-zinc-900 rounded-full outline-none transition-all duration-200 shadow-2xs focus:ring-2 focus:ring-zinc-900/10"
        />

        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
          <SearchIcon className="w-4 h-4" />
        </div>

        {keyword && (
          <button
            type="button"
            onClick={() => {
              setKeyword("");
              setResults([]);
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors p-0.5"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-zinc-200 z-50 overflow-hidden divide-y divide-zinc-100 animate-in fade-in-50 duration-150">
          <div className="p-3 bg-zinc-50/70">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 px-1">
              Nhảy nhanh theo Hãng
            </div>
            <div className="flex flex-wrap gap-1.5">
              {BRAND_JUMPS.map((brand) => (
                <button
                  key={brand.label}
                  type="button"
                  onClick={() => handleBrandJump(brand)}
                  className="px-2.5 py-1 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-900 hover:text-white border border-zinc-200 rounded-lg transition-all"
                >
                  {brand.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-2">
            {loading ? (
              <div className="py-4 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                Đang tìm sản phẩm phù hợp...
              </div>
            ) : keyword.trim() && results.length === 0 ? (
              <div className="py-4 text-center text-xs text-zinc-500">
                Không tìm thấy sản phẩm nào khớp với &quot;<span className="font-semibold text-zinc-800">{keyword}</span>&quot;
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 py-1">
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
                      className="flex items-center gap-3 p-2 hover:bg-zinc-50 rounded-xl transition-colors group"
                    >
                      <div className="w-11 h-11 rounded-lg bg-zinc-100 border border-zinc-200 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <span className="text-[9px] text-zinc-400 font-mono">NO IMG</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-zinc-800 truncate group-hover:text-zinc-950 transition-colors">
                          {item.name}
                        </div>
                        {item.sku && (
                          <div className="text-[10px] font-mono text-zinc-400">
                            SKU: {item.sku}
                          </div>
                        )}
                      </div>

                      <div className="text-right flex-shrink-0 pl-2">
                        <div className="text-xs font-bold text-zinc-900">
                          {formatPrice(finalPrice)}
                        </div>
                        {isSale && (
                          <div className="text-[10px] text-zinc-400 line-through">
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
                  className="w-full mt-2 py-2 px-3 text-xs font-medium text-zinc-800 hover:text-white bg-zinc-100 hover:bg-zinc-900 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Xem tất cả kết quả cho &quot;{keyword}&quot;</span>
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
