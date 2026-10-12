"use client";

import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/services/axiosClient';

export default function TrashPage() {
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'categories' | 'brands' | 'orders' | 'users'
  
  const [productsTrash, setProductsTrash] = useState([]);
  const [categoriesTrash, setCategoriesTrash] = useState([]);
  const [brandsTrash, setBrandsTrash] = useState([]);
  const [ordersTrash, setOrdersTrash] = useState([]);
  const [usersTrash, setUsersTrash] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  // Thông tin user hiện tại để phân quyền UI
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  // Modal xác nhận xóa vĩnh viễn
  const [deleteModal, setDeleteModal] = useState({ open: false, type: '', id: null, name: '' });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const fetchTrashData = useCallback(() => {
    setLoading(true);
    setError(null);

    const promises = [
      axiosClient.get('/products/trash'),
      axiosClient.get('/categories/trash'),
      axiosClient.get('/brands/trash'),
      axiosClient.get('/admin/orders/trash?all=1'),
    ];

    if (currentUser?.role === 'admin') {
      promises.push(axiosClient.get('/admin/users/trash?all=1'));
    }

    Promise.allSettled(promises)
      .then(([prodRes, catRes, brandRes, orderRes, userRes]) => {
        if (prodRes && prodRes.status === 'fulfilled') {
          const pData = prodRes.value.data || prodRes.value || [];
          setProductsTrash(Array.isArray(pData) ? pData : (pData.data || []));
        }
        if (catRes && catRes.status === 'fulfilled') {
          const cData = catRes.value.data || catRes.value || [];
          setCategoriesTrash(Array.isArray(cData) ? cData : (cData.data || []));
        }
        if (brandRes && brandRes.status === 'fulfilled') {
          const bData = brandRes.value.data || brandRes.value || [];
          setBrandsTrash(Array.isArray(bData) ? bData : (bData.data || []));
        }
        if (orderRes && orderRes.status === 'fulfilled') {
          const oData = orderRes.value.data || orderRes.value || [];
          setOrdersTrash(Array.isArray(oData) ? oData : (oData.data || []));
        }
        if (userRes && userRes.status === 'fulfilled') {
          const uData = userRes.value.data || userRes.value || [];
          setUsersTrash(Array.isArray(uData) ? uData : (uData.data || []));
        }
      })
      .catch((err) => {
        setError(err.message || 'Lỗi khi tải dữ liệu thùng rác');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentUser]);

  useEffect(() => {
    fetchTrashData();

    // Đồng bộ thông tin user để phân quyền
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('access_token')) : null;
    if (token) {
      axiosClient.get('/user')
        .then((res) => {
          const userData = res?.user || res?.data || res;
          if (userData && (userData.role || userData.name)) {
            setCurrentUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        })
        .catch((err) => {
          console.error('Lỗi khi tải thông tin tài khoản:', err);
        });
    }
  }, [fetchTrashData]);

  // Khôi phục bản ghi
  const handleRestore = async (type, id) => {
    setIsRestoring(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (type === 'orders') {
        await axiosClient.post(`/admin/orders/${id}/restore`);
      } else if (type === 'users') {
        await axiosClient.post(`/admin/users/${id}/restore`);
      } else {
        await axiosClient.put(`/${type}/${id}/restore`);
      }
      
      setSuccessMsg('Đã khôi phục bản ghi thành công!');
      
      // Cập nhật lại state danh sách ngay lập tức
      if (type === 'products') {
        setProductsTrash((prev) => prev.filter((item) => item.id !== id));
      } else if (type === 'categories') {
        setCategoriesTrash((prev) => prev.filter((item) => item.id !== id));
      } else if (type === 'brands') {
        setBrandsTrash((prev) => prev.filter((item) => item.id !== id));
      } else if (type === 'orders') {
        setOrdersTrash((prev) => prev.filter((item) => item.id !== id));
      } else if (type === 'users') {
        setUsersTrash((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      const msg = err.message || 'Có lỗi xảy ra khi khôi phục';
      setError(msg);
      alert(msg);
    } finally {
      setIsRestoring(false);
    }
  };

  // Mở modal xác nhận xóa vĩnh viễn (Chỉ Admin)
  const openConfirmForceDelete = (type, id, name) => {
    if (currentUser?.role !== 'admin') {
      alert('Lỗi: Chỉ có Quản trị viên mới có quyền xóa vĩnh viễn!');
      return;
    }
    setDeleteModal({ open: true, type, id, name });
  };

  // Đóng modal
  const closeConfirmForceDelete = () => {
    setDeleteModal({ open: false, type: '', id: null, name: '' });
  };

  // Xóa vĩnh viễn
  const handleForceDelete = async () => {
    const { type, id } = deleteModal;
    if (!type || !id) return;

    if (currentUser?.role !== 'admin') {
      setError('Lỗi: Bạn không có quyền xóa vĩnh viễn dữ liệu!');
      closeConfirmForceDelete();
      return;
    }

    setIsDeleting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (type === 'orders') {
        await axiosClient.delete(`/admin/orders/${id}/force`);
      } else if (type === 'users') {
        await axiosClient.delete(`/admin/users/${id}/force`);
      } else {
        await axiosClient.delete(`/${type}/${id}/force-delete`);
      }
      
      setSuccessMsg('Đã xóa vĩnh viễn bản ghi khỏi cơ sở dữ liệu!');
      
      // Cập nhật lại state
      if (type === 'products') {
        setProductsTrash((prev) => prev.filter((item) => item.id !== id));
      } else if (type === 'categories') {
        setCategoriesTrash((prev) => prev.filter((item) => item.id !== id));
      } else if (type === 'brands') {
        setBrandsTrash((prev) => prev.filter((item) => item.id !== id));
      } else if (type === 'orders') {
        setOrdersTrash((prev) => prev.filter((item) => item.id !== id));
      } else if (type === 'users') {
        setUsersTrash((prev) => prev.filter((item) => item.id !== id));
      }
      closeConfirmForceDelete();
    } catch (err) {
      const msg = err.message || 'Có lỗi xảy ra khi xóa vĩnh viễn';
      setError(msg);
      alert(msg);
      closeConfirmForceDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '---';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Toolbar */}
      <div className="border-b-2 border-black pb-2 flex justify-between items-center bg-[#d4d0c8] p-2">
        <div>
          <h1 className="text-base font-bold text-black uppercase tracking-wide">
            THÙNG RÁC HỆ THỐNG (TRASH)
          </h1>
          <p className="text-xs text-gray-700">
            Quản lý các bản ghi đã xóa tạm thời (Soft Delete). Bạn có thể khôi phục hoặc xóa vĩnh viễn.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={fetchTrashData}
            disabled={loading}
            className="retro-btn"
          >
            Tải lại
          </button>
        </div>
      </div>

      {/* Thông báo Thành công / Lỗi */}
      {successMsg && (
        <div className="bg-green-100 border border-green-700 text-green-900 p-2 text-xs font-bold">
          <b>Thông báo:</b> {successMsg}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-2 border-red-700 text-red-900 p-2 text-xs font-bold">
          <b>Lỗi:</b> {error}
        </div>
      )}

      {/* Windows Style Property Sheet Tabs */}
      <div className="flex flex-wrap border-b border-black gap-1 pt-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={
            activeTab === 'orders'
              ? "bg-[#d4d0c8] border-t-2 border-l-2 border-r-2 border-t-white border-l-white border-r-[#404040] border-b-0 font-bold px-3 py-1.5 -mb-[1px] text-black"
              : "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#808080] px-3 py-1 text-gray-800 hover:text-black cursor-pointer"
          }
        >
          Đơn hàng ({ordersTrash.length})
        </button>

        {currentUser?.role === 'admin' && (
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={
              activeTab === 'users'
                ? "bg-[#d4d0c8] border-t-2 border-l-2 border-r-2 border-t-white border-l-white border-r-[#404040] border-b-0 font-bold px-3 py-1.5 -mb-[1px] text-black"
                : "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#808080] px-3 py-1 text-gray-800 hover:text-black cursor-pointer"
            }
          >
            Người dùng ({usersTrash.length})
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={
            activeTab === 'products'
              ? "bg-[#d4d0c8] border-t-2 border-l-2 border-r-2 border-t-white border-l-white border-r-[#404040] border-b-0 font-bold px-3 py-1.5 -mb-[1px] text-black"
              : "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#808080] px-3 py-1 text-gray-800 hover:text-black cursor-pointer"
          }
        >
          Sản phẩm ({productsTrash.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={
            activeTab === 'categories'
              ? "bg-[#d4d0c8] border-t-2 border-l-2 border-r-2 border-t-white border-l-white border-r-[#404040] border-b-0 font-bold px-3 py-1.5 -mb-[1px] text-black"
              : "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#808080] px-3 py-1 text-gray-800 hover:text-black cursor-pointer"
          }
        >
          Danh mục ({categoriesTrash.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('brands')}
          className={
            activeTab === 'brands'
              ? "bg-[#d4d0c8] border-t-2 border-l-2 border-r-2 border-t-white border-l-white border-r-[#404040] border-b-0 font-bold px-3 py-1.5 -mb-[1px] text-black"
              : "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#808080] px-3 py-1 text-gray-800 hover:text-black cursor-pointer"
          }
        >
          Thương hiệu ({brandsTrash.length})
        </button>
      </div>

      {/* Main Content Pane */}
      <div className="bg-white border border-black p-3">
        {loading ? (
          <div className="p-8 text-center text-black bg-[#ece9d8]">
            <b>Đang tải dữ liệu thùng rác... Vui lòng đợi.</b>
          </div>
        ) : (
          <>
            {/* TAB: ĐƠN HÀNG ĐÃ XÓA */}
            {activeTab === 'orders' && (
              <div className="overflow-x-auto">
                <table className="retro-table">
                  <thead>
                    <tr>
                      <th className="w-12 text-center">ID</th>
                      <th>Mã đơn hàng</th>
                      <th>Khách hàng</th>
                      <th className="text-right">Tổng tiền</th>
                      <th className="text-center">Thời gian xóa</th>
                      <th className="text-center w-36">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersTrash.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-4 text-center text-gray-700 bg-[#f9f9f9]">
                          Thùng rác đơn hàng trống. Không có đơn nào bị xóa tạm thời.
                        </td>
                      </tr>
                    ) : (
                      ordersTrash.map((item) => (
                        <tr key={item.id}>
                          <td className="text-center font-mono">{item.id}</td>
                          <td className="font-mono font-bold">{item.order_code}</td>
                          <td>
                            {item.customer_name} ({item.customer_phone})
                          </td>
                          <td className="text-right font-bold text-red-700 font-mono">
                            {Number(item.total || 0).toLocaleString()} ₫
                          </td>
                          <td className="text-center text-gray-600 font-mono text-[11px]">
                            {formatDate(item.deleted_at)}
                          </td>
                          <td className="text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleRestore('orders', item.id)}
                              disabled={isRestoring}
                              className="text-[#0000ee] underline hover:text-green-700 font-bold"
                            >
                              [Khôi phục]
                            </button>
                            {currentUser?.role === 'admin' && (
                              <>
                                {' '}
                                <button
                                  type="button"
                                  onClick={() => openConfirmForceDelete('orders', item.id, item.order_code)}
                                  className="text-[#cc0000] underline hover:text-red-900 font-bold"
                                >
                                  [Xóa vĩnh viễn]
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: NGƯỜI DÙNG ĐÃ XÓA */}
            {activeTab === 'users' && currentUser?.role === 'admin' && (
              <div className="overflow-x-auto">
                <table className="retro-table">
                  <thead>
                    <tr>
                      <th className="w-12 text-center">ID</th>
                      <th>Họ và tên</th>
                      <th>Email</th>
                      <th className="text-center">Vai trò</th>
                      <th className="text-center">Thời gian xóa</th>
                      <th className="text-center w-36">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersTrash.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-4 text-center text-gray-700 bg-[#f9f9f9]">
                          Thùng rác người dùng trống. Không có tài khoản nào bị xóa tạm thời.
                        </td>
                      </tr>
                    ) : (
                      usersTrash.map((item) => (
                        <tr key={item.id}>
                          <td className="text-center font-mono">{item.id}</td>
                          <td className="font-bold">{item.name}</td>
                          <td className="font-mono">{item.email}</td>
                          <td className="text-center uppercase text-[10px] font-bold">
                            {item.role}
                          </td>
                          <td className="text-center text-gray-600 font-mono text-[11px]">
                            {formatDate(item.deleted_at)}
                          </td>
                          <td className="text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleRestore('users', item.id)}
                              disabled={isRestoring}
                              className="text-[#0000ee] underline hover:text-green-700 font-bold"
                            >
                              [Khôi phục]
                            </button>
                            {' '}
                            <button
                              type="button"
                              onClick={() => openConfirmForceDelete('users', item.id, item.email)}
                              className="text-[#cc0000] underline hover:text-red-900 font-bold"
                            >
                              [Xóa vĩnh viễn]
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: SẢN PHẨM ĐÃ XÓA */}
            {activeTab === 'products' && (
              <div className="overflow-x-auto">
                <table className="retro-table">
                  <thead>
                    <tr>
                      <th className="w-12 text-center">ID</th>
                      <th>Tên sản phẩm</th>
                      <th>Danh mục</th>
                      <th>Thương hiệu</th>
                      <th className="text-right">Giá bán</th>
                      <th className="text-center">Thời gian xóa</th>
                      <th className="text-center w-36">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsTrash.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-4 text-center text-gray-700 bg-[#f9f9f9]">
                          Thùng rác sản phẩm trống. Không có sản phẩm nào bị xóa tạm thời.
                        </td>
                      </tr>
                    ) : (
                      productsTrash.map((item) => (
                        <tr key={item.id}>
                          <td className="text-center font-mono">{item.id}</td>
                          <td className="font-bold">{item.name}</td>
                          <td>{item.category?.name || '---'}</td>
                          <td>{item.brand?.name || '---'}</td>
                          <td className="text-right font-mono">
                            {item.price ? Number(item.price).toLocaleString() + ' ₫' : 'Liên hệ'}
                          </td>
                          <td className="text-center text-gray-600 font-mono text-[11px]">
                            {formatDate(item.deleted_at)}
                          </td>
                          <td className="text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleRestore('products', item.id)}
                              disabled={isRestoring}
                              className="text-[#0000ee] underline hover:text-green-700 font-bold"
                            >
                              [Khôi phục]
                            </button>
                            {currentUser?.role === 'admin' && (
                              <>
                                {' '}
                                <button
                                  type="button"
                                  onClick={() => openConfirmForceDelete('products', item.id, item.name)}
                                  className="text-[#cc0000] underline hover:text-red-900 font-bold"
                                >
                                  [Xóa vĩnh viễn]
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: DANH MỤC ĐÃ XÓA */}
            {activeTab === 'categories' && (
              <div className="overflow-x-auto">
                <table className="retro-table">
                  <thead>
                    <tr>
                      <th className="w-16 text-center">ID</th>
                      <th>Tên danh mục</th>
                      <th className="text-center">Thời gian xóa</th>
                      <th className="text-center w-36">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoriesTrash.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-4 text-center text-gray-700 bg-[#f9f9f9]">
                          Thùng rác danh mục trống. Không có danh mục nào bị xóa tạm thời.
                        </td>
                      </tr>
                    ) : (
                      categoriesTrash.map((item) => (
                        <tr key={item.id}>
                          <td className="text-center font-mono">{item.id}</td>
                          <td className="font-bold">{item.name}</td>
                          <td className="text-center text-gray-600 font-mono text-[11px]">
                            {formatDate(item.deleted_at)}
                          </td>
                          <td className="text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleRestore('categories', item.id)}
                              disabled={isRestoring}
                              className="text-[#0000ee] underline hover:text-green-700 font-bold"
                            >
                              [Khôi phục]
                            </button>
                            {currentUser?.role === 'admin' && (
                              <>
                                {' '}
                                <button
                                  type="button"
                                  onClick={() => openConfirmForceDelete('categories', item.id, item.name)}
                                  className="text-[#cc0000] underline hover:text-red-900 font-bold"
                                >
                                  [Xóa vĩnh viễn]
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: THƯƠNG HIỆU ĐÃ XÓA */}
            {activeTab === 'brands' && (
              <div className="overflow-x-auto">
                <table className="retro-table">
                  <thead>
                    <tr>
                      <th className="w-16 text-center">ID</th>
                      <th>Tên thương hiệu</th>
                      <th className="text-center">Thời gian xóa</th>
                      <th className="text-center w-36">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brandsTrash.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-4 text-center text-gray-700 bg-[#f9f9f9]">
                          Thùng rác thương hiệu trống. Không có thương hiệu nào bị xóa tạm thời.
                        </td>
                      </tr>
                    ) : (
                      brandsTrash.map((item) => (
                        <tr key={item.id}>
                          <td className="text-center font-mono">{item.id}</td>
                          <td className="font-bold">{item.name}</td>
                          <td className="text-center text-gray-600 font-mono text-[11px]">
                            {formatDate(item.deleted_at)}
                          </td>
                          <td className="text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleRestore('brands', item.id)}
                              disabled={isRestoring}
                              className="text-[#0000ee] underline hover:text-green-700 font-bold"
                            >
                              [Khôi phục]
                            </button>
                            {currentUser?.role === 'admin' && (
                              <>
                                {' '}
                                <button
                                  type="button"
                                  onClick={() => openConfirmForceDelete('brands', item.id, item.name)}
                                  className="text-[#cc0000] underline hover:text-red-900 font-bold"
                                >
                                  [Xóa vĩnh viễn]
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Xác nhận Xóa vĩnh viễn (Retro Window) */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="retro-window w-full max-w-sm bg-[#d4d0c8] border-2 border-t-white border-l-white border-r-black border-b-black shadow-xl">
            <div className="retro-titlebar">
              <span>Xác nhận xóa vĩnh viễn</span>
              <button 
                type="button" 
                onClick={closeConfirmForceDelete} 
                className="retro-btn !p-0 !w-4 !h-4 text-[10px] font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-[#d4d0c8]">
              <div className="mb-4">
                <div className="font-bold text-black mb-1">Cảnh báo: Hành động không thể hoàn tác!</div>
                <p className="text-gray-800 text-xs leading-relaxed">
                  Bạn có chắc chắn muốn xóa vĩnh viễn bản ghi <b>&ldquo;{deleteModal.name}&rdquo;</b> (ID: {deleteModal.id})? 
                  Dữ liệu sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu và không thể khôi phục lại.
                </p>
              </div>
              
              <div className="pt-3 border-t border-[#ffffff] flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={handleForceDelete} 
                  disabled={isDeleting}
                  className="retro-btn font-bold text-red-700 px-4"
                >
                  {isDeleting ? 'Đang xóa...' : 'Đồng ý xóa vĩnh viễn'}
                </button>
                <button 
                  type="button" 
                  onClick={closeConfirmForceDelete} 
                  disabled={isDeleting}
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
