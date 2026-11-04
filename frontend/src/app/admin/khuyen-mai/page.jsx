"use client";
import React, { useState, useEffect, useCallback } from "react";
import axiosClient from "@/services/axiosClient";
import {
  PercentIcon,
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  RefreshCwIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XIcon,
} from "@/components/Icons";

export default function AdminPromotionsPage() {
  const [mounted, setMounted] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState(null);

  // Alert
  const [alertMsg, setAlertMsg] = useState(null);
  const showAlert = (message, type = "success") => {
    setAlertMsg({ message, type });
    setTimeout(() => setAlertMsg(null), 5000);
  };

  // Modal create/edit
  const initialFormData = {
    id: null,
    code: "",
    name: "",
    discount_type: "fixed",
    discount_value: "",
    max_discount_amount: "",
    min_order_value: 0,
    usage_limit: 100,
    start_date: "",
    end_date: "",
    status: 1,
  };

  const [formModal, setFormModal] = useState({
    open: false,
    isEdit: false,
    submitting: false,
    error: null,
    data: initialFormData,
  });

  // Modal delete
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    code: "",
    submitting: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchPromotions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await axiosClient.get(`/admin/promotions?${params.toString()}`);
      const data = res.data?.data || res.data || [];
      setPromotions(data);
      setMeta({
        current_page: res.data?.current_page || res.current_page || 1,
        last_page: res.data?.last_page || res.last_page || 1,
        total: res.data?.total || res.total || 0,
      });
    } catch (err) {
      console.error("Lỗi tải danh sách mã khuyến mãi:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    if (mounted) {
      fetchPromotions(currentPage);
    }
  }, [mounted, currentPage, fetchPromotions]);

  const handleOpenCreate = () => {
    const today = new Date().toISOString().split("T")[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    setFormModal({
      open: true,
      isEdit: false,
      submitting: false,
      error: null,
      data: {
        ...initialFormData,
        start_date: today,
        end_date: nextMonth,
      },
    });
  };

  const handleOpenEdit = (promo) => {
    setFormModal({
      open: true,
      isEdit: true,
      submitting: false,
      error: null,
      data: {
        id: promo.id,
        code: promo.code,
        name: promo.name,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        max_discount_amount: promo.max_discount_amount || "",
        min_order_value: promo.min_order_value || 0,
        usage_limit: promo.usage_limit || 100,
        start_date: promo.start_date ? promo.start_date.split("T")[0] : "",
        end_date: promo.end_date ? promo.end_date.split("T")[0] : "",
        status: promo.status !== undefined ? Number(promo.status) : 1,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormModal((prev) => ({ ...prev, submitting: true, error: null }));

    try {
      const payload = {
        code: formModal.data.code.trim().toUpperCase(),
        name: formModal.data.name.trim(),
        discount_type: formModal.data.discount_type,
        discount_value: Number(formModal.data.discount_value),
        max_discount_amount: formModal.data.max_discount_amount ? Number(formModal.data.max_discount_amount) : null,
        min_order_value: Number(formModal.data.min_order_value) || 0,
        usage_limit: Number(formModal.data.usage_limit) || 1,
        start_date: formModal.data.start_date,
        end_date: formModal.data.end_date,
        status: Number(formModal.data.status),
      };

      if (formModal.isEdit) {
        await axiosClient.put(`/admin/promotions/${formModal.data.id}`, payload);
        showAlert("Cập nhật mã khuyến mãi thành công!");
      } else {
        await axiosClient.post("/admin/promotions", payload);
        showAlert("Tạo mới mã khuyến mãi thành công!");
      }

      setFormModal((prev) => ({ ...prev, open: false, submitting: false }));
      fetchPromotions(currentPage);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Có lỗi xảy ra!";
      setFormModal((prev) => ({ ...prev, submitting: false, error: msg }));
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteModal((prev) => ({ ...prev, submitting: true }));
    try {
      await axiosClient.delete(`/admin/promotions/${deleteModal.id}`);
      setDeleteModal({ open: false, id: null, code: "", submitting: false });
      showAlert("Đã xóa mã khuyến mãi thành công!");
      fetchPromotions(currentPage);
    } catch (err) {
      alert("Lỗi khi xóa mã khuyến mãi: " + (err.response?.data?.message || err.message));
      setDeleteModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* HEADER & ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <PercentIcon className="w-6 h-6 text-zinc-900" />
            <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight">
              Quản lý Mã Khuyến Mãi (Coupons)
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1 font-mono">
            Tạo voucher giảm giá phần trăm hoặc tiền mặt, thiết lập đơn hàng tối thiểu và giới hạn lượt dùng
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 shadow-sm transition"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Thêm mã khuyến mãi</span>
        </button>
      </div>

      {/* ALERT NOTIFICATION */}
      {alertMsg && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs animate-in fade-in duration-200 ${
            alertMsg.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {alertMsg.type === "error" ? (
              <AlertCircleIcon className="w-4 h-4 text-rose-600" />
            ) : (
              <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
            )}
            <span className="font-semibold">{alertMsg.message}</span>
          </div>
          <button
            onClick={() => setAlertMsg(null)}
            className="p-1 hover:bg-black/5 rounded-md transition"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* SEARCH & FILTERS TABLE CONTAINER */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row gap-3 justify-between items-center bg-zinc-50/50">
          <div className="relative w-full sm:w-80">
            <SearchIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm mã code hoặc tên chương trình..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setCurrentPage(1);
                  fetchPromotions(1);
                }
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-white border border-zinc-200 rounded-lg px-3 py-1.5 font-medium text-zinc-700 focus:outline-hidden focus:border-zinc-900"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="1">Đang kích hoạt</option>
              <option value="0">Tạm khóa / Hết hạn</option>
            </select>

            <button
              type="button"
              onClick={() => fetchPromotions(currentPage)}
              className="p-1.5 border border-zinc-200 rounded-lg bg-white hover:bg-zinc-100 text-zinc-600 transition"
              title="Làm mới"
            >
              <RefreshCwIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-mono">
              <tr>
                <th className="py-3 px-4 font-bold">Mã Voucher</th>
                <th className="py-3 px-4 font-bold">Tên chương trình</th>
                <th className="py-3 px-4 font-bold text-center">Mức giảm</th>
                <th className="py-3 px-4 font-bold text-right">Đơn tối thiểu</th>
                <th className="py-3 px-4 font-bold text-center">Lượt dùng</th>
                <th className="py-3 px-4 font-bold text-center">Thời hạn áp dụng</th>
                <th className="py-3 px-4 font-bold text-center">Trạng thái</th>
                <th className="py-3 px-4 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-zinc-400 font-mono">
                    Đang tải danh sách mã khuyến mãi...
                  </td>
                </tr>
              ) : promotions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-zinc-400 font-mono">
                    Không tìm thấy mã khuyến mãi nào
                  </td>
                </tr>
              ) : (
                promotions.map((p) => {
                  const isPercent = p.discount_type === "percent";
                  const active = Number(p.status) === 1;

                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/50 transition">
                      <td className="py-3 px-4">
                        <span className="font-mono font-extrabold text-xs px-2.5 py-1 bg-zinc-100 border border-zinc-300 rounded text-zinc-900 tracking-wider">
                          {p.code}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-zinc-900">{p.name}</p>
                        {p.max_discount_amount && isPercent && (
                          <p className="text-[10px] text-zinc-400 font-mono">
                            Tối đa: {Number(p.max_discount_amount).toLocaleString("vi-VN")} ₫
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          {isPercent
                            ? `-${p.discount_value}%`
                            : `-${Number(p.discount_value).toLocaleString("vi-VN")} ₫`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-zinc-700">
                        {Number(p.min_order_value || 0).toLocaleString("vi-VN")} ₫
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        <span className="font-bold text-zinc-900">{p.used_count || 0}</span>
                        <span className="text-zinc-400"> / {p.usage_limit || "∞"}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-[11px] text-zinc-500">
                        {p.start_date ? p.start_date.split("T")[0] : "..."} ➔{" "}
                        {p.end_date ? p.end_date.split("T")[0] : "..."}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                            active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-zinc-100 text-zinc-600 border-zinc-200"
                          }`}
                        >
                          {active ? "Kích hoạt" : "Đã khóa"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-700 transition"
                            title="Chỉnh sửa"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteModal({ open: true, id: p.id, code: p.code, submitting: false })
                            }
                            className="p-1.5 rounded-md hover:bg-rose-50 text-rose-600 transition"
                            title="Xóa voucher"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {meta && meta.last_page > 1 && (
          <div className="p-4 border-t border-zinc-200 flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-mono">
              Trang {meta.current_page} / {meta.last_page} (Tổng {meta.total} mã)
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition"
              >
                « Trước
              </button>
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
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
                disabled={currentPage >= meta.last_page}
                onClick={() => setCurrentPage((p) => Math.min(meta.last_page, p + 1))}
                className="px-2.5 py-1 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition"
              >
                Sau »
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: TẠO / SỬA MÃ KHUYẾN MÃI */}
      {formModal.open && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-zinc-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <PercentIcon className="w-4 h-4 text-zinc-900" />
                <h3 className="font-extrabold text-zinc-900 text-sm">
                  {formModal.isEdit ? `Cập nhật mã [${formModal.data.code}]` : "Thêm mã khuyến mãi mới"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFormModal((prev) => ({ ...prev, open: false }))}
                className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center text-xs"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {formModal.error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircleIcon className="w-4 h-4 shrink-0" />
                  <span>{formModal.error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Mã code voucher <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: VIP2026, BAOCONG500K"
                    value={formModal.data.code}
                    onChange={(e) =>
                      setFormModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, code: e.target.value.toUpperCase() },
                      }))
                    }
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-mono font-bold tracking-wider"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Loại giảm giá <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formModal.data.discount_type}
                    onChange={(e) =>
                      setFormModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, discount_type: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-medium"
                  >
                    <option value="fixed">Tiền mặt cố định (VNĐ)</option>
                    <option value="percent">Phần trăm giá trị đơn (%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  Tên chương trình khuyến mãi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Giảm ngay 500k cho khách hàng thân thiết"
                  value={formModal.data.name}
                  onChange={(e) =>
                    setFormModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, name: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Giá trị giảm <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder={formModal.data.discount_type === "percent" ? "VD: 10 (%)" : "VD: 500000"}
                    value={formModal.data.discount_value}
                    onChange={(e) =>
                      setFormModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, discount_value: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Giảm tối đa (Nếu theo %)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Không giới hạn nếu để trống"
                    disabled={formModal.data.discount_type === "fixed"}
                    value={formModal.data.max_discount_amount}
                    onChange={(e) =>
                      setFormModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, max_discount_amount: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-mono disabled:bg-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Đơn hàng tối thiểu (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formModal.data.min_order_value}
                    onChange={(e) =>
                      setFormModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, min_order_value: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Giới hạn số lượt dùng
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formModal.data.usage_limit}
                    onChange={(e) =>
                      setFormModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, usage_limit: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Ngày bắt đầu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formModal.data.start_date}
                    onChange={(e) =>
                      setFormModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, start_date: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Ngày kết thúc <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formModal.data.end_date}
                    onChange={(e) =>
                      setFormModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, end_date: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Trạng thái kích hoạt</label>
                <select
                  value={formModal.data.status}
                  onChange={(e) =>
                    setFormModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, status: Number(e.target.value) },
                    }))
                  }
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-medium"
                >
                  <option value={1}>Đang kích hoạt (Khách hàng được dùng)</option>
                  <option value={0}>Tạm khóa (Không cho áp dụng)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-zinc-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFormModal((prev) => ({ ...prev, open: false }))}
                  className="px-4 py-2 rounded-lg border border-zinc-200 bg-white font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={formModal.submitting}
                  className="px-4 py-2 rounded-lg bg-zinc-900 font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
                >
                  {formModal.submitting ? "Đang lưu..." : formModal.isEdit ? "Lưu thay đổi" : "Tạo voucher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: XÓA VOUCHER */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-zinc-200 p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <TrashIcon className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="font-extrabold text-zinc-900 text-sm">Xóa mã khuyến mãi?</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Bạn có chắc chắn muốn xóa mã <span className="font-mono font-bold text-zinc-900">{deleteModal.code}</span>? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, id: null, code: "", submitting: false })}
                className="px-4 py-2 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={deleteModal.submitting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-lg bg-rose-600 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {deleteModal.submitting ? "Đang xóa..." : "Xác nhận xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

