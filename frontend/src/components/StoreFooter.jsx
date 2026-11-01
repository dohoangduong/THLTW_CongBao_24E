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
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white shadow-2xs">
                <BrandLogoIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-white tracking-tight">
                  BẢO CÔNG <span className="text-zinc-500 font-semibold">STUDIO</span>
                </span>
              </div>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Hệ thống bán lẻ thiết bị di động, tablet & phụ kiện công nghệ chính hãng hàng đầu. Tiên phong trải nghiệm mua sắm thông minh và chính sách bảo hành 1 đổi 1 minh bạch.
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
                  Trung tâm hỗ trợ khách hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ & Showroom */}
          <div>
            <h4 className="font-bold text-zinc-200 mb-2.5 uppercase tracking-wider text-[11px]">Liên Hệ &amp; Showroom</h4>
            <ul className="space-y-1.5 text-zinc-400 text-[11px]">
              <li>
                <span className="text-zinc-500">CSKH:</span>{" "}
                <span className="text-white font-semibold">1900 8888</span> (8h00 - 21h30)
              </li>
              <li>
                <span className="text-zinc-500">Kỹ thuật:</span>{" "}
                <span className="text-white font-semibold">1900 8889</span>
              </li>
              <li>
                <span className="text-zinc-500">Showroom:</span> 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
              </li>
              <li>
                <span className="text-zinc-500">Email:</span> cskh@baocongstudio.vn
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-900 flex flex-wrap items-center justify-between text-zinc-500 text-[11px] gap-2">
          <div>© 2026 Bảo Công Studio. All rights reserved.</div>
          <div className="flex items-center gap-3">
            <Link href="/ho-tro" className="hover:text-zinc-300 transition-colors">
              Chính sách bảo mật
            </Link>
            <span>•</span>
            <Link href="/ho-tro" className="hover:text-zinc-300 transition-colors">
              Điều khoản dịch vụ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
