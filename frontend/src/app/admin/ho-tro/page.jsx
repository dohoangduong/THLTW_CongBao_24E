"use client";

import React, { useState, useEffect, useCallback } from "react";
import axiosClient from "@/services/axiosClient";
import {
  HelpCircleIcon,
  SearchIcon,
  RefreshIcon,
  CheckIcon,
  TrashIcon,
  AlertCircleIcon,
  XIcon,
  PhoneIcon,
  MailIcon,
  ClockIcon,
  EditIcon,
  MessageSquareIcon,
  FilterIcon,
} from "@/components/Icons";

const TICKET_STATUS = {
  pending: { label: "Chờ xử lý", dot: "bg-amber-500", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  processing: { label: "Đang hỗ trợ", dot: "bg-blue-500", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  resolved: { label: "Đã giải quyết", dot: "bg-emerald-500", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const COMMON_SUBJECTS = [
  "Tư vấn sản phẩm & bảo hành",
  "Chính sách thu cũ đổi mới",
  "Kiểm tra vận chuyển đơn hàng",
  "Gói bảo hành VIP rơi vỡ",
  "Khiếu nại dịch vụ & đổi trả",
  "Tư vấn xuất hóa đơn VAT",
];

export default function AdminSupportTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [meta, setMeta] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 4 Thẻ KPI Thống Kê Tiến Độ Xử Lý
  const [kpiStats, setKpiStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    resolved: 0,
  });

  // Bộ lọc
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");

  // Modal Xem / Xử lý / Cập nhật ghi chú phiếu hỗ trợ
  const [actionModal, setActionModal] = useState({
    open: false,
    ticket: null,
    status: "pending",
    admin_notes: "",
    submitting: false,
  });

  // [THUẬT TOÁN TẢI DANH SÁCH PHIẾU HỖ TRỢ TRONG ADMIN]:
  // Gọi GET /api/admin/support-tickets để nạp các yêu cầu khách gửi từ form /ho-tro.
  const fetchTickets = useCallback(
    (page = 1) => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ page: String(page), per_page: "10" });
      if (statusFilter) params.append("status", statusFilter);
      if (subjectFilter) params.append("subject", subjectFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      axiosClient
        .get(`/admin/support-tickets?${params.toString()}`)
        .then((res) => {
          const list = res.data || res || [];
          setTickets(Array.isArray(list) ? list : list.data || []);
          setMeta(res.meta || res);

          if (res.kpi_stats) {
            setKpiStats(res.kpi_stats);
          } else if (Array.isArray(list)) {
            // Tính toán tạm thời nếu chưa có kpi_stats
            setKpiStats({
              total: list.length,
              pending: list.filter((t) => t.status === "pending").length,
              processing: list.filter((t) => t.status === "processing").length,
              resolved: list.filter((t) => t.status === "resolved").length,
            });
          }
        })
        .catch((err) => {
          console.error("Lỗi khi tải danh sách phiếu hỗ trợ:", err);
          setError(err.message || "Không thể tải danh sách phiếu hỗ trợ từ máy chủ");
        })
        .finally(() => setLoading(false));
    },
    [statusFilter, subjectFilter, searchQuery]
  );

  useEffect(() => {
    fetchTickets(currentPage);
  }, [currentPage, fetchTickets]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTickets(1);
  };

  // [THUẬT TOÁN CẬP NHẬT TIẾN ĐỘ VÀ GHI CHÚ XỬ LÝ]:
  // Đổi trạng thái (pending -> processing -> resolved) và lưu ghi chú của CSKH.
  const handleOpenAction = (t) => {
    setActionModal({
      open: true,
      ticket: t,
      status: t.status || "pending",
      admin_notes: t.admin_notes || "",
      submitting: false,
    });
  };

  const handleSaveAction = async (e) => {
    e.preventDefault();
    if (!actionModal.ticket) return;

    setActionModal((prev) => ({ ...prev, submitting: true }));
    try {
      const res = await axiosClient.put(`/admin/support-tickets/${actionModal.ticket.id}`, {
        status: actionModal.status,
        admin_notes: actionModal.admin_notes,
      });
      alert(res.message || "Cập nhật tiến độ xử lý phiếu hỗ trợ thành công!");
      setActionModal({ open: false, ticket: null, status: "pending", admin_notes: "", submitting: false });
      fetchTickets(currentPage);
    } catch (err) {
      alert("Lỗi cập nhật: " + (err.message || "Lỗi máy chủ"));
      setActionModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // [THUẬT TOÁN XÓA PHIẾU HỖ TRỢ]:
  const handleDeleteTicket = async (t) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa phiếu hỗ trợ từ "${t.name}" không?`)) {
      return;
    }

    try {
      await axiosClient.delete(`/admin/support-tickets/${t.id}`);
      alert("Đã xóa phiếu hỗ trợ thành công!");
      fetchTickets(currentPage);
    } catch (err) {
      alert("Lỗi khi xóa phiếu hỗ trợ: " + (err.message || "Lỗi máy chủ"));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-zinc-900 tracking-tight">
            Quản lý Hỗ trợ &amp; Phiếu Yêu Cầu Khách Hàng
          </h2>
          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
            TIẾP NHẬN YÊU CẦU TỪ /ho-tro • ĐIỀU PHỐI XỬ LÝ • LƯU TRỮ MYSQL
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchTickets(currentPage)}
          className="bg-white hover:bg-zinc-50 text-zinc-700 font-semibold px-3 py-2 rounded-lg border border-zinc-200 text-xs shadow-2xs transition flex items-center gap-1.5"
        >
          <RefreshIcon className="w-3.5 h-3.5" />
          <span>Tải lại</span>
        </button>
      </div>

      {/* 4 THẺ KPI TIẾN ĐỘ XỬ LÝ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Tổng yêu cầu */}
        <div
          onClick={() => {
            setStatusFilter("");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === ""
              ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
              : "bg-white text-zinc-900 border-zinc-200/80 hover:border-zinc-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === "" ? "text-zinc-400" : "text-zinc-500"}`}>
              Tổng yêu cầu
            </span>
            <MessageSquareIcon className={`w-4 h-4 ${statusFilter === "" ? "text-zinc-300" : "text-zinc-400"}`} />
          </div>
          <div className="text-2xl font-black font-mono mt-2 tracking-tight">
            {kpiStats.total}
          </div>
          <div className={`text-[10px] mt-1 ${statusFilter === "" ? "text-zinc-400" : "text-zinc-500"}`}>
            Tất cả phiếu gửi từ /ho-tro
          </div>
        </div>

        {/* KPI 2: Chờ xử lý */}
        <div
          onClick={() => {
            setStatusFilter("pending");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === "pending"
              ? "bg-amber-500 text-white border-amber-600 shadow-sm"
              : "bg-white text-zinc-900 border-zinc-200/80 hover:border-amber-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === "pending" ? "text-amber-100" : "text-amber-600"}`}>
              Chờ xử lý
            </span>
            <ClockIcon className={`w-4 h-4 ${statusFilter === "pending" ? "text-amber-100" : "text-amber-500"}`} />
          </div>
          <div className="text-2xl font-black font-mono mt-2 tracking-tight text-amber-900">
            {kpiStats.pending}
          </div>
          <div className={`text-[10px] mt-1 ${statusFilter === "pending" ? "text-amber-100" : "text-amber-700 font-medium"}`}>
            Phiếu mới cần tiếp nhận
          </div>
        </div>

        {/* KPI 3: Đang hỗ trợ */}
        <div
          onClick={() => {
            setStatusFilter("processing");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === "processing"
              ? "bg-blue-600 text-white border-blue-700 shadow-sm"
              : "bg-white text-zinc-900 border-zinc-200/80 hover:border-blue-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === "processing" ? "text-blue-100" : "text-blue-600"}`}>
              Đang hỗ trợ
            </span>
            <AlertCircleIcon className={`w-4 h-4 ${statusFilter === "processing" ? "text-blue-100" : "text-blue-500"}`} />
          </div>
          <div className="text-2xl font-black font-mono mt-2 tracking-tight text-blue-900">
            {kpiStats.processing}
          </div>
          <div className={`text-[10px] mt-1 ${statusFilter === "processing" ? "text-blue-100" : "text-blue-700 font-medium"}`}>
            CSKH đang giải quyết
          </div>
        </div>

        {/* KPI 4: Đã giải quyết */}
        <div
          onClick={() => {
            setStatusFilter("resolved");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === "resolved"
              ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
              : "bg-white text-zinc-900 border-zinc-200/80 hover:border-emerald-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === "resolved" ? "text-emerald-100" : "text-emerald-600"}`}>
              Đã giải quyết
            </span>
            <CheckIcon className={`w-4 h-4 ${statusFilter === "resolved" ? "text-emerald-100" : "text-emerald-500"}`} />
          </div>
          <div className="text-2xl font-black font-mono mt-2 tracking-tight text-emerald-900">
            {kpiStats.resolved}
          </div>
          <div className={`text-[10px] mt-1 ${statusFilter === "resolved" ? "text-emerald-100" : "text-emerald-700 font-medium"}`}>
            Hoàn tất hỗ trợ khách
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
              placeholder="Tìm theo tên khách, SĐT, email, mã đơn, tiêu đề..."
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

        <div className="flex flex-wrap items-center gap-2">
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
            <option value="pending">Chờ xử lý (Mới)</option>
            <option value="processing">Đang hỗ trợ</option>
            <option value="resolved">Đã giải quyết</option>
          </select>

          {/* Lọc theo Chủ đề */}
          <select
            value={subjectFilter}
            onChange={(e) => {
              setSubjectFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-medium rounded-lg px-3 py-2 outline-none focus:border-zinc-900 cursor-pointer max-w-xs"
          >
            <option value="">-- Tất cả chủ đề --</option>
            {COMMON_SUBJECTS.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
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
            Đang tải dữ liệu phiếu hỗ trợ từ MySQL...
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs space-y-2">
            <HelpCircleIcon className="w-8 h-8 text-zinc-400 mx-auto" />
            <p className="font-semibold text-zinc-700">Chưa có phiếu yêu cầu hỗ trợ nào phù hợp với bộ lọc.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead className="bg-zinc-50/80 text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-200 font-mono">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">ID</th>
                  <th className="py-3 px-4 w-52">Khách hàng &amp; SĐT</th>
                  <th className="py-3 px-4 w-44">Chủ đề &amp; Đơn hàng</th>
                  <th className="py-3 px-4">Nội dung chi tiết &amp; Ghi chú Admin</th>
                  <th className="py-3 px-4 text-center w-32">Tiến độ</th>
                  <th className="py-3 px-4 text-center w-28">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {tickets.map((t) => {
                  const statusInfo = TICKET_STATUS[t.status] || {
                    label: t.status,
                    dot: "bg-zinc-400",
                    cls: "bg-zinc-100 text-zinc-600 border-zinc-200",
                  };

                  return (
                    <tr key={t.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-3 px-4 text-center font-mono text-zinc-400">{t.id}</td>

                      {/* Khách hàng */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-zinc-900">{t.name}</div>
                        <div className="text-[11px] font-mono text-zinc-600 flex items-center gap-1 mt-0.5">
                          <PhoneIcon className="w-3 h-3 text-zinc-400" />
                          <a href={`tel:${t.phone}`} className="hover:underline text-zinc-800 font-semibold">
                            {t.phone}
                          </a>
                        </div>
                        {t.email && (
                          <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 mt-0.5">
                            <MailIcon className="w-3 h-3 text-zinc-400" />
                            <a href={`mailto:${t.email}`} className="hover:underline">
                              {t.email}
                            </a>
                          </div>
                        )}
                        <div className="text-[10px] text-zinc-400 font-mono mt-1">
                          {new Date(t.created_at).toLocaleString("vi-VN")}
                        </div>
                      </td>

                      {/* Chủ đề & Đơn hàng */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-zinc-900 leading-snug">{t.subject}</div>
                        {t.order_code && (
                          <div className="text-[11px] font-mono font-bold text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200 inline-block mt-1">
                            Mã đơn: #{t.order_code}
                          </div>
                        )}
                      </td>

                      {/* Nội dung tin nhắn & Ghi chú CSKH */}
                      <td className="py-3 px-4 space-y-1.5">
                        <p className="text-zinc-800 leading-relaxed font-normal">{t.message}</p>
                        {t.admin_notes && (
                          <div className="p-2 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-800 text-[11px]">
                            <span className="font-bold block text-zinc-900">Ghi chú của CSKH:</span>
                            {t.admin_notes}
                          </div>
                        )}
                      </td>

                      {/* Tiến độ xử lý */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${statusInfo.cls}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {/* Nút Xử lý / Cập nhật */}
                          <button
                            type="button"
                            onClick={() => handleOpenAction(t)}
                            className="bg-zinc-900 hover:bg-zinc-800 text-white px-2 py-1 rounded-md text-xs font-semibold transition flex items-center gap-1 shadow-2xs"
                            title="Xem chi tiết và xử lý phiếu"
                          >
                            <EditIcon className="w-3.5 h-3.5" />
                            <span>Xử lý</span>
                          </button>

                          {/* Nút Xóa */}
                          <button
                            type="button"
                            onClick={() => handleDeleteTicket(t)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-2 py-1 rounded-md text-xs font-medium transition border border-rose-200"
                            title="Xóa phiếu hỗ trợ spam"
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
              Hiển thị <b>{tickets.length}</b> phiếu (Trang <b>{meta.current_page || currentPage}</b> /{" "}
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

      {/* MODAL XỬ LÝ & GHI CHÚ PHIẾU HỖ TRỢ */}
      {actionModal.open && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-zinc-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
              <div>
                <h3 className="font-extrabold text-zinc-900 text-sm">
                  Chi Tiết &amp; Xử Lý Phiếu Hỗ Trợ #{actionModal.ticket?.id}
                </h3>
                <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                  ĐỒNG BỘ 100% VỚI BẢNG SUPPORT_TICKETS TRONG MYSQL
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActionModal({ open: false, ticket: null, status: "pending", admin_notes: "", submitting: false })}
                className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center text-xs"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAction} className="p-5 space-y-4 text-xs">
              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-zinc-900 text-sm">
                    {actionModal.ticket?.name}
                  </div>
                  {actionModal.ticket?.order_code && (
                    <span className="px-2 py-0.5 rounded bg-zinc-200 text-zinc-800 font-mono font-bold text-[10px]">
                      Đơn hàng #{actionModal.ticket?.order_code}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-zinc-600 font-mono text-[11px]">
                  <span>SĐT: <a href={`tel:${actionModal.ticket?.phone}`} className="font-bold text-zinc-900 underline">{actionModal.ticket?.phone}</a></span>
                  {actionModal.ticket?.email && <span>Email: {actionModal.ticket?.email}</span>}
                </div>

                <div className="text-zinc-800 font-bold">
                  Chủ đề: <span className="font-medium text-zinc-700">{actionModal.ticket?.subject}</span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-zinc-200 text-zinc-800 leading-relaxed italic">
                  &quot;{actionModal.ticket?.message}&quot;
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-bold mb-1">
                  Trạng thái tiến độ xử lý
                </label>
                <select
                  value={actionModal.status}
                  onChange={(e) => setActionModal({ ...actionModal, status: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs outline-none focus:border-zinc-900 font-medium cursor-pointer"
                >
                  <option value="pending">Chờ xử lý (Mới tiếp nhận từ khách)</option>
                  <option value="processing">Đang hỗ trợ (Đang liên hệ giải quyết)</option>
                  <option value="resolved">Đã giải quyết (Hoàn tất thành công)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 font-bold mb-1">
                  Ghi chú nội bộ của Quản trị viên / Chuyên viên CSKH
                </label>
                <textarea
                  rows={4}
                  placeholder="Ví dụ: Đã gọi điện lúc 10h15 xác nhận thủ tục đổi máy cho khách, hẹn kỹ thuật qua kiểm tra..."
                  value={actionModal.admin_notes}
                  onChange={(e) => setActionModal({ ...actionModal, admin_notes: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs outline-none focus:border-zinc-900 resize-none font-sans"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActionModal({ open: false, ticket: null, status: "pending", admin_notes: "", submitting: false })}
                  className="px-4 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 font-bold rounded-lg text-zinc-700 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={actionModal.submitting}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-lg transition disabled:opacity-50"
                >
                  {actionModal.submitting ? "Đang lưu..." : "Lưu cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
