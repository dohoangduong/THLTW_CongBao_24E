"use client";

import { useState, useEffect } from 'react';
import axiosClient from '@/services/axiosClient';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Form & Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', category_id: '', brand_id: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dependencies for form
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  useEffect(() => {
    // Fetch categories and brands for the select options
    // Assuming backend returns data directly in array or { data: [...] }
    axiosClient.get('/categories')
      .then(data => setCategories(data.data || data))
      .catch(err => console.error('Failed to load categories', err));
    
    axiosClient.get('/brands')
      .then(data => setBrands(data.data || data))
      .catch(err => console.error('Failed to load brands', err));
  }, []);

  const fetchProducts = async (page) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosClient.get(`/products?page=${page}&per_page=15`);
      setProducts(res.data || []);
      // Some API variations return meta separately, some inside links/meta keys
      setMeta(res.meta || res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name || '',
        price: product.price || '',
        category_id: product.category_id || '',
        brand_id: product.brand_id || ''
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', price: '', category_id: '', brand_id: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', price: '', category_id: '', brand_id: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await axiosClient.put(`/products/${editingId}`, formData);
      } else {
        await axiosClient.post('/products', formData);
      }
      handleCloseModal();
      fetchProducts(currentPage);
    } catch (err) {
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
      await axiosClient.delete(`/products/${editingId}`);
      setIsDeleteModalOpen(false);
      setEditingId(null);
      fetchProducts(currentPage);
    } catch (err) {
      alert('Lỗi: ' + err.message);
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Sản phẩm</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý danh sách các sản phẩm đang được bán trên hệ thống.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Thêm mới
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100 flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex justify-center items-center py-20 text-slate-400 flex-col gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-gray-200 text-slate-600 text-sm">
                <th className="p-4 font-semibold w-16">ID</th>
                <th className="p-4 font-semibold">Tên sản phẩm</th>
                <th className="p-4 font-semibold">Danh mục</th>
                <th className="p-4 font-semibold">Giá</th>
                <th className="p-4 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 bg-slate-50/50">
                    Chưa có dữ liệu sản phẩm.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 text-slate-600">{product.id}</td>
                    <td className="p-4 font-medium text-slate-900">{product.name}</td>
                    <td className="p-4 text-slate-600">{product.category?.name || '---'}</td>
                    <td className="p-4 font-medium text-emerald-600">
                      {product.price ? Number(product.price).toLocaleString() + ' đ' : 'Liên hệ'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(product)}
                          className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-md transition-colors"
                          title="Sửa"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => confirmDelete(product.id)}
                          className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-md transition-colors"
                          title="Xóa"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {meta && (meta.last_page > 1 || meta.total > 0) && (
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
          <span className="text-sm text-slate-500">
            Hiển thị từ <span className="font-medium text-slate-900">{meta.from || 0}</span> đến <span className="font-medium text-slate-900">{meta.to || 0}</span> trong tổng số <span className="font-medium text-slate-900">{meta.total || 0}</span>
          </span>
          
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-gray-200">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm rounded-md font-medium text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm transition-all"
            >
              Trước
            </button>
            
            <div className="flex px-1 gap-1">
              {Array.from({ length: meta.last_page || 1 }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`min-w-[32px] h-8 flex items-center justify-center rounded-md text-sm font-medium transition-all ${
                    currentPage === page 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-600 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === (meta.last_page || 1)}
              className="px-3 py-1.5 text-sm rounded-md font-medium text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm transition-all"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? 'Cập nhật Sản phẩm' : 'Thêm Sản phẩm mới'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md hover:bg-slate-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên sản phẩm <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                    placeholder="Nhập tên sản phẩm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Giá (VNĐ) <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                    placeholder="VD: 15000000"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Danh mục</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm bg-white"
                    >
                      <option value="">-- Chọn --</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Thương hiệu</label>
                    <select
                      value={formData.brand_id}
                      onChange={(e) => setFormData({...formData, brand_id: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm bg-white"
                    >
                      <option value="">-- Chọn --</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  disabled={isSubmitting}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isSubmitting && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {editingId ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Xác nhận xóa</h3>
              <p className="text-slate-600 text-sm">Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác.</p>
              
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  onClick={() => { setIsDeleteModalOpen(false); setEditingId(null); }} 
                  disabled={isSubmitting}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleDelete} 
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 shadow-sm shadow-red-600/20 transition-colors disabled:opacity-70 flex items-center"
                >
                  {isSubmitting && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  Đồng ý xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
