"use client";

import { useState, useEffect, useCallback } from "react";
import axiosClient from "@/services/axiosClient";
import { dateVN, money, ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from "@/lib/api";

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
      setStatusModal({ open: false, order: null, newStatus: "", newPaymentStatus: "", note: "", submitting: false, error: null });
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
    <div className="space-y-4">
      {/* Top Header & Toolbar Retro */}
      <div className="border-b-2 border-black pb-2 flex flex-wrap justify-between items-center bg-[#d4d0c8] p-2 gap-2">
        <div>
          <h1 className="text-base font-bold text-black uppercase tracking-wide">
            QUẢN LÝ ĐƠN HÀNG (ORDERS)
          </h1>
          <p className="text-xs text-gray-700">
            Theo dõi, xử lý luồng đơn hàng, trạng thái thanh toán và thông tin khách mua.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fetchOrders(currentPage)}
            className="retro-btn font-bold"
          >
            Tải lại danh sách
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-2 border-red-700 text-red-900 p-2 text-xs font-mono">
          <b>Lỗi hệ thống:</b> {error}
        </div>
      )}

      {/* Retro Filter Bar */}
      <div className="border border-[#808080] bg-[#ece9d8] p-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <span>Tìm kiếm:</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Mã đơn, tên khách, SĐT..."
            className="retro-input px-2 py-0.5 w-56 text-xs"
          />
          <button type="submit" className="retro-btn text-xs font-bold !py-0.5">
            Tìm
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="retro-btn text-xs !py-0.5 text-gray-600"
            >
              Xóa tìm
            </button>
          )}
        </form>

        <div className="flex items-center gap-2">
          <span>Lọc trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="retro-input px-2 py-0.5 text-xs font-bold"
          >
            <option value="">-- Tất cả trạng thái --</option>
            {Object.entries(ORDER_STATUS).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bảng danh sách đơn hàng Retro */}
      {loading ? (
        <div className="p-8 text-center text-black bg-[#ece9d8] border border-black">
          <b>Đang tải dữ liệu đơn hàng từ Database... Vui lòng đợi.</b>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="retro-table">
            <thead>
              <tr>
                <th className="w-10 text-center">ID</th>
                <th className="w-28">Mã đơn hàng</th>
                <th>Khách hàng & SĐT</th>
                <th className="text-center w-28">Ngày đặt</th>
                <th className="text-right w-28">Tổng tiền</th>
                <th className="text-center w-28">Thanh toán</th>
                <th className="text-center w-28">Trạng thái</th>
                <th className="text-center w-36">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-4 text-center text-gray-700 bg-[#f9f9f9]">
                    Không tìm thấy đơn hàng nào trong cơ sở dữ liệu.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="text-center font-mono">{order.id}</td>
                    <td className="font-mono font-bold text-[#0000ee]">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(order.id)}
                        className="underline hover:text-red-600"
                      >
                        {order.order_code}
                      </button>
                    </td>
                    <td>
                      <b>{order.customer_name}</b>
                      <br />
                      <span className="text-[11px] text-gray-600 font-mono">
                        {order.customer_phone} {order.customer_email ? `| ${order.customer_email}` : ""}
                      </span>
                    </td>
                    <td className="text-center text-[11px] whitespace-nowrap">
                      {dateVN(order.created_at)}
                    </td>
                    <td className="text-right font-bold text-red-700 whitespace-nowrap">
                      {money(order.total)}
                    </td>
                    <td className="text-center text-[11px]">
                      <span className="font-semibold block">
                        {order.payment_method?.toUpperCase()}
                      </span>
                      <span
                        className={`text-[10px] px-1 py-0.2 border ${
                          order.payment_status === "paid"
                            ? "bg-[#e6f4ea] text-[#137333] border-[#137333]"
                            : "bg-[#fef7e0] text-[#b06000] border-[#b06000]"
                        }`}
                      >
                        {PAYMENT_STATUS[order.payment_status]?.label || order.payment_status}
                      </span>
                    </td>
                    <td className="text-center whitespace-nowrap">
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-bold border ${
                          order.status === "completed"
                            ? "bg-[#e6f4ea] text-[#137333] border-[#137333]"
                            : order.status === "cancelled"
                            ? "bg-[#fce8e6] text-[#c5221f] border-[#c5221f]"
                            : "bg-[#e8f0fe] text-[#1a73e8] border-[#1a73e8]"
                        }`}
                      >
                        {ORDER_STATUS[order.status]?.label || order.status}
                      </span>
                    </td>
                    <td className="text-center whitespace-nowrap space-x-1">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(order.id)}
                        className="retro-btn !py-0.5 text-[11px]"
                        title="Xem chi tiết đơn"
                      >
                        Xem
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenStatusModal(order)}
                        className="retro-btn font-bold !py-0.5 text-[11px] text-[#0a246a]"
                        title="Cập nhật trạng thái"
                      >
                        Xử lý
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDelete(order)}
                        className="retro-btn !py-0.5 text-[11px] text-red-700"
                        title="Xóa vào thùng rác"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Retro Pagination */}
      {meta && (
        <div className="border border-[#808080] bg-[#ece9d8] p-1.5 flex flex-wrap justify-between items-center text-xs">
          <div>
            Hiển thị <b>{orders.length}</b> đơn hàng (Trang <b>{meta.current_page || currentPage}</b> /{" "}
            <b>{meta.last_page || 1}</b> - Tổng: <b>{meta.total || orders.length}</b> đơn)
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="retro-btn !py-0.5"
            >
              « Trang trước
            </button>
            {Array.from({ length: meta.last_page || 1 }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === meta.last_page || Math.abs(p - currentPage) <= 2)
              .map((p, idx, arr) => (
                <span key={p} className="flex items-center">
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-gray-500">...</span>}
                  <button
                    type="button"
                    onClick={() => handlePageChange(p)}
                    className={
                      p === currentPage
                        ? "retro-btn font-bold bg-[#0a246a] text-white !py-0.5"
                        : "retro-btn !py-0.5"
                    }
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              type="button"
              disabled={!meta || currentPage >= (meta.last_page || 1)}
              onClick={() => handlePageChange(currentPage + 1)}
              className="retro-btn !py-0.5"
            >
              Trang sau »
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: XEM CHI TIẾT ĐƠN HÀNG (RETRO WINDOW)
          ========================================================================= */}
      {detailModal.open && (
        <div className="retro-modal-backdrop">
          <div className="retro-modal w-[680px] max-w-[95vw] max-h-[90vh] flex flex-col">
            <div className="retro-titlebar">
              <span className="font-bold">
                CHI TIẾT ĐƠN HÀNG: {detailModal.order?.order_code || "Đang tải..."}
              </span>
              <button
                type="button"
                onClick={() => setDetailModal({ open: false, order: null, loading: false })}
                className="retro-btn font-bold !py-0 !px-1.5 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-3 overflow-y-auto space-y-3 bg-[#ece9d8] flex-1 text-xs">
              {detailModal.loading ? (
                <div className="p-8 text-center font-bold">Đang tải chi tiết đơn hàng...</div>
              ) : detailModal.order ? (
                <>
                  {/* Khung Thông tin chung */}
                  <div className="border border-[#808080] bg-white p-2.5 space-y-1">
                    <div className="font-bold border-b border-[#808080] pb-1 mb-1 text-black">
                      1. THÔNG TIN KHÁCH HÀNG & GIAO HÀNG
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <b>Người nhận:</b> {detailModal.order.customer_name}
                      </div>
                      <div>
                        <b>Số điện thoại:</b> {detailModal.order.customer_phone}
                      </div>
                      <div>
                        <b>Email:</b> {detailModal.order.customer_email || "Chưa có"}
                      </div>
                      <div>
                        <b>Ngày đặt hàng:</b> {dateVN(detailModal.order.created_at)}
                      </div>
                      <div className="col-span-2">
                        <b>Địa chỉ giao:</b> {detailModal.order.shipping_address}
                      </div>
                      {detailModal.order.note && (
                        <div className="col-span-2 text-gray-700 bg-[#fef7e0] p-1.5 border border-[#808080]">
                          <b>Ghi chú:</b> {detailModal.order.note}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Khung Sản phẩm */}
                  <div className="border border-[#808080] bg-white p-2.5">
                    <div className="font-bold border-b border-[#808080] pb-1 mb-2 text-black">
                      2. DANH SÁCH MẶT HÀNG TRONG ĐƠN
                    </div>
                    <table className="retro-table w-full">
                      <thead>
                        <tr>
                          <th>Sản phẩm</th>
                          <th className="text-right w-24">Đơn giá</th>
                          <th className="text-center w-16">SL</th>
                          <th className="text-right w-28">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailModal.order.details?.map((d) => (
                          <tr key={d.id}>
                            <td>
                              <b>{d.product_name}</b>
                              {d.product_sku && (
                                <span className="text-[10px] text-gray-500 font-mono block">
                                  SKU: {d.product_sku}
                                </span>
                              )}
                            </td>
                            <td className="text-right">{money(d.price)}</td>
                            <td className="text-center font-bold">{d.quantity}</td>
                            <td className="text-right font-bold text-red-700">{money(d.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="mt-2 text-right space-y-1 text-xs border-t border-[#808080] pt-2">
                      <div>
                        Tạm tính: <b>{money(detailModal.order.subtotal)}</b>
                      </div>
                      <div>
                        Phí vận chuyển: <b>{detailModal.order.shipping_fee ? money(detailModal.order.shipping_fee) : "0 ₫ (Miễn phí)"}</b>
                      </div>
                      <div className="text-sm font-extrabold text-red-700">
                        TỔNG CỘNG: {money(detailModal.order.total)}
                      </div>
                    </div>
                  </div>

                  {/* Khung Trạng thái & Thanh toán */}
                  <div className="border border-[#808080] bg-white p-2.5 grid grid-cols-2 gap-2">
                    <div>
                      <b>Phương thức thanh toán:</b> {PAYMENT_METHOD[detailModal.order.payment_method] || detailModal.order.payment_method}
                    </div>
                    <div>
                      <b>Trạng thái thanh toán:</b>{" "}
                      <span className="font-bold">
                        {PAYMENT_STATUS[detailModal.order.payment_status]?.label || detailModal.order.payment_status}
                      </span>
                    </div>
                    <div>
                      <b>Trạng thái đơn hàng:</b>{" "}
                      <span className="font-bold text-[#0000ee]">
                        {ORDER_STATUS[detailModal.order.status]?.label || detailModal.order.status}
                      </span>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <div className="bg-[#d4d0c8] p-2 border-t border-[#808080] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const o = detailModal.order;
                  setDetailModal({ open: false, order: null, loading: false });
                  if (o) handleOpenStatusModal(o);
                }}
                className="retro-btn font-bold text-[#0a246a]"
              >
                Cập nhật trạng thái...
              </button>
              <button
                type="button"
                onClick={() => setDetailModal({ open: false, order: null, loading: false })}
                className="retro-btn"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (RETRO WINDOW)
          ========================================================================= */}
      {statusModal.open && (
        <div className="retro-modal-backdrop">
          <div className="retro-modal w-[480px] max-w-[95vw]">
            <div className="retro-titlebar">
              <span className="font-bold">XỬ LÝ ĐƠN HÀNG #{statusModal.order?.order_code}</span>
              <button
                type="button"
                onClick={() => setStatusModal({ open: false, order: null, newStatus: "", newPaymentStatus: "", note: "", submitting: false, error: null })}
                className="retro-btn font-bold !py-0 !px-1.5 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="p-3 bg-[#ece9d8] space-y-3 text-xs">
              {statusModal.error && (
                <div className="p-2 bg-red-100 border border-red-700 text-red-900 font-bold">
                  {statusModal.error}
                </div>
              )}

              <div className="border border-[#808080] bg-white p-2.5 space-y-2.5">
                <div>
                  <label className="block font-bold text-black mb-1">
                    Trạng thái đơn hàng:
                  </label>
                  <select
                    value={statusModal.newStatus}
                    onChange={(e) => setStatusModal({ ...statusModal, newStatus: e.target.value })}
                    className="retro-input w-full p-1 font-bold text-xs"
                  >
                    {Object.entries(ORDER_STATUS).map(([key, item]) => (
                      <option key={key} value={key}>
                        {item.label} ({key})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-black mb-1">
                    Trạng thái thanh toán:
                  </label>
                  <select
                    value={statusModal.newPaymentStatus}
                    onChange={(e) => setStatusModal({ ...statusModal, newPaymentStatus: e.target.value })}
                    className="retro-input w-full p-1 text-xs"
                  >
                    {Object.entries(PAYMENT_STATUS).map(([key, item]) => (
                      <option key={key} value={key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-black mb-1">
                    Ghi chú quản trị:
                  </label>
                  <textarea
                    rows={2}
                    value={statusModal.note}
                    onChange={(e) => setStatusModal({ ...statusModal, note: e.target.value })}
                    className="retro-input w-full p-1 text-xs"
                    placeholder="Ghi chú về việc chuyển hàng, lý do hủy..."
                  />
                </div>
              </div>

              <div className="text-[11px] text-gray-700 bg-[#f9f9f9] border border-[#808080] p-2">
                * Lưu ý: Nếu chuyển trạng thái sang <b>Đã hủy (cancelled)</b>, hệ thống sẽ tự động hoàn trả lại số lượng tồn kho cho các sản phẩm trong đơn.
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  disabled={statusModal.submitting}
                  className="retro-btn font-bold text-black"
                >
                  {statusModal.submitting ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button
                  type="button"
                  onClick={() => setStatusModal({ open: false, order: null, newStatus: "", newPaymentStatus: "", note: "", submitting: false, error: null })}
                  className="retro-btn"
                >
                  Hủy bỏ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: XÁC NHẬN XÓA MỀM (RETRO ALERT DIALOG)
          ========================================================================= */}
      {deleteModal.open && (
        <div className="retro-modal-backdrop">
          <div className="retro-modal w-96">
            <div className="retro-titlebar">
              <span className="font-bold">XÁC NHẬN XÓA ĐƠN HÀNG</span>
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, id: null, code: "", submitting: false })}
                className="retro-btn font-bold !py-0 !px-1.5 text-xs"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-[#ece9d8] text-xs space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  Bạn có chắc chắn muốn xóa đơn hàng <b>#{deleteModal.code}</b> không?
                  <br />
                  <span className="text-gray-600">
                    Đơn hàng sẽ được chuyển vào <b>Thùng rác</b> và có thể khôi phục lại bất kỳ lúc nào.
                  </span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#808080]">
                <button
                  type="button"
                  disabled={deleteModal.submitting}
                  onClick={handleDeleteConfirm}
                  className="retro-btn font-bold text-red-700"
                >
                  {deleteModal.submitting ? "Đang xóa..." : "Đồng ý xóa"}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteModal({ open: false, id: null, code: "", submitting: false })}
                  className="retro-btn"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
