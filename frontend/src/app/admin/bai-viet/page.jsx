"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import axiosClient from "@/services/axiosClient";
import {
  BookOpenIcon,
  SearchIcon,
  PlusIcon,
  EyeIcon,
  EyeOffIcon,
  PinIcon,
  LockIcon,
  UnlockIcon,
  EditIcon,
  TrashIcon,
  ExternalLinkIcon,
  XIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  MessageSquareIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  TagIcon,
  ClockIcon,
  ArrowRightIcon,
} from "@/components/Icons";

const CATEGORIES = [
  "Đánh giá Flagship",
  "Tin tức công nghệ",
  "Mẹo & Thủ thuật",
  "Khuyến mãi & Sự kiện",
];

export default function AdminArticlesPage() {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    visible: 0,
    total_views: 0,
    total_comments: 0,
    featured: 0,
  });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  // Danh sách sản phẩm khả dụng từ database
  const [availableProducts, setAvailableProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState(CATEGORIES);

  // Bộ lọc
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("");

  // Modal Thêm / Sửa
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState("editor"); // 'editor' | 'preview'
  const [showImagePrompt, setShowImagePrompt] = useState(false);
  const [imageInput, setImageInput] = useState({ url: "", caption: "" });
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingInlineImage, setUploadingInlineImage] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category: CATEGORIES[0],
    thumbnail: "",
    reading_time: "6 phút đọc",
    author_name: "Ban Biên Tập Bảo Công Studio",
    summary: "",
    content: "",
    product_id: "",
    is_featured: false,
    is_visible: true,
    allow_comments: true,
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [notification, setNotification] = useState({ type: "", message: "" });

  const notify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: "", message: "" }), 4000);
  };

  // Tải thống kê tổng quan
  const fetchStats = useCallback(async () => {
    try {
      const res = await axiosClient.get("/admin/posts/stats");
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error("Lỗi khi tải thống kê bài viết:", err);
    }
  }, []);

  // Tải danh sách bài viết
  const fetchPosts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("per_page", "10");
      if (search.trim()) params.append("search", search.trim());
      if (categoryFilter) params.append("category", categoryFilter);
      if (visibilityFilter) params.append("is_visible", visibilityFilter);

      const res = await axiosClient.get(`/admin/posts?${params.toString()}`);
      if (res.data) {
        setPosts(res.data);
      }
      if (res.meta) {
        setPagination(res.meta);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách bài viết Admin:", err);
      notify("error", "Không thể kết nối máy chủ để tải danh sách bài viết.");
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, visibilityFilter]);

  // Tải danh sách sản phẩm để gắn kèm bài viết
  const fetchProducts = useCallback(async () => {
    try {
      const res = await axiosClient.get("/products?all=1");
      if (res.data) {
        setAvailableProducts(res.data);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách sản phẩm:", err);
    }
  }, []);

  // Tải danh mục chủ đề bài viết động từ MySQL
  const fetchCategories = useCallback(async () => {
    try {
      const res = await axiosClient.get("/admin/post-categories");
      const list = res.data?.data || res.data || [];
      if (Array.isArray(list) && list.length > 0) {
        setCategoriesList(list.map((c) => c.name));
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách chủ đề bài viết:", err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchPosts(1);
    fetchProducts();
    fetchCategories();
  }, [fetchStats, fetchPosts, fetchProducts, fetchCategories]);

  // Micro-control 1: Toggle Ẩn / Hiện
  const handleToggleVisibility = async (post) => {
    try {
      const res = await axiosClient.put(`/admin/posts/${post.id}/toggle-visibility`);
      if (res.success) {
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, is_visible: res.is_visible } : p))
        );
        fetchStats();
        notify("success", res.message || "Đã cập nhật trạng thái hiển thị!");
      }
    } catch (err) {
      console.error("Lỗi toggle visibility:", err);
      notify("error", "Lỗi khi thay đổi trạng thái hiển thị.");
    }
  };

  // Micro-control 2: Toggle Ghim Bento
  const handleToggleFeatured = async (post) => {
    try {
      const res = await axiosClient.put(`/admin/posts/${post.id}/toggle-featured`);
      if (res.success) {
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, is_featured: res.is_featured } : p))
        );
        fetchStats();
        notify("success", res.message || "Đã cập nhật ghim bài viết tâm điểm!");
      }
    } catch (err) {
      console.error("Lỗi toggle featured:", err);
      notify("error", "Lỗi khi cập nhật ghim bài viết.");
    }
  };

  // Micro-control 3: Toggle Khóa / Mở bình luận
  const handleToggleComments = async (post) => {
    try {
      const res = await axiosClient.put(`/admin/posts/${post.id}/toggle-comments`);
      if (res.success) {
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, allow_comments: res.allow_comments } : p))
        );
        notify("success", res.message || "Đã cập nhật quyền thảo luận cho bài viết!");
      }
    } catch (err) {
      console.error("Lỗi toggle comments:", err);
      notify("error", "Lỗi khi cập nhật quyền bình luận.");
    }
  };

  // Mở modal tạo mới
  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedPostId(null);
    setActiveModalTab("editor");
    setShowImagePrompt(false);
    setImageInput({ url: "", caption: "" });
    setFormData({
      title: "",
      category: CATEGORIES[0],
      thumbnail: "",
      reading_time: "6 phút đọc",
      author_name: "Ban Biên Tập Bảo Công Studio",
      summary: "",
      content: "",
      product_id: "",
      is_featured: false,
      is_visible: true,
      allow_comments: true,
    });
    setShowModal(true);
  };

  // Mở modal sửa
  const handleOpenEdit = (post) => {
    setModalMode("edit");
    setSelectedPostId(post.id);
    setActiveModalTab("editor");
    setShowImagePrompt(false);
    setImageInput({ url: "", caption: "" });
    setFormData({
      title: post.title || "",
      category: post.category || CATEGORIES[0],
      thumbnail: post.thumbnail || "",
      reading_time: post.reading_time || "6 phút đọc",
      author_name: post.author_name || "Ban Biên Tập Bảo Công Studio",
      summary: post.summary || "",
      content: post.content || "",
      product_id: post.product_id ? String(post.product_id) : "",
      is_featured: Boolean(post.is_featured),
      is_visible: Boolean(post.is_visible),
      allow_comments: Boolean(post.allow_comments),
    });
    setShowModal(true);
  };

  // Chèn mã Markdown vào con trỏ của ô soạn thảo
  const insertSnippet = (snippet) => {
    const textarea = document.getElementById("admin-post-content");
    if (!textarea) {
      setFormData((prev) => ({
        ...prev,
        content: (prev.content ? prev.content + "\n\n" : "") + snippet,
      }));
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content || "";
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newContent = before + snippet + after;
    setFormData((prev) => ({ ...prev, content: newContent }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 40);
  };

  // Upload ảnh lên API /api/upload-image kèm kiểm tra client-side nghiêm ngặt
  const uploadImageFile = async (file) => {
    // 1. Kiểm tra Client-side định dạng PNG hoặc JPG/JPEG
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      notify("error", "Chỉ chấp nhận file ảnh định dạng PNG hoặc JPG/JPEG!");
      return null;
    }

    // 2. Kiểm tra dung lượng tối đa 10MB (10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      notify("error", "Dung lượng ảnh vượt quá giới hạn cho phép (Tối đa 10MB)!");
      return null;
    }

    // 3. Gửi FormData lên API /api/upload-image
    const uploadData = new FormData();
    uploadData.append("image", file);

    try {
      const res = await axiosClient.post("/upload-image", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.success && res.url) {
        notify("success", "Đã tải ảnh lên máy chủ thành công!");
        return res.url;
      } else {
        notify("error", res.message || "Tải ảnh không thành công!");
        return null;
      }
    } catch (err) {
      console.error("Lỗi khi tải ảnh:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.image?.[0] ||
        "Không thể kết nối đến máy chủ để tải ảnh. Vui lòng kiểm tra lại!";
      notify("error", msg);
      return null;
    }
  };

  // Tải ảnh bìa trực tiếp từ máy tính
  const handleThumbnailFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumb(true);
    try {
      const url = await uploadImageFile(file);
      if (url) {
        setFormData((prev) => ({ ...prev, thumbnail: url }));
      }
    } finally {
      setUploadingThumb(false);
      e.target.value = "";
    }
  };

  // Tải ảnh minh họa trực tiếp từ máy tính
  const handleInlineImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingInlineImage(true);
    try {
      const url = await uploadImageFile(file);
      if (url) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        setImageInput((prev) => ({
          ...prev,
          url: url,
          caption: prev.caption ? prev.caption : cleanName,
        }));
      }
    } finally {
      setUploadingInlineImage(false);
      e.target.value = "";
    }
  };

  // Trích xuất danh sách Mục lục (Table of Contents) cho Live Preview
  const extractTableOfContents = (content) => {
    if (!content) return [];
    const normalized = content.replace(/\r\n/g, "\n");
    const regex = /^##\s+(.+)$/gm;
    const headings = [];
    let match;
    let index = 0;
    while ((match = regex.exec(normalized)) !== null) {
      const rawTitle = match[1].trim();
      const cleanTitle = rawTitle.replace(/^\d+\.\s*/, "");
      headings.push({
        id: `preview-heading-${index}`,
        number: index + 1,
        title: cleanTitle,
      });
      index++;
    }
    return headings;
  };

  // Chèn ảnh minh họa
  const handleInsertImage = () => {
    if (!imageInput.url.trim()) {
      notify("error", "Vui lòng nhập đường dẫn URL ảnh minh họa.");
      return;
    }
    const caption = imageInput.caption.trim() || "Hình ảnh minh họa chi tiết sản phẩm";
    const snippet = `\n\n![${caption}](${imageInput.url.trim()})\n\n`;
    insertSnippet(snippet);
    setImageInput({ url: "", caption: "" });
    setShowImagePrompt(false);
    notify("success", "Đã chèn ảnh minh họa vào bài viết!");
  };

  // Lưu form (Thêm hoặc Sửa)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    const payload = {
      ...formData,
      product_id: formData.product_id ? parseInt(formData.product_id, 10) : null,
    };

    try {
      if (modalMode === "create") {
        const res = await axiosClient.post("/admin/posts", payload);
        if (res.success) {
          notify("success", "Đã tạo bài viết công nghệ mới thành công!");
          setShowModal(false);
          fetchPosts(1);
          fetchStats();
        }
      } else {
        const res = await axiosClient.put(`/admin/posts/${selectedPostId}`, payload);
        if (res.success) {
          notify("success", "Đã cập nhật bài viết thành công!");
          setShowModal(false);
          fetchPosts(pagination.current_page);
          fetchStats();
        }
      }
    } catch (err) {
      console.error("Lỗi submit bài viết:", err);
      const msg = err.response?.data?.message || "Không thể lưu bài viết. Vui lòng kiểm tra lại.";
      notify("error", msg);
    } finally {
      setModalLoading(false);
    }
  };

  // Xóa bài viết
  const handleDeletePost = async (post) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài viết:\n"${post.title}"?`)) {
      return;
    }

    try {
      const res = await axiosClient.delete(`/admin/posts/${post.id}`);
      if (res.success) {
        notify("success", "Đã xóa bài viết thành công!");
        fetchPosts(pagination.current_page);
        fetchStats();
      }
    } catch (err) {
      console.error("Lỗi xóa bài viết:", err);
      notify("error", "Không thể xóa bài viết. Vui lòng thử lại.");
    }
  };

  // Trình phân tích Markdown inline cho Live Preview (chuyển **text** thành <strong>)
  const parseInlineMarkdown = (text, isDark = false) => {
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

  // Định dạng nội dung xem trước
  const renderLivePreview = (rawContent) => {
    if (!rawContent) {
      return (
        <div className="text-center py-12 text-zinc-400 font-mono text-xs">
          Chưa có nội dung để hiển thị xem trước. Hãy nhập nội dung ở tab Soạn thảo.
        </div>
      );
    }

    let h2Counter = 0;
    const blocks = rawContent.split(/\n\n+/);
    return blocks.map((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      // 1. Heading 2 (## )
      if (trimmed.startsWith("## ")) {
        const headingId = `preview-heading-${h2Counter++}`;
        return (
          <h2
            key={idx}
            id={headingId}
            className="text-lg font-bold text-zinc-900 mt-6 mb-2 tracking-tight flex items-center gap-2 border-b border-zinc-200 pb-1.5 scroll-mt-6"
          >
            <span className="w-1.5 h-4 bg-zinc-900 rounded-full inline-block" />
            <span>{parseInlineMarkdown(trimmed.replace(/^##\s+/, ""))}</span>
          </h2>
        );
      }

      // 2. Heading 3 (### )
      if (trimmed.startsWith("### ")) {
        return (
          <h3 key={idx} className="text-sm font-bold text-zinc-900 mt-4 mb-1 tracking-tight">
            {parseInlineMarkdown(trimmed.replace(/^###\s+/, ""))}
          </h3>
        );
      }

      // 3. Ảnh minh họa dạng ![Caption](URL)
      const imageMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imageMatch) {
        const caption = imageMatch[1];
        const src = imageMatch[2];
        return (
          <figure key={idx} className="my-4 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100">
            <img src={src} alt={caption} className="w-full max-h-72 object-cover" />
            {caption && (
              <figcaption className="p-2 text-center text-[10px] font-mono text-zinc-500 bg-zinc-50 border-t border-zinc-200">
                — {caption}
              </figcaption>
            )}
          </figure>
        );
      }

      // 4. Bảng Markdown Table
      if (trimmed.includes("|") && trimmed.includes("\n|")) {
        const rows = trimmed
          .split("\n")
          .map((r) => r.trim())
          .filter((r) => r.startsWith("|") && r.endsWith("|"));
        if (rows.length >= 2) {
          const headerCells = rows[0]
            .slice(1, -1)
            .split("|")
            .map((c) => c.trim());
          const bodyRows = rows.slice(2).map((r) =>
            r
              .slice(1, -1)
              .split("|")
              .map((c) => c.trim())
          );
          return (
            <div key={idx} className="my-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-100 border-b border-zinc-200 text-zinc-700 font-mono text-[10px] uppercase">
                    {headerCells.map((cell, cIdx) => (
                      <th key={cIdx} className="py-2.5 px-3 font-bold border-b border-zinc-200">
                        {parseInlineMarkdown(cell)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {bodyRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-zinc-50/60">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="py-2.5 px-3 text-zinc-700 font-mono text-[11px]">
                          {parseInlineMarkdown(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
      }

      // 5. Trích dẫn / Callout Box
      if (trimmed.startsWith("> ")) {
        const quoteLines = trimmed
          .split("\n")
          .map((l) => l.replace(/^>\s*/, "").trim())
          .filter(Boolean);
        return (
          <blockquote
            key={idx}
            className="my-3 p-4 rounded-xl bg-zinc-950 text-zinc-100 border-l-4 border-amber-400 text-xs leading-relaxed space-y-1.5"
          >
            {quoteLines.map((line, qIdx) => (
              <p key={qIdx}>{parseInlineMarkdown(line, true)}</p>
            ))}
          </blockquote>
        );
      }

      // 6. Danh sách gạch đầu dòng
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const items = trimmed.split("\n").map((line) => line.replace(/^[-*]\s+/, "").trim());
        return (
          <ul key={idx} className="my-2 space-y-1 pl-4 list-disc text-xs text-zinc-700">
            {items.map((it, iIdx) => (
              <li key={iIdx}>{parseInlineMarkdown(it)}</li>
            ))}
          </ul>
        );
      }

      // 7. Đoạn văn thường
      return (
        <p key={idx} className="my-2 text-xs text-zinc-700 leading-relaxed">
          {parseInlineMarkdown(trimmed)}
        </p>
      );
    });
  };

  // Tìm sản phẩm được chọn để hiển thị trong preview
  const selectedProduct = availableProducts.find(
    (p) => String(p.id) === String(formData.product_id)
  );

  return (
    <div className="space-y-6">
      {/* Toast thông báo */}
      {notification.message && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-2.5 text-xs font-medium transition-all ${
            notification.type === "success"
              ? "bg-zinc-950 text-white border-zinc-800"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header trang & Nút thêm bài mới */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Quản lý Bài viết Công nghệ
            </h1>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-zinc-200 text-zinc-800">
              User ⇄ Admin
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Soạn thảo, ghim bài Bento tâm điểm, chèn ảnh minh họa, gắn thẻ sản phẩm đề xuất đồng bộ 100% với MySQL.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 text-white text-xs font-semibold hover:bg-black transition-colors shrink-0 shadow-sm"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Thêm bài viết mới</span>
        </button>
      </div>

      {/* =========================================================================
          1. THỐNG KÊ TỔNG QUAN (BENTO STATS CARDS)
          ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-zinc-200/90 shadow-xs space-y-1">
          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
            Tổng bài viết
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-zinc-900">
            {stats.total_posts || stats.total || 0}
          </div>
          <span className="text-[11px] text-zinc-500">Toàn bộ kho lưu trữ</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200/90 shadow-xs space-y-1">
          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
            Đang hiển thị
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600">
            {stats.visible_posts || stats.visible || 0}
          </div>
          <span className="text-[11px] text-zinc-500">Công khai ở /bai-viet</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200/90 shadow-xs space-y-1">
          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
            Ghim tâm điểm
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-amber-500">
            {stats.featured_posts || stats.featured || 0}
          </div>
          <span className="text-[11px] text-zinc-500">Vị trí Hero Bento</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200/90 shadow-xs space-y-1">
          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
            Tổng lượt xem
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-zinc-900">
            {(stats.total_views || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-zinc-500">Tự động đếm khi đọc</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200/90 shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
            Tổng thảo luận
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-zinc-900">
            {stats.total_comments || 0}
          </div>
          <span className="text-[11px] text-zinc-500">Ý kiến từ độc giả</span>
        </div>
      </div>

      {/* =========================================================================
          2. THANH LỌC & TÌM KIẾM
          ========================================================================= */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tiêu đề hoặc tóm tắt bài viết..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-700 focus:outline-none focus:border-zinc-900"
          >
            <option value="">Tất cả chuyên mục</option>
            {categoriesList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-700 focus:outline-none focus:border-zinc-900"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Đang hiển thị</option>
            <option value="false">Đang ẩn</option>
          </select>
        </div>
      </div>

      {/* =========================================================================
          3. BẢNG DỮ LIỆU BÀI VIẾT VỚI 3 NÚT MICRO-CONTROLS
          ========================================================================= */}
      <div className="bg-white rounded-xl border border-zinc-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-zinc-500">
            Đang tải dữ liệu bài viết...
          </div>
        ) : posts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">Bài viết & Gắn sản phẩm</th>
                  <th className="py-3 px-3">Chỉ số</th>
                  <th className="py-3 px-3 text-center">Ẩn / Hiện</th>
                  <th className="py-3 px-3 text-center">Ghim Bento</th>
                  <th className="py-3 px-3 text-center">Thảo luận</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-zinc-50/70 transition-colors">
                    {/* Cột 1: Thông tin bài viết */}
                    <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                      <div className="flex items-center gap-3">
                        {post.thumbnail ? (
                          <img
                            src={post.thumbnail}
                            alt={post.title}
                            className="w-16 h-10 object-cover rounded-lg border border-zinc-200 shrink-0 bg-zinc-100"
                          />
                        ) : (
                          <div className="w-16 h-10 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-400">
                            <BookOpenIcon className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-zinc-600 bg-zinc-100 px-1.5 py-0.2 rounded border border-zinc-200">
                              {post.category}
                            </span>
                            {post.is_featured && (
                              <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-300">
                                ★ Tiêu điểm
                              </span>
                            )}
                            {post.product && (
                              <span className="text-[10px] font-mono text-zinc-600 bg-zinc-100 px-1.5 py-0.2 rounded border border-zinc-200 truncate max-w-[140px]">
                                SP: {post.product.name}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-zinc-900 truncate">{post.title}</h4>
                          <span className="text-[10px] font-mono text-zinc-400 truncate block">
                            /{post.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Cột 2: Chỉ số lượt xem & comment */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="space-y-0.5 font-mono text-[11px] text-zinc-600">
                        <div className="flex items-center gap-1">
                          <EyeIcon className="w-3 h-3 text-zinc-400" />
                          <span>{post.views?.toLocaleString()} xem</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquareIcon className="w-3 h-3 text-zinc-400" />
                          <span>{post.comments_count || 0} bình luận</span>
                        </div>
                      </div>
                    </td>

                    {/* Cột 3: Micro-control 1 - Ẩn / Hiện */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleVisibility(post)}
                        title={post.is_visible ? "Bấm để ẩn bài viết" : "Bấm để hiển thị công khai"}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold transition-all ${
                          post.is_visible
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-zinc-100 text-zinc-500 border border-zinc-300 hover:bg-zinc-200"
                        }`}
                      >
                        {post.is_visible ? (
                          <>
                            <EyeIcon className="w-3 h-3 text-emerald-600" />
                            <span>Hiển thị</span>
                          </>
                        ) : (
                          <>
                            <EyeOffIcon className="w-3 h-3 text-zinc-400" />
                            <span>Đang ẩn</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Cột 4: Micro-control 2 - Ghim Bento */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleFeatured(post)}
                        title={post.is_featured ? "Hạ khỏi vị trí tâm điểm" : "Ghim làm bài tâm điểm Bento"}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold transition-all ${
                          post.is_featured
                            ? "bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100"
                            : "bg-zinc-50 text-zinc-500 border border-zinc-200 hover:bg-zinc-100"
                        }`}
                      >
                        <PinIcon
                          className={`w-3 h-3 ${post.is_featured ? "text-amber-500" : "text-zinc-400"}`}
                        />
                        <span>{post.is_featured ? "★ Đang ghim" : "Không ghim"}</span>
                      </button>
                    </td>

                    {/* Cột 5: Micro-control 3 - Đóng / Mở Thảo Luận */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleComments(post)}
                        title={
                          post.allow_comments
                            ? "Bấm để tạm khóa khung thảo luận"
                            : "Bấm để mở lại cho khách thảo luận"
                        }
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold transition-all ${
                          post.allow_comments
                            ? "bg-zinc-900 text-white hover:bg-black"
                            : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                        }`}
                      >
                        {post.allow_comments ? (
                          <>
                            <UnlockIcon className="w-3 h-3 text-zinc-300" />
                            <span>Mở bình luận</span>
                          </>
                        ) : (
                          <>
                            <LockIcon className="w-3 h-3 text-rose-500" />
                            <span>Đã khóa</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Cột 6: Thao tác Sửa / Xóa / Xem thử */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/bai-viet/${post.id}`}
                          target="_blank"
                          title="Xem thử trên trang khách hàng"
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                        >
                          <ExternalLinkIcon className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => handleOpenEdit(post)}
                          title="Chỉnh sửa nội dung"
                          className="p-1.5 rounded-lg text-zinc-700 hover:text-black hover:bg-zinc-100 transition-colors"
                        >
                          <EditIcon className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeletePost(post)}
                          title="Xóa bài viết"
                          className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-zinc-500 space-y-2">
            <BookOpenIcon className="w-8 h-8 text-zinc-300 mx-auto" />
            <p className="font-bold text-zinc-800">Không tìm thấy bài viết nào phù hợp</p>
            <p className="text-[11px] text-zinc-400">
              Hãy thử thay đổi điều kiện lọc hoặc tạo một bài viết mới.
            </p>
          </div>
        )}

        {/* Phân trang */}
        {pagination.last_page > 1 && (
          <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-mono">
              Trang {pagination.current_page} / {pagination.last_page} (Tổng {pagination.total} bài)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fetchPosts(Math.max(1, pagination.current_page - 1))}
                disabled={pagination.current_page <= 1}
                className="p-1.5 rounded-lg border border-zinc-200 hover:bg-white disabled:opacity-40"
              >
                <ChevronLeftIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => fetchPosts(Math.min(pagination.last_page, pagination.current_page + 1))}
                disabled={pagination.current_page >= pagination.last_page}
                className="p-1.5 rounded-lg border border-zinc-200 hover:bg-white disabled:opacity-40"
              >
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          4. MODAL THÊM MỚI / CHỈNH SỬA BÀI VIẾT (HIGH-DENSITY FORM + LIVE PREVIEW)
          ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-zinc-300 w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-6 py-3.5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <div>
                <h3 className="font-bold text-base text-zinc-900">
                  {modalMode === "create" ? "Thêm Bài Viết Công Nghệ Mới" : "Chỉnh Sửa Bài Viết"}
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Nội dung được lưu trực tiếp vào cơ sở dữ liệu MySQL và đồng bộ 100% với trang người dùng.
                </p>
              </div>

              {/* Tab Switcher: Soạn thảo vs Xem trước */}
              <div className="flex items-center gap-2">
                <div className="bg-zinc-200/80 p-0.5 rounded-lg flex items-center text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setActiveModalTab("editor")}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${
                      activeModalTab === "editor"
                        ? "bg-white text-zinc-900 shadow-xs"
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    Soạn thảo (Editor)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModalTab("preview")}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${
                      activeModalTab === "preview"
                        ? "bg-white text-zinc-900 shadow-xs"
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    Xem trước (Live Preview)
                  </button>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg ml-2"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            {activeModalTab === "editor" ? (
              <form onSubmit={handleSubmitForm} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                {/* Tiêu đề */}
                <div>
                  <label className="block font-mono font-medium text-zinc-700 mb-1">
                    Tiêu đề bài viết <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ví dụ: Đánh giá chi tiết Samsung Galaxy S24 Ultra sau 30 ngày sử dụng thực tế..."
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-900 focus:bg-white text-xs text-zinc-900 font-medium"
                    required
                  />
                </div>

                {/* Chuyên mục - Thời lượng đọc - Tác giả */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-mono font-medium text-zinc-700 mb-1">
                      Chuyên mục <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-900 text-xs text-zinc-900"
                    >
                      {categoriesList.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono font-medium text-zinc-700 mb-1">
                      Thời lượng đọc
                    </label>
                    <input
                      type="text"
                      value={formData.reading_time}
                      onChange={(e) => setFormData({ ...formData, reading_time: e.target.value })}
                      placeholder="Ví dụ: 6 phút đọc"
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-900 text-xs text-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block font-mono font-medium text-zinc-700 mb-1">
                      Tác giả biên tập
                    </label>
                    <input
                      type="text"
                      value={formData.author_name}
                      onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-900 text-xs text-zinc-900"
                    />
                  </div>
                </div>

                {/* Đường dẫn ảnh bìa & Khung Live Thumbnail Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block font-mono font-medium text-zinc-700">
                      Ảnh bìa (Thumbnail)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="url"
                        value={formData.thumbnail}
                        onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                        placeholder="Nhập URL ảnh https://... hoặc bấm nút tải ảnh bên cạnh"
                        className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-900 focus:bg-white text-xs text-zinc-900"
                      />
                      <label className={`px-3 py-2 rounded-xl border border-zinc-300 font-mono text-[11px] font-semibold cursor-pointer shrink-0 transition inline-flex items-center justify-center gap-1.5 ${uploadingThumb ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' : 'bg-white hover:bg-zinc-100 text-zinc-800 shadow-2xs'}`}>
                        <span>📁</span>
                        <span>{uploadingThumb ? "Đang tải ảnh lên..." : "Tải ảnh từ máy (PNG/JPG ≤ 10MB)"}</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg"
                          disabled={uploadingThumb}
                          onChange={handleThumbnailFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Chấp nhận file PNG hoặc JPG/JPEG dung lượng ≤ 10MB. Tải lên trực tiếp lưu vào máy chủ hệ thống.
                    </p>
                  </div>

                  <div>
                    <span className="block font-mono font-medium text-zinc-700 text-[11px] mb-1">
                      Xem trước ảnh bìa
                    </span>
                    <div className="aspect-video w-full rounded-xl border border-zinc-200 bg-zinc-100 overflow-hidden flex items-center justify-center relative shadow-xs">
                      {formData.thumbnail ? (
                        <img
                          src={formData.thumbnail}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="text-[10px] text-zinc-400 font-mono">Chưa có ảnh bìa</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gắn sản phẩm liên quan từ DB */}
                <div>
                  <label className="block font-mono font-medium text-zinc-700 mb-1">
                    Sản phẩm liên kết (Tự động hiển thị thẻ Mua Ngay ở cuối bài đọc)
                  </label>
                  <select
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-900 text-xs text-zinc-900"
                  >
                    <option value="">-- Không gắn sản phẩm (Để trống) --</option>
                    {availableProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        [ID #{p.id}] {p.name} — {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p.sale_price || p.price)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tóm tắt */}
                <div>
                  <label className="block font-mono font-medium text-zinc-700 mb-1">
                    Đoạn tóm tắt vắn tắt (Summary) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="Mô tả ngắn gọn trong 2-3 câu làm nổi bật nội dung chính của bài viết..."
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-900 focus:bg-white text-xs text-zinc-900 leading-relaxed"
                    required
                  />
                </div>

                {/* Thanh công cụ định dạng nhanh & Textarea nội dung */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="font-mono font-medium text-zinc-700">
                      Nội dung chi tiết bài viết (Hỗ trợ định dạng Markdown đầy đủ) <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {(formData.content || "").length} ký tự
                    </span>
                  </div>

                  {/* Thanh công cụ chèn nội dung */}
                  <div className="flex flex-wrap items-center gap-1.5 p-2 bg-zinc-100/90 rounded-xl border border-zinc-200">
                    <button
                      type="button"
                      onClick={() => setShowImagePrompt((prev) => !prev)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-zinc-800 text-[11px] font-mono font-semibold hover:bg-zinc-50 shadow-2xs flex items-center gap-1"
                    >
                      <PlusIcon className="w-3 h-3 text-zinc-500" />
                      <span>Chèn ảnh minh họa</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        insertSnippet(
                          `\n\n> **ĐIỂM NHẤN CÔNG NGHỆ:** Viết đoạn trích dẫn, nhận xét hoặc thông tin cần nhấn mạnh tại đây.\n\n`
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-zinc-800 text-[11px] font-mono font-semibold hover:bg-zinc-50 shadow-2xs"
                    >
                      + Hộp Điểm Nhấn
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        insertSnippet(
                          `\n\n| Tiêu chí kỹ thuật | Thông số cấu hình | Đánh giá thực tế |\n|---|---|---|\n| Màn hình hiển thị | 6.8" Dynamic AMOLED 2X, 120Hz | 2600 nits đỉnh, viền siêu mỏng |\n| Vi xử lý & GPU | Snapdragon 8 Gen 3 for Galaxy | Điểm AnTuTu vượt 2.100.000 |\n| Hệ thống Camera | 200MP Chính + 50MP Zoom 5x | Khả năng khử nhiễu đêm xuất sắc |\n| Thời lượng Pin | 5000 mAh, sạc nhanh 45W | Sử dụng liên tục 9h30 on-screen |\n\n`
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-zinc-800 text-[11px] font-mono font-semibold hover:bg-zinc-50 shadow-2xs"
                    >
                      + Bảng Thông Số
                    </button>

                    <button
                      type="button"
                      onClick={() => insertSnippet(`\n\n## 1. Tiêu đề mục chính\n`)}
                      className="px-2 py-1 rounded-lg bg-white border border-zinc-200 text-zinc-700 text-[11px] font-mono hover:bg-zinc-50 shadow-2xs"
                    >
                      + Tiêu đề H2
                    </button>

                    <button
                      type="button"
                      onClick={() => insertSnippet(`\n\n### 1.1. Tiêu đề mục phụ\n`)}
                      className="px-2 py-1 rounded-lg bg-white border border-zinc-200 text-zinc-700 text-[11px] font-mono hover:bg-zinc-50 shadow-2xs"
                    >
                      + Tiêu đề H3
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        insertSnippet(
                          `\n\n> **TỔNG KẾT & LỜI KHUYÊN MUA HÀNG:** Đưa ra nhận xét tổng kết xem thiết bị phù hợp với ai và có xứng đáng để sở hữu hay không.\n\n`
                        )
                      }
                      className="px-2 py-1 rounded-lg bg-zinc-900 text-white text-[11px] font-mono hover:bg-black shadow-2xs"
                    >
                      + Hộp Tổng Kết
                    </button>
                  </div>

                  {/* Pop-up chèn ảnh minh họa (Mặc định ẩn, mở khi bấm nút và tự đóng sau khi chèn) */}
                  {showImagePrompt && (
                    <div className="p-4 bg-zinc-50 border border-zinc-300 rounded-2xl space-y-3 animate-in fade-in duration-150 shadow-sm">
                      <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                        <span className="font-mono font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                          <span>🖼️</span>
                          <span>Chèn ảnh minh họa vào bài viết</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowImagePrompt(false)}
                          className="text-zinc-400 hover:text-zinc-700 p-1"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {/* 2 Cách: Nhập URL hoặc Chọn từ máy tính */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Cách 1: Nhập URL */}
                          <div className="space-y-1">
                            <label className="block text-[11px] font-mono font-medium text-zinc-700">
                              Cách 1: Nhập URL ảnh
                            </label>
                            <input
                              type="url"
                              value={imageInput.url}
                              onChange={(e) => setImageInput({ ...imageInput, url: e.target.value })}
                              placeholder="https://images.unsplash.com/photo-..."
                              className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs focus:outline-none focus:border-zinc-900"
                            />
                          </div>

                          {/* Cách 2: Chọn từ máy */}
                          <div className="space-y-1">
                            <label className="block text-[11px] font-mono font-medium text-zinc-700">
                              Cách 2: Chọn ảnh từ máy tính
                            </label>
                            <label className={`w-full py-1.5 px-3 rounded-lg border border-zinc-300 font-mono text-[11px] font-medium cursor-pointer transition flex items-center justify-center gap-1.5 ${uploadingInlineImage ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' : 'bg-white hover:bg-zinc-100 text-zinc-800 shadow-2xs'}`}>
                              <span>📁</span>
                              <span>{uploadingInlineImage ? "Đang tải ảnh lên..." : "Chọn ảnh từ máy (PNG/JPG ≤ 10MB)"}</span>
                              <input
                                type="file"
                                accept="image/png,image/jpeg"
                                disabled={uploadingInlineImage}
                                onChange={handleInlineImageFileChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        {/* Ô nhập Chú thích ảnh & Xem trước ảnh thu nhỏ */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                          <div className="sm:col-span-2 space-y-1">
                            <label className="block text-[11px] font-mono font-medium text-zinc-700">
                              Chú thích ảnh minh họa (Caption)
                            </label>
                            <input
                              type="text"
                              value={imageInput.caption}
                              onChange={(e) => setImageInput({ ...imageInput, caption: e.target.value })}
                              placeholder="Ví dụ: Cận cảnh cụm camera sau với cảm biến 200MP..."
                              className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs focus:outline-none focus:border-zinc-900"
                            />
                          </div>

                          {imageInput.url ? (
                            <div className="flex items-center gap-2 p-1.5 rounded-xl border border-zinc-200 bg-white shadow-2xs">
                              <img
                                src={imageInput.url}
                                alt="Thumb preview"
                                className="w-14 h-10 object-cover rounded-lg border border-zinc-100 shrink-0 bg-zinc-50"
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                              />
                              <span className="text-[10px] text-zinc-600 font-mono truncate">
                                Đã sẵn sàng chèn
                              </span>
                            </div>
                          ) : (
                            <div className="text-[10px] text-zinc-400 font-mono italic">
                              Chưa có ảnh (Nhập URL hoặc chọn file)
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
                        <button
                          type="button"
                          onClick={() => setShowImagePrompt(false)}
                          className="px-3 py-1.5 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-100 text-[11px] font-medium"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={handleInsertImage}
                          disabled={!imageInput.url.trim() || uploadingInlineImage}
                          className="px-4 py-1.5 rounded-xl bg-zinc-900 text-white font-medium hover:bg-black text-[11px] disabled:opacity-50 transition shadow-2xs"
                        >
                          Chèn vào nội dung
                        </button>
                      </div>
                    </div>
                  )}

                  <textarea
                    id="admin-post-content"
                    rows={14}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Dùng ## cho tiêu đề chính, ### cho tiêu đề phụ, ![chú thích](url) cho ảnh, > cho hộp nổi bật..."
                    className="w-full min-h-[320px] p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-900 focus:bg-white text-xs text-zinc-900 font-mono leading-relaxed shadow-2xs"
                    required
                  />
                </div>

                {/* Thanh trạng thái & Nút bấm Cố định (Sticky Footer) ở đáy Modal */}
                <div className="sticky bottom-0 bg-white border-t border-zinc-200 pt-4 pb-2 z-10 -mx-6 px-6 space-y-3 shadow-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_visible}
                        onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                        className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900"
                      />
                      <span className="font-medium text-zinc-800">Hiển thị công khai</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900"
                      />
                      <span className="font-medium text-zinc-800">Ghim làm Tâm Điểm</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allow_comments}
                        onChange={(e) => setFormData({ ...formData, allow_comments: e.target.checked })}
                        className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900"
                      />
                      <span className="font-medium text-zinc-800">Cho phép thảo luận</span>
                    </label>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-700 font-medium hover:bg-zinc-100 transition-colors"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={modalLoading}
                      className="px-5 py-2 rounded-xl bg-zinc-950 text-white font-semibold hover:bg-black transition-colors disabled:opacity-50"
                    >
                      {modalLoading
                        ? "Đang lưu..."
                        : modalMode === "create"
                        ? "Tạo bài viết"
                        : "Cập nhật bài viết"}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* TAB XEM TRƯỚC (LIVE PREVIEW) */
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div className="max-w-2xl mx-auto space-y-4">
                  {/* Badge & Tiêu đề */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 text-white">
                        {formData.category}
                      </span>
                      {formData.is_featured && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                          ★ Tiêu điểm
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-zinc-400">
                        {formData.reading_time}
                      </span>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight leading-snug">
                      {formData.title || "Tiêu đề bài viết..."}
                    </h1>

                    <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono pb-3 border-b border-zinc-200">
                      <span>Biên tập: {formData.author_name}</span>
                      <span>•</span>
                      <span>{new Date().toLocaleDateString("vi-VN")}</span>
                    </div>
                  </div>

                  {/* Thumbnail */}
                  {formData.thumbnail && (
                    <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100 aspect-video">
                      <img
                        src={formData.thumbnail}
                        alt="Preview thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Đoạn tóm tắt */}
                  {formData.summary && (
                    <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs italic leading-relaxed font-sans">
                      "{formData.summary}"
                    </div>
                  )}

                  {/* Mục lục nội dung bài viết (Đồng bộ 100% với trang người dùng /bai-viet/[id]) */}
                  {extractTableOfContents(formData.content).length > 0 && (
                    <nav className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 sm:p-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-2">
                        <BookOpenIcon className="w-4 h-4 text-zinc-800" />
                        <span>Mục lục nội dung bài viết</span>
                      </div>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-zinc-700 font-medium">
                        {extractTableOfContents(formData.content).map((item) => (
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

                  {/* Nội dung đã format */}
                  <div className="border-t border-zinc-200 pt-4">
                    {renderLivePreview(formData.content)}
                  </div>

                  {/* Thẻ sản phẩm đề xuất (nếu có gắn) */}
                  {selectedProduct && (
                    <div className="mt-8 p-4 rounded-2xl bg-zinc-900 text-white border border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                          Thiết Bị Được Nhắc Đến Trong Bài
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          ID #{selectedProduct.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {selectedProduct.image && (
                          <img
                            src={selectedProduct.image}
                            alt={selectedProduct.name}
                            className="w-16 h-16 object-contain rounded-xl bg-white p-1 shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-white truncate">
                            {selectedProduct.name}
                          </h4>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-amber-400 font-black font-mono text-sm">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(selectedProduct.sale_price || selectedProduct.price)}
                            </span>
                            {selectedProduct.sale_price && (
                              <span className="text-zinc-400 line-through font-mono text-xs">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(selectedProduct.price)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer preview */}
                <div className="pt-4 border-t border-zinc-200 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveModalTab("editor")}
                    className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-black transition-colors"
                  >
                    Quay lại Soạn thảo để chỉnh sửa
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
