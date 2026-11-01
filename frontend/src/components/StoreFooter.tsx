import React from "react";
import Link from "next/link";
import { BrandLogoIcon } from "@/components/Icons";

export default function StoreFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-800 bg-zinc-950 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Cột 1: Thông tin thương hiệu */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white shadow-xs">
                <BrandLogoIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-white tracking-tight">
                  BẢO CÔNG <span className="text-zinc-500 font-semibold">STUDIO</span>
                </span>
              </div>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Hệ thống bán lẻ thiết bị di động, tablet & phụ kiện công nghệ chính hãng. Tiên phong trải nghiệm mua sắm thông minh và chính sách bảo hành 1 đổi 1 minh bạch.
            </p>
          </div>

          {/* Cột 2: Phân loại sản phẩm */}
          <div>
            <h4 className="font-bold text-zinc-200 mb-2.5 uppercase tracking-wider text-[11px]">Sản Phẩm</h4>
            <ul className="space-y-1.5 text-zinc-400 text-[11px]">
              <li>
                <Link href="/products?category_id=1" className="hover:text-white transition-colors">
                  Điện thoại thông minh
                </Link>
              </li>
              <li>
                <Link href="/products?category_id=2" className="hover:text-white transition-colors">
                  Máy tính bảng (iPad &amp; Tab)
                </Link>
              </li>
              <li>
                <Link href="/products?category_id=3" className="hover:text-white transition-colors">
                  Điện thoại Gaming chuyên nghiệp
                </Link>
              </li>
              <li>
                <Link href="/products?category_id=4" className="hover:text-white transition-colors">
                  Phụ kiện sạc cáp &amp; âm thanh
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Chính sách & Hỗ trợ */}
          <div>
            <h4 className="font-bold text-zinc-200 mb-2.5 uppercase tracking-wider text-[11px]">Chính Sách &amp; Hỗ Trợ</h4>
            <ul className="space-y-1.5 text-zinc-400 text-[11px]">
              <li>
                <Link href="/ho-tro" className="hover:text-white transition-colors">
                  Bảo hành 12 tháng chính hãng
                </Link>
              </li>
              <li>
                <Link href="/ho-tro" className="hover:text-white transition-colors">
                  1 đổi 1 trong vòng 30 ngày
                </Link>
              </li>
              <li>
                <Link href="/ho-tro" className="hover:text-white transition-colors">
                  Giao hàng hỏa tốc 2 giờ nội thành
                </Link>
              </li>
              <li>
                <Link href="/ho-tro" className="hover:text-white transition-colors">
                  Gửi phiếu yêu cầu hỗ trợ trực tuyến
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Kỹ thuật hệ thống */}
          <div>
            <h4 className="font-bold text-zinc-200 mb-2.5 uppercase tracking-wider text-[11px]">Kiến Trúc Hệ Thống</h4>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Thiết kế Headless: Backend Laravel 11 RESTful API + Frontend Next.js 16 (Turbopack) đồng bộ MySQL Database.
            </p>
            <div className="mt-3 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-800/80 px-2.5 py-1 rounded-md w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>STATUS: REST API LIVE (OK)</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-900 flex flex-wrap items-center justify-between text-zinc-500 text-[11px] gap-2">
          <div>© 2026 Bảo Công Studio — Đồ án Thực hành lập trình web (Laravel + Next.js).</div>
          <div className="font-mono text-zinc-500">SWISS MONOCHROME TECH UI</div>
        </div>
      </div>
    </footer>
  );
}

