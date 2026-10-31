"use client";

import { useState, useEffect, useCallback } from "react";
import axiosClient from "@/services/axiosClient";
import {
  SmartphoneIcon,
  PackageIcon,
  UsersIcon,
  GridIcon,
  TagIcon,
  RefreshIcon,
  CheckIcon,
  TrashIcon,
  AlertCircleIcon,
  XIcon,
} from "@/components/Icons";

export default function TrashPage() {
  const [activeTab, setActiveTab] = useState("products"); // 'products' | 'categories' | 'brands' | 'orders' | 'users'

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
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  // Modal xác nhận xóa vĩnh viễn
  const [deleteModal, setDeleteModal] = useState({ open: false, type: "", id: null, name: "" });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const fetchTrashData = useCallback(() => {
    setLoading(true);
    setError(null);

    const promises = [
      axiosClient.get("/products/trash"),
      axiosClient.get("/categories/trash"),
      axiosClient.get("/brands/trash"),
      axiosClient.get("/admin/orders/trash?all=1"),
    ];

    if (currentUser?.role === "admin") {
      promises.push(axiosClient.get("/admin/users/trash?all=1"));
    }

    Promise.allSettled(promises)
      .then(([prodRes, catRes, brandRes, orderRes, userRes]) => {
        if (prodRes && prodRes.status === "fulfilled") {
          const pData = prodRes.value.data || prodRes.value || [];
          setProductsTrash(Array.isArray(pData) ? pData : pData.data || []);
        }
        if (catRes && catRes.status === "fulfilled") {
          const cData = catRes.value.data || catRes.value || [];
          setCategoriesTrash(Array.isArray(cData) ? cData : cData.data || []);
        }
        if (brandRes && brandRes.status === "fulfilled") {
          const bData = brandRes.value.data || brandRes.value || [];
          setBrandsTrash(Array.isArray(bData) ? bData : bData.data || []);
        }
        if (orderRes && orderRes.status === "fulfilled") {
          const oData = orderRes.value.data || orderRes.value || [];
          setOrdersTrash(Array.isArray(oData) ? oData : oData.data || []);
        }
        if (userRes && userRes.status === "fulfilled") {
          const uData = userRes.value.data || userRes.value || [];
          setUsersTrash(Array.isArray(uData) ? uData : uData.data || []);
        }
      })
      .catch((err) => {
        setError(err.message || "Lỗi khi tải dữ liệu thùng rác");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentUser]);

  useEffect(() => {
    fetchTrashData();

    // Đồng bộ thông tin user để phân quyền
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || localStorage.getItem("access_token")
        : null;
    if (token) {
      axiosClient
        .get("/user")
        .then((res) => {
          const userData = res?.user || res?.data || res;
          if (userData && (userData.role || userData.name)) {
            setCurrentUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
          }
        })
        .catch((err) => {
          console.error("Lỗi khi tải thông tin tài khoản:", err);
        });
    }
  }, [fetchTrashData]);

  // Khôi phục bản ghi
  const handleRestore = async (type, id) => {
    setIsRestoring(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (type === "orders") {
        await axiosClient.post(`/admin/orders/${id}/restore`);
      } else if (type === "users") {
        await axiosClient.post(`/admin/users/${id}/restore`);
      } else {
        await axiosClient.put(`/${type}/${id}/restore`);
      }

      setSuccessMsg("Đã khôi phục bản ghi thành công!");

      if (type === "products") {
        setProductsTrash((prev) => prev.filter((item) => item.id !== id));
      } else if (type === "categories") {
        setCategoriesTrash((prev) => prev.filter((item) => item.id !== id));
      } else if (type === "brands") {
        setBrandsTrash((prev) => prev.filter((item) => item.id !== id));
      } else if (type === "orders") {
        setOrdersTrash((prev) => prev.filter((item) => item.id !== id));
      } else if (type === "users") {
        setUsersTrash((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      const msg = err.message || "Có lỗi xảy ra khi khôi phục";
      setError(msg);
      alert(msg);
    } finally {
      setIsRestoring(false);
    }
  };

  // Mở modal xác nhận xóa vĩnh viễn (Chỉ Admin)
  const openConfirmForceDelete = (type, id, name) => {
    if (currentUser?.role !== "admin") {
      alert("Lỗi: Chỉ có Quản trị viên mới có quyền xóa vĩnh viễn!");
      return;
    }
    setDeleteModal({ open: true, type, id, name });
  };

  const closeConfirmForceDelete = () => {
    setDeleteModal({ open: false, type: "", id: null, name: "" });
  };

  // Xóa vĩnh viễn
  const handleForceDelete = async () => {
    const { type, id } = deleteModal;
    if (!type || !id) return;

    if (currentUser?.role !== "admin") {
      setError("Lỗi: Bạn không có quyền xóa vĩnh viễn dữ liệu!");
      closeConfirmForceDelete();
      return;
    }

    setIsDeleting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (type === "orders") {
        await axiosClient.delete(`/admin/orders/${id}/force`);
      } else if (type === "users") {
        await axiosClient.delete(`/admin/users/${id}/force`);
      } else {
        await axiosClient.delete(`/${type}/${id}/force-delete`);
      }

      setSuccessMsg("Đã xóa vĩnh viễn bản ghi khỏi cơ sở dữ liệu!");

      if (type === "products") {
        setProductsTrash((prev) => prev.filter((item) => item.id !== id));
      } else if (type === "categories") {
        setCategoriesTrash((prev) => prev.filter((item) => item.id !== id));
      } else if (type === "brands") {
        setBrandsTrash((prev) => prev.filter((item) => item.id !== id));
      } else if (type === "orders") {
        setOrdersTrash((prev) => prev.filter((item) => item.id !== id));
      } else if (type === "users") {
        setUsersTrash((prev) => prev.filter((item) => item.id !== id));
      }
      closeConfirmForceDelete();
    } catch (err) {
      const msg = err.message || "Có lỗi xảy ra khi xóa vĩnh viễn";
      setError(msg);
      alert(msg);
      closeConfirmForceDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("vi-VN");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-zinc-900 tracking-tight">Thùng rác hệ thống (Trash)</h2>
          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
            DỮ LIỆU ĐÃ XÓA TẠM THỜI • KHÔI PHỤC BẢN GHI • XÓA VĨNH VIỄN
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={fetchTrashData}
            disabled={loading}
            className="bg-white hover:bg-zinc-50 text-zinc-700 font-semibold px-3 py-2 rounded-lg border border-zinc-200 text-xs shadow-2xs transition flex items-center gap-1.5"
          >
            <RefreshIcon className="w-3.5 h-3.5" />
            <span>Tải lại</span>
          </button>
        </div>
      </div>

      {/* Thông báo Thành công / Lỗi */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold ml-2"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-700 hover:text-rose-950 font-bold ml-2"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("products")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
            activeTab === "products"
              ? "bg-zinc-900 text-white"
              : "bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200"
          }`}
        >
          <SmartphoneIcon className="w-3.5 h-3.5" />
          <span>Sản phẩm</span>
          <span
            className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
              activeTab === "products" ? "bg-zinc-700 text-white" : "bg-zinc-100 text-zinc-600"
            }`}
          >
            {productsTrash.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
            activeTab === "orders"
              ? "bg-zinc-900 text-white"
              : "bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200"
          }`}
        >
          <PackageIcon className="w-3.5 h-3.5" />
          <span>Đơn hàng</span>
          <span
            className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
              activeTab === "orders" ? "bg-zinc-700 text-white" : "bg-zinc-100 text-zinc-600"
            }`}
          >
            {ordersTrash.length}
          </span>
        </button>

        {currentUser?.role === "admin" && (
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === "users"
                ? "bg-zinc-900 text-white"
                : "bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200"
            }`}
          >
            <UsersIcon className="w-3.5 h-3.5" />
            <span>Người dùng</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                activeTab === "users" ? "bg-zinc-700 text-white" : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {usersTrash.length}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
            activeTab === "categories"
              ? "bg-zinc-900 text-white"
              : "bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200"
          }`}
        >
          <GridIcon className="w-3.5 h-3.5" />
          <span>Danh mục</span>
          <span
            className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
              activeTab === "categories" ? "bg-zinc-700 text-white" : "bg-zinc-100 text-zinc-600"
            }`}
          >
            {categoriesTrash.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("brands")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
            activeTab === "brands"
              ? "bg-zinc-900 text-white"
              : "bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200"
          }`}
        >
          <TagIcon className="w-3.5 h-3.5" />
          <span>Thương hiệu</span>
          <span
            className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
              activeTab === "brands" ? "bg-zinc-700 text-white" : "bg-zinc-100 text-zinc-600"
            }`}
          >
            {brandsTrash.length}
          </span>
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-zinc-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-zinc-500 text-xs font-mono">
            Đang tải dữ liệu thùng rác từ máy chủ...
          </div>
        ) : (
          <>
            {/* TAB: SẢN PHẨM */}
            {activeTab === "products" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-700">
                  <thead className="bg-zinc-50/80 text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-200 font-mono">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">ID</th>
                      <th className="py-3 px-4">Tên sản phẩm</th>
                      <th className="py-3 px-4">Danh mục</th>
                      <th className="py-3 px-4">Thương hiệu</th>
                      <th className="py-3 px-4 text-right">Giá bán</th>
                      <th className="py-3 px-4 text-center">Thời gian xóa</th>
                      <th className="py-3 px-4 text-center w-36">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {productsTrash.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-zinc-500">
                          Thùng rác sản phẩm trống. Không có sản phẩm nào bị xóa tạm thời.
                        </td>
                      </tr>
                    ) : (
                      productsTrash.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="py-2.5 px-4 text-center font-mono text-zinc-400">{item.id}</td>
                          <td className="py-2.5 px-4 font-bold text-zinc-900">{item.name}</td>
                          <td className="py-2.5 px-4 text-zinc-600">{item.category?.name || "—"}</td>
                          <td className="py-2.5 px-4 text-zinc-600">{item.brand?.name || "—"}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-zinc-900 tabular-nums">
                            {item.price ? Number(item.price).toLocaleString("vi-VN") + " ₫" : "Liên hệ"}
                          </td>
                          <td className="py-2.5 px-4 text-center text-zinc-500 font-mono text-[11px]">
                            {formatDate(item.deleted_at)}
                          </td>
                          <td className="py-2.5 px-4 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleRestore("products", item.id)}
                                disabled={isRestoring}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-xs font-medium transition"
                              >
                                Khôi phục
                              </button>
                              {currentUser?.role === "admin" && (
                                <button
                                  type="button"
                                  onClick={() => openConfirmForceDelete("products", item.id, item.name)}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-2 py-1 rounded-md text-xs font-medium transition"
                                >
                                  Xóa vĩnh viễn
                                </button>
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

            {/* TAB: ĐƠN HÀNG */}
            {activeTab === "orders" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-700">
                  <thead className="bg-zinc-50/80 text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-200 font-mono">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">ID</th>
                      <th className="py-3 px-4">Mã đơn</th>
                      <th className="py-3 px-4">Khách hàng</th>
                      <th className="py-3 px-4 text-right">Tổng tiền</th>
                      <th className="py-3 px-4 text-center">Thời gian xóa</th>
                      <th className="py-3 px-4 text-center w-36">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {ordersTrash.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-zinc-500">
                          Thùng rác đơn hàng trống. Không có đơn nào bị xóa tạm thời.
                        </td>
                      </tr>
                    ) : (
                      ordersTrash.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="py-2.5 px-4 text-center font-mono text-zinc-400">{item.id}</td>
                          <td className="py-2.5 px-4 font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                            {item.order_code}
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="font-bold text-zinc-900">{item.customer_name}</div>
                            <div className="text-[11px] text-zinc-500 font-mono">{item.customer_phone}</div>
                          </td>
                          <td className="py-2.5 px-4 text-right font-bold text-zinc-900 font-mono tabular-nums">
                            {Number(item.total || 0).toLocaleString("vi-VN")} ₫
                          </td>
                          <td className="py-2.5 px-4 text-center text-zinc-500 font-mono text-[11px]">
                            {formatDate(item.deleted_at)}
                          </td>
                          <td className="py-2.5 px-4 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleRestore("orders", item.id)}
                                disabled={isRestoring}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-xs font-medium transition"
                              >
                                Khôi phục
                              </button>
                              {currentUser?.role === "admin" && (
                                <button
                                  type="button"
                                  onClick={() => openConfirmForceDelete("orders", item.id, item.order_code)}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-2 py-1 rounded-md text-xs font-medium transition"
                                >
                                  Xóa vĩnh viễn
                                </button>
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

            {/* TAB: NGƯỜI DÙNG */}
            {activeTab === "users" && currentUser?.role === "admin" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-700">
                  <thead className="bg-zinc-50/80 text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-200 font-mono">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">ID</th>
                      <th className="py-3 px-4">Họ và tên</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4 text-center">Vai trò</th>
                      <th className="py-3 px-4 text-center">Thời gian xóa</th>
                      <th className="py-3 px-4 text-center w-36">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {usersTrash.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-zinc-500">
                          Thùng rác người dùng trống. Không có tài khoản nào bị xóa tạm thời.
                        </td>
                      </tr>
                    ) : (
                      usersTrash.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="py-2.5 px-4 text-center font-mono text-zinc-400">{item.id}</td>
                          <td className="py-2.5 px-4 font-bold text-zinc-900">{item.name}</td>
                          <td className="py-2.5 px-4 font-mono text-zinc-600">{item.email}</td>
                          <td className="py-2.5 px-4 text-center font-mono uppercase text-[10px] font-bold text-zinc-600">
                            {item.role}
                          </td>
                          <td className="py-2.5 px-4 text-center text-zinc-500 font-mono text-[11px]">
                            {formatDate(item.deleted_at)}
                          </td>
                          <td className="py-2.5 px-4 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleRestore("users", item.id)}
                                disabled={isRestoring}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-xs font-medium transition"
                              >
                                Khôi phục
                              </button>
                              <button
                                type="button"
                                onClick={() => openConfirmForceDelete("users", item.id, item.email)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-2 py-1 rounded-md text-xs font-medium transition"
                              >
                                Xóa vĩnh viễn
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

            {/* TAB: DANH MỤC */}
            {activeTab === "categories" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-700">
                  <thead className="bg-zinc-50/80 text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-200 font-mono">
                    <tr>
                      <th className="py-3 px-4 w-16 text-center">ID</th>
                      <th className="py-3 px-4">Tên danh mục</th>
                      <th className="py-3 px-4 text-center">Thời gian xóa</th>
                      <th className="py-3 px-4 text-center w-36">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {categoriesTrash.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-zinc-500">
                          Thùng rác danh mục trống. Không có danh mục nào bị xóa tạm thời.
                        </td>
                      </tr>
                    ) : (
                      categoriesTrash.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="py-2.5 px-4 text-center font-mono text-zinc-400">{item.id}</td>
                          <td className="py-2.5 px-4 font-bold text-zinc-900">{item.name}</td>
                          <td className="py-2.5 px-4 text-center text-zinc-500 font-mono text-[11px]">
                            {formatDate(item.deleted_at)}
                          </td>
                          <td className="py-2.5 px-4 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleRestore("categories", item.id)}
                                disabled={isRestoring}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-xs font-medium transition"
                              >
                                Khôi phục
                              </button>
                              {currentUser?.role === "admin" && (
                                <button
                                  type="button"
                                  onClick={() => openConfirmForceDelete("categories", item.id, item.name)}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-2 py-1 rounded-md text-xs font-medium transition"
                                >
                                  Xóa vĩnh viễn
                                </button>
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

            {/* TAB: THƯƠNG HIỆU */}
            {activeTab === "brands" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-700">
                  <thead className="bg-zinc-50/80 text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-200 font-mono">
                    <tr>
                      <th className="py-3 px-4 w-16 text-center">ID</th>
                      <th className="py-3 px-4">Tên thương hiệu</th>
                      <th className="py-3 px-4 text-center">Thời gian xóa</th>
                      <th className="py-3 px-4 text-center w-36">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {brandsTrash.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-zinc-500">
                          Thùng rác thương hiệu trống. Không có thương hiệu nào bị xóa tạm thời.
                        </td>
                      </tr>
                    ) : (
                      brandsTrash.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="py-2.5 px-4 text-center font-mono text-zinc-400">{item.id}</td>
                          <td className="py-2.5 px-4 font-bold text-zinc-900">{item.name}</td>
                          <td className="py-2.5 px-4 text-center text-zinc-500 font-mono text-[11px]">
                            {formatDate(item.deleted_at)}
                          </td>
                          <td className="py-2.5 px-4 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleRestore("brands", item.id)}
                                disabled={isRestoring}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-xs font-medium transition"
                              >
                                Khôi phục
                              </button>
                              {currentUser?.role === "admin" && (
                                <button
                                  type="button"
                                  onClick={() => openConfirmForceDelete("brands", item.id, item.name)}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-2 py-1 rounded-md text-xs font-medium transition"
                                >
                                  Xóa vĩnh viễn
                                </button>
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
          </>
        )}
      </div>

      {/* MODAL: XÁC NHẬN XÓA VĨNH VIỄN */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-zinc-200 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <TrashIcon className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-zinc-900 text-sm">Xác nhận xóa vĩnh viễn</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Bạn có chắc chắn muốn xóa vĩnh viễn bản ghi <b>&ldquo;{deleteModal.name}&rdquo;</b> (ID: {deleteModal.id})? Hành động này{" "}
                <span className="text-rose-600 font-bold">không thể khôi phục</span>!
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleForceDelete}
                disabled={isDeleting}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 rounded-lg text-xs transition"
              >
                {isDeleting ? "Đang xóa..." : "Xóa vĩnh viễn"}
              </button>
              <button
                type="button"
                onClick={closeConfirmForceDelete}
                disabled={isDeleting}
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
