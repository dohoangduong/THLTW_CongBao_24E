"use client";

import { useState, useEffect, useCallback } from "react";
import axiosClient from "@/services/axiosClient";

const ROLE_LABELS = {
  admin: { label: "Quản trị viên (Admin)", cls: "bg-[#fce8e6] text-[#c5221f] border-[#c5221f]" },
  manager: { label: "Quản lý (Manager)", cls: "bg-[#fef7e0] text-[#b06000] border-[#b06000]" },
  customer: { label: "Khách hàng (Customer)", cls: "bg-[#e8f0fe] text-[#1a73e8] border-[#1a73e8]" },
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
      // Nếu là manager thì không cho gọi API
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

  // Mở modal thêm mới hoặc sửa
  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingId(user.id);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "", // Để trống nếu không muốn đổi
        phone: user.phone || "",
        address: user.address || "",
        role: user.role || "customer",
        status: user.status ? 1 : 0,
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
    setEditingId(null);
    setModalError(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalSubmitting(true);
    setModalError(null);

    try {
      const payload = { ...formData };
      if (editingId && !payload.password) {
        delete payload.password;
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

  // Khóa / Mở khóa nhanh
  const handleToggleStatus = async (user) => {
    const newStatus = user.status ? 0 : 1;
    if (!confirm(`Bạn có chắc muốn ${newStatus ? "mở khóa" : "khóa"} tài khoản ${user.email}?`)) return;

    try {
      await axiosClient.put(`/admin/users/${user.id}`, { status: newStatus });
      fetchUsers(currentPage);
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  // Xóa mềm
  const handleOpenDelete = (user) => {
    if (currentUser?.id === user.id) {
      alert("Cảnh báo: Bạn không thể tự xóa tài khoản của chính mình!");
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

  // KIỂM TRA PHÂN QUYỀN: Nếu tài khoản là manager -> Chặn truy cập hiển thị thông báo Retro
  if (currentUser?.role === "manager") {
    return (
      <div className="p-4 space-y-4">
        <div className="border-2 border-red-700 bg-red-100 p-6 text-red-900 text-center font-bold text-xs space-y-2">
          <div className="text-3xl">🛑</div>
          <div className="text-sm font-black uppercase tracking-wider">
            TRUY CẬP BỊ TỪ CHỐI (ACCESS DENIED)
          </div>
          <p className="font-normal text-gray-800 max-w-lg mx-auto">
            Tài khoản hiện tại có vai trò <b>Quản lý (Manager)</b>. Theo chính sách phân quyền bảo mật của hệ thống,
            Quản lý chỉ có quyền xem và xử lý Đơn hàng, <b>tuyệt đối không được phép can thiệp vào Module Quản lý Người dùng</b>.
          </p>
          <p className="text-[11px] text-gray-600 font-mono">
            Vui lòng đăng nhập bằng tài khoản <b>Quản trị viên (Super Admin)</b> để tiếp tục.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Header & Toolbar Retro */}
      <div className="border-b-2 border-black pb-2 flex flex-wrap justify-between items-center bg-[#d4d0c8] p-2 gap-2">
        <div>
          <h1 className="text-base font-bold text-black uppercase tracking-wide">
            QUẢN LÝ NGƯỜI DÙNG & TÀI KHOẢN (USERS)
          </h1>
          <p className="text-xs text-gray-700">
            Quản lý danh sách tài khoản, phân quyền Quản trị viên, Quản lý, Khách hàng và trạng thái khóa/mở.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="retro-btn font-bold text-black"
          >
            + Thêm người dùng mới
          </button>
          <button
            type="button"
            onClick={() => fetchUsers(currentPage)}
            className="retro-btn"
          >
            Tải lại danh sách
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-2 border-red-700 text-red-900 p-2 text-xs font-mono">
          <b>Lỗi hệ thống:</b> {error}
        </div>
      )}

      {/* Retro Filter Bar */}
      <div className="border border-[#808080] bg-[#ece9d8] p-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <span>Tìm kiếm:</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tên người dùng, email, SĐT..."
            className="retro-input px-2 py-0.5 w-56 text-xs"
          />
          <button type="submit" className="retro-btn text-xs font-bold !py-0.5">
            Tìm
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="retro-btn text-xs !py-0.5 text-gray-600"
            >
              Xóa tìm
            </button>
          )}
        </form>

        <div className="flex items-center gap-2">
          <span>Lọc vai trò:</span>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="retro-input px-2 py-0.5 text-xs font-bold"
          >
            <option value="">-- Tất cả vai trò --</option>
            <option value="admin">Quản trị viên (Admin)</option>
            <option value="manager">Quản lý (Manager)</option>
            <option value="customer">Khách hàng (Customer)</option>
          </select>
        </div>
      </div>

      {/* Bảng danh sách người dùng Retro */}
      {loading ? (
        <div className="p-8 text-center text-black bg-[#ece9d8] border border-black">
          <b>Đang tải dữ liệu người dùng từ Database... Vui lòng đợi.</b>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="retro-table">
            <thead>
              <tr>
                <th className="w-10 text-center">ID</th>
                <th>Họ và tên</th>
                <th>Địa chỉ Email</th>
                <th>Số điện thoại</th>
                <th className="text-center w-28">Vai trò</th>
                <th className="text-center w-20">Đơn hàng</th>
                <th className="text-center w-24">Trạng thái</th>
                <th className="text-center w-36">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-4 text-center text-gray-700 bg-[#f9f9f9]">
                    Không tìm thấy người dùng nào trong cơ sở dữ liệu.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td className="text-center font-mono">{u.id}</td>
                    <td className="font-bold">{u.name}</td>
                    <td className="font-mono text-gray-800">{u.email}</td>
                    <td>{u.phone || <span className="text-gray-400">---</span>}</td>
                    <td className="text-center whitespace-nowrap">
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-bold border ${
                          ROLE_LABELS[u.role]?.cls || "bg-gray-100 text-gray-800 border-gray-400"
                        }`}
                      >
                        {ROLE_LABELS[u.role]?.label ? u.role.toUpperCase() : u.role}
                      </span>
                    </td>
                    <td className="text-center font-bold">{u.orders_count ?? 0}</td>
                    <td className="text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u)}
                        className={`px-1.5 py-0.5 text-[10px] font-bold border cursor-pointer ${
                          u.status
                            ? "bg-[#e6f4ea] text-[#137333] border-[#137333]"
                            : "bg-[#fce8e6] text-[#c5221f] border-[#c5221f]"
                        }`}
                        title="Bấm để đổi trạng thái khóa/mở"
                      >
                        {u.status ? "Hoạt động" : "Đã khóa"}
                      </button>
                    </td>
                    <td className="text-center whitespace-nowrap space-x-1">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(u)}
                        className="retro-btn !py-0.5 text-[11px] font-bold text-[#0a246a]"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u)}
                        className="retro-btn !py-0.5 text-[11px]"
                      >
                        {u.status ? "Khóa" : "Mở"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDelete(u)}
                        className="retro-btn !py-0.5 text-[11px] text-red-700"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Retro Pagination */}
      {meta && (
        <div className="border border-[#808080] bg-[#ece9d8] p-1.5 flex flex-wrap justify-between items-center text-xs">
          <div>
            Hiển thị <b>{users.length}</b> người dùng (Trang <b>{meta.current_page || currentPage}</b> /{" "}
            <b>{meta.last_page || 1}</b> - Tổng: <b>{meta.total || users.length}</b> tài khoản)
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="retro-btn !py-0.5"
            >
              « Trang trước
            </button>
            {Array.from({ length: meta.last_page || 1 }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === meta.last_page || Math.abs(p - currentPage) <= 2)
              .map((p, idx, arr) => (
                <span key={p} className="flex items-center">
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-gray-500">...</span>}
                  <button
                    type="button"
                    onClick={() => handlePageChange(p)}
                    className={
                      p === currentPage
                        ? "retro-btn font-bold bg-[#0a246a] text-white !py-0.5"
                        : "retro-btn !py-0.5"
                    }
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              type="button"
              disabled={!meta || currentPage >= (meta.last_page || 1)}
              onClick={() => handlePageChange(currentPage + 1)}
              className="retro-btn !py-0.5"
            >
              Trang sau »
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: THÊM / SỬA NGƯỜI DÙNG (RETRO WINDOW)
          ========================================================================= */}
      {isModalOpen && (
        <div className="retro-modal-backdrop">
          <div className="retro-modal w-[500px] max-w-[95vw]">
            <div className="retro-titlebar">
              <span className="font-bold">
                {editingId ? `CẬP NHẬT THÔNG TIN NGƯỜI DÙNG (#${editingId})` : "THÊM NGƯỜI DÙNG MỚI"}
              </span>
              <button
                type="button"
                onClick={handleCloseModal}
                className="retro-btn font-bold !py-0 !px-1.5 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-3 bg-[#ece9d8] space-y-3 text-xs">
              {modalError && (
                <div className="p-2 bg-red-100 border border-red-700 text-red-900 font-bold whitespace-pre-line">
                  {modalError}
                </div>
              )}

              <div className="border border-[#808080] bg-white p-2.5 space-y-2">
                <div>
                  <label className="block font-bold text-black mb-1">
                    Họ và tên: <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="retro-input w-full p-1 text-xs"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="block font-bold text-black mb-1">
                    Địa chỉ Email: <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="retro-input w-full p-1 text-xs font-mono"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block font-bold text-black mb-1">
                    Mật khẩu {editingId ? "(Để trống nếu không đổi):" : <span className="text-red-700">*</span>}
                  </label>
                  <input
                    type="password"
                    required={!editingId}
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="retro-input w-full p-1 text-xs font-mono"
                    placeholder={editingId ? "Nhập mật khẩu mới nếu muốn đổi" : "Tối thiểu 6 ký tự"}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-black mb-1">Số điện thoại:</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="retro-input w-full p-1 text-xs"
                      placeholder="0912345678"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-black mb-1">
                      Vai trò (Phân quyền): <span className="text-red-700">*</span>
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="retro-input w-full p-1 text-xs font-bold"
                    >
                      <option value="customer">Khách hàng (customer)</option>
                      <option value="manager">Quản lý (manager)</option>
                      <option value="admin">Quản trị viên (admin)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-black mb-1">Địa chỉ:</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="retro-input w-full p-1 text-xs"
                    placeholder="Địa chỉ giao hàng"
                  />
                </div>

                <div>
                  <label className="block font-bold text-black mb-1">Trạng thái:</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
                    className="retro-input w-full p-1 text-xs"
                  >
                    <option value={1}>1 - Đang hoạt động bình thường</option>
                    <option value={0}>0 - Khóa tài khoản (Vô hiệu hóa)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="retro-btn font-bold text-black"
                >
                  {modalSubmitting ? "Đang lưu..." : editingId ? "Cập nhật tài khoản" : "Tạo người dùng"}
                </button>
                <button type="button" onClick={handleCloseModal} className="retro-btn">
                  Hủy bỏ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: XÁC NHẬN XÓA MỀM (RETRO ALERT DIALOG)
          ========================================================================= */}
      {deleteModal.open && (
        <div className="retro-modal-backdrop">
          <div className="retro-modal w-96">
            <div className="retro-titlebar">
              <span className="font-bold">XÁC NHẬN XÓA TÀI KHOẢN</span>
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, user: null, submitting: false })}
                className="retro-btn font-bold !py-0 !px-1.5 text-xs"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-[#ece9d8] text-xs space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  Bạn có chắc muốn xóa tài khoản:
                  <br />
                  <b>{deleteModal.user?.name}</b> ({deleteModal.user?.email})?
                  <br />
                  <span className="text-gray-600">
                    Tài khoản sẽ được chuyển vào <b>Thùng rác</b> và có thể khôi phục lại bất kỳ lúc nào.
                  </span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#808080]">
                <button
                  type="button"
                  disabled={deleteModal.submitting}
                  onClick={handleDeleteConfirm}
                  className="retro-btn font-bold text-red-700"
                >
                  {deleteModal.submitting ? "Đang xóa..." : "Đồng ý xóa"}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteModal({ open: false, user: null, submitting: false })}
                  className="retro-btn"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
