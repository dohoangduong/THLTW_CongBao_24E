"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BrandLogoIcon } from "@/components/Icons";
import axiosClient from "@/services/axiosClient";

export default function StoreFooter() {
  const [settings, setSettings] = useState(null);
  const [footerMenus, setFooterMenus] = useState([]);

  useEffect(() => {
    axiosClient
      .get("/settings")
      .then((res) => {
        const s = res?.data || res;
        if (s) setSettings(s);
      })
      .catch(() => {});

    axiosClient
      .get("/menus")
      .then((res) => {
        const fMenus = res?.footer || (Array.isArray(res?.data) ? res.data.filter((m) => m.position === "footer") : []);
        if (Array.isArray(fMenus) && fMenus.length > 0) {
          setFooterMenus(fMenus);
        }
      })
      .catch(() => {});
  }, []);

  const siteName = settings?.site_name || "BẢO CÔNG STUDIO";
  const hotline = settings?.hotline || "1900 8888";
  const email = settings?.email || "cskh@baocongstudio.vn";
  const address = settings?.address || "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh";
  const workingHours = settings?.working_hours || "8h00 - 21h30 (Thứ 2 - Chủ Nhật)";
  const copyright = settings?.copyright_text || "© 2026 Bảo Công Studio. All rights reserved.";

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
                <span className="font-extrabold text-sm text-white tracking-tight uppercase">
                  {siteName}
                </span>
              </div>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Hệ thống bán lẻ thiết bị di động, tablet &amp; phụ kiện công nghệ chính hãng hàng đầu. Tiên phong trải nghiệm mua sắm thông minh và chính sách bảo hành 1 đổi 1 minh bạch.
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

          {/* Cột 3: Chính sách & Hỗ trợ (Menu động từ MySQL) */}
          <div>
            <h4 className="font-bold text-zinc-200 mb-2.5 uppercase tracking-wider text-[11px]">Chính Sách &amp; Hỗ Trợ</h4>
            <ul className="space-y-1.5 text-zinc-400 text-[11px]">
              {footerMenus.length > 0 ? (
                footerMenus.map((m) => (
                  <li key={m.id || m.url}>
                    <Link href={m.url} className="hover:text-white transition-colors">
                      {m.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link href="/trang/gioi-thieu" className="hover:text-white transition-colors">
                      Về Bảo Công Studio
                    </Link>
                  </li>
                  <li>
                    <Link href="/trang/chinh-sach-mua-hang" className="hover:text-white transition-colors">
                      Chính sách mua hàng &amp; giao nhận
                    </Link>
                  </li>
                  <li>
                    <Link href="/trang/chinh-sach-doi-tra" className="hover:text-white transition-colors">
                      Chính sách 1 đổi 1 trong 30 ngày
                    </Link>
                  </li>
                  <li>
                    <Link href="/trang/chinh-sach-bao-hanh" className="hover:text-white transition-colors">
                      Chính sách bảo hành 12 tháng
                    </Link>
                  </li>
                  <li>
                    <Link href="/trang/huong-dan-mua-hang" className="hover:text-white transition-colors">
                      Hướng dẫn mua hàng online
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Cột 4: Liên hệ & Showroom (Đồng bộ từ Cấu hình Website) */}
          <div>
            <h4 className="font-bold text-zinc-200 mb-2.5 uppercase tracking-wider text-[11px]">Liên Hệ &amp; Showroom</h4>
            <ul className="space-y-1.5 text-zinc-400 text-[11px]">
              <li>
                <span className="text-zinc-500">CSKH:</span>{" "}
                <span className="text-white font-semibold font-mono">{hotline}</span> ({workingHours})
              </li>
              <li>
                <span className="text-zinc-500">Showroom:</span> {address}
              </li>
              <li>
                <span className="text-zinc-500">Email:</span> {email}
              </li>
              <li className="pt-1 flex items-center gap-2">
                {settings?.facebook_url && (
                  <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white">
                    Facebook
                  </a>
                )}
                {settings?.youtube_url && (
                  <a href={settings.youtube_url} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white">
                    • YouTube
                  </a>
                )}
                {settings?.zalo_url && (
                  <a href={settings.zalo_url} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white">
                    • Zalo
                  </a>
                )}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-900 flex flex-wrap items-center justify-between text-zinc-500 text-[11px] gap-2">
          <div>{copyright}</div>
          <div className="flex items-center gap-3">
            <Link href="/trang/chinh-sach-mua-hang" className="hover:text-zinc-300 transition-colors">
              Chính sách bảo mật
            </Link>
            <span>•</span>
            <Link href="/trang/chinh-sach-doi-tra" className="hover:text-zinc-300 transition-colors">
              Điều khoản dịch vụ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
