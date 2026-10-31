"use client";

import { useState, useEffect, useCallback } from "react";
import axiosClient from "@/services/axiosClient";
import {
  UsersIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  AlertCircleIcon,
  XIcon,
  EyeIcon,
  LockIcon,
  UnlockIcon,
  PackageIcon,
  CheckIcon,
} from "@/components/Icons";

const ROLE_BADGES = {
  admin: { label: "Quản trị viên (Admin)", dot: "bg-rose-500", cls: "bg-rose-50/80 text-rose-700 border-rose-200" },
  manager: { label: "Quản lý (Manager)", dot: "bg-amber-500", cls: "bg-amber-50/80 text-amber-700 border-amber-200" },
  customer: { label: "Khách hàng", dot: "bg-blue-500", cls: "bg-blue-50/80 text-blue-700 border-blue-200" },
};

const ORDER_STATUS_LABELS = {
  pending: { label: "Chờ xử lý", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed: { label: "Đã xác nhận", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  shipping: { label: "Đang giao hàng", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  completed: { label: "Hoàn tất", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Đã hủy", cls: "bg-rose-50 text-rose-700 border-rose-200" },
};

export default function AdminUsersPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bộ lọc
  const [roleFilter, setRoleFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Thêm / Sửa người dùng
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "customer",
    status: 1,
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Modal Chi tiết Người dùng & Lịch sử đơn hàng trên cùng 1 trang (Chuẩn Bảng Trắng)
  const [detailModal, setDetailModal] = useState({
    open: false,
    loading: false,
    user: null,
  });

  // Modal Xóa mềm
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null, submitting: false });

  // 1. Kiểm tra tài khoản hiện tại
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("user");
        if (saved) setCurrentUser(JSON.parse(saved));
      } catch {}

      axiosClient
        .get("/user")
        .then((res) => {
          const u = res?.user || res?.data || res;
          if (u && (u.role || u.name)) setCurrentUser(u);
        })
        .catch(() => {});
    }
  }, []);

  // 2. Tải danh sách người dùng
  const fetchUsers = useCallback(
    (page = 1) => {
      if (currentUser?.role === "manager") {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ page: String(page), per_page: "10" });
      if (roleFilter) params.append("role", roleFilter);
      if (searchQuery.trim()) params.append("q", searchQuery.trim());

      axiosClient
        .get(`/admin/users?${params.toString()}`)
        .then((res) => {
          const list = res.data || res || [];
          setUsers(Array.isArray(list) ? list : list.data || []);
          setMeta(res.meta || res);
        })
        .catch((err) => {
          console.error("Lỗi khi tải danh sách người dùng:", err);
          setError(err.message || "Không thể tải danh sách người dùng từ cơ sở dữ liệu");
        })
        .finally(() => setLoading(false));
    },
    [currentUser, roleFilter, searchQuery]
  );

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, fetchUsers]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1);
  };

  // [THUẬT TOÁN KHÓA / MỞ KHÓA TÀI KHOẢN (BLOCK/UNBLOCK)]:
  // Gọi API PUT /api/admin/users/{id}/toggle-status để đảo trạng thái status và thu hồi token nếu bị khóa.
  const handleToggleStatus = async (u) => {
    if (u.id === currentUser?.id) {
      alert("Lỗi bảo mật: Bạn không thể tự khóa tài khoản của chính mình!");
      return;
    }

    const actionText = Number(u.status) === 1 ? "KHÓA" : "MỞ KHÓA";
    if (!confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản "${u.name}" (${u.email})?`)) {
      return;
    }

    try {
      const res = await axiosClient.put(`/admin/users/${u.id}/toggle-status`);
      alert(res.message || `Đã ${actionText.toLowerCase()} tài khoản người dùng thành công!`);
      fetchUsers(currentPage);
    } catch (err) {
      alert("Lỗi cập nhật trạng thái tài khoản: " + (err.message || "Lỗi máy chủ"));
    }
  };

  // [THUẬT TOÁN XEM CHI TIẾT USER VÀ TOÀN BỘ ĐƠN HÀNG TRÊN CÙNG 1 TRANG (CHUẨN BẢNG TRẮNG)]:
  // Gọi API GET /api/admin/users/{id} trả về thông tin cá nhân kèm toàn bộ mảng orders và details.
  const handleOpenDetail = async (u) => {
    setDetailModal({ open: true, loading: true, user: null });
    try {
      const res = await axiosClient.get(`/admin/users/${u.id}`);
      const userData = res.data || res;
      setDetailModal({ open: true, loading: false, user: userData });
    } catch (err) {
      alert("Lỗi khi tải chi tiết người dùng: " + (err.message || "Lỗi máy chủ"));
      setDetailModal({ open: false, loading: false, user: null });
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingId(user.id);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        phone: user.phone || "",
        address: user.address || "",
        role: user.role || "customer",
        status: user.status !== undefined ? (user.status ? 1 : 0) : 1,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        role: "customer",
        status: 1,
      });
    }
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      role: "customer",
      status: 1,
    });
    setEditingId(null);
    setModalError(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalSubmitting(true);
    setModalError(null);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        address: formData.address || null,
        role: formData.role,
        status: Number(formData.status),
      };

      if (!editingId || (editingId && formData.password.trim() !== "")) {
        payload.password = formData.password;
      }

      if (editingId) {
        await axiosClient.put(`/admin/users/${editingId}`, payload);
      } else {
        await axiosClient.post("/admin/users", payload);
      }

      handleCloseModal();
      fetchUsers(currentPage);
    } catch (err) {
      setModalError(err.message || "Có lỗi xảy ra khi lưu người dùng");
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleOpenDelete = (user) => {
    if (user.id === currentUser?.id) {
      alert("Lỗi: Bạn không thể tự xóa tài khoản của chính mình!");
      return;
    }
    setDeleteModal({ open: true, user, submitting: false });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.user) return;
    setDeleteModal((prev) => ({ ...prev, submitting: true }));

    try {
      await axiosClient.delete(`/admin/users/${deleteModal.user.id}`);
      setDeleteModal({ open: false, user: null, submitting: false });
      fetchUsers(currentPage);
    } catch (err) {
      alert("Lỗi khi xóa người dùng: " + err.message);
      setDeleteModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handlePageChange = (p) => {
    if (p >= 1 && (!meta || p <= (meta.last_page || 1))) {
      setCurrentPage(p);
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(amount) || 0);
  };

  if (currentUser && currentUser.role === "manager") {
    return (
      <div className="p-8 bg-white border border-zinc-200 rounded-xl max-w-lg mx-auto text-center space-y-3">
        <AlertCircleIcon className="w-8 h-8 text-amber-500 mx-auto" />
        <h3 className="text-base font-extrabold text-zinc-900">Giới hạn quyền truy cập</h3>
        <p className="text-xs text-zinc-500">
          Chỉ có <b>Quản trị viên (Admin)</b> mới có quyền xem và quản lý người dùng. Tài khoản Quản lý chỉ được quản lý đơn hàng và danh mục.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-zinc-900 tracking-tight">Quản lý người dùng & tài khoản</h2>
          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
            DANH SÁCH TÀI KHOẢN • KHÓA / MỞ KHÓA • CHI TIẾT & LỊCH SỬ ĐƠN HÀNG
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-3.5 py-2 rounded-lg text-xs shadow-2xs transition flex items-center gap-1.5"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>Thêm tài khoản</span>
          </button>
          <button
            type="button"
            onClick={() => fetchUsers(currentPage)}
            className="bg-white hover:bg-zinc-50 text-zinc-700 font-semibold px-3 py-2 rounded-lg border border-zinc-200 text-xs shadow-2xs transition flex items-center gap-1.5"
          >
            <RefreshIcon className="w-3.5 h-3.5" />
            <span>Tải lại</span>
          </button>
        </div>
      </div>

      {/* Toolbar Filter */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md flex items-center gap-2">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, email, số điện thoại..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-2 pl-9 pr-3 text-xs outline-none focus:border-zinc-900 transition-all font-mono"
            />
            <SearchIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          </div>
          <button
            type="submit"
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-4 py-2 rounded-lg text-xs transition shrink-0"
          >
            Tìm kiếm
          </button>
        </form>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-medium rounded-lg px-3 py-2 outline-none focus:border-zinc-900 cursor-pointer"
        >
          <option value="">-- Tất cả vai trò --</option>
          <option value="admin">Quản trị viên (Admin)</option>
          <option value="manager">Quản lý (Manager)</option>
          <option value="customer">Khách hàng</option>
        </select>
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
            Đang tải dữ liệu người dùng từ Database...
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs space-y-2">
            <UsersIcon className="w-8 h-8 text-zinc-400 mx-auto" />
            <p className="font-semibold text-zinc-700">Không tìm thấy tài khoản người dùng nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead className="bg-zinc-50/80 text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-200 font-mono">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">ID</th>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Điện thoại</th>
                  <th className="py-3 px-4 text-center">Vai trò</th>
                  <th className="py-3 px-4 text-center">Đơn hàng</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-center w-52">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {users.map((u) => {
                  const roleBadge = ROLE_BADGES[u.role] || {
                    label: u.role,
                    dot: "bg-zinc-400",
                    cls: "bg-zinc-100 text-zinc-700 border-zinc-200",
                  };
                  const isActive = Boolean(u.status);

                  return (
                    <tr key={u.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-2.5 px-4 text-center font-mono text-zinc-400">{u.id}</td>
                      <td className="py-2.5 px-4 font-bold text-zinc-900">{u.name}</td>
                      <td className="py-2.5 px-4 font-mono text-zinc-600">{u.email}</td>
                      <td className="py-2.5 px-4 font-mono text-zinc-600">{u.phone || "—"}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${roleBadge.cls}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${roleBadge.dot}`} />
                          <span>{roleBadge.label}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-zinc-800">
                        {u.orders_count || 0} đơn
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          <span>{isActive ? "Hoạt động" : "Bị khóa"}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {/* Nút Chi tiết (Chuẩn sơ đồ bảng trắng) */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(u)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-xs font-semibold transition flex items-center gap-1 border border-indigo-200"
                            title="Xem chi tiết và lịch sử đơn hàng"
                          >
                            <EyeIcon className="w-3.5 h-3.5" />
                            <span>Chi tiết</span>
                          </button>

                          {/* Nút Khóa / Mở khóa tài khoản */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u)}
                            className={`px-2 py-1 rounded-md text-xs font-semibold transition flex items-center gap-1 border ${
                              isActive
                                ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                            }`}
                            title={isActive ? "Khóa tài khoản này" : "Mở khóa tài khoản"}
                          >
                            {isActive ? (
                              <>
                                <LockIcon className="w-3.5 h-3.5 text-amber-600" />
                                <span>Khóa</span>
                              </>
                            ) : (
                              <>
                                <UnlockIcon className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Mở</span>
                              </>
                            )}
                          </button>

                          {/* Nút Sửa */}
                          <button
                            type="button"
                            onClick={() => handleOpenModal(u)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-medium transition flex items-center gap-1"
                            title="Sửa thông tin"
                          >
                            <EditIcon className="w-3.5 h-3.5" />
                          </button>

                          {/* Nút Xóa */}
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(u)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-2 py-1 rounded-md text-xs font-medium transition flex items-center gap-1"
                            title="Xóa vào thùng rác"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Phân trang */}
        {meta && (
          <div className="p-4 border-t border-zinc-200 flex flex-wrap items-center justify-between text-xs text-zinc-500 gap-2 font-mono">
            <div>
              Hiển thị <b>{users.length}</b> tài khoản (Trang <b>{meta.current_page || currentPage}</b> /{" "}
              <b>{meta.last_page || 1}</b>)
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

      {/* MODAL CHI TIẾT NGƯỜI DÙNG & TOÀN BỘ ĐƠN HÀNG (SƠ ĐỒ BẢNG TRẮNG CÙNG 1 TRANG) */}
      {detailModal.open && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-zinc-200 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header Modal */}
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <UsersIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-zinc-900 text-sm">
                    Hồ Sơ Chi Tiết Người Dùng & Toàn Bộ Lịch Sử Đơn Hàng
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    ĐỒNG BỘ 100% CƠ SỞ DỮ LIỆU MYSQL TRÊN CÙNG MỘT TRANG
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailModal({ open: false, loading: false, user: null })}
                className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {detailModal.loading ? (
                <div className="py-12 text-center text-zinc-400 font-mono">
                  Đang tải thông tin chi tiết và lịch sử đơn hàng...
                </div>
              ) : detailModal.user ? (
                <>
                  {/* Phần 1: Thẻ thông tin cá nhân */}
                  <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-[11px] text-zinc-400 font-medium">Họ và tên:</div>
                      <div className="font-bold text-zinc-900 text-sm">{detailModal.user.name}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-zinc-400 font-medium">Email tài khoản:</div>
                      <div className="font-mono text-zinc-800">{detailModal.user.email}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-zinc-400 font-medium">Số điện thoại:</div>
                      <div className="font-mono text-zinc-800">{detailModal.user.phone || "Chưa cập nhật"}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-zinc-400 font-medium">Vai trò hệ thống:</div>
                      <div className="font-bold text-blue-600 uppercase">{detailModal.user.role}</div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-[11px] text-zinc-400 font-medium">Địa chỉ giao hàng mặc định:</div>
                      <div className="text-zinc-800">{detailModal.user.address || "Chưa thiết lập"}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-zinc-400 font-medium">Trạng thái tài khoản:</div>
                      <div className="font-semibold">
                        {Boolean(detailModal.user.status) ? (
                          <span className="text-emerald-700">Đang hoạt động (OK)</span>
                        ) : (
                          <span className="text-rose-600 font-bold">ĐÃ BỊ KHÓA BỞI ADMIN</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-zinc-400 font-medium">Tổng số đơn hàng:</div>
                      <div className="font-mono font-bold text-zinc-900">
                        {detailModal.user.orders?.length || detailModal.user.orders_count || 0} đơn hàng
                      </div>
                    </div>
                  </div>

                  {/* Phần 2: Danh sách toàn bộ đơn hàng của chính User đó (Khớp Whiteboard) */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <PackageIcon className="w-4 h-4 text-zinc-600" />
                        <h4 className="font-bold text-sm text-zinc-900">
                          Toàn bộ lịch sử đơn hàng của người dùng này ({detailModal.user.orders?.length || 0})
                        </h4>
                      </div>
                      <span className="text-[11px] text-zinc-400 font-mono">DỮ LIỆU BẢNG ORDERS</span>
                    </div>

                    {!detailModal.user.orders || detailModal.user.orders.length === 0 ? (
                      <div className="p-8 text-center bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-500 font-medium">
                        Người dùng này chưa phát sinh đơn hàng nào trong hệ thống.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {detailModal.user.orders.map((order) => {
                          const statusInfo = ORDER_STATUS_LABELS[order.status] || {
                            label: order.status,
                            cls: "bg-zinc-100 text-zinc-700 border-zinc-200",
                          };

                          return (
                            <div
                              key={order.id}
                              className="border border-zinc-200 rounded-2xl p-4 bg-white shadow-2xs space-y-3"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-100">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-sm text-blue-600">
                                    #{order.order_code}
                                  </span>
                                  <span className="text-zinc-400">•</span>
                                  <span className="text-zinc-500 font-mono text-[11px]">
                                    {new Date(order.created_at).toLocaleString("vi-VN")}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${statusInfo.cls}`}
                                  >
                                    {statusInfo.label}
                                  </span>
                                  <span className="font-bold text-zinc-900 text-sm">
                                    {formatMoney(order.total)}
                                  </span>
                                </div>
                              </div>

                              {/* Danh sách sản phẩm trong đơn */}
                              <div className="bg-zinc-50 rounded-xl p-3">
                                <div className="text-[11px] font-bold uppercase text-zinc-400 mb-2">
                                  Sản phẩm trong đơn:
                                </div>
                                {order.details && order.details.length > 0 ? (
                                  <div className="space-y-1.5 divide-y divide-zinc-200/50">
                                    {order.details.map((item, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center justify-between pt-1 text-xs"
                                      >
                                        <div className="font-medium text-zinc-800">
                                          {item.product_name || "Sản phẩm điện thoại"}{" "}
                                          <span className="text-zinc-400 font-mono">
                                            (x{item.quantity})
                                          </span>
                                        </div>
                                        <div className="font-mono text-zinc-600">
                                          {formatMoney(item.subtotal || item.price * item.quantity)}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-zinc-400 text-xs italic">
                                    Không có thông tin chi tiết mặt hàng
                                  </div>
                                )}
                              </div>

                              <div className="text-[11px] text-zinc-500 flex flex-wrap items-center justify-between gap-2 pt-1">
                                <div>
                                  <b>Thanh toán:</b> {order.payment_method?.toUpperCase()} (
                                  {order.payment_status === "paid" ? "Đã thanh toán" : "Chưa thanh toán"})
                                </div>
                                <div>
                                  <b>Giao đến:</b> {order.shipping_address || "Tại cửa hàng"}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-zinc-200 bg-zinc-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailModal({ open: false, loading: false, user: null })}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-xl transition"
              >
                Đóng chi tiết
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: THÊM / SỬA TÀI KHOẢN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-zinc-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
              <h3 className="font-extrabold text-zinc-900 text-sm">
                {editingId ? "Cập nhật tài khoản người dùng" : "Thêm tài khoản người dùng mới"}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center text-xs"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 text-xs">
              {modalError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-zinc-700 font-bold mb-1">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-bold mb-1">
                  Email đăng nhập <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs outline-none focus:border-zinc-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-bold mb-1">
                  Mật khẩu {editingId && <span className="text-zinc-400 font-normal">(bỏ trống nếu không đổi)</span>}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  placeholder={editingId ? "••••••••" : "Tối thiểu 6 ký tự"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs outline-none focus:border-zinc-900 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs outline-none focus:border-zinc-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Vai trò</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs outline-none focus:border-zinc-900"
                  >
                    <option value="customer">Khách hàng</option>
                    <option value="manager">Quản lý (Manager)</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-bold mb-1">Địa chỉ</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-bold mb-1">Trạng thái tài khoản</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs outline-none focus:border-zinc-900"
                >
                  <option value={1}>1 - Hoạt động bình thường</option>
                  <option value={0}>0 - Khóa tài khoản (Chặn đăng nhập & mua hàng)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 font-bold rounded-lg text-zinc-700 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-lg transition disabled:opacity-50"
                >
                  {modalSubmitting ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Tạo tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÓA MỀM */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-zinc-200 space-y-4 shadow-xl">
            <h3 className="font-extrabold text-zinc-900 text-sm">Chuyển vào thùng rác?</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Bạn có chắc chắn muốn chuyển tài khoản <b>{deleteModal.user?.name}</b> ({deleteModal.user?.email}) vào thùng rác không?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, user: null, submitting: false })}
                className="px-3 py-1.5 border border-zinc-200 text-xs font-semibold rounded-lg text-zinc-700 hover:bg-zinc-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteModal.submitting}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-2xs disabled:opacity-50"
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
