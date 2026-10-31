"use client";

import { useState, useEffect, useCallback } from "react";
import axiosClient from "@/services/axiosClient";
import {
  TagIcon,
  PlusIcon,
  RefreshIcon,
  EditIcon,
  TrashIcon,
  AlertCircleIcon,
  XIcon,
} from "@/components/Icons";

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [meta, setMeta] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form & Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "", status: 1 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Lấy danh sách thương hiệu có phân trang
  const fetchBrands = useCallback((page = 1) => {
    setLoading(true);
    axiosClient
      .get(`/brands?page=${page}&per_page=10`)
      .then((res) => {
        setBrands(res.data || []);
        setMeta(res.meta || res);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchBrands(currentPage);
  }, [currentPage, fetchBrands]);

  const handleOpenModal = (brand = null) => {
    if (brand) {
      setEditingId(brand.id);
      setFormData({
        name: brand.name || "",
        description: brand.description || "",
        status: brand.status !== undefined ? Number(brand.status) : 1,
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", description: "", status: 1 });
    }
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", description: "", status: 1 });
    setEditingId(null);
    setModalError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);
    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        status: formData.status,
      };

      if (editingId) {
        await axiosClient.put(`/brands/${editingId}`, payload);
      } else {
        await axiosClient.post("/brands", payload);
      }
      handleCloseModal();
      fetchBrands(currentPage);
    } catch (err) {
      setModalError(err.message);
      alert("Lỗi: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id) => {
    setEditingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await axiosClient.delete(`/brands/${editingId}`);
      setIsDeleteModalOpen(false);
      setEditingId(null);
      fetchBrands(currentPage);
    } catch (err) {
      alert(err.message || "Không thể xóa thương hiệu này!");
      setIsDeleteModalOpen(false);
      setEditingId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && (!meta || page <= (meta.last_page || 1))) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-zinc-900 tracking-tight">Quản lý thương hiệu</h2>
          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
            ĐỐI TÁC PHÂN PHỐI • HÃNG SẢN XUẤT • TRẠNG THÁI HỢP TÁC
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-3.5 py-2 rounded-lg text-xs shadow-2xs transition flex items-center gap-1.5"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>Thêm thương hiệu</span>
          </button>
          <button
            type="button"
            onClick={() => fetchBrands(currentPage)}
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

      {/* Main Table View */}
      <div className="bg-white rounded-xl border border-zinc-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-zinc-500 text-xs font-mono">
            Đang tải dữ liệu thương hiệu...
          </div>
        ) : brands.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs space-y-2">
            <TagIcon className="w-8 h-8 text-zinc-400 mx-auto" />
            <p className="font-semibold text-zinc-700">Không có bản ghi thương hiệu nào trong cơ sở dữ liệu.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead className="bg-zinc-50/80 text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-200 font-mono">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">ID</th>
                  <th className="py-3 px-4">Tên thương hiệu</th>
                  <th className="py-3 px-4">Mô tả</th>
                  <th className="py-3 px-4 text-center w-24">Trạng thái</th>
                  <th className="py-3 px-4 text-center w-20">Số SP</th>
                  <th className="py-3 px-4 text-center w-28">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {brands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-2.5 px-4 text-center font-mono text-zinc-400">{brand.id}</td>
                    <td className="py-2.5 px-4">
                      <span className="font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200 font-mono">
                        {brand.name}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-zinc-500 max-w-xs truncate">
                      {brand.description || "—"}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {/* Dot Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${
                          Number(brand.status) === 1
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-zinc-100 text-zinc-600 border-zinc-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            Number(brand.status) === 1 ? "bg-emerald-500" : "bg-zinc-400"
                          }`}
                        />
                        <span>{Number(brand.status) === 1 ? "Hiện" : "Ẩn"}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono">
                      <span className="bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                        {brand.products_count ?? 0}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(brand)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-medium transition flex items-center gap-1"
                        >
                          <EditIcon className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmDelete(brand.id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-2 py-1 rounded-md text-xs font-medium transition flex items-center gap-1"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Phân trang */}
        {meta && (meta.last_page > 1 || meta.total > 0) && (
          <div className="p-4 border-t border-zinc-200 flex flex-wrap items-center justify-between text-xs text-zinc-500 gap-2 font-mono">
            <div>
              Hiển thị mục <b>{meta.from || 0}</b> - <b>{meta.to || 0}</b> trong tổng số <b>{meta.total || 0}</b> thương hiệu
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

      {/* MODAL: THÊM / SỬA THƯƠNG HIỆU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-zinc-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
              <h3 className="font-extrabold text-zinc-900 text-sm">
                {editingId ? "Cập nhật thương hiệu" : "Thêm thương hiệu mới"}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center text-xs"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 font-semibold rounded-lg flex items-center gap-2">
                  <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-700 block">Tên thương hiệu *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-zinc-900"
                  placeholder="VD: Apple, Samsung, Xiaomi..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-700 block">Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-zinc-900"
                >
                  <option value={1}>Hiện (Hoạt động)</option>
                  <option value={0}>Ẩn (Tạm ngưng)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-700 block">Mô tả thương hiệu</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-xs outline-none focus:border-zinc-900"
                  placeholder="Nhập thông tin giới thiệu về thương hiệu..."
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 flex justify-end gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-4 py-2 rounded-lg text-xs transition"
                >
                  {isSubmitting ? "Đang lưu..." : editingId ? "Cập nhật" : "Thêm mới"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold px-4 py-2 rounded-lg text-xs transition"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: XÁC NHẬN XÓA MỀM */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-zinc-200 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <TrashIcon className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-zinc-900 text-sm">Xóa thương hiệu</h3>
              <p className="text-xs text-zinc-500">
                Thương hiệu sẽ được chuyển vào <b>Thùng rác</b>. Bạn có thể khôi phục lại bất kỳ lúc nào nếu cần.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 rounded-lg text-xs transition"
              >
                {isSubmitting ? "Đang xóa..." : "Đồng ý xóa"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setEditingId(null);
                }}
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
