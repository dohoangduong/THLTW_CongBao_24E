"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import axiosClient from "@/services/axiosClient";
import {
  MessageSquareIcon,
  SearchIcon,
  EyeIcon,
  EyeOffIcon,
  TrashIcon,
  CornerDownRightIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ExternalLinkIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SendIcon,
} from "@/components/Icons";

export default function AdminCommentsPage() {
  const [comments, setComments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    unreplied: 0,
    hidden: 0,
  });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  // Bộ lọc
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal Trả lời bình luận
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // Toast thông báo
  const [notification, setNotification] = useState({ type: "", message: "" });
  const notify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: "", message: "" }), 4000);
  };

  // Tải thống kê
  const fetchStats = useCallback(async () => {
    try {
      const res = await axiosClient.get("/admin/post-comments/stats");
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error("Lỗi tải thống kê thảo luận:", err);
    }
  }, []);

  // Tải danh sách bình luận
  const fetchComments = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("per_page", "15");
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter) params.append("status", statusFilter);

      const res = await axiosClient.get(`/admin/post-comments?${params.toString()}`);
      if (res.data) {
        setComments(res.data);
      }
      if (res.meta) {
        setPagination(res.meta);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách thảo luận:", err);
      notify("error", "Không thể kết nối máy chủ để tải danh sách thảo luận.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchStats();
    fetchComments(1);
  }, [fetchStats, fetchComments]);

  // Micro-control 1: Toggle Ẩn / Hiện bình luận
  const handleToggleVisibility = async (comment) => {
    try {
      const res = await axiosClient.put(`/admin/post-comments/${comment.id}/toggle-visibility`);
      if (res.success) {
        setComments((prev) =>
          prev.map((c) => (c.id === comment.id ? { ...c, is_visible: res.is_visible } : c))
        );
        fetchStats();
        notify("success", res.message || "Đã cập nhật trạng thái bình luận!");
      }
    } catch (err) {
      console.error("Lỗi toggle comment visibility:", err);
      notify("error", "Không thể thay đổi trạng thái ẩn/hiện bình luận.");
    }
  };

  // Mở modal phản hồi
  const handleOpenReply = (comment) => {
    setSelectedComment(comment);
    setReplyText(comment.admin_reply || "");
    setShowReplyModal(true);
  };

  // Gửi phản hồi chính thức từ Admin
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      notify("error", "Vui lòng nhập nội dung phản hồi.");
      return;
    }

    setSubmittingReply(true);
    try {
      const res = await axiosClient.put(`/admin/post-comments/${selectedComment.id}/reply`, {
        admin_reply: replyText.trim(),
      });

      if (res.success) {
        setComments((prev) =>
          prev.map((c) => (c.id === selectedComment.id ? { ...c, admin_reply: replyText.trim() } : c))
        );
        fetchStats();
        notify("success", "Đã gửi phản hồi chính thức từ Bảo Công Studio!");
        setShowReplyModal(false);
      }
    } catch (err) {
      console.error("Lỗi gửi reply:", err);
      notify("error", "Không thể lưu phản hồi. Vui lòng thử lại.");
    } finally {
      setSubmittingReply(false);
    }
  };

  // Xóa vĩnh viễn bình luận
  const handleDeleteComment = async (comment) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn ý kiến thảo luận của "${comment.author_name}"?`)) {
      return;
    }

    try {
      const res = await axiosClient.delete(`/admin/post-comments/${comment.id}`);
      if (res.success) {
        notify("success", "Đã xóa bình luận thảo luận thành công!");
        fetchComments(pagination.current_page);
        fetchStats();
      }
    } catch (err) {
      console.error("Lỗi xóa comment:", err);
      notify("error", "Không thể xóa bình luận. Vui lòng thử lại.");
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

      {/* Header trang */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            Quản lý Thảo luận & Ý kiến Khách hàng
          </h1>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-zinc-200 text-zinc-800">
            User ⇄ Admin
          </span>
        </div>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Kiểm duyệt ý kiến độc giả, giải đáp thắc mắc kỹ thuật và phản hồi chính thức cho các bài viết công nghệ.
        </p>
      </div>

      {/* =========================================================================
          1. THỐNG KÊ TỔNG QUAN (BENTO STATS CARDS)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-zinc-200/90 shadow-xs space-y-1">
          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
            Tổng ý kiến thảo luận
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-zinc-900">
            {stats.total}
          </div>
          <span className="text-[11px] text-zinc-500">Toàn bộ trên các bài viết</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200/90 shadow-xs space-y-1">
          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
            Chưa có phản hồi
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-amber-600">
            {stats.unreplied}
          </div>
          <span className="text-[11px] text-zinc-500">Cần Ban Biên Tập trả lời</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200/90 shadow-xs space-y-1">
          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
            Bình luận đang ẩn
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-rose-600">
            {stats.hidden}
          </div>
          <span className="text-[11px] text-zinc-500">Đã tạm ẩn khỏi trang người dùng</span>
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
            placeholder="Tìm theo nội dung, tên người gửi hoặc email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-700 focus:outline-none focus:border-zinc-900"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="unreplied">Chưa có phản hồi ({stats.unreplied})</option>
            <option value="visible">Đang hiển thị công khai</option>
            <option value="hidden">Đang bị ẩn ({stats.hidden})</option>
          </select>
        </div>
      </div>

      {/* =========================================================================
          3. DANH SÁCH BÌNH LUẬN & PHẢN HỒI
          ========================================================================= */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-12 text-center text-xs font-mono text-zinc-500 rounded-xl border border-zinc-200">
            Đang tải dữ liệu ý kiến thảo luận...
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`bg-white rounded-xl border transition-all p-5 shadow-xs space-y-3.5 ${
                !comment.is_visible
                  ? "border-amber-300 bg-amber-50/20"
                  : "border-zinc-200/90 hover:border-zinc-900"
              }`}
            >
              {/* Header card: Bài viết liên quan & Trạng thái */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-zinc-400 uppercase text-[10px]">Bài viết:</span>
                  <Link
                    href={`/bai-viet/${comment.post_id}`}
                    target="_blank"
                    className="font-bold text-zinc-900 hover:underline inline-flex items-center gap-1"
                  >
                    <span>{comment.post?.title || `Bài viết #${comment.post_id}`}</span>
                    <ExternalLinkIcon className="w-3 h-3 text-zinc-400" />
                  </Link>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {/* Badge trạng thái phản hồi */}
                  {comment.admin_reply ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircleIcon className="w-3 h-3 text-emerald-600" />
                      Đã phản hồi
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      Chưa phản hồi
                    </span>
                  )}

                  {/* Badge Ẩn / Hiện */}
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      comment.is_visible
                        ? "bg-zinc-100 text-zinc-700 border-zinc-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {comment.is_visible ? "Hiển thị" : "Đang ẩn"}
                  </span>
                </div>
              </div>

              {/* Thông tin độc giả & nội dung thảo luận */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs font-mono shrink-0">
                  {comment.author_name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-zinc-900">{comment.author_name}</span>
                    <span className="text-zinc-400 font-mono text-[11px]">&lt;{comment.author_email}&gt;</span>
                    <span className="text-zinc-400 font-mono text-[10px]">• {formatDate(comment.created_at)}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed bg-zinc-50 p-3 rounded-xl border border-zinc-200/60">
                    {comment.content}
                  </p>
                </div>
              </div>

              {/* Phản hồi chính thức của Admin */}
              {comment.admin_reply && (
                <div className="ml-11 bg-zinc-950 text-white rounded-xl p-3.5 border border-zinc-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <CornerDownRightIcon className="w-3.5 h-3.5" />
                      <span>Phản hồi chính thức từ Ban Quản Trị</span>
                    </div>
                    <button
                      onClick={() => handleOpenReply(comment)}
                      className="text-zinc-400 hover:text-white underline text-[10px]"
                    >
                      Chỉnh sửa
                    </button>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed pl-5">
                    {comment.admin_reply}
                  </p>
                </div>
              )}

              {/* Toolbar thao tác phía dưới */}
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenReply(comment)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-black transition-colors"
                  >
                    <SendIcon className="w-3 h-3" />
                    <span>{comment.admin_reply ? "Sửa phản hồi" : "Trả lời khách hàng"}</span>
                  </button>

                  <button
                    onClick={() => handleToggleVisibility(comment)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                      comment.is_visible
                        ? "border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                        : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    }`}
                  >
                    {comment.is_visible ? (
                      <>
                        <EyeOffIcon className="w-3.5 h-3.5" />
                        <span>Ẩn ý kiến</span>
                      </>
                    ) : (
                      <>
                        <EyeIcon className="w-3.5 h-3.5" />
                        <span>Bỏ ẩn</span>
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={() => handleDeleteComment(comment)}
                  title="Xóa vĩnh viễn"
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-xs font-medium inline-flex items-center gap-1"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  <span>Xóa</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center text-xs text-zinc-500 space-y-2">
            <MessageSquareIcon className="w-8 h-8 text-zinc-300 mx-auto" />
            <p className="font-bold text-zinc-800">Không tìm thấy ý kiến thảo luận nào</p>
            <p className="text-[11px] text-zinc-400">
              Hãy thử chọn trạng thái khác hoặc xóa từ khóa tìm kiếm.
            </p>
          </div>
        )}

        {/* Phân trang */}
        {pagination.last_page > 1 && (
          <div className="p-3 bg-white rounded-xl border border-zinc-200 flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-mono">
              Trang {pagination.current_page} / {pagination.last_page} (Tổng {pagination.total} bình luận)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fetchComments(Math.max(1, pagination.current_page - 1))}
                disabled={pagination.current_page <= 1}
                className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 disabled:opacity-40"
              >
                <ChevronLeftIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => fetchComments(Math.min(pagination.last_page, pagination.current_page + 1))}
                disabled={pagination.current_page >= pagination.last_page}
                className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 disabled:opacity-40"
              >
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          4. MODAL TRẢ LỜI BÌNH LUẬN (ADMIN REPLY MODAL)
          ========================================================================= */}
      {showReplyModal && selectedComment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-zinc-300 w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <div>
                <h3 className="font-bold text-sm text-zinc-900">
                  Phản hồi thảo luận của {selectedComment.author_name}
                </h3>
                <p className="text-[11px] text-zinc-500 truncate max-w-xs">
                  {selectedComment.post?.title}
                </p>
              </div>
              <button
                onClick={() => setShowReplyModal(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendReply} className="p-5 space-y-4 text-xs">
              {/* Nội dung khách hỏi */}
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 space-y-1">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                  Ý kiến của khách hàng:
                </span>
                <p className="text-zinc-800 italic">{selectedComment.content}</p>
              </div>

              {/* Textarea nhập phản hồi */}
              <div>
                <label className="block font-mono font-medium text-zinc-700 mb-1">
                  Nội dung phản hồi chính thức từ Bảo Công Studio <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Nhập câu trả lời chi tiết, chuyên nghiệp từ Ban Biên Tập / Đội ngũ kỹ thuật..."
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-900 focus:bg-white text-xs text-zinc-900 leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowReplyModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 font-medium hover:bg-zinc-50"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={submittingReply}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-950 text-white font-semibold hover:bg-black disabled:opacity-50"
                >
                  <SendIcon className="w-3.5 h-3.5" />
                  <span>{submittingReply ? "Đang lưu..." : "Đăng phản hồi"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

