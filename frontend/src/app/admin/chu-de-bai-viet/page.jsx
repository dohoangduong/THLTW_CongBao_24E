"use client";
import React, { useState, useEffect, useCallback } from "react";
import axiosClient from "@/services/axiosClient";
import {
  TagIcon,
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  RefreshCwIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XIcon,
} from "@/components/Icons";

export default function AdminPostCategoriesPage() {
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState([]);
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

  const initialFormData = {
    id: null,
    name: "",
    slug: "",
    description: "",
    sort_order: 0,
    status: 1,
  };

  const [formModal, setFormModal] = useState({
    open: false,
    isEdit: false,
    submitting: false,
    error: null,
    data: initialFormData,
  });

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    name: "",
    submitting: false,
    error: null,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchCategories = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await axiosClient.get(`/admin/post-categories?${params.toString()}`);
      const data = res.data?.data || res.data || [];
      setCategories(data);
      setMeta({
        current_page: res.data?.current_page || res.current_page || 1,
        last_page: res.data?.last_page || res.last_page || 1,
        total: res.data?.total || res.total || 0,
      });
    } catch (err) {
      console.error("Lỗi tải danh mục chủ đề bài viết:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    if (mounted) {
      fetchCategories(currentPage);
    }
  }, [mounted, currentPage, fetchCategories]);

  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/([^0-9a-z-\s])/g, "")
      .replace(/(\s+)/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleOpenCreate = () => {
    setFormModal({
      open: true,
      isEdit: false,
      submitting: false,
      error: null,
      data: initialFormData,
    });
  };

  const handleOpenEdit = (cat) => {
    setFormModal({
      open: true,
      isEdit: true,
      submitting: false,
      error: null,
      data: {
        id: cat.id,
        name: cat.name || "",
        slug: cat.slug || "",
        description: cat.description || "",
        sort_order: cat.sort_order || 0,
        status: cat.status !== undefined ? Number(cat.status) : 1,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormModal((prev) => ({ ...prev, submitting: true, error: null }));
    try {
      const payload = {
        name: formModal.data.name.trim(),
        slug: formModal.data.slug.trim(),
        description: formModal.data.description?.trim() || null,
        sort_order: Number(formModal.data.sort_order) || 0,
        status: Number(formModal.data.status),
      };

      if (formModal.isEdit) {
        await axiosClient.put(`/admin/post-categories/${formModal.data.id}`, payload);
        showAlert("Cập nhật chủ đề bài viết thành công!");
      } else {
        await axiosClient.post("/admin/post-categories", payload);
        showAlert("Tạo mới chủ đề bài viết thành công!");
      }

      setFormModal((prev) => ({ ...prev, open: false, submitting: false }));
      fetchCategories(currentPage);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Có lỗi xảy ra!";
      setFormModal((prev) => ({ ...prev, submitting: false, error: msg }));
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteModal((prev) => ({ ...prev, submitting: true, error: null }));
    try {
      await axiosClient.delete(`/admin/post-categories/${deleteModal.id}`);
      setDeleteModal({ open: false, id: null, name: "", submitting: false, error: null });
      showAlert("Đã xóa chủ đề bài viết thành công!");
      fetchCategories(currentPage);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Không thể xóa chủ đề bài viết do ràng buộc quan hệ dữ liệu!";
      setDeleteModal((prev) => ({ ...prev, submitting: false, error: msg }));
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* HEADER & ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TagIcon className="w-6 h-6 text-zinc-900" />
            <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight">
              Quản lý Chủ đề Bài viết
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1 font-mono">
            Phân loại bài viết công nghệ theo danh mục chủ đề, quản lý số lượng tin tức theo từng danh mục
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 shadow-sm transition"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Thêm chủ đề mới</span>
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
              placeholder="Tìm tên chủ đề, slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setCurrentPage(1);
                  fetchCategories(1);
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
              <option value="0">Đang khóa</option>
            </select>

            <button
              type="button"
              onClick={() => fetchCategories(currentPage)}
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
                <th className="py-3 px-4 font-bold">Tên chủ đề</th>
                <th className="py-3 px-4 font-bold">Slug URL</th>
                <th className="py-3 px-4 font-bold">Mô tả</th>
                <th className="py-3 px-4 font-bold text-center">Số bài viết</th>
                <th className="py-3 px-4 font-bold text-center">Thứ tự</th>
                <th className="py-3 px-4 font-bold text-center">Trạng thái</th>
                <th className="py-3 px-4 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-zinc-400 font-mono">
                    Đang tải danh sách chủ đề bài viết...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-zinc-400 font-mono">
                    Chưa có chủ đề nào phù hợp
                  </td>
                </tr>
              ) : (
                categories.map((c) => {
                  const active = Number(c.status) === 1;
                  return (
                    <tr key={c.id} className="hover:bg-zinc-50/50 transition">
                      <td className="py-3 px-4">
                        <p className="font-bold text-zinc-900">{c.name}</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-600">
                        <span className="bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200 text-zinc-800 font-semibold">
                          {c.slug}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-500 max-w-xs truncate">
                        {c.description || "—"}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        <span className="px-2 py-0.5 rounded-full bg-zinc-100 font-bold text-zinc-800 border border-zinc-200">
                          {c.posts_count || 0} bài
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-zinc-900">
                        {c.sort_order}
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
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-700 transition"
                            title="Chỉnh sửa"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteModal({
                                open: true,
                                id: c.id,
                                name: c.name,
                                submitting: false,
                                error: null,
                              })
                            }
                            className="p-1.5 rounded-md hover:bg-rose-50 text-rose-600 transition"
                            title="Xóa chủ đề"
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
              Trang {meta.current_page} / {meta.last_page} (Tổng {meta.total} chủ đề)
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

      {/* MODAL: TẠO / SỬA CHỦ ĐỀ */}
      {formModal.open && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-zinc-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <TagIcon className="w-4 h-4 text-zinc-900" />
                <h3 className="font-extrabold text-zinc-900 text-sm">
                  {formModal.isEdit ? `Cập nhật chủ đề [${formModal.data.name}]` : "Thêm chủ đề mới"}
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
                  Tên chủ đề <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Đánh giá Flagship, Thủ thuật công nghệ..."
                  value={formModal.data.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormModal((prev) => ({
                      ...prev,
                      data: {
                        ...prev.data,
                        name,
                        slug: prev.isEdit ? prev.data.slug : slugify(name),
                      },
                    }));
                  }}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  Slug định danh URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: danh-gia-flagship"
                  value={formModal.data.slug}
                  onChange={(e) =>
                    setFormModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, slug: slugify(e.target.value) },
                    }))
                  }
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Mô tả ngắn chủ đề</label>
                <textarea
                  rows="2"
                  placeholder="Mô tả mục đích và loại bài viết thuộc chủ đề này..."
                  value={formModal.data.description}
                  onChange={(e) =>
                    setFormModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, description: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Thứ tự ưu tiên</label>
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
                  <label className="block font-bold text-zinc-700 mb-1">Trạng thái</label>
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
                    <option value={1}>Kích hoạt</option>
                    <option value={0}>Khóa</option>
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
                  {formModal.submitting ? "Đang lưu..." : formModal.isEdit ? "Lưu thay đổi" : "Tạo chủ đề"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: XÓA CHỦ ĐỀ (RÀNG BUỘC TOÀN VẸN) */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-zinc-200 p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <TrashIcon className="w-5 h-5" />
            </div>

            <div className="text-center">
              <h3 className="font-extrabold text-zinc-900 text-sm">Xóa chủ đề bài viết?</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Bạn có chắc chắn muốn xóa chủ đề <strong className="text-zinc-900">{deleteModal.name}</strong>?
              </p>
            </div>

            {deleteModal.error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 text-left">
                <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-relaxed font-semibold">{deleteModal.error}</span>
              </div>
            )}

            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() =>
                  setDeleteModal({ open: false, id: null, name: "", submitting: false, error: null })
                }
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

