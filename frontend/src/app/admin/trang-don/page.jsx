"use client";
import React, { useState, useEffect, useCallback } from "react";
import axiosClient from "@/services/axiosClient";
import Link from "next/link";
import {
  FileTextIcon,
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  RefreshCwIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
  XIcon,
} from "@/components/Icons";

export default function AdminPagesPage() {
  const [mounted, setMounted] = useState(false);
  const [pages, setPages] = useState([]);
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
    title: "",
    slug: "",
    summary: "",
    content: "",
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
    title: "",
    submitting: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchPages = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await axiosClient.get(`/admin/pages?${params.toString()}`);
      const data = res.data?.data || res.data || [];
      setPages(data);
      setMeta({
        current_page: res.data?.current_page || res.current_page || 1,
        last_page: res.data?.last_page || res.last_page || 1,
        total: res.data?.total || res.total || 0,
      });
    } catch (err) {
      console.error("Lỗi tải danh sách trang đơn:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    if (mounted) {
      fetchPages(currentPage);
    }
  }, [mounted, currentPage, fetchPages]);

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

  const handleOpenEdit = (page) => {
    setFormModal({
      open: true,
      isEdit: true,
      submitting: false,
      error: null,
      data: {
        id: page.id,
        title: page.title || "",
        slug: page.slug || "",
        summary: page.summary || "",
        content: page.content || "",
        status: page.status !== undefined ? Number(page.status) : 1,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormModal((prev) => ({ ...prev, submitting: true, error: null }));
    try {
      const payload = {
        title: formModal.data.title.trim(),
        slug: formModal.data.slug.trim(),
        summary: formModal.data.summary?.trim() || null,
        content: formModal.data.content,
        status: Number(formModal.data.status),
      };

      if (formModal.isEdit) {
        await axiosClient.put(`/admin/pages/${formModal.data.id}`, payload);
        showAlert("Cập nhật nội dung trang đơn thành công!");
      } else {
        await axiosClient.post("/admin/pages", payload);
        showAlert("Tạo mới trang đơn thành công!");
      }

      setFormModal((prev) => ({ ...prev, open: false, submitting: false }));
      fetchPages(currentPage);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Có lỗi xảy ra!";
      setFormModal((prev) => ({ ...prev, submitting: false, error: msg }));
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteModal((prev) => ({ ...prev, submitting: true }));
    try {
      await axiosClient.delete(`/admin/pages/${deleteModal.id}`);
      setDeleteModal({ open: false, id: null, title: "", submitting: false });
      showAlert("Đã xóa trang đơn thành công!");
      fetchPages(currentPage);
    } catch (err) {
      alert("Lỗi khi xóa trang: " + (err.response?.data?.message || err.message));
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
            <FileTextIcon className="w-6 h-6 text-zinc-900" />
            <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight">
              Quản lý Trang đơn / Trang tĩnh
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1 font-mono">
            Quản trị các trang Giới thiệu, Chính sách bảo hành, Đổi trả, Hướng dẫn mua hàng đồng bộ ra đường dẫn /trang/[slug]
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 shadow-sm transition"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Thêm trang đơn mới</span>
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
              placeholder="Tìm tiêu đề trang, slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setCurrentPage(1);
                  fetchPages(1);
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
              <option value="1">Đang công khai</option>
              <option value="0">Đang ẩn</option>
            </select>

            <button
              type="button"
              onClick={() => fetchPages(currentPage)}
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
                <th className="py-3 px-4 font-bold">Tiêu đề trang</th>
                <th className="py-3 px-4 font-bold">Slug URL</th>
                <th className="py-3 px-4 font-bold">Tóm tắt ngắn</th>
                <th className="py-3 px-4 font-bold text-center">Trạng thái</th>
                <th className="py-3 px-4 font-bold text-right">Cập nhật</th>
                <th className="py-3 px-4 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-zinc-400 font-mono">
                    Đang tải danh sách trang đơn...
                  </td>
                </tr>
              ) : pages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-zinc-400 font-mono">
                    Chưa có trang đơn nào
                  </td>
                </tr>
              ) : (
                pages.map((p) => {
                  const active = Number(p.status) === 1;
                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/50 transition">
                      <td className="py-3 px-4">
                        <p className="font-bold text-zinc-900">{p.title}</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-600">
                        <span className="bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200 text-zinc-800 font-semibold">
                          /trang/{p.slug}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-500 max-w-xs truncate">
                        {p.summary || "—"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                            active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-zinc-100 text-zinc-600 border-zinc-200"
                          }`}
                        >
                          {active ? "Công khai" : "Đang ẩn"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-zinc-500 text-[11px]">
                        {p.updated_at ? new Date(p.updated_at).toLocaleDateString("vi-VN") : "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/trang/${p.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-600 transition"
                            title="Xem trang ngoài website"
                          >
                            <ExternalLinkIcon className="w-4 h-4" />
                          </Link>
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
                              setDeleteModal({ open: true, id: p.id, title: p.title, submitting: false })
                            }
                            className="p-1.5 rounded-md hover:bg-rose-50 text-rose-600 transition"
                            title="Xóa trang"
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
              Trang {meta.current_page} / {meta.last_page} (Tổng {meta.total} trang)
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

      {/* MODAL: TẠO / SỬA TRANG ĐƠN */}
      {formModal.open && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-zinc-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <FileTextIcon className="w-4 h-4 text-zinc-900" />
                <h3 className="font-extrabold text-zinc-900 text-sm">
                  {formModal.isEdit ? `Cập nhật trang [${formModal.data.title}]` : "Thêm trang đơn mới"}
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

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {formModal.error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircleIcon className="w-4 h-4 shrink-0" />
                  <span>{formModal.error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Tiêu đề trang <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Chính sách bảo hành & đổi trả"
                    value={formModal.data.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setFormModal((prev) => ({
                        ...prev,
                        data: {
                          ...prev.data,
                          title,
                          slug: prev.isEdit ? prev.data.slug : slugify(title),
                        },
                      }));
                    }}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Slug đường dẫn URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: chinh-sach-bao-hanh"
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
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Tóm tắt ngắn trang</label>
                <input
                  type="text"
                  placeholder="Mô tả súc tích nội dung trang hiển thị dưới tiêu đề..."
                  value={formModal.data.summary}
                  onChange={(e) =>
                    setFormModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, summary: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  Nội dung chi tiết (Markdown / HTML) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="10"
                  required
                  placeholder="Nhập nội dung chi tiết theo định dạng Markdown..."
                  value={formModal.data.content}
                  onChange={(e) =>
                    setFormModal((prev) => ({
                      ...prev,
                      data: { ...prev.data, content: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-mono text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Trạng thái công khai</label>
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
                  <option value={1}>Công khai (Cho phép khách truy cập)</option>
                  <option value={0}>Tạm ẩn (Khách truy cập sẽ nhận 404)</option>
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
                  {formModal.submitting ? "Đang lưu..." : formModal.isEdit ? "Lưu thay đổi" : "Tạo trang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: XÓA TRANG ĐƠN */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-zinc-200 p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <TrashIcon className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="font-extrabold text-zinc-900 text-sm">Xóa trang đơn này?</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Bạn có chắc chắn muốn xóa trang <strong className="text-zinc-900">{deleteModal.title}</strong>?
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

