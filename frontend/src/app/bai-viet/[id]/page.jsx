"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import axiosClient from "@/services/axiosClient";
import {
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  MessageSquareIcon,
  ArrowRightIcon,
  SendIcon,
  LockIcon,
  CornerDownRightIcon,
  BrandLogoIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  UserCircleIcon,
  AlertCircleIcon,
  StarIcon,
} from "@/components/Icons";

export default function ArticleDetailPage() {
  const routerParams = useParams();
  const postId = routerParams?.id;

  const [post, setPost] = useState(null);
  const [relatedProduct, setRelatedProduct] = useState(null);
  const [comments, setComments] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Form thảo luận
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState("");
  const [commentError, setCommentError] = useState("");

  // Kiểm tra tài khoản đăng nhập để tự điền form
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          const userObj = JSON.parse(savedUser);
          setCurrentUser(userObj);
          if (userObj.name) setAuthorName(userObj.name);
          if (userObj.email) setAuthorEmail(userObj.email);
        } catch {
          // ignore
        }
      }
    }
  }, []);

  // Tải chi tiết bài viết và thảo luận
  useEffect(() => {
    if (!postId) return;
    setLoading(true);

    axiosClient
      .get(`/posts/${postId}`)
      .then((res) => {
        if (res.data) {
          setPost(res.data);
          setRelatedProduct(res.related_product || res.data.product || null);
          setComments(res.comments || []);
          setRelatedPosts(res.related_posts || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi tải chi tiết bài viết:", err);
        setLoading(false);
      });
  }, [postId]);

  // Gửi bình luận thảo luận mới
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentError("");
    setCommentSuccess("");

    if (!commentContent.trim()) {
      setCommentError("Vui lòng nhập nội dung ý kiến thảo luận của bạn.");
      return;
    }

    if (!currentUser && (!authorName.trim() || !authorEmail.trim())) {
      setCommentError("Vui lòng cung cấp Họ tên và Email để đăng bình luận.");
      return;
    }

    setSubmittingComment(true);

    try {
      const payload = {
        content: commentContent.trim(),
        author_name: authorName.trim() || currentUser?.name || "Khách hàng",
        author_email: authorEmail.trim() || currentUser?.email || "guest@example.com",
      };

      const res = await axiosClient.post(`/posts/${postId}/comments`, payload);

      if (res.success && res.data) {
        // Cập nhật danh sách thảo luận tức thì
        setComments((prev) => [res.data, ...prev]);
        setCommentContent("");
        setCommentSuccess("Bình luận của bạn đã được đăng thành công!");
        setTimeout(() => setCommentSuccess(""), 4000);
      } else {
        setCommentError(res.message || "Không thể gửi bình luận. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Lỗi gửi bình luận:", err);
      const msg =
        err.response?.data?.message ||
        "Gửi bình luận không thành công. Bạn vui lòng kiểm tra kết nối mạng hoặc thử lại.";
      setCommentError(msg);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (val) => {
    if (!val) return "";
    return Number(val).toLocaleString("vi-VN") + " đ";
  };

  // Trích xuất danh sách Mục lục (Table of Contents)
  const extractTableOfContents = (content) => {
    if (!content) return [];
    const normalized = content.replace(/\r\n/g, "\n");
    const regex = /^##\s+(.+)$/gm;
    const headings = [];
    let match;
    let index = 0;
    while ((match = regex.exec(normalized)) !== null) {
      const rawTitle = match[1].trim();
      // Loại bỏ số thứ tự có sẵn trong tiêu đề (ví dụ "1. Thiết kế..." -> "Thiết kế...")
      const cleanTitle = rawTitle.replace(/^\d+\.\s*/, "");
      headings.push({
        id: `section-heading-${index}`,
        number: index + 1,
        title: cleanTitle,
      });
      index++;
    }
    return headings;
  };

  // Xử lý render chữ đậm **text** (Hỗ trợ isDark: màu vàng amber nổi bật trên nền đen, tránh chữ đen tàng hình)
  const renderInlineStyles = (text, isDark = false) => {
    if (!text) return "";
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong
            key={i}
            className={`font-bold ${isDark ? "text-amber-400" : "text-zinc-950"}`}
          >
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  // Trình render nội dung tạp chí công nghệ chuẩn Editorial Magazine
  const renderFormattedContent = (content) => {
    if (!content) return null;
    const normalized = content.replace(/\r\n/g, "\n");
    const rawParagraphs = normalized.split(/\n\s*\n/);
    let h2Counter = 0;

    return rawParagraphs.map((block, blockIdx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      // 1. Khung Ảnh Minh Họa ![caption](url)
      const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        const caption = imgMatch[1];
        const url = imgMatch[2];
        return (
          <figure
            key={`fig-${blockIdx}`}
            className="my-8 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 shadow-sm"
          >
            <img
              src={url}
              alt={caption || "Hình ảnh minh họa bài viết"}
              className="w-full max-h-[480px] object-cover hover:scale-[1.01] transition-transform duration-500"
              loading="lazy"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=80";
              }}
            />
            {caption && (
              <figcaption className="px-4 py-3 text-center text-xs italic text-zinc-500 border-t border-zinc-200/80 bg-white">
                {caption}
              </figcaption>
            )}
          </figure>
        );
      }

      // 2. Tiêu đề cấp 2 (## Tiêu đề)
      if (trimmed.startsWith("## ")) {
        const headingId = `section-heading-${h2Counter++}`;
        const lines = trimmed.split("\n");
        const headingTitle = lines[0].replace(/^##\s+/, "");
        const restOfBlock = lines.slice(1).join("\n").trim();

        return (
          <div key={`h2-block-${blockIdx}`} className="space-y-4">
            <h2
              id={headingId}
              className="text-xl sm:text-2xl font-black text-zinc-950 mt-10 mb-4 tracking-tight border-l-4 border-zinc-900 pl-3.5 scroll-mt-24"
            >
              {headingTitle}
            </h2>
            {restOfBlock && (
              <p className="text-zinc-700 leading-relaxed text-sm sm:text-base">
                {renderInlineStyles(restOfBlock, false)}
              </p>
            )}
          </div>
        );
      }

      // 3. Tiêu đề cấp 3 (### Tiêu đề)
      if (trimmed.startsWith("### ")) {
        const lines = trimmed.split("\n");
        const headingTitle = lines[0].replace(/^###\s+/, "");
        const restOfBlock = lines.slice(1).join("\n").trim();

        return (
          <div key={`h3-block-${blockIdx}`} className="space-y-3">
            <h3 className="text-lg sm:text-xl font-bold text-zinc-900 mt-8 mb-3 tracking-tight">
              {headingTitle}
            </h3>
            {restOfBlock && (
              <p className="text-zinc-700 leading-relaxed text-sm sm:text-base">
                {renderInlineStyles(restOfBlock)}
              </p>
            )}
          </div>
        );
      }

      // 4. Bảng Markdown (| Cột 1 | Cột 2 |)
      if (trimmed.startsWith("|") && trimmed.includes("\n|")) {
        const tableLines = trimmed
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.startsWith("|"));

        if (tableLines.length >= 2) {
          const parseCells = (line) =>
            line
              .split("|")
              .slice(1, -1)
              .map((c) => c.trim());

          const headerCells = parseCells(tableLines[0]);
          // Dòng 1 là separator (|---|---|), các dòng sau là rows
          const rowLines = tableLines.slice(2);

          return (
            <div
              key={`table-${blockIdx}`}
              className="my-8 overflow-x-auto rounded-2xl border border-zinc-200/90 shadow-xs"
            >
              <table className="w-full text-xs sm:text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-900 text-white font-mono text-xs uppercase tracking-wider">
                    {headerCells.map((h, i) => (
                      <th key={i} className="py-3 px-4 font-bold border-b border-zinc-800">
                        {renderInlineStyles(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/80 bg-white">
                  {rowLines.map((row, rIdx) => {
                    const cells = parseCells(row);
                    return (
                      <tr
                        key={rIdx}
                        className={rIdx % 2 === 0 ? "bg-white" : "bg-zinc-50/70"}
                      >
                        {cells.map((c, cIdx) => (
                          <td key={cIdx} className="py-3 px-4 text-zinc-800 leading-relaxed">
                            {renderInlineStyles(c)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        }
      }

      // 5. Hộp Điểm Nhấn Nhanh / Trích dẫn (> )
      if (trimmed.startsWith("> ")) {
        const quoteLines = trimmed
          .split("\n")
          .map((l) => l.replace(/^>\s?/, "").trim())
          .filter(Boolean);

        return (
          <blockquote
            key={`quote-${blockIdx}`}
            className="bg-zinc-950 text-zinc-100 rounded-2xl p-6 sm:p-7 my-7 border border-zinc-800 shadow-md space-y-2.5 font-sans"
          >
            {quoteLines.map((ql, qIdx) => (
              <p key={qIdx} className="text-xs sm:text-sm leading-relaxed text-zinc-200">
                {renderInlineStyles(ql, true)}
              </p>
            ))}
          </blockquote>
        );
      }

      // 6. Danh sách gạch đầu dòng (- hoặc *)
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const items = trimmed
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.startsWith("- ") || l.startsWith("* "));

        return (
          <ul
            key={`ul-${blockIdx}`}
            className="space-y-2.5 my-5 list-disc list-inside text-zinc-700 text-sm sm:text-base leading-relaxed pl-2"
          >
            {items.map((it, i) => (
              <li key={i} className="leading-relaxed">
                {renderInlineStyles(it.replace(/^[-*]\s+/, ""))}
              </li>
            ))}
          </ul>
        );
      }

      // 7. Đoạn văn xuôi thông thường
      return (
        <p
          key={`p-${blockIdx}`}
          className="text-zinc-700 text-sm sm:text-base leading-relaxed my-5"
        >
          {renderInlineStyles(trimmed)}
        </p>
      );
    });
  };

  const tableOfContents = post ? extractTableOfContents(post.content) : [];

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans text-zinc-900 antialiased">
      <StoreHeader />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        {/* =========================================================================
            1. BREADCRUMBS & NÚT QUAY LẠI
            ========================================================================= */}
        <nav className="flex items-center justify-between border-b border-zinc-200 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 overflow-hidden">
            <Link href="/trangchu" className="hover:text-zinc-900 transition-colors shrink-0">
              Trang chủ
            </Link>
            <span>/</span>
            <Link href="/bai-viet" className="hover:text-zinc-900 transition-colors shrink-0">
              Bài viết công nghệ
            </Link>
            {post && (
              <>
                <span>/</span>
                <span className="text-zinc-900 font-medium truncate max-w-[200px] sm:max-w-xs">
                  {post.title}
                </span>
              </>
            )}
          </div>

          <Link
            href="/bai-viet"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 hover:text-black shrink-0 px-3 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-400 transition-colors"
          >
            <ChevronLeftIcon className="w-3.5 h-3.5" />
            <span>Tất cả bài viết</span>
          </Link>
        </nav>

        {loading ? (
          /* Skeleton Loading Detail */
          <div className="space-y-6 animate-pulse">
            <div className="h-6 bg-zinc-200 rounded w-1/4" />
            <div className="h-10 bg-zinc-200 rounded w-3/4" />
            <div className="h-4 bg-zinc-200 rounded w-1/2" />
            <div className="aspect-[21/9] bg-zinc-200 rounded-3xl w-full" />
            <div className="space-y-3 pt-4">
              <div className="h-4 bg-zinc-200 rounded w-full" />
              <div className="h-4 bg-zinc-200 rounded w-full" />
              <div className="h-4 bg-zinc-200 rounded w-5/6" />
            </div>
          </div>
        ) : post ? (
          <article className="space-y-8">
            {/* Header bài viết */}
            <header className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-zinc-900 text-white text-xs font-mono font-medium">
                  {post.category}
                </span>
                {post.is_featured && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-mono border border-amber-300 font-bold">
                    <StarIcon className="w-3 h-3 text-amber-500" />
                    TÂM ĐIỂM CÔNG NGHỆ
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-zinc-950 leading-tight tracking-tight">
                {post.title}
              </h1>

              {/* Dòng tác giả và chỉ số đọc */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-y border-zinc-200/80 py-3 text-xs font-mono text-zinc-600">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-950 text-white flex items-center justify-center font-bold text-xs">
                    BC
                  </div>
                  <div>
                    <span className="font-sans font-bold text-zinc-900 block">
                      {post.author_name || "Ban Biên Tập Bảo Công Studio"}
                    </span>
                    <span className="text-[10px] text-zinc-500">Chuyên viên Kỹ thuật Phần cứng</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-zinc-500">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {formatDate(post.created_at)}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <ClockIcon className="w-3.5 h-3.5" />
                    {post.reading_time || "5 phút đọc"}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <EyeIcon className="w-3.5 h-3.5" />
                    {post.views?.toLocaleString()} lượt xem
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <MessageSquareIcon className="w-3.5 h-3.5" />
                    {comments.length} thảo luận
                  </span>
                </div>
              </div>
            </header>

            {/* Thumbnail ảnh bìa chính */}
            {post.thumbnail && (
              <div className="aspect-[21/9] sm:aspect-[16/8] rounded-3xl overflow-hidden border border-zinc-200/90 shadow-sm bg-zinc-100">
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Tóm tắt mở đầu (Lead paragraph) */}
            {post.summary && (
              <div className="bg-zinc-100/90 border-l-4 border-zinc-900 rounded-r-2xl p-5 sm:p-6 text-zinc-800 text-sm sm:text-base leading-relaxed font-medium">
                {post.summary}
              </div>
            )}

            {/* =========================================================================
                MỤC LỤC TỰ ĐỘNG (TABLE OF CONTENTS)
                ========================================================================= */}
            {tableOfContents.length > 0 && (
              <nav className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 sm:p-6 space-y-3.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-2.5">
                  <BookOpenIcon className="w-4 h-4 text-zinc-800" />
                  <span>Mục lục nội dung bài viết</span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-zinc-700 font-medium">
                  {tableOfContents.map((item) => (
                    <li key={item.id} className="flex items-start gap-2 group">
                      <span className="font-mono font-bold text-zinc-900 shrink-0 select-none">
                        {item.number}.
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById(item.id);
                          if (el) {
                            el.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        }}
                        className="text-left text-zinc-700 group-hover:text-black group-hover:underline transition-colors leading-relaxed"
                      >
                        {item.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {/* =========================================================================
                THẺ SẢN PHẨM ĐỀ XUẤT TRONG BÀI VIẾT (RELATED PRODUCT CALLOUT)
                ========================================================================= */}
            {relatedProduct && (
              <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white rounded-3xl p-6 sm:p-8 my-8 border border-zinc-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5 w-full md:w-auto">
                  {relatedProduct.image && (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-zinc-800 border border-zinc-700 overflow-hidden shrink-0 flex items-center justify-center p-2">
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 text-[10px] font-mono font-bold border border-amber-400/20">
                      SẢN PHẨM NHẮC ĐẾN TRONG BÀI VIẾT
                    </span>
                    <h3 className="font-extrabold text-base sm:text-lg text-white">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-baseline gap-2 pt-0.5">
                      <span className="text-lg sm:text-xl font-black font-mono text-white">
                        {formatCurrency(relatedProduct.sale_price || relatedProduct.price)}
                      </span>
                      {relatedProduct.sale_price && (
                        <span className="text-xs text-zinc-400 line-through font-mono">
                          {formatCurrency(relatedProduct.price)}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-emerald-400 font-mono block">
                      ✓ Sẵn hàng tại showroom • Bảo hành 12 tháng 1 đổi 1
                    </span>
                  </div>
                </div>

                <Link
                  href={`/products/${relatedProduct.id}`}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 font-bold text-xs sm:text-sm hover:bg-zinc-200 transition-colors shrink-0 shadow-md group"
                >
                  <span>Xem chi tiết & Mua ngay</span>
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}

            {/* Nội dung bài viết chi tiết */}
            <div className="prose-zinc max-w-none text-zinc-800 leading-relaxed font-sans text-base">
              {renderFormattedContent(post.content)}
            </div>

            {/* Chữ ký ban biên tập */}
            <div className="bg-zinc-100/70 border border-zinc-200 rounded-2xl p-5 flex items-center justify-between gap-4 mt-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center">
                  <BrandLogoIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-900 font-mono">
                    Bảo Công Studio Editorial
                  </h4>
                  <p className="text-xs text-zinc-600">
                    Mọi ý kiến đóng góp hoặc thắc mắc kỹ thuật, vui lòng gửi phản hồi ở khung thảo luận bên dưới.
                  </p>
                </div>
              </div>
            </div>

            {/* =========================================================================
                2. BÀI VIẾT LIÊN QUAN (RELATED POSTS)
                ========================================================================= */}
            {relatedPosts.length > 0 && (
              <section className="pt-8 border-t border-zinc-200 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-extrabold text-zinc-900 font-sans tracking-tight">
                    Bài viết cùng chuyên mục liên quan
                  </h3>
                  <Link
                    href={`/bai-viet?category=${encodeURIComponent(post.category)}`}
                    className="text-xs font-semibold text-zinc-600 hover:text-black inline-flex items-center gap-1"
                  >
                    Xem thêm <ArrowRightIcon className="w-3 h-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {relatedPosts.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/bai-viet/${rel.id}`}
                      className="group bg-white rounded-2xl p-4 border border-zinc-200/90 hover:border-zinc-900 transition-all shadow-sm hover:shadow-md flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        {rel.thumbnail && (
                          <div className="aspect-video rounded-xl overflow-hidden bg-zinc-100">
                            <img
                              src={rel.thumbnail}
                              alt={rel.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <span className="text-[10px] font-mono font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200 uppercase">
                          {rel.category}
                        </span>
                        <h4 className="font-bold text-sm text-zinc-900 group-hover:text-black line-clamp-2 leading-snug">
                          {rel.title}
                        </h4>
                      </div>

                      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                        <span>{formatDate(rel.created_at)}</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-zinc-800">
                          Đọc tiếp <ArrowRightIcon className="w-3 h-3" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* =========================================================================
                3. KHUNG THẢO LUẬN & BÌNH LUẬN 2 CHIỀU (COMMUNITY DISCUSSION)
                ========================================================================= */}
            <section id="thao-luan" className="pt-10 border-t border-zinc-200 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
                    <MessageSquareIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-zinc-950 tracking-tight">
                      Góc Thảo Luận & Nhận Định
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Giao lưu, đặt câu hỏi kỹ thuật hoặc chia sẻ cảm nhận của bạn với cộng đồng.
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-900 font-mono text-xs font-bold border border-zinc-200">
                  {comments.length} ý kiến
                </span>
              </div>

              {/* Trạng thái BẬT / TẮT thảo luận do Admin điều khiển */}
              {!post.allow_comments ? (
                <div className="bg-zinc-100/90 border border-zinc-300 rounded-2xl p-5 flex items-center gap-3.5 text-zinc-700">
                  <LockIcon className="w-5 h-5 text-zinc-500 shrink-0" />
                  <div>
                    <p className="font-bold text-xs uppercase font-mono tracking-wider text-zinc-800">
                      Khung thảo luận đã được tạm khóa
                    </p>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      Chủ đề thảo luận cho bài viết này đã được đóng bởi ban quản trị. Bạn vẫn có thể đọc các ý kiến trước đó bên dưới.
                    </p>
                  </div>
                </div>
              ) : (
                /* Form gửi bình luận thảo luận */
                <form
                  onSubmit={handleCommentSubmit}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-zinc-200 shadow-sm space-y-4"
                >
                  <h4 className="text-sm font-bold text-zinc-900">Để lại ý kiến thảo luận của bạn</h4>

                  {commentSuccess && (
                    <div className="p-3 bg-zinc-900 text-white rounded-xl text-xs flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{commentSuccess}</span>
                    </div>
                  )}

                  {commentError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{commentError}</span>
                    </div>
                  )}

                  {!currentUser && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-zinc-600 mb-1">
                          Họ và tên <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                          placeholder="Ví dụ: Hoàng Tuấn"
                          className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-900 focus:bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-zinc-600 mb-1">
                          Địa chỉ Email <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={authorEmail}
                          onChange={(e) => setAuthorEmail(e.target.value)}
                          placeholder="email@example.com"
                          className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-900 focus:bg-white"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {currentUser && (
                    <div className="flex items-center gap-2 text-xs text-zinc-600 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/80">
                      <UserCircleIcon className="w-4 h-4 text-zinc-700" />
                      <span>
                        Bình luận dưới danh nghĩa:{" "}
                        <strong className="text-zinc-900">{currentUser.name}</strong> ({currentUser.email})
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-mono text-zinc-600 mb-1">
                      Nội dung thảo luận <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Chia sẻ quan điểm, đánh giá hoặc câu hỏi của bạn về nội dung bài viết..."
                      className="w-full p-3 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-900 focus:bg-white transition-all text-zinc-900 placeholder-zinc-400"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={submittingComment}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-black transition-colors disabled:opacity-50"
                    >
                      <SendIcon className="w-3.5 h-3.5" />
                      <span>{submittingComment ? "Đang gửi..." : "Gửi ý kiến"}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Danh sách bình luận & Phản hồi chính thức từ Admin */}
              <div className="space-y-4 pt-2">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-white rounded-2xl p-5 border border-zinc-200/90 shadow-sm space-y-3"
                    >
                      {/* Người bình luận */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-200 text-zinc-800 flex items-center justify-center font-bold text-xs font-mono">
                            {comment.author_name?.charAt(0)?.toUpperCase() || "K"}
                          </div>
                          <div>
                            <span className="font-bold text-xs sm:text-sm text-zinc-900 block">
                              {comment.author_name}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Nội dung thảo luận */}
                      <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed pl-11">
                        {comment.content}
                      </p>

                      {/* PHẢN HỒI CHÍNH THỨC TỪ BẢO CÔNG STUDIO (NẾU CÓ) */}
                      {comment.admin_reply && (
                        <div className="ml-8 sm:ml-11 mt-3 bg-zinc-950 text-white rounded-xl p-4 border border-zinc-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CornerDownRightIcon className="w-3.5 h-3.5 text-zinc-400" />
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-mono font-bold text-emerald-400">
                                <CheckCircleIcon className="w-3 h-3 text-emerald-400" />
                                <span>Phản hồi chính thức từ Bảo Công Studio</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-500">Ban Quản Trị</span>
                          </div>
                          <p className="text-xs text-zinc-300 leading-relaxed pl-5">
                            {comment.admin_reply}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs font-mono text-zinc-400 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                    Chưa có ý kiến thảo luận nào. Hãy là người đầu tiên chia sẻ cảm nghĩ!
                  </div>
                )}
              </div>
            </section>
          </article>
        ) : (
          <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center space-y-3">
            <h3 className="text-base font-bold text-zinc-900">Bài viết không tồn tại</h3>
            <p className="text-xs text-zinc-500">
              Bài viết bạn đang tìm có thể đã bị ẩn hoặc gỡ bỏ khỏi hệ thống.
            </p>
            <Link
              href="/bai-viet"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-medium hover:bg-black"
            >
              Quay lại danh sách bài viết
            </Link>
          </div>
        )}
      </main>

      <StoreFooter />
    </div>
  );
}
