"use client";
import React, { useState, useEffect, useCallback } from "react";
import axiosClient from "@/services/axiosClient";
import {
  ImageIcon,
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  RefreshCwIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  UploadIcon,
  XIcon,
} from "@/components/Icons";

export default function AdminBannersPage() {
  const [mounted, setMounted] = useState(false);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState(null);

  // Alert
  const [alertMsg, setAlertMsg] = useState(null);
  const showAlert = (message, type = "success") => {
    setAlertMsg({ message, type });
    setTimeout(() => setAlertMsg(null), 5000);
  };

  const initialFormData = {
    id: null,
    title: "",
    subtitle: "",
    badge_text: "",
    image: "",
    link_url: "",
    button_text: "Khám phá ngay",
    position: "main_hero",
    sort_order: 0,
    status: 1,
  };

  const [formModal, setFormModal] = useState({
    open: false,
    isEdit: false,
    submitting: false,
    uploading: false,
    error: null,
    data: initialFormData,
  });

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    title: "",
    submitting: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchBanners = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      if (search.trim()) params.append("search", search.trim());
      if (positionFilter !== "all") params.append("position", positionFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await axiosClient.get(`/admin/banners?${params.toString()}`);
      const data = res.data?.data || res.data || [];
      setBanners(data);
      setMeta({
        current_page: res.data?.current_page || res.current_page || 1,
        last_page: res.data?.last_page || res.last_page || 1,
        total: res.data?.total || res.total || 0,
      });
    } catch (err) {
      console.error("Lỗi tải danh sách banner:", err);
    } finally {
      setLoading(false);
    }
  }, [search, positionFilter, statusFilter]);

  useEffect(() => {
    if (mounted) {
      fetchBanners(currentPage);
    }
  }, [mounted, currentPage, fetchBanners]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type)) {
      alert("Chỉ chấp nhận file ảnh PNG, JPG/JPEG (Tối đa 10MB)!");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Dung lượng ảnh vượt quá 10MB!");
      return;
    }

    setFormModal((prev) => ({ ...prev, uploading: true }));
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await axiosClient.post("/admin/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.url) {
        setFormModal((prev) => ({
          ...prev,
          data: { ...prev.data, image: res.url },
        }));
        showAlert("Tải ảnh banner lên máy chủ thành công!");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Tải ảnh thất bại!";
      alert("Lỗi tải ảnh: " + msg);
    } finally {
      setFormModal((prev) => ({ ...prev, uploading: false }));
    }
  };

  const handleOpenCreate = () => {
    setFormModal({
      open: true,
      isEdit: false,
      submitting: false,
      uploading: false,
      error: null,
      data: initialFormData,
    });
  };

  const handleOpenEdit = (banner) => {
    setFormModal({
      open: true,
      isEdit: true,
      submitting: false,
      uploading: false,
      error: null,
      data: {
        id: banner.id,
        title: banner.title || "",
        subtitle: banner.subtitle || "",
        badge_text: banner.badge_text || "",
        image: banner.image || "",
        link_url: banner.link_url || "",
        button_text: banner.button_text || "Khám phá ngay",
        position: banner.position || "main_hero",
        sort_order: banner.sort_order || 0,
        status: banner.status !== undefined ? Number(banner.status) : 1,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formModal.data.image) {
      setFormModal((prev) => ({ ...prev, error: "Vui lòng chọn hoặc tải ảnh cho banner!" }));
      return;
    }

    setFormModal((prev) => ({ ...prev, submitting: true, error: null }));
    try {
      const payload = {
        title: formModal.data.title.trim(),
        subtitle: formModal.data.subtitle?.trim() || null,
        badge_text: formModal.data.badge_text?.trim() || null,
        image: formModal.data.image.trim(),
        link_url: formModal.data.link_url?.trim() || null,
        button_text: formModal.data.button_text?.trim() || "Khám phá ngay",
        position: formModal.data.position,
        sort_order: Number(formModal.data.sort_order) || 0,
        status: Number(formModal.data.status),
      };

      if (formModal.isEdit) {
        await axiosClient.put(`/admin/banners/${formModal.data.id}`, payload);
        showAlert("Cập nhật banner thành công!");
      } else {
        await axiosClient.post("/admin/banners", payload);
        showAlert("Thêm mới banner thành công!");
      }

      setFormModal((prev) => ({ ...prev, open: false, submitting: false }));
      fetchBanners(currentPage);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Có lỗi xảy ra!";
      setFormModal((prev) => ({ ...prev, submitting: false, error: msg }));
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteModal((prev) => ({ ...prev, submitting: true }));
    try {
      await axiosClient.delete(`/admin/banners/${deleteModal.id}`);
      setDeleteModal({ open: false, id: null, title: "", submitting: false });
      showAlert("Xóa banner thành công!");
      fetchBanners(currentPage);
    } catch (err) {
      alert("Lỗi khi xóa banner: " + (err.response?.data?.message || err.message));
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
            <ImageIcon className="w-6 h-6 text-zinc-900" />
            <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight">
              Quản lý Banner Trang chủ
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1 font-mono">
            Tùy biến banner Hero lớn và các banner phụ quảng bá chiến dịch nổi bật
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 shadow-sm transition"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Thêm banner mới</span>
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
              placeholder="Tìm tiêu đề banner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setCurrentPage(1);
                  fetchBanners(1);
                }
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={positionFilter}
              onChange={(e) => {
                setPositionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-white border border-zinc-200 rounded-lg px-3 py-1.5 font-medium text-zinc-700 focus:outline-hidden focus:border-zinc-900"
            >
              <option value="all">Tất cả vị trí</option>
              <option value="main_hero">Banner chính Hero</option>
              <option value="sub_banner">Banner phụ</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-white border border-zinc-200 rounded-lg px-3 py-1.5 font-medium text-zinc-700 focus:outline-hidden focus:border-zinc-900"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="1">Đang hiển thị</option>
              <option value="0">Đang ẩn</option>
            </select>

            <button
              type="button"
              onClick={() => fetchBanners(currentPage)}
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
                <th className="py-3 px-4 font-bold">Hình ảnh</th>
                <th className="py-3 px-4 font-bold">Tiêu đề & Badge</th>
                <th className="py-3 px-4 font-bold">Vị trí</th>
                <th className="py-3 px-4 font-bold text-center">Thứ tự</th>
                <th className="py-3 px-4 font-bold text-center">Trạng thái</th>
                <th className="py-3 px-4 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-zinc-400 font-mono">
                    Đang tải danh sách banner...
                  </td>
                </tr>
              ) : banners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-zinc-400 font-mono">
                    Chưa có banner nào phù hợp
                  </td>
                </tr>
              ) : (
                banners.map((b) => {
                  const active = Number(b.status) === 1;
                  return (
                    <tr key={b.id} className="hover:bg-zinc-50/50 transition">
                      <td className="py-3 px-4">
                        <img
                          src={b.image}
                          alt={b.title}
                          className="w-24 h-12 object-cover rounded-lg border border-zinc-200 bg-zinc-900"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {b.badge_text && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
                              {b.badge_text}
                            </span>
                          )}
                          <p className="font-bold text-zinc-900">{b.title}</p>
                        </div>
                        {b.subtitle && (
                          <p className="text-zinc-500 text-[11px] line-clamp-1 mt-0.5">
                            {b.subtitle}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            b.position === "main_hero"
                              ? "bg-zinc-900 text-white border-zinc-900"
                              : "bg-zinc-100 text-zinc-700 border-zinc-200"
                          }`}
                        >
                          {b.position === "main_hero" ? "Banner chính Hero" : "Banner phụ"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-zinc-900">
                        {b.sort_order}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                            active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-zinc-100 text-zinc-600 border-zinc-200"
                          }`}
                        >
                          {active ? "Hiển thị" : "Đang ẩn"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(b)}
                            className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-700 transition"
                            title="Chỉnh sửa"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteModal({ open: true, id: b.id, title: b.title, submitting: false })
                            }
                            className="p-1.5 rounded-md hover:bg-rose-50 text-rose-600 transition"
                            title="Xóa banner"
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
              Trang {meta.current_page} / {meta.last_page} (Tổng {meta.total} banner)
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

      {/* MODAL: TẠO / SỬA BANNER */}
      {formModal.open && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-zinc-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-zinc-900" />
                <h3 className="font-extrabold text-zinc-900 text-sm">
                  {formModal.isEdit ? `Chỉnh sửa banner #${formModal.data.id}` : "Thêm banner mới"}
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

              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  Tiêu đề banner <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: iPhone 16 Pro Max - Đỉnh cao công nghệ"
                  value={formModal.data.title}
                  onChange={(e) =>
                    setFormModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, title: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Nhãn phụ (Badge Text)</label>
                  <input
                    type="text"
                    placeholder="VD: FLAGSHIP 2026"
                    value={formModal.data.badge_text}
                    onChange={(e) =>
                      setFormModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, badge_text: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Vị trí hiển thị</label>
                  <select
                    value={formModal.data.position}
                    onChange={(e) =>
                      setFormModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, position: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-medium"
                  >
                    <option value="main_hero">Banner chính Hero (Đầu trang)</option>
                    <option value="sub_banner">Banner phụ (Quảng bá nhỏ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Mô tả phụ (Subtitle)</label>
                <input
                  type="text"
                  placeholder="VD: Titan Sa Mạc - Khung viền siêu nhẹ, Chip A18 Pro"
                  value={formModal.data.subtitle}
                  onChange={(e) =>
                    setFormModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, subtitle: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900"
                />
              </div>

              {/* HÌNH ẢNH BANNER: URL + UPLOAD TRỰC TIẾP TỪ MÁY */}
              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  Hình ảnh banner <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Nhập URL ảnh hoặc bấm tải lên..."
                    value={formModal.data.image}
                    onChange={(e) =>
                      setFormModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, image: e.target.value },
                      }))
                    }
                    className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-mono text-[11px]"
                  />
                  <label className="cursor-pointer px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg border border-zinc-300 font-semibold flex items-center gap-1.5 shrink-0 transition">
                    <UploadIcon className="w-3.5 h-3.5" />
                    <span>{formModal.uploading ? "Đang tải..." : "Tải ảnh (≤10MB)"}</span>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
                {formModal.data.image && (
                  <div className="mt-2 p-2 border border-zinc-200 rounded-lg bg-zinc-900 inline-block">
                    <img
                      src={formModal.data.image}
                      alt="Banner Preview"
                      className="h-16 object-cover rounded"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Đường dẫn liên kết (Link URL)</label>
                  <input
                    type="text"
                    placeholder="VD: /products/1 hoặc /san-pham"
                    value={formModal.data.link_url}
                    onChange={(e) =>
                      setFormModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, link_url: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Chữ trên nút bấm</label>
                  <input
                    type="text"
                    placeholder="VD: Khám phá ngay"
                    value={formModal.data.button_text}
                    onChange={(e) =>
                      setFormModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, button_text: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Thứ tự hiển thị (Số nhỏ ưu tiên)</label>
                  <input
                    type="number"
                    value={formModal.data.sort_order}
                    onChange={(e) =>
                      setFormModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, sort_order: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Trạng thái hiển thị</label>
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
                    <option value={1}>Hiển thị lên website</option>
                    <option value={0}>Tạm ẩn</option>
                  </select>
                </div>
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
                  {formModal.submitting ? "Đang lưu..." : formModal.isEdit ? "Cập nhật" : "Tạo banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: XÓA BANNER */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-zinc-200 p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <TrashIcon className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="font-extrabold text-zinc-900 text-sm">Xóa banner này?</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Bạn có chắc chắn muốn xóa banner <strong className="text-zinc-900">{deleteModal.title}</strong>?
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, id: null, title: "", submitting: false })}
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

