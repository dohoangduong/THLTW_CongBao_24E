"use client";

import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/services/axiosClient';
import { MULTIPART, toFormData } from '@/utils/formData';
import { slugify } from '@/utils/format';
import ImageUploader from '@/components/admin/ImageUploader';
import StatusSwitch from '@/components/admin/StatusSwitch';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

const EMPTY_FORM = { name: '', slug: '', description: '', status: true };

export default function BrandsPage() {
  const [tab, setTab] = useState('active');          // 'active' = đang dùng | 'trash' = thùng rác
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Form thêm / sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);   // true = người dùng tự gõ slug, không auto nữa
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Hộp xác nhận: { type: 'trash' | 'restore' | 'force', item }
  const [confirm, setConfirm] = useState(null);
  const [confirmError, setConfirmError] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosClient.get('/brands', {
        params: { admin: 1, trashed: tab === 'trash' ? 1 : 0 },
      });
      setBrands(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  /* ---------------- Thêm / Sửa ---------------- */
  const handleOpenModal = (brand = null) => {
    if (brand) {
      setEditingId(brand.id);
      setFormData({
        name: brand.name || '',
        slug: brand.slug || '',
        description: brand.description || '',
        status: brand.status === 1,
      });
      setSlugTouched(true);
      setCurrentImage(brand.image || null);
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
    setFormData((prev) => ({
      ...prev,
      name,
      slug: slugTouched ? prev.slug : slugify(name),   // tự tạo slug khi chưa sửa tay
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);
    try {
      const values = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        status: formData.status,
        image: imageFile || undefined,
        remove_image: removeImage && !imageFile ? true : undefined,
      };

      if (editingId) {
        await axiosClient.post(`/brands/${editingId}`, toFormData(values, { method: 'PUT' }), MULTIPART);
      } else {
        await axiosClient.post('/brands', toFormData(values), MULTIPART);
      }
      handleCloseModal();
      fetchBrands();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- Ẩn / hiện ---------------- */
  const handleToggleStatus = async (brand) => {
    setTogglingId(brand.id);
    try {
      const res = await axiosClient.patch(`/brands/${brand.id}/toggle-status`);
      setBrands((list) => list.map((c) => (c.id === brand.id ? { ...c, ...res.data } : c)));
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
      if (type === 'trash') await axiosClient.delete(`/brands/${item.id}`);
      if (type === 'restore') await axiosClient.post(`/brands/${item.id}/restore`);
      if (type === 'force') await axiosClient.delete(`/brands/${item.id}/force`);
      setConfirm(null);
      fetchBrands();
    } catch (err) {
      setConfirmError(err.message);   // VD: "Không thể xóa: thương hiệu còn 3 sản phẩm..."
    } finally {
      setIsConfirming(false);
    }
  };

  const confirmProps = {
    trash:   { title: 'Chuyển vào thùng rác', confirmText: 'Chuyển vào thùng rác', tone: 'danger',
               message: 'Thương hiệu sẽ bị ẩn khỏi hệ thống nhưng vẫn có thể khôi phục lại trong thùng rác.' },
    restore: { title: 'Khôi phục thương hiệu', confirmText: 'Khôi phục', tone: 'primary',
               message: 'Thương hiệu sẽ được đưa trở lại danh sách đang sử dụng.' },
    force:   { title: 'Xóa vĩnh viễn', confirmText: 'Xóa vĩnh viễn', tone: 'danger',
               message: 'Hành động này KHÔNG thể hoàn tác. Thương hiệu và ảnh của nó sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu.' },
  };
  const cp = confirm ? confirmProps[confirm.type] : null;

  const isTrash = tab === 'trash';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Thương hiệu</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý các thương hiệu sản phẩm trên hệ thống.</p>
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

      {/* Tab: Đang sử dụng / Thùng rác */}
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        {[['active', 'Đang sử dụng'], ['trash', 'Thùng rác']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
              tab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">{error}</div>
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
                <th className="p-4 font-semibold w-24">Hình ảnh</th>
                <th className="p-4 font-semibold">Tên thương hiệu</th>
                <th className="p-4 font-semibold w-20 text-center">SP</th>
                {!isTrash && <th className="p-4 font-semibold w-28 text-center">Hiển thị</th>}
                <th className="p-4 font-semibold text-right w-56">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {brands.length === 0 ? (
                <tr>
                  <td colSpan={isTrash ? 5 : 6} className="p-8 text-center text-slate-500 bg-slate-50/50">
                    {isTrash ? 'Thùng rác trống.' : 'Chưa có dữ liệu thương hiệu.'}
                  </td>
                </tr>
              ) : (
                brands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 text-slate-600 font-medium">{brand.id}</td>
                    <td className="p-4">
                      <div className="w-14 h-14 rounded-lg border border-gray-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                        {brand.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={brand.image} alt={brand.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-slate-400">No image</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{brand.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">/{brand.slug}</div>
                    </td>
                    <td className="p-4 text-center text-slate-600">{brand.products_count ?? 0}</td>
                    {!isTrash && (
                      <td className="p-4 text-center">
                        <StatusSwitch
                          checked={brand.status === 1}
                          disabled={togglingId === brand.id}
                          onChange={() => handleToggleStatus(brand)}
                        />
                      </td>
                    )}
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {isTrash ? (
                          <>
                            <button
                              onClick={() => openConfirm('restore', brand)}
                              className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                            >
                              Khôi phục
                            </button>
                            <button
                              onClick={() => openConfirm('force', brand)}
                              className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                            >
                              Xóa vĩnh viễn
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleOpenModal(brand)}
                              className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => openConfirm('trash', brand)}
                              className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                            >
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
      )}

      {/* Modal Thêm / Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50/50 sticky top-0">
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? 'Cập nhật Thương hiệu' : 'Thêm Thương hiệu mới'}
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

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên thương hiệu <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm"
                    placeholder="VD: Apple"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Slug (đường dẫn)</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => { setSlugTouched(true); setFormData({ ...formData, slug: e.target.value }); }}
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-mono"
                    placeholder="tu-dong-tao-tu-ten"
                  />
                  <p className="text-xs text-slate-400 mt-1">Tự động tạo từ tên. Để trống, hệ thống sẽ tự sinh và tự thêm hậu tố nếu bị trùng.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Mô tả</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm"
                  />
                </div>

                <ImageUploader
                  label="Hình ảnh thương hiệu"
                  currentUrl={currentImage}
                  file={imageFile}
                  removed={removeImage}
                  onPick={(f) => { setImageFile(f); setRemoveImage(false); }}
                  onRemove={() => { setImageFile(null); setRemoveImage(true); }}
                />

                <div className="flex items-center gap-3">
                  <StatusSwitch checked={formData.status} onChange={(v) => setFormData({ ...formData, status: v })} />
                  <span className="text-sm text-slate-700">{formData.status ? 'Hiển thị' : 'Ẩn'}</span>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-70"
                >
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
