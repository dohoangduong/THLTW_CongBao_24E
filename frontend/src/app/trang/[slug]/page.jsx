"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axiosClient from "@/services/axiosClient";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import { AlertCircleIcon, BookOpenIcon, ClockIcon, ArrowRightIcon } from "@/components/Icons";

export default function StaticPageView() {
  const params = useParams();
  const slug = params?.slug;
  const router = useRouter();

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error404, setError404] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError404(false);

    axiosClient
      .get(`/pages/${slug}`)
      .then((res) => {
        const pageData = res?.data || res;
        if (!pageData || pageData.status === 0) {
          setError404(true);
        } else {
          setPage(pageData);
        }
      })
      .catch((err) => {
        console.error("Lỗi khi tải trang tĩnh:", err);
        setError404(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col font-sans antialiased">
        <StoreHeader />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 space-y-4">
          <div className="h-8 w-48 bg-zinc-200 animate-pulse rounded-lg" />
          <div className="h-4 w-72 bg-zinc-200 animate-pulse rounded" />
          <div className="h-96 w-full bg-zinc-100 animate-pulse rounded-2xl mt-6" />
        </main>
        <StoreFooter />
      </div>
    );
  }

  // Giao diện chuẩn 404 khi không tìm thấy trang hoặc trang đang ẩn
  if (error404 || !page) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col font-sans antialiased">
        <StoreHeader />
        <main className="flex-1 max-w-lg w-full mx-auto px-4 py-20 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 mb-4 shadow-2xs">
            <AlertCircleIcon className="w-8 h-8 text-zinc-400" />
          </div>
          <span className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-widest">
            ERROR 404
          </span>
          <h1 className="text-2xl font-black text-zinc-900 mt-2 tracking-tight">
            Trang hoặc bản ghi không tồn tại
          </h1>
          <p className="text-xs text-zinc-500 mt-2 max-w-sm leading-relaxed">
            Nội dung bạn đang tìm kiếm có thể đã bị xóa, thay đổi đường dẫn hoặc đang tạm thời bị ẩn bởi Quản trị viên.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link
              href="/trangchu"
              className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition shadow-2xs"
            >
              Về Trang chủ
            </Link>
            <Link
              href="/products"
              className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-semibold px-4 py-2.5 rounded-lg transition"
            >
              Xem Sản phẩm
            </Link>
          </div>
        </main>
        <StoreFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col font-sans antialiased">
      <StoreHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-6 font-medium">
          <Link href="/trangchu" className="hover:text-zinc-900 transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-zinc-400">Trang thông tin</span>
          <span>/</span>
          <span className="text-zinc-900 font-bold truncate">{page.title}</span>
        </nav>

        {/* Nội dung bài trang */}
        <article className="bg-white border border-zinc-200/80 rounded-2xl p-6 sm:p-10 shadow-2xs space-y-6">
          <header className="border-b border-zinc-100 pb-6 space-y-3">
            <div className="inline-flex items-center gap-2 bg-zinc-100 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold text-zinc-700">
              <BookOpenIcon className="w-3.5 h-3.5 text-zinc-700" />
              <span>CHÍNH SÁCH &amp; HƯỚNG DẪN BẢO CÔNG</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight leading-snug">
              {page.title}
            </h1>
            {page.summary && (
              <p className="text-sm text-zinc-600 leading-relaxed font-medium bg-zinc-50 border-l-2 border-zinc-900 p-3 rounded-r-lg">
                {page.summary}
              </p>
            )}
          </header>

          <div className="prose prose-zinc max-w-none text-xs sm:text-sm text-zinc-700 leading-relaxed space-y-4">
            {page.content.split("\n\n").map((para, idx) => {
              if (para.startsWith("## ")) {
                return (
                  <h2 key={idx} className="text-lg font-bold text-zinc-900 mt-6 pt-2 border-b border-zinc-100 pb-1">
                    {para.replace("## ", "")}
                  </h2>
                );
              }
              if (para.startsWith("### ")) {
                return (
                  <h3 key={idx} className="text-sm font-bold text-zinc-800 mt-4">
                    {para.replace("### ", "")}
                  </h3>
                );
              }
              if (para.startsWith("- ") || para.startsWith("* ")) {
                const listItems = para.split("\n");
                return (
                  <ul key={idx} className="list-disc pl-5 space-y-1">
                    {listItems.map((li, i) => (
                      <li key={i}>{li.replace(/^[-*]\s+/, "")}</li>
                    ))}
                  </ul>
                );
              }
              if (para.match(/^\d+\.\s/)) {
                const listItems = para.split("\n");
                return (
                  <ol key={idx} className="list-decimal pl-5 space-y-1">
                    {listItems.map((li, i) => (
                      <li key={i}>{li.replace(/^\d+\.\s+/, "")}</li>
                    ))}
                  </ol>
                );
              }
              return <p key={idx}>{para}</p>;
            })}
          </div>

          <footer className="pt-6 border-t border-zinc-100 flex flex-wrap items-center justify-between text-xs text-zinc-500 gap-3">
            <div>
              Cập nhật lần cuối:{" "}
              <b className="font-mono text-zinc-700">
                {page.updated_at ? new Date(page.updated_at).toLocaleDateString("vi-VN") : "—"}
              </b>
            </div>
            <Link
              href="/ho-tro"
              className="inline-flex items-center gap-1.5 text-zinc-900 font-bold hover:underline"
            >
              <span>Gửi câu hỏi tới Trung tâm hỗ trợ</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </footer>
        </article>
      </main>

      <StoreFooter />
    </div>
  );
}

