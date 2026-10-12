"use client";

import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/services/axiosClient';
import { MULTIPART, toFormData } from '@/utils/formData';
import { formatVND, formatMoneyInput, onlyDigits, slugify } from '@/utils/format';
import ImageUploader from '@/components/admin/ImageUploader';
import StatusSwitch from '@/components/admin/StatusSwitch';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

const EMPTY_FORM = {
  name: '', slug: '', sku: '', price: '', sale_price: '', stock: '',
  description: '', category_id: '', brand_id: '', status: true, featured: false,
};

const inputCls =
  'w-full border border-gray-300 rounded-lg px-3.5 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm bg-white';

export default function ProductsPage() {
  const [tab, setTab] = useState('active');               // 'active' | 'trash'
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [keyword, setKeyword] = useState('');             // nội dung đang gõ
  const [search, setSearch] = useState('');               // nội dung đã bấm tìm
  const [togglingId, setTogglingId] = useState(null);

  // Dữ liệu cho 2 ô chọn Danh mục / Thương hiệu
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Form thêm / sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Hộp xác nhận
  const [confirm, setConfirm] = useState(null);
  const [confirmError, setConfirmError] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const isTrash = tab === 'trash';

  /* ---------------- Tải dữ liệu ---------------- */
  useEffect(() => {
    axiosClient.get('/categories', { params: { admin: 1 } })
      .then((res) => setCategories(res.data || []))
      .catch((err) => console.error('Không tải được danh mục', err));

    axiosClient.get('/brands', { params: { admin: 1 } })
      .then((res) => setBrands(res.data || []))
      .catch((err) => console.error('Không tải được thương hiệu', err));
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosClient.get('/products', {
        params: { admin: 1, trashed: isTrash ? 1 : 0, q: search || undefined, page: currentPage, per_page: 15 },
      });
      // Xóa hết dòng cuối của trang > 1 thì lùi về trang trước
      if ((res.data || []).length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
        return;
      }
      setProducts(res.data || []);
      setMeta(res.meta || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isTrash, search, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const switchTab = (key) => {
    setTab(key);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearch(keyword.trim());
  };

  const handlePageChange = (page) => {
    if (page >= 1 && (!meta || page <= (meta.last_page || 1))) setCurrentPage(page);
  };

  /* ---------------- Thêm / Sửa ---------------- */
  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        sku: product.sku || '',
        price: formatMoneyInput(product.price),                 // 21990000 -> "21.990.000"
        sale_price: product.sale_price ? formatMoneyInput(product.sale_price) : '',
        stock: product.stock ?? '',
        description: product.description || '',
        category_id: product.category_id || '',
        brand_id: product.brand_id || '',
        status: product.status === 1,
        featured: !!product.featured,
      });
      setSlugTouched(true);
      setCurrentImage(product.image || null);
    } else {
      setEditingId(null);
      setFormData(EMPTY_FORM);
      setSlugTouched(false);
      setCurrentImage(null);
    }
    setImageFile(null);
    setRemoveImage(false);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setModalError(null);
  };

  const handleNameChange = (name) => {
    setFormData((prev) => ({ ...prev, name, slug: slugTouched ? prev.slug : slugify(name) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);

    // Kiểm tra nhanh ở client: giá khuyến mãi phải nhỏ hơn giá bán
    const price = Number(onlyDigits(formData.price));
    const salePrice = formData.sale_price ? Number(onlyDigits(formData.sale_price)) : null;
    if (salePrice !== null && salePrice >= price) {
      setModalError('Giá khuyến mãi phải nhỏ hơn giá bán.');
      return;
    }

    setIsSubmitting(true);
    try {
      const values = {
        name: formData.name,
        slug: formData.slug,
        sku: formData.sku,
        price,                                   // gửi số nguyên thuần (21990000), không có dấu chấm
        sale_price: salePrice,                   // null -> xóa giá khuyến mãi
        stock: formData.stock === '' ? 0 : formData.stock,
        description: formData.description,
        category_id: formData.category_id,
        brand_id: formData.brand_id,
        status: formData.status,
        featured: formData.featured,
        image: imageFile || undefined,
        remove_image: removeImage && !imageFile ? true : undefined,
      };

      if (editingId) {
        await axiosClient.post(`/products/${editingId}`, toFormData(values, { method: 'PUT' }), MULTIPART);
      } else {
        await axiosClient.post('/products', toFormData(values), MULTIPART);
      }
      handleCloseModal();
      fetchProducts();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- Ẩn / hiện ---------------- */
  const handleToggleStatus = async (product) => {
    setTogglingId(product.id);
    try {
      const res = await axiosClient.patch(`/products/${product.id}/toggle-status`);
      setProducts((list) => list.map((p) => (p.id === product.id ? { ...p, ...res.data } : p)));
    } catch (err) {
      alert('Lỗi: ' + err.message);
    } finally {
      setTogglingId(null);
    }
  };

  /* ---------------- Xóa / Khôi phục / Xóa vĩnh viễn ---------------- */
  const openConfirm = (type, item) => {
    setConfirmError(null);
    setConfirm({ type, item });
  };

  const handleConfirm = async () => {
    if (!confirm) return;
    setIsConfirming(true);
    setConfirmError(null);
    try {
      const { type, item } = confirm;
      if (type === 'trash') await axiosClient.delete(`/products/${item.id}`);
      if (type === 'restore') await axiosClient.post(`/products/${item.id}/restore`);
      if (type === 'force') await axiosClient.delete(`/products/${item.id}/force`);
      setConfirm(null);
      fetchProducts();
    } catch (err) {
      setConfirmError(err.message);
    } finally {
      setIsConfirming(false);
    }
  };

  const confirmProps = {
    trash:   { title: 'Chuyển vào thùng rác', confirmText: 'Chuyển vào thùng rác', tone: 'danger',
               message: 'Sản phẩm sẽ bị ẩn khỏi cửa hàng nhưng vẫn có thể khôi phục lại trong thùng rác.' },
    restore: { title: 'Khôi phục sản phẩm', confirmText: 'Khôi phục', tone: 'primary',
               message: 'Sản phẩm sẽ được đưa trở lại danh sách đang sử dụng.' },
    force:   { title: 'Xóa vĩnh viễn', confirmText: 'Xóa vĩnh viễn', tone: 'danger',
               message: 'Hành động này KHÔNG thể hoàn tác. Sản phẩm và ảnh sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu.' },
  };
  const cp = confirm ? confirmProps[confirm.type] : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Sản phẩm</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý danh sách các sản phẩm đang được bán trên hệ thống.</p>
        </div>
        {!isTrash && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Thêm mới
          </button>
        )}
      </div>

      {/* Tab + tìm kiếm */}
      <div className="flex flex-wrap justify-between items-end gap-3 mb-5 border-b border-gray-200">
        <div className="flex gap-1">
          {[['active', 'Đang sử dụng'], ['trash', 'Thùng rác']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => switchTab(key)}
              className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
                tab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 pb-2">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo tên hoặc SKU..."
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 w-64"
          />
          <button type="submit" className="px-4 py-2 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-900">Tìm</button>
        </form>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">{error}</div>}

      {loading ? (
        <div className="flex-1 flex justify-center items-center py-20 text-slate-400 flex-col gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-gray-200 text-slate-600 text-sm">
                  <th className="p-4 font-semibold w-16">ID</th>
                  <th className="p-4 font-semibold w-24">Hình ảnh</th>
                  <th className="p-4 font-semibold">Sản phẩm</th>
                  <th className="p-4 font-semibold">Danh mục / Thương hiệu</th>
                  <th className="p-4 font-semibold text-right">Giá</th>
                  <th className="p-4 font-semibold text-center w-20">Kho</th>
                  {!isTrash && <th className="p-4 font-semibold text-center w-28">Hiển thị</th>}
                  <th className="p-4 font-semibold text-right w-52">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={isTrash ? 7 : 8} className="p-8 text-center text-slate-500 bg-slate-50/50">
                      {isTrash ? 'Thùng rác trống.' : search ? 'Không tìm thấy sản phẩm phù hợp.' : 'Chưa có dữ liệu sản phẩm.'}
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-4 text-slate-600 font-medium">{product.id}</td>
                      <td className="p-4">
                        <div className="w-14 h-14 rounded-lg border border-gray-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                          {product.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] text-slate-400">No image</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-900">
                          {product.name}
                          {product.featured && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Nổi bật</span>}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          /{product.slug}{product.sku ? ` · SKU: ${product.sku}` : ''}
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">
                        <div>{product.category?.name || '—'}</div>
                        <div className="text-xs text-slate-400">{product.brand?.name || '—'}</div>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        {product.sale_price ? (
                          <>
                            <div className="font-semibold text-red-600">{formatVND(product.sale_price)}</div>
                            <div className="text-xs text-slate-400 line-through">{formatVND(product.price)}</div>
                          </>
                        ) : (
                          <div className="font-semibold text-slate-800">{formatVND(product.price)}</div>
                        )}
                      </td>
                      <td className="p-4 text-center text-slate-600">{product.stock}</td>
                      {!isTrash && (
                        <td className="p-4 text-center">
                          <StatusSwitch
                            checked={product.status === 1}
                            disabled={togglingId === product.id}
                            onChange={() => handleToggleStatus(product)}
                          />
                        </td>
                      )}
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          {isTrash ? (
                            <>
                              <button onClick={() => openConfirm('restore', product)}
                                className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md text-xs font-medium transition-colors">
                                Khôi phục
                              </button>
                              <button onClick={() => openConfirm('force', product)}
                                className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md text-xs font-medium transition-colors">
                                Xóa vĩnh viễn
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleOpenModal(product)}
                                className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md text-xs font-medium transition-colors">
                                Sửa
                              </button>
                              <button onClick={() => openConfirm('trash', product)}
                                className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md text-xs font-medium transition-colors">
                                Xóa
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between mt-5 text-sm text-slate-600">
              <span>Trang {meta.current_page} / {meta.last_page} — tổng {meta.total} sản phẩm</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-slate-50 disabled:opacity-40"
                >
                  Trước
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= meta.last_page}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-slate-50 disabled:opacity-40"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Thêm / Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10">
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? 'Cập nhật Sản phẩm' : 'Thêm Sản phẩm mới'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {modalError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm whitespace-pre-line">
                  {modalError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên sản phẩm <span className="text-red-500">*</span></label>
                  <input required type="text" value={formData.name} onChange={(e) => handleNameChange(e.target.value)}
                    className={inputCls} placeholder="VD: iPhone 15 Pro 256GB" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Slug (đường dẫn)</label>
                  <input type="text" value={formData.slug}
                    onChange={(e) => { setSlugTouched(true); setFormData({ ...formData, slug: e.target.value }); }}
                    className={`${inputCls} font-mono`} placeholder="tu-dong-tao-tu-ten" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Mã SKU</label>
                  <input type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className={inputCls} placeholder="VD: IP15P-256" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Danh mục <span className="text-red-500">*</span></label>
                  <select required value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className={inputCls}>
                    <option value="">— Chọn danh mục —</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Thương hiệu <span className="text-red-500">*</span></label>
                  <select required value={formData.brand_id}
                    onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })} className={inputCls}>
                    <option value="">— Chọn thương hiệu —</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>

                {/* Ô nhập tiền VNĐ: hiển thị 21.990.000, gửi lên server là 21990000 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Giá bán (VNĐ) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input required type="text" inputMode="numeric" value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: formatMoneyInput(e.target.value) })}
                      className={`${inputCls} pr-10 text-right`} placeholder="21.990.000" />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₫</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Giá khuyến mãi (VNĐ)</label>
                  <div className="relative">
                    <input type="text" inputMode="numeric" value={formData.sale_price}
                      onChange={(e) => setFormData({ ...formData, sale_price: formatMoneyInput(e.target.value) })}
                      className={`${inputCls} pr-10 text-right`} placeholder="19.990.000" />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₫</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Số lượng tồn kho</label>
                  <input type="number" min="0" step="1" value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className={inputCls} placeholder="0" />
                </div>

                <div className="flex items-end gap-6 pb-1">
                  <label className="flex items-center gap-3 text-sm text-slate-700">
                    <StatusSwitch checked={formData.status} onChange={(v) => setFormData({ ...formData, status: v })} />
                    {formData.status ? 'Hiển thị' : 'Ẩn'}
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300" />
                    Sản phẩm nổi bật
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Mô tả</label>
                  <textarea rows={3} value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={inputCls} />
                </div>

                <div className="md:col-span-2">
                  <ImageUploader
                    label="Hình ảnh sản phẩm"
                    currentUrl={currentImage}
                    file={imageFile}
                    removed={removeImage}
                    onPick={(f) => { setImageFile(f); setRemoveImage(false); }}
                    onRemove={() => { setImageFile(null); setRemoveImage(true); }}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={handleCloseModal} disabled={isSubmitting}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50">
                  Hủy
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-70">
                  {isSubmitting ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirm}
        title={cp?.title}
        message={cp ? `${cp.message}  (${confirm.item.name})` : ''}
        confirmText={cp?.confirmText}
        tone={cp?.tone}
        loading={isConfirming}
        error={confirmError}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
