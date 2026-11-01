"use client";

import React, { useState, useEffect, useCallback } from "react";
import axiosClient from "@/services/axiosClient";
import {
  StarIcon,
  SearchIcon,
  RefreshIcon,
  CheckIcon,
  TrashIcon,
  AlertCircleIcon,
  XIcon,
  MessageSquareIcon,
  EyeIcon,
  AwardIcon,
  SmartphoneIcon,
} from "@/components/Icons";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [meta, setMeta] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 4 Thẻ KPI Đánh Giá Hệ Thống
  const [kpiStats, setKpiStats] = useState({
    total: 0,
    average_rating: 5.0,
    five_stars: 0,
    hidden: 0,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  // Modal Phản hồi đánh giá
  const [replyModal, setReplyModal] = useState({
    open: false,
    review: null,
    replyText: "",
    submitting: false,
  });

  // [THUẬT TOÁN TẢI DANH SÁCH ĐÁNH GIÁ SẢN PHẨM TRONG ADMIN]:
  // Gọi GET /api/admin/reviews kèm phân trang và các bộ lọc trạng thái duyệt, số sao, từ khóa.
  const fetchReviews = useCallback(
    (page = 1) => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ page: String(page), per_page: "10" });
      if (statusFilter !== "") params.append("status", statusFilter);
      if (ratingFilter !== "") params.append("rating", ratingFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      axiosClient
        .get(`/admin/reviews?${params.toString()}`)
        .then((res) => {
          const list = res.data || res || [];
          setReviews(Array.isArray(list) ? list : list.data || []);
          setMeta(res.meta || res);

          if (res.kpi_stats) {
            setKpiStats(res.kpi_stats);
          } else if (Array.isArray(list)) {
            const total = list.length;
            const avg = total > 0 ? (list.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / total).toFixed(1) : 5.0;
            const fiveStars = list.filter((r) => Number(r.rating) === 5).length;
            const hidden = list.filter((r) => Number(r.status) === 0).length;
            setKpiStats({ total, average_rating: Number(avg), five_stars: fiveStars, hidden });
          }
        })
        .catch((err) => {
          console.error("Lỗi khi tải danh sách đánh giá:", err);
          setError(err.message || "Không thể tải danh sách đánh giá từ máy chủ");
        })
        .finally(() => setLoading(false));
    },
    [statusFilter, ratingFilter, searchQuery]
  );

  useEffect(() => {
    fetchReviews(currentPage);
  }, [currentPage, fetchReviews]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchReviews(1);
  };

  // [THUẬT TOÁN DUYỆT / ẨN ĐÁNH GIÁ]:
  // Gọi API PUT /api/admin/reviews/{id}/status để thay đổi trạng thái hiển thị công khai trên Store.
  const handleToggleStatus = async (rev) => {
    const actionText = Number(rev.status) === 1 ? "tạm ẩn" : "duyệt hiển thị";
    try {
      const res = await axiosClient.put(`/admin/reviews/${rev.id}/status`);
      alert(res.message || `Đã ${actionText} đánh giá thành công!`);
      fetchReviews(currentPage);
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái: " + (err.message || "Lỗi máy chủ"));
    }
  };

  // [THUẬT TOÁN PHẢN HỒI ĐÁNH GIÁ CỦA KHÁCH]:
  // Gửi nội dung trả lời chính thức từ shop vào trường admin_reply trong bảng reviews.
  const handleOpenReply = (rev) => {
    setReplyModal({
      open: true,
      review: rev,
      replyText: rev.admin_reply || "",
      submitting: false,
    });
  };

  const handleSaveReply = async (e) => {
    e.preventDefault();
    if (!replyModal.review) return;

    setReplyModal((prev) => ({ ...prev, submitting: true }));
    try {
      const res = await axiosClient.put(`/admin/reviews/${replyModal.review.id}/reply`, {
        admin_reply: replyModal.replyText,
      });
      alert(res.message || "Đã lưu câu trả lời của Quản trị viên thành công!");
      setReplyModal({ open: false, review: null, replyText: "", submitting: false });
      fetchReviews(currentPage);
    } catch (err) {
      alert("Lỗi lưu phản hồi: " + (err.message || "Lỗi máy chủ"));
      setReplyModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // [THUẬT TOÁN XÓA ĐÁNH GIÁ]:
  const handleDeleteReview = async (rev) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa đánh giá của "${rev.reviewer_name}" không?`)) {
      return;
    }

    try {
      await axiosClient.delete(`/admin/reviews/${rev.id}`);
      alert("Đã xóa đánh giá thành công!");
      fetchReviews(currentPage);
    } catch (err) {
      alert("Lỗi xóa đánh giá: " + (err.message || "Lỗi máy chủ"));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-zinc-900 tracking-tight">
            Quản lý Đánh giá &amp; Nhận xét sản phẩm
          </h2>
          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
            KIỂM DUYỆT ĐÁNH GIÁ • PHẢN HỒI KHÁCH HÀNG • ĐỒNG BỘ STORE 2 CHIỀU
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchReviews(currentPage)}
          className="bg-white hover:bg-zinc-50 text-zinc-700 font-semibold px-3 py-2 rounded-lg border border-zinc-200 text-xs shadow-2xs transition flex items-center gap-1.5"
        >
          <RefreshIcon className="w-3.5 h-3.5" />
          <span>Tải lại</span>
        </button>
      </div>

      {/* 4 THẺ KPI ĐÁNH GIÁ TOÀN HỆ THỐNG */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Tổng đánh giá */}
        <div
          onClick={() => {
            setStatusFilter("");
            setRatingFilter("");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === "" && ratingFilter === ""
              ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
              : "bg-white text-zinc-900 border-zinc-200/80 hover:border-zinc-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === "" && ratingFilter === "" ? "text-zinc-400" : "text-zinc-500"}`}>
              Tổng đánh giá
            </span>
            <MessageSquareIcon className={`w-4 h-4 ${statusFilter === "" && ratingFilter === "" ? "text-zinc-300" : "text-zinc-400"}`} />
          </div>
          <div className="text-2xl font-black font-mono mt-2 tracking-tight">
            {kpiStats.total}
          </div>
          <div className={`text-[10px] mt-1 ${statusFilter === "" && ratingFilter === "" ? "text-zinc-400" : "text-zinc-500"}`}>
            Nhận xét từ khách mua hàng
          </div>
        </div>

        {/* KPI 2: Điểm sao trung bình toàn hệ thống */}
        <div className="p-4 rounded-xl border bg-white text-zinc-900 border-zinc-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
              Điểm sao TB hệ thống
            </span>
            <StarIcon className="w-4 h-4 text-amber-500 fill-amber-500" filled />
          </div>
          <div className="text-2xl font-black font-mono mt-2 tracking-tight text-zinc-900 flex items-center gap-1.5">
            <span>{Number(kpiStats.average_rating).toFixed(1)}</span>
            <span className="text-amber-500 text-base">★</span>
            <span className="text-xs text-zinc-400 font-normal">/ 5.0</span>
          </div>
          <div className="text-[10px] mt-1 text-zinc-500">
            Tính trên các đánh giá hiển thị
          </div>
        </div>

        {/* KPI 3: Đánh giá 5 sao */}
        <div
          onClick={() => {
            setRatingFilter("5");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            ratingFilter === "5"
              ? "bg-amber-500 text-white border-amber-600 shadow-sm"
              : "bg-white text-zinc-900 border-zinc-200/80 hover:border-amber-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${ratingFilter === "5" ? "text-amber-100" : "text-amber-600"}`}>
              Đánh giá 5 sao
            </span>
            <AwardIcon className={`w-4 h-4 ${ratingFilter === "5" ? "text-amber-100" : "text-amber-500"}`} />
          </div>
          <div className="text-2xl font-black font-mono mt-2 tracking-tight text-amber-900">
            {kpiStats.five_stars}
          </div>
          <div className={`text-[10px] mt-1 ${ratingFilter === "5" ? "text-amber-100" : "text-amber-700 font-medium"}`}>
            Khách hàng hài lòng tuyệt đối
          </div>
        </div>

        {/* KPI 4: Đánh giá đang ẩn */}
        <div
          onClick={() => {
            setStatusFilter("0");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === "0"
              ? "bg-rose-600 text-white border-rose-700 shadow-sm"
              : "bg-white text-zinc-900 border-zinc-200/80 hover:border-rose-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === "0" ? "text-rose-100" : "text-rose-600"}`}>
              Đánh giá đang ẩn
            </span>
            <EyeIcon className={`w-4 h-4 ${statusFilter === "0" ? "text-rose-100" : "text-rose-500"}`} />
          </div>
          <div className="text-2xl font-black font-mono mt-2 tracking-tight text-rose-900">
            {kpiStats.hidden}
          </div>
          <div className={`text-[10px] mt-1 ${statusFilter === "0" ? "text-rose-100" : "text-rose-700 font-medium"}`}>
            Tạm ẩn khỏi trang sản phẩm
          </div>
        </div>
      </div>

      {/* Toolbar Filter */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md flex items-center gap-2">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo sản phẩm, tên khách, nội dung nhận xét..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-2 pl-9 pr-3 text-xs outline-none focus:border-zinc-900 transition-all font-mono"
            />
            <SearchIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          </div>
          <button
            type="submit"
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-4 py-2 rounded-lg text-xs transition shrink-0"
          >
            Tìm kiếm
          </button>
        </form>

        <div className="flex items-center gap-2">
          {/* Lọc theo Trạng thái */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-medium rounded-lg px-3 py-2 outline-none focus:border-zinc-900 cursor-pointer"
          >
            <option value="">-- Tất cả trạng thái --</option>
            <option value="1">Hiển thị (Đã duyệt)</option>
            <option value="0">Tạm ẩn (Đang ẩn khỏi Store)</option>
          </select>

          {/* Lọc theo Số sao */}
          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-medium rounded-lg px-3 py-2 outline-none focus:border-zinc-900 cursor-pointer"
          >
            <option value="">-- Tất cả số sao --</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-zinc-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-zinc-500 text-xs font-mono">
            Đang tải dữ liệu đánh giá sản phẩm từ MySQL...
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs space-y-2">
            <StarIcon className="w-8 h-8 text-zinc-400 mx-auto" />
            <p className="font-semibold text-zinc-700">Chưa có đánh giá nào phù hợp với bộ lọc.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead className="bg-zinc-50/80 text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-200 font-mono">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">ID</th>
                  <th className="py-3 px-4 w-56">Sản phẩm</th>
                  <th className="py-3 px-4 w-44">Người đánh giá</th>
                  <th className="py-3 px-4">Nhận xét &amp; Phản hồi Admin</th>
                  <th className="py-3 px-4 text-center w-28">Trạng thái</th>
                  <th className="py-3 px-4 text-center w-36">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {reviews.map((rev) => {
                  const isVisible = Number(rev.status) === 1;

                  return (
                    <tr key={rev.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-3 px-4 text-center font-mono text-zinc-400">{rev.id}</td>

                      {/* Sản phẩm */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {rev.product?.image ? (
                            <img
                              src={rev.product.image}
                              alt={rev.product.name}
                              className="w-10 h-10 object-contain rounded-lg border border-zinc-200 bg-white p-0.5 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                              <SmartphoneIcon className="w-5 h-5 text-zinc-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <a
                              href={`/products/${rev.product?.id || rev.product_id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-zinc-900 hover:underline line-clamp-1 block leading-tight"
                            >
                              {rev.product?.name || `Sản phẩm #${rev.product_id}`}
                            </a>
                            {rev.product?.sku && (
                              <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                                SKU: {rev.product.sku}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Người đánh giá */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-zinc-900">{rev.reviewer_name}</div>
                        {rev.reviewer_email && (
                          <div className="text-[10px] font-mono text-zinc-500 mt-0.5">{rev.reviewer_email}</div>
                        )}
                        <div className="text-[10px] text-zinc-400 font-mono mt-1">
                          {new Date(rev.created_at).toLocaleString("vi-VN")}
                        </div>
                      </td>

                      {/* Nhận xét & Phản hồi */}
                      <td className="py-3 px-4 space-y-2">
                        {/* Rating Stars */}
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <StarIcon
                              key={i}
                              filled={i < rev.rating}
                              className="w-3.5 h-3.5 fill-current text-amber-400"
                            />
                          ))}
                          <span className="text-[11px] font-mono font-bold text-zinc-700 ml-1">
                            {rev.rating}/5 sao
                          </span>
                        </div>

                        {/* Comment text */}
                        <p className="text-zinc-800 leading-relaxed font-normal">{rev.comment}</p>

                        {/* Phản hồi từ Quản trị viên */}
                        {rev.admin_reply && (
                          <div className="p-2.5 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-800 text-[11px] space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                              <span>Bảo Công Studio — Phản hồi chính thức:</span>
                            </div>
                            <p className="pl-3 text-zinc-700">{rev.admin_reply}</p>
                          </div>
                        )}
                      </td>

                      {/* Trạng thái duyệt */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${
                            isVisible
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-zinc-100 text-zinc-600 border-zinc-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isVisible ? "bg-emerald-500" : "bg-zinc-400"
                            }`}
                          />
                          <span>{isVisible ? "Hiển thị" : "Đang ẩn"}</span>
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {/* Nút Ẩn/Hiện */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(rev)}
                            className={`px-2 py-1 rounded-md text-xs font-semibold transition border flex items-center gap-1 ${
                              isVisible
                                ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                            }`}
                            title={isVisible ? "Tạm ẩn đánh giá" : "Duyệt hiển thị đánh giá"}
                          >
                            <EyeIcon className="w-3.5 h-3.5" />
                            <span>{isVisible ? "Ẩn" : "Hiện"}</span>
                          </button>

                          {/* Nút Trả lời */}
                          <button
                            type="button"
                            onClick={() => handleOpenReply(rev)}
                            className="bg-zinc-900 hover:bg-zinc-800 text-white px-2 py-1 rounded-md text-xs font-semibold transition flex items-center gap-1 shadow-2xs"
                            title="Trả lời đánh giá của khách"
                          >
                            <MessageSquareIcon className="w-3.5 h-3.5" />
                            <span>Trả lời</span>
                          </button>

                          {/* Nút Xóa */}
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-2 py-1 rounded-md text-xs font-medium transition border border-rose-200"
                            title="Xóa đánh giá vi phạm"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Phân trang */}
        {meta && (
          <div className="p-4 border-t border-zinc-200 flex flex-wrap items-center justify-between text-xs text-zinc-500 gap-2 font-mono">
            <div>
              Hiển thị <b>{reviews.length}</b> đánh giá (Trang <b>{meta.current_page || currentPage}</b> /{" "}
              <b>{meta.last_page || 1}</b>)
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-2.5 py-1 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition"
              >
                « Trước
              </button>
              {Array.from({ length: meta.last_page || 1 }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 rounded-md font-bold text-xs transition ${
                    p === currentPage
                      ? "bg-zinc-900 text-white"
                      : "border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                disabled={!meta || currentPage >= (meta.last_page || 1)}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-2.5 py-1 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition"
              >
                Sau »
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL PHẢN HỒI ĐÁNH GIÁ CỦA QUẢN TRỊ VIÊN */}
      {replyModal.open && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-zinc-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
              <div>
                <h3 className="font-extrabold text-zinc-900 text-sm">
                  Phản Hồi Đánh Giá Của Khách Hàng
                </h3>
                <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                  CÂU TRẢ LỜI SẼ HIỂN THỊ CÔNG KHAI DƯỚI NHẬN XÉT Ở TRANG /products/[id]
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReplyModal({ open: false, review: null, replyText: "", submitting: false })}
                className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center text-xs"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReply} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
                <div className="font-bold text-zinc-900">
                  {replyModal.review?.reviewer_name} ({replyModal.review?.rating} sao)
                </div>
                <div className="text-zinc-600 text-[11px]">
                  Sản phẩm: {replyModal.review?.product?.name}
                </div>
                <p className="text-zinc-700 italic pt-1">&quot;{replyModal.review?.comment}&quot;</p>
              </div>

              <div>
                <label className="block text-zinc-700 font-bold mb-1">
                  Nội dung phản hồi từ Quản trị viên <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Ví dụ: Cảm ơn bạn đã tin tưởng ủng hộ Bảo Công Studio! Nếu cần hỗ trợ thêm thông tin kỹ thuật, bạn vui lòng liên hệ hotline..."
                  value={replyModal.replyText}
                  onChange={(e) => setReplyModal({ ...replyModal, replyText: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs outline-none focus:border-zinc-900 resize-none font-sans"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReplyModal({ open: false, review: null, replyText: "", submitting: false })}
                  className="px-4 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 font-bold rounded-lg text-zinc-700 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={replyModal.submitting}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-lg transition disabled:opacity-50"
                >
                  {replyModal.submitting ? "Đang lưu..." : "Lưu phản hồi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
