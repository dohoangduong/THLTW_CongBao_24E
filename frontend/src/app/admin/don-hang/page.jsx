"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import axiosClient from "@/services/axiosClient";
import { dateVN, money, ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from "@/lib/api";
import {
  PackageIcon,
  TrendingUpIcon,
  ClockIcon,
  CheckIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  SearchIcon,
  RefreshIcon,
  AlertCircleIcon,
  XIcon,
} from "@/components/Icons";

const STATUS_BADGES = {
  pending: { label: "Chờ xác nhận", dot: "bg-amber-500", cls: "bg-amber-50/80 text-amber-700 border-amber-200" },
  confirmed: { label: "Đã xác nhận", dot: "bg-blue-500", cls: "bg-blue-50/80 text-blue-700 border-blue-200" },
  processing: { label: "Đang chuẩn bị", dot: "bg-indigo-500", cls: "bg-indigo-50/80 text-indigo-700 border-indigo-200" },
  shipping: { label: "Đang giao hàng", dot: "bg-sky-500", cls: "bg-sky-50/80 text-sky-700 border-sky-200" },
  completed: { label: "Hoàn thành", dot: "bg-emerald-500", cls: "bg-emerald-50/80 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Đã hủy", dot: "bg-rose-500", cls: "bg-rose-50/80 text-rose-700 border-rose-200" },
};

const PAYMENT_BADGES = {
  pending: { label: "Chưa thanh toán", dot: "bg-amber-500", cls: "bg-amber-50/80 text-amber-700 border-amber-200" },
  paid: { label: "Đã thanh toán", dot: "bg-emerald-500", cls: "bg-emerald-50/80 text-emerald-700 border-emerald-200" },
  failed: { label: "Lỗi thanh toán", dot: "bg-rose-500", cls: "bg-rose-50/80 text-rose-700 border-rose-200" },
  refunded: { label: "Đã hoàn tiền", dot: "bg-zinc-400", cls: "bg-zinc-100 text-zinc-700 border-zinc-200" },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bộ lọc
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal xem chi tiết
  const [detailModal, setDetailModal] = useState({ open: false, order: null, loading: false });

  // Modal cập nhật trạng thái
  const [statusModal, setStatusModal] = useState({
    open: false,
    order: null,
    newStatus: "",
    newPaymentStatus: "",
    note: "",
    submitting: false,
    error: null,
  });

  // Modal xóa mềm
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, code: "", submitting: false });

  // Lấy danh sách đơn hàng
  const fetchOrders = useCallback(
    (page = 1) => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ page: String(page), per_page: "10" });
      if (statusFilter) params.append("status", statusFilter);
      if (searchQuery.trim()) params.append("q", searchQuery.trim());

      axiosClient
        .get(`/admin/orders?${params.toString()}`)
        .then((res) => {
          const list = res.data || res || [];
          setOrders(Array.isArray(list) ? list : list.data || []);
          setMeta(res.meta || res);
        })
        .catch((err) => {
          console.error("Lỗi khi tải danh sách đơn hàng:", err);
          setError(err.message || "Không thể tải danh sách đơn hàng từ cơ sở dữ liệu");
        })
        .finally(() => setLoading(false));
    },
    [statusFilter, searchQuery]
  );

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, fetchOrders]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders(1);
  };

  // Tính 4 chỉ số KPI Summary
  const kpiStats = useMemo(() => {
    const totalOrders = meta?.total ?? orders.length;
    let revenue = 0;
    let pendingCount = 0;
    let completedCount = 0;

    orders.forEach((o) => {
      if (o.status !== "cancelled") {
        revenue += Number(o.total || 0);
      }
      if (o.status === "pending" || o.status === "confirmed" || o.status === "processing") {
        pendingCount++;
      }
      if (o.status === "completed") {
        completedCount++;
      }
    });

    return {
      totalOrders,
      revenue,
      pendingCount,
      completedCount,
    };
  }, [orders, meta]);

  // Mở modal xem chi tiết
  const handleOpenDetail = (orderId) => {
    setDetailModal({ open: true, order: null, loading: true });
    axiosClient
      .get(`/admin/orders/${orderId}`)
      .then((res) => {
        const o = res.data || res;
        setDetailModal({ open: true, order: o, loading: false });
      })
      .catch((err) => {
        alert("Lỗi khi tải chi tiết đơn hàng: " + err.message);
        setDetailModal({ open: false, order: null, loading: false });
      });
  };

  // Mở modal cập nhật trạng thái
  const handleOpenStatusModal = (order) => {
    setStatusModal({
      open: true,
      order,
      newStatus: order.status,
      newPaymentStatus: order.payment_status || "pending",
      note: order.note || "",
      submitting: false,
      error: null,
    });
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    setStatusModal((prev) => ({ ...prev, submitting: true, error: null }));
    try {
      await axiosClient.put(`/admin/orders/${statusModal.order.id}/status`, {
        status: statusModal.newStatus,
        payment_status: statusModal.newPaymentStatus,
        note: statusModal.note,
      });
      setStatusModal({
        open: false,
        order: null,
        newStatus: "",
        newPaymentStatus: "",
        note: "",
        submitting: false,
        error: null,
      });
      fetchOrders(currentPage);
    } catch (err) {
      setStatusModal((prev) => ({ ...prev, submitting: false, error: err.message }));
    }
  };

  // Mở modal xóa mềm
  const handleOpenDelete = (order) => {
    setDeleteModal({ open: true, id: order.id, code: order.order_code, submitting: false });
  };

  const handleDeleteConfirm = async () => {
    setDeleteModal((prev) => ({ ...prev, submitting: true }));
    try {
      await axiosClient.delete(`/admin/orders/${deleteModal.id}`);
      setDeleteModal({ open: false, id: null, code: "", submitting: false });
      fetchOrders(currentPage);
    } catch (err) {
      alert("Lỗi khi xóa đơn hàng: " + err.message);
      setDeleteModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handlePageChange = (p) => {
    if (p >= 1 && (!meta || p <= (meta.last_page || 1))) {
      setCurrentPage(p);
    }
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          1. 4 THẺ KPI SUMMARY TRÊN ĐẦU TRANG
          ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Tổng đơn hàng */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[11px] font-mono uppercase text-zinc-500 font-bold">Tổng đơn hàng</p>
            <h3 className="text-2xl font-extrabold text-zinc-900 font-mono tabular-nums mt-1">
              {kpiStats.totalOrders}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Dữ liệu toàn hệ thống</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
            <PackageIcon className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2: Doanh thu ghi nhận */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[11px] font-mono uppercase text-zinc-500 font-bold">Doanh thu ghi nhận</p>
            <h3 className="text-xl font-extrabold text-emerald-700 font-mono tabular-nums mt-1">
              {kpiStats.revenue.toLocaleString("vi-VN")} ₫
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Trừ đơn đã hủy</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUpIcon className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Đơn chờ xử lý */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[11px] font-mono uppercase text-zinc-500 font-bold">Đơn chờ xử lý</p>
            <h3 className="text-2xl font-extrabold text-amber-600 font-mono tabular-nums mt-1">
              {kpiStats.pendingCount}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Cần tiếp nhận & giao</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <ClockIcon className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Đơn hoàn thành */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[11px] font-mono uppercase text-zinc-500 font-bold">Đơn hoàn thành</p>
            <h3 className="text-2xl font-extrabold text-blue-600 font-mono tabular-nums mt-1">
              {kpiStats.completedCount}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Giao thành công</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <CheckIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. TOOLBAR LỌC & TÌM KIẾM SẮC NÉT
          ========================================================================= */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md flex items-center gap-2">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã đơn, tên khách, số điện thoại..."
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

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-medium rounded-lg px-3 py-2 outline-none focus:border-zinc-900 cursor-pointer"
          >
            <option value="">-- Tất cả trạng thái --</option>
            {Object.entries(ORDER_STATUS).map(([k, v]) => (
              <option key={k} value={k}>
                {typeof v === "object" && v !== null ? v.label : String(v)}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => fetchOrders(currentPage)}
            className="bg-white hover:bg-zinc-50 text-zinc-700 font-semibold px-3 py-2 rounded-lg border border-zinc-200 text-xs shadow-2xs transition flex items-center gap-1.5"
          >
            <RefreshIcon className="w-3.5 h-3.5" />
            <span>Tải lại</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* =========================================================================
          3. BẢNG DỮ LIỆU SẮC NÉT (HIGH-DENSITY TABULAR DATA)
          ========================================================================= */}
      <div className="bg-white rounded-xl border border-zinc-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-zinc-500 text-xs font-mono">
            Đang truy vấn dữ liệu từ MySQL...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs space-y-2">
            <PackageIcon className="w-8 h-8 text-zinc-400 mx-auto" />
            <p className="font-semibold text-zinc-700">Không tìm thấy đơn hàng nào trong cơ sở dữ liệu.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead className="bg-zinc-50/80 text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-200 font-mono">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">ID</th>
                  <th className="py-3 px-4">Mã đơn</th>
                  <th className="py-3 px-4">Khách hàng & SĐT</th>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4 text-right">Tổng tiền</th>
                  <th className="py-3 px-4 text-center">Thanh toán</th>
                  <th className="py-3 px-4 text-center">Trạng thái đơn</th>
                  <th className="py-3 px-4 text-center w-36">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {orders.map((order) => {
                  const sBadge = STATUS_BADGES[order.status] || {
                    label: typeof ORDER_STATUS[order.status] === "object" ? ORDER_STATUS[order.status]?.label : (order.status || "—"),
                    dot: "bg-zinc-400",
                    cls: "bg-zinc-100 text-zinc-700 border-zinc-200",
                  };
                  const pBadge = PAYMENT_BADGES[order.payment_status] || {
                    label: typeof PAYMENT_STATUS[order.payment_status] === "object" ? PAYMENT_STATUS[order.payment_status]?.label : (order.payment_status || "Chưa TT"),
                    dot: "bg-zinc-400",
                    cls: "bg-zinc-100 text-zinc-700 border-zinc-200",
                  };

                  return (
                    <tr key={order.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-3 px-4 text-center font-mono text-zinc-400">{order.id}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                          {order.order_code}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-zinc-900">{order.customer_name}</div>
                        <div className="text-[11px] font-mono text-zinc-500">{order.customer_phone}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">
                        {dateVN(order.created_at)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-zinc-900 tabular-nums">
                        {Number(order.total || 0).toLocaleString("vi-VN")} ₫
                      </td>
                      <td className="py-3 px-4 text-center">
                        {/* Dot Status Badge: Thanh toán */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border ${pBadge.cls}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${pBadge.dot}`} />
                          <span>{pBadge.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {/* Dot Status Badge: Trạng thái đơn */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border ${sBadge.cls}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${sBadge.dot}`} />
                          <span>{sBadge.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(order.id)}
                            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-2 py-1 rounded-md text-xs font-medium transition flex items-center gap-1"
                          >
                            <EyeIcon className="w-3.5 h-3.5 text-zinc-600" />
                            <span>Xem</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenStatusModal(order)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-medium transition flex items-center gap-1"
                          >
                            <EditIcon className="w-3.5 h-3.5 text-blue-600" />
                            <span>Xử lý</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(order)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-2 py-1 rounded-md text-xs font-medium transition flex items-center gap-1"
                          >
                            <TrashIcon className="w-3.5 h-3.5 text-rose-600" />
                            <span>Xóa</span>
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

        {/* Phân trang High-Density */}
        {meta && (
          <div className="p-4 border-t border-zinc-200 flex flex-wrap items-center justify-between text-xs text-zinc-500 gap-2 font-mono">
            <div>
              Hiển thị <b>{orders.length}</b> đơn hàng (Trang <b>{meta.current_page || currentPage}</b> /{" "}
              <b>{meta.last_page || 1}</b>)
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-2.5 py-1 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition"
              >
                « Trước
              </button>
              {Array.from({ length: meta.last_page || 1 }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePageChange(p)}
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
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-2.5 py-1 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition"
              >
                Sau »
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL: CHI TIẾT ĐƠN HÀNG
          ========================================================================= */}
      {detailModal.open && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-zinc-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <PackageIcon className="w-5 h-5 text-zinc-900" />
                <h3 className="font-extrabold text-zinc-900 text-sm">
                  Chi tiết đơn hàng #{detailModal.order?.order_code || "..."}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailModal({ open: false, order: null, loading: false })}
                className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center text-xs"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {detailModal.loading ? (
                <div className="p-8 text-center text-zinc-500 font-mono">Đang tải thông tin đơn hàng...</div>
              ) : detailModal.order ? (
                <>
                  <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                    <div>
                      <p className="text-zinc-500 text-[11px] font-mono uppercase">Khách hàng</p>
                      <p className="font-bold text-zinc-900 mt-0.5">{detailModal.order.customer_name}</p>
                      <p className="text-zinc-600 font-mono">{detailModal.order.customer_phone}</p>
                      <p className="text-zinc-600">{detailModal.order.customer_email || "Chưa có email"}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-[11px] font-mono uppercase">Địa chỉ giao hàng</p>
                      <p className="text-zinc-800 mt-0.5 leading-relaxed">{detailModal.order.shipping_address}</p>
                      {detailModal.order.note && (
                        <p className="text-amber-700 italic mt-1 text-[11px]">
                          Ghi chú: {detailModal.order.note}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Trạng thái đơn và thanh toán */}
                  <div className="flex flex-wrap items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 font-mono text-[11px]">Vận chuyển:</span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${
                          (STATUS_BADGES[detailModal.order.status] || {}).cls || "bg-zinc-100 text-zinc-700 border-zinc-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            (STATUS_BADGES[detailModal.order.status] || {}).dot || "bg-zinc-400"
                          }`}
                        />
                        <span>
                          {(STATUS_BADGES[detailModal.order.status] || {}).label || detailModal.order.status}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 font-mono text-[11px]">Thanh toán:</span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${
                          (PAYMENT_BADGES[detailModal.order.payment_status] || {}).cls || "bg-zinc-100 text-zinc-700 border-zinc-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            (PAYMENT_BADGES[detailModal.order.payment_status] || {}).dot || "bg-zinc-400"
                          }`}
                        />
                        <span>
                          {(PAYMENT_BADGES[detailModal.order.payment_status] || {}).label ||
                            detailModal.order.payment_status ||
                            "Chưa TT"}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-zinc-900 mb-2 uppercase tracking-wider text-[11px] font-mono">
                      Danh sách sản phẩm ({detailModal.order.items?.length || 0})
                    </h4>
                    <div className="border border-zinc-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-50 text-zinc-500 font-mono border-b border-zinc-200">
                          <tr>
                            <th className="py-2.5 px-3">Sản phẩm</th>
                            <th className="py-2.5 px-3 text-center">Số lượng</th>
                            <th className="py-2.5 px-3 text-right">Đơn giá</th>
                            <th className="py-2.5 px-3 text-right">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {detailModal.order.items?.map((item) => (
                            <tr key={item.id}>
                              <td className="py-2.5 px-3 font-semibold text-zinc-900">
                                {item.product_name || item.product?.name || `Sản phẩm #${item.product_id}`}
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                              <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                                {Number(item.price).toLocaleString("vi-VN")} ₫
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-900 tabular-nums">
                                {(Number(item.price) * Number(item.quantity)).toLocaleString("vi-VN")} ₫
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-zinc-50 font-bold border-t border-zinc-200">
                          <tr>
                            <td colSpan={3} className="py-2.5 px-3 text-right text-zinc-700 font-mono">
                              Tổng cộng:
                            </td>
                            <td className="py-2.5 px-3 text-right text-zinc-950 font-mono text-sm tabular-nums">
                              {Number(detailModal.order.total || 0).toLocaleString("vi-VN")} ₫
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <div className="p-4 border-t border-zinc-200 flex justify-end bg-zinc-50/50">
              <button
                type="button"
                onClick={() => setDetailModal({ open: false, order: null, loading: false })}
                className="bg-zinc-900 text-white font-semibold px-4 py-2 rounded-lg text-xs hover:bg-zinc-800 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
          ========================================================================= */}
      {statusModal.open && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-zinc-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <EditIcon className="w-4 h-4 text-zinc-900" />
                <h3 className="font-extrabold text-zinc-900 text-sm">
                  Cập nhật đơn hàng #{statusModal.order?.order_code}
                </h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  setStatusModal({
                    open: false,
                    order: null,
                    newStatus: "",
                    newPaymentStatus: "",
                    note: "",
                    submitting: false,
                    error: null,
                  })
                }
                className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center text-xs"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="p-5 space-y-4 text-xs">
              {statusModal.error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 font-semibold rounded-lg flex items-center gap-2">
                  <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{statusModal.error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-700 block">Trạng thái vận chuyển & xử lý</label>
                <select
                  value={statusModal.newStatus}
                  onChange={(e) => setStatusModal({ ...statusModal, newStatus: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs outline-none focus:border-zinc-900"
                >
                  {Object.entries(ORDER_STATUS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {typeof v === "object" && v !== null ? v.label : String(v)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-700 block">Trạng thái thanh toán</label>
                <select
                  value={statusModal.newPaymentStatus}
                  onChange={(e) => setStatusModal({ ...statusModal, newPaymentStatus: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs outline-none focus:border-zinc-900"
                >
                  {Object.entries(PAYMENT_STATUS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {typeof v === "object" && v !== null ? v.label : String(v)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-700 block">Ghi chú xử lý nội bộ</label>
                <textarea
                  rows={2}
                  value={statusModal.note}
                  onChange={(e) => setStatusModal({ ...statusModal, note: e.target.value })}
                  placeholder="Ghi chú thêm về đơn hàng nếu có..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs outline-none focus:border-zinc-900"
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 flex justify-end gap-2">
                <button
                  type="submit"
                  disabled={statusModal.submitting}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-4 py-2 rounded-lg text-xs transition"
                >
                  {statusModal.submitting ? "Đang lưu..." : "Cập nhật đơn"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setStatusModal({
                      open: false,
                      order: null,
                      newStatus: "",
                      newPaymentStatus: "",
                      note: "",
                      submitting: false,
                      error: null,
                    })
                  }
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold px-4 py-2 rounded-lg text-xs transition"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: XÁC NHẬN XÓA MỀM ĐƠN HÀNG
          ========================================================================= */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-zinc-200 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <TrashIcon className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-zinc-900 text-sm">Xóa đơn hàng</h3>
              <p className="text-xs text-zinc-500">
                Bạn có chắc chắn muốn đưa đơn <b>#{deleteModal.code}</b> vào <b>Thùng rác</b>? Bạn có thể khôi phục lại bất kỳ lúc nào.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={deleteModal.submitting}
                onClick={handleDeleteConfirm}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 rounded-lg text-xs transition"
              >
                {deleteModal.submitting ? "Đang xóa..." : "Đồng ý xóa"}
              </button>
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, id: null, code: "", submitting: false })}
                className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold py-2 rounded-lg text-xs transition"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
