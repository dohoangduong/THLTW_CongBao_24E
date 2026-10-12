"use client";

import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/services/axiosClient';

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
  const [formData, setFormData] = useState({ name: '', description: '', status: 1 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Lấy danh sách thương hiệu có phân trang
  const fetchBrands = useCallback((page = 1) => {
    setLoading(true);
    axiosClient.get(`/brands?page=${page}&per_page=10`)
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
    axiosClient.get(`/brands?page=${currentPage}&per_page=10`)
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
  }, [currentPage]);

  const handleOpenModal = (brand = null) => {
    if (brand) {
      setEditingId(brand.id);
      setFormData({
        name: brand.name || '',
        description: brand.description || '',
        status: brand.status !== undefined ? Number(brand.status) : 1,
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', description: '', status: 1 });
    }
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', description: '', status: 1 });
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
        await axiosClient.post('/brands', payload);
      }
      handleCloseModal();
      fetchBrands(currentPage);
    } catch (err) {
      setModalError(err.message);
      alert('Lỗi: ' + err.message);
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
      alert(err.message || 'Không thể xóa thương hiệu này!');
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
    <div className="space-y-4">
      {/* Top Header & Toolbar */}
      <div className="border-b-2 border-black pb-2 flex justify-between items-center bg-[#d4d0c8] p-2">
        <div>
          <h1 className="text-base font-bold text-black uppercase tracking-wide">
            QUẢN LÝ THƯƠNG HIỆU
          </h1>
          <p className="text-xs text-gray-700">
            Danh sách đối tác và thương hiệu các dòng sản phẩm kinh doanh.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => handleOpenModal()}
            className="retro-btn font-bold"
          >
            + Thêm thương hiệu mới
          </button>
          <button 
            type="button"
            onClick={() => fetchBrands(currentPage)}
            className="retro-btn"
          >
            Tải lại
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-2 border-red-700 text-red-900 p-2 text-xs">
          <b>Lỗi hệ thống:</b> {error}
        </div>
      )}

      {/* Main Table View */}
      {loading ? (
        <div className="p-8 text-center text-black bg-[#ece9d8] border border-black">
          <b>Đang tải dữ liệu thương hiệu... Vui lòng đợi.</b>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="retro-table">
            <thead>
              <tr>
                <th className="w-12 text-center">ID</th>
                <th>Tên thương hiệu</th>
                <th>Mô tả</th>
                <th className="text-center w-20">Trạng thái</th>
                <th className="text-center w-16">Số SP</th>
                <th className="text-center w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {brands.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-700 bg-[#f9f9f9]">
                    Không có bản ghi thương hiệu nào trong cơ sở dữ liệu.
                  </td>
                </tr>
              ) : (
                brands.map((brand) => (
                  <tr key={brand.id}>
                    <td className="text-center font-mono">{brand.id}</td>
                    <td className="font-bold">{brand.name}</td>
                    <td className="text-gray-700 max-w-xs truncate">{brand.description || '---'}</td>
                    <td className="text-center whitespace-nowrap">
                      {Number(brand.status) === 1 ? (
                        <span className="bg-[#e6f4ea] text-[#137333] border border-[#137333] px-1.5 py-0.5 text-[10px] font-bold">
                          Hiện
                        </span>
                      ) : (
                        <span className="bg-[#fce8e6] text-[#c5221f] border border-[#c5221f] px-1.5 py-0.5 text-[10px] font-bold">
                          Ẩn
                        </span>
                      )}
                    </td>
                    <td className="text-center font-mono">{brand.products_count ?? 0}</td>
                    <td className="text-center whitespace-nowrap">
                      <button 
                        type="button"
                        onClick={() => handleOpenModal(brand)}
                        className="text-[#0000ee] underline hover:text-red-600 font-bold"
                      >
                        [Sửa]
                      </button>
                      {' '}
                      <button 
                        type="button"
                        onClick={() => confirmDelete(brand.id)}
                        className="text-[#cc0000] underline hover:text-red-900 font-bold"
                      >
                        [Xóa]
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Classic Web 1.0 Pagination */}
      {meta && (meta.last_page > 1 || meta.total > 0) && (
        <div className="flex justify-between items-center bg-[#d4d0c8] border border-black p-2 text-xs">
          <div>
            Hiển thị mục <b>{meta.from || 0}</b> - <b>{meta.to || 0}</b> trong tổng số <b>{meta.total || 0}</b> thương hiệu.
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="retro-btn"
            >
              &lt;&lt; Trang trước
            </button>
            
            <span className="px-2">
              Trang <b>{currentPage}</b> / <b>{meta.last_page || 1}</b>
            </span>

            <button 
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === (meta.last_page || 1)}
              className="retro-btn"
            >
              Trang sau &gt;&gt;
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Modal Window */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="retro-window w-full max-w-md bg-[#d4d0c8]">
            <div className="retro-titlebar">
              <span>{editingId ? 'Sửa thông tin thương hiệu' : 'Thêm thương hiệu mới'}</span>
              <button 
                type="button" 
                onClick={handleCloseModal} 
                className="retro-btn !p-0 !w-4 !h-4 text-[10px] font-bold"
              >
                X
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-3 bg-[#d4d0c8]">
              {modalError && (
                <div className="mb-3 p-2 bg-red-100 border border-red-700 text-red-900 text-xs">
                  <b>Lỗi:</b> {modalError}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-black mb-1">
                    Tên thương hiệu: <span className="text-red-700">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="retro-input w-full"
                    placeholder="VD: Apple, Samsung..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-black mb-1">Trạng thái:</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: Number(e.target.value)})}
                    className="retro-input w-full"
                  >
                    <option value={1}>Hiện (Hoạt động)</option>
                    <option value={0}>Ẩn (Tạm ngưng)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-black mb-1">Mô tả thương hiệu:</label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="retro-input w-full"
                    placeholder="Nhập mô tả về thương hiệu..."
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-[#ffffff] flex justify-end gap-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="retro-btn font-bold px-4"
                >
                  {isSubmitting ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Thêm mới')}
                </button>
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  disabled={isSubmitting}
                  className="retro-btn px-4"
                >
                  Hủy bỏ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Window */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="retro-window w-full max-w-sm bg-[#d4d0c8]">
            <div className="retro-titlebar">
              <span>Xác nhận xóa thương hiệu</span>
              <button 
                type="button" 
                onClick={() => { setIsDeleteModalOpen(false); setEditingId(null); }} 
                className="retro-btn !p-0 !w-4 !h-4 text-[10px] font-bold"
              >
                X
              </button>
            </div>
            <div className="p-4 bg-[#d4d0c8]">
              <div className="mb-4">
                <div className="font-bold text-black">Cảnh báo xóa dữ liệu</div>
                <p className="text-gray-800 text-xs mt-1">
                  Bạn có chắc chắn muốn xóa thương hiệu này không? Các sản phẩm thuộc thương hiệu có thể bị ảnh hưởng.
                </p>
              </div>
              
              <div className="pt-3 border-t border-[#ffffff] flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={handleDelete} 
                  disabled={isSubmitting}
                  className="retro-btn font-bold text-red-700 px-4"
                >
                  {isSubmitting ? 'Đang xóa...' : 'Đồng ý xóa'}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setIsDeleteModalOpen(false); setEditingId(null); }} 
                  disabled={isSubmitting}
                  className="retro-btn px-4"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
