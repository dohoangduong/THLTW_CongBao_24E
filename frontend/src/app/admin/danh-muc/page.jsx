"use client";

import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/services/axiosClient';
import { MULTIPART, toFormData } from '@/utils/formData';
import { slugify } from '@/utils/format';
import ImageUploader from '@/components/admin/ImageUploader';
import StatusSwitch from '@/components/admin/StatusSwitch';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

const EMPTY_FORM = { name: '', slug: '', parent_id: '', description: '', status: true };

export default function CategoriesPage() {
  const [tab, setTab] = useState('active');          // 'active' = đang dùng | 'trash' = thùng rác
  const [categories, setCategories] = useState([]);
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

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosClient.get('/categories', {
        params: { admin: 1, trashed: tab === 'trash' ? 1 : 0 },
      });
      setCategories(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /* ---------------- Thêm / Sửa ---------------- */
  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingId(category.id);
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        parent_id: category.parent_id || '',
        description: category.description || '',
        status: category.status === 1,
      });
      setSlugTouched(true);
      setCurrentImage(category.image || null);
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
        parent_id: formData.parent_id,
        description: formData.description,
        status: formData.status,
        image: imageFile || undefined,
        remove_image: removeImage && !imageFile ? true : undefined,
      };

      if (editingId) {
        await axiosClient.post(`/categories/${editingId}`, toFormData(values, { method: 'PUT' }), MULTIPART);
      } else {
        await axiosClient.post('/categories', toFormData(values), MULTIPART);
      }
      handleCloseModal();
      fetchCategories();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- Ẩn / hiện ---------------- */
  const handleToggleStatus = async (category) => {
    setTogglingId(category.id);
    try {
      const res = await axiosClient.patch(`/categories/${category.id}/toggle-status`);
      setCategories((list) => list.map((c) => (c.id === category.id ? { ...c, ...res.data } : c)));
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
      if (type === 'trash') await axiosClient.delete(`/categories/${item.id}`);
      if (type === 'restore') await axiosClient.post(`/categories/${item.id}/restore`);
      if (type === 'force') await axiosClient.delete(`/categories/${item.id}/force`);
      setConfirm(null);
      fetchCategories();
    } catch (err) {
      setConfirmError(err.message);   // VD: "Không thể xóa: danh mục còn 3 sản phẩm..."
    } finally {
      setIsConfirming(false);
    }
  };

  const confirmProps = {
    trash:   { title: 'Chuyển vào thùng rác', confirmText: 'Chuyển vào thùng rác', tone: 'danger',
               message: 'Danh mục sẽ bị ẩn khỏi hệ thống nhưng vẫn có thể khôi phục lại trong thùng rác.' },
    restore: { title: 'Khôi phục danh mục', confirmText: 'Khôi phục', tone: 'primary',
               message: 'Danh mục sẽ được đưa trở lại danh sách đang sử dụng.' },
    force:   { title: 'Xóa vĩnh viễn', confirmText: 'Xóa vĩnh viễn', tone: 'danger',
               message: 'Hành động này KHÔNG thể hoàn tác. Danh mục và ảnh của nó sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu.' },
  };
  const cp = confirm ? confirmProps[confirm.type] : null;

  const parentOptions = categories.filter((c) => c.id !== editingId);
  const isTrash = tab === 'trash';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Danh mục</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý các danh mục sản phẩm trên hệ thống.</p>
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
                <th className="p-4 font-semibold">Tên danh mục</th>
                <th className="p-4 font-semibold">Danh mục cha</th>
                <th className="p-4 font-semibold w-20 text-center">SP</th>
                {!isTrash && <th className="p-4 font-semibold w-28 text-center">Hiển thị</th>}
                <th className="p-4 font-semibold text-right w-56">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={isTrash ? 6 : 7} className="p-8 text-center text-slate-500 bg-slate-50/50">
                    {isTrash ? 'Thùng rác trống.' : 'Chưa có dữ liệu danh mục.'}
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 text-slate-600 font-medium">{category.id}</td>
                    <td className="p-4">
                      <div className="w-14 h-14 rounded-lg border border-gray-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                        {category.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-slate-400">No image</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{category.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">/{category.slug}</div>
                    </td>
                    <td className="p-4 text-slate-600">{category.parent_name || '—'}</td>
                    <td className="p-4 text-center text-slate-600">{category.products_count ?? 0}</td>
                    {!isTrash && (
                      <td className="p-4 text-center">
                        <StatusSwitch
                          checked={category.status === 1}
                          disabled={togglingId === category.id}
                          onChange={() => handleToggleStatus(category)}
                        />
                      </td>
                    )}
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {isTrash ? (
                          <>
                            <button
                              onClick={() => openConfirm('restore', category)}
                              className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                            >
                              Khôi phục
                            </button>
                            <button
                              onClick={() => openConfirm('force', category)}
                              className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                            >
                              Xóa vĩnh viễn
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleOpenModal(category)}
                              className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => openConfirm('trash', category)}
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
                {editingId ? 'Cập nhật Danh mục' : 'Thêm Danh mục mới'}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên danh mục <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm"
                    placeholder="VD: Điện thoại iPhone"
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
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Danh mục cha</label>
                  <select
                    value={formData.parent_id}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm bg-white"
                  >
                    <option value="">— Không có (danh mục gốc) —</option>
                    {parentOptions.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
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
                  label="Hình ảnh danh mục"
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
