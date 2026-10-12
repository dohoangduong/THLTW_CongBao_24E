/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/services/axiosClient';
import { formatVND, parseVND, numberToVietnameseWords } from '@/utils/numberToWords';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Form & Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', sale_price: '', description: '', category_id: '', brand_id: '', stock: '', status: 1 });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);
  
  // Dependencies for form
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const fetchProducts = useCallback((page) => {
    setLoading(true);
    axiosClient.get(`/products?page=${page}&per_page=15`)
      .then((res) => {
        setProducts(res.data || []);
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
    axiosClient.get(`/products?page=${currentPage}&per_page=15`)
      .then((res) => {
        setProducts(res.data || []);
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

  useEffect(() => {
    axiosClient.get('/categories?all=1')
      .then(res => {
        const data = res.data || res;
        setCategories(Array.isArray(data) ? data : (data.data || []));
      })
      .catch(err => console.error('Failed to load categories', err));
    
    axiosClient.get('/brands?all=1')
      .then(res => {
        const data = res.data || res;
        setBrands(Array.isArray(data) ? data : (data.data || []));
      })
      .catch(err => console.error('Failed to load brands', err));
  }, []);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name || '',
        // Parse loại bỏ số lẻ thập phân (.00) từ API/Database
        price: parseVND(product.price),
        sale_price: parseVND(product.sale_price),
        description: product.description || '',
        category_id: product.category_id || '',
        brand_id: product.brand_id || '',
        stock: product.stock ?? '',
        status: product.status !== undefined ? Number(product.status) : 1,
      });
      setSelectedFile(null);
      if (product.image) {
        setPreviewUrl(product.image.startsWith('http') ? product.image : `http://localhost:8000${product.image.startsWith('/') ? '' : '/'}${product.image}`);
      } else {
        setPreviewUrl(null);
      }
    } else {
      setEditingId(null);
      setFormData({ name: '', price: '', sale_price: '', description: '', category_id: '', brand_id: '', stock: '', status: 1 });
      setSelectedFile(null);
      setPreviewUrl(null);
    }
    setModalError(null);
    setIsModalOpen(true);
  };

  // Chặn phím không phải là số khi nhập giá tiền
  const handlePriceKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) return;
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'
    ];
    if (allowedKeys.includes(e.key)) return;
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Xử lý khi gõ giá tiền: xóa dấu phẩy/phần thập phân, lưu số nguyên vào state
  const handlePriceChange = (e, field) => {
    const rawDigits = e.target.value.split('.')[0].replace(/\D/g, '');
    const integerVal = rawDigits === '' ? '' : parseInt(rawDigits, 10);
    setFormData((prev) => ({
      ...prev,
      [field]: integerVal,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', price: '', sale_price: '', description: '', category_id: '', brand_id: '', stock: '', status: 1 });
    setSelectedFile(null);
    setPreviewUrl(null);
    setEditingId(null);
    setModalError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);

    // Kiểm tra ràng buộc giá khuyến mãi < giá gốc
    if (
      formData.sale_price !== '' &&
      formData.sale_price !== null &&
      Number(formData.sale_price) >= Number(formData.price)
    ) {
      const msg = 'Giá khuyến mãi không được lớn hơn hoặc bằng giá gốc';
      setModalError(msg);
      alert('Lỗi: ' + msg);
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('price', formData.price);
      if (formData.sale_price !== '' && formData.sale_price !== null) {
        payload.append('sale_price', formData.sale_price);
      }
      if (formData.description) payload.append('description', formData.description);
      if (formData.category_id !== '' && formData.category_id !== null) {
        payload.append('category_id', formData.category_id);
      }
      if (formData.brand_id !== '' && formData.brand_id !== null) {
        payload.append('brand_id', formData.brand_id);
      }
      if (formData.stock !== '' && formData.stock !== null) {
        payload.append('stock', formData.stock);
      }
      payload.append('status', formData.status !== undefined ? formData.status : 1);

      if (selectedFile) {
        payload.append('image', selectedFile);
      }

      if (editingId) {
        payload.append('_method', 'PUT');
        await axiosClient.post(`/products/${editingId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axiosClient.post('/products', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      handleCloseModal();
      fetchProducts(currentPage);
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
    <div className="space-y-4">
      {/* Top Header & Toolbar */}
      <div className="border-b-2 border-black pb-2 flex justify-between items-center bg-[#d4d0c8] p-2">
        <div>
          <h1 className="text-base font-bold text-black uppercase tracking-wide">
            QUẢN LÝ SẢN PHẨM
          </h1>
          <p className="text-xs text-gray-700">
            Cơ sở dữ liệu danh mục sản phẩm điện thoại di động và phụ kiện.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => handleOpenModal()}
            className="retro-btn font-bold"
          >
            + Thêm sản phẩm mới
          </button>
          <button 
            type="button"
            onClick={() => fetchProducts(currentPage)}
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
          <b>Đang tải dữ liệu sản phẩm từ máy chủ... Vui lòng đợi.</b>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="retro-table">
            <thead>
              <tr>
                <th className="w-10 text-center">ID</th>
                <th className="w-12 text-center">Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Thương hiệu</th>
                <th className="text-right">Giá bán</th>
                <th className="text-right">Giá KM</th>
                <th className="text-center w-14">Kho</th>
                <th className="text-center w-20">Trạng thái</th>
                <th className="text-center w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-4 text-center text-gray-700 bg-[#f9f9f9]">
                    Không tìm thấy bản ghi sản phẩm nào trong cơ sở dữ liệu.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td className="text-center font-mono">{product.id}</td>
                    <td className="text-center p-1">
                      {product.image ? (
                        <img
                          src={product.image.startsWith('http') ? product.image : `http://localhost:8000${product.image.startsWith('/') ? '' : '/'}${product.image}`}
                          alt={product.name}
                          className="w-8 h-8 object-cover mx-auto border border-[#808080] bg-white inline-block"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-gray-400 text-[10px]">---</span>
                      )}
                    </td>
                    <td className="font-bold">{product.name}</td>
                    <td>{product.category?.name || '---'}</td>
                    <td>{product.brand?.name || '---'}</td>
                    <td className="text-right font-mono">
                      {product.price ? Number(product.price).toLocaleString() + ' đ' : 'Liên hệ'}
                    </td>
                    <td className="text-right font-mono text-red-700">
                      {product.sale_price ? Number(product.sale_price).toLocaleString() + ' đ' : '---'}
                    </td>
                    <td className="text-center font-mono">{product.stock || 0}</td>
                    <td className="text-center whitespace-nowrap">
                      {Number(product.status) === 1 ? (
                        <span className="bg-[#e6f4ea] text-[#137333] border border-[#137333] px-1.5 py-0.5 text-[10px] font-bold">
                          Hiện
                        </span>
                      ) : (
                        <span className="bg-[#fce8e6] text-[#c5221f] border border-[#c5221f] px-1.5 py-0.5 text-[10px] font-bold">
                          Ẩn
                        </span>
                      )}
                    </td>
                    <td className="text-center whitespace-nowrap">
                      <button 
                        type="button"
                        onClick={() => handleOpenModal(product)}
                        className="text-[#0000ee] underline hover:text-red-600 font-bold"
                      >
                        [Sửa]
                      </button>
                      {' '}
                      <button 
                        type="button"
                        onClick={() => confirmDelete(product.id)}
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
            Hiển thị mục <b>{meta.from || 0}</b> - <b>{meta.to || 0}</b> trong tổng số <b>{meta.total || 0}</b> sản phẩm.
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
          <div className="retro-window w-full max-w-lg bg-[#d4d0c8]">
            <div className="retro-titlebar">
              <span>{editingId ? 'Sửa thông tin sản phẩm' : 'Thêm sản phẩm mới'}</span>
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
                    Tên sản phẩm: <span className="text-red-700">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="retro-input w-full"
                    placeholder="VD: iPhone 15 Pro Max"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-2 items-start">
                  {/* 1. Ô nhập Giá gốc (text input format real-time) */}
                  <div>
                    <label className="block font-bold text-black mb-1">
                      Giá gốc (VNĐ): <span className="text-red-700">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      inputMode="numeric"
                      value={formatVND(formData.price)}
                      onChange={(e) => handlePriceChange(e, 'price')}
                      onKeyDown={handlePriceKeyDown}
                      className="retro-input w-full text-right font-mono font-bold tracking-wider"
                      placeholder="VD: 100,000"
                    />
                    {/* Render text đọc tiền bằng chữ tiếng Việt từ số nguyên gốc */}
                    <div className="min-h-[18px] mt-1">
                      {formData.price !== '' && formData.price !== null && formData.price !== undefined ? (
                        <p className="text-[11px] text-gray-700 italic font-sans leading-tight">
                          Bằng chữ: <span className="text-[#0a246a] font-bold not-italic">{numberToVietnameseWords(formData.price)}</span>
                        </p>
                      ) : (
                        <p className="text-[10px] text-gray-400 italic font-sans leading-tight select-none">
                          (Chưa nhập giá)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 2. Ô nhập Giá KM (text input format real-time) */}
                  <div>
                    <label className="block font-bold text-black mb-1">
                      Giá KM (VNĐ):
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatVND(formData.sale_price)}
                      onChange={(e) => handlePriceChange(e, 'sale_price')}
                      onKeyDown={handlePriceKeyDown}
                      className="retro-input w-full text-right font-mono font-bold tracking-wider"
                      placeholder="VD: 90,000"
                    />
                    {/* Render text đọc tiền bằng chữ tiếng Việt từ số nguyên gốc */}
                    <div className="min-h-[18px] mt-1">
                      {formData.sale_price !== '' && formData.sale_price !== null && formData.sale_price !== undefined ? (
                        <p className="text-[11px] text-gray-700 italic font-sans leading-tight">
                          Bằng chữ: <span className="text-[#0a246a] font-bold not-italic">{numberToVietnameseWords(formData.sale_price)}</span>
                        </p>
                      ) : (
                        <p className="text-[10px] text-gray-400 italic font-sans leading-tight select-none">
                          (Chưa nhập giá)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 3. Ô nhập Tồn kho */}
                  <div>
                    <label className="block font-bold text-black mb-1">
                      Tồn kho:
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      className="retro-input w-full"
                      placeholder="VD: 50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-black mb-1">Hình ảnh sản phẩm:</label>
                  <div className="flex items-center gap-2">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-10 h-10 object-cover border border-black bg-white"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="retro-input flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-black mb-1">Mô tả sản phẩm:</label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="retro-input w-full"
                    placeholder="Nhập ghi chú hoặc mô tả..."
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold text-black mb-1">Danh mục:</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                      className="retro-input w-full"
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-black mb-1">Thương hiệu:</label>
                    <select
                      value={formData.brand_id}
                      onChange={(e) => setFormData({...formData, brand_id: e.target.value})}
                      className="retro-input w-full"
                    >
                      <option value="">-- Chọn thương hiệu --</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                    </select>
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
              <span>Xác nhận xóa bản ghi</span>
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
                  Bạn có chắc chắn muốn xóa sản phẩm này không? Thao tác này sẽ xóa vĩnh viễn khỏi cơ sở dữ liệu.
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
