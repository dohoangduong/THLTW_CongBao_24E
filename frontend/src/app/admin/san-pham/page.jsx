/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useCallback } from "react";
import axiosClient from "@/services/axiosClient";
import { formatVND, parseVND, numberToVietnameseWords } from "@/utils/numberToWords";
import {
  SmartphoneIcon,
  PlusIcon,
  RefreshIcon,
  EditIcon,
  TrashIcon,
  AlertCircleIcon,
  XIcon,
} from "@/components/Icons";

const FALLBACK_IMAGE = "/images/default-phone.svg";

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
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    sale_price: "",
    description: "",
    category_id: "",
    brand_id: "",
    stock: "",
    status: 1,
    image: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Dependencies for form
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const fetchProducts = useCallback((page) => {
    setLoading(true);
    axiosClient
      .get(`/products?page=${page}&per_page=15&admin=1`)
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
    fetchProducts(currentPage);
  }, [currentPage, fetchProducts]);

  useEffect(() => {
    axiosClient
      .get("/categories?all=1")
      .then((res) => {
        const data = res.data || res;
        setCategories(Array.isArray(data) ? data : data.data || []);
      })
      .catch((err) => console.error("Failed to load categories", err));

    axiosClient
      .get("/brands?all=1")
      .then((res) => {
        const data = res.data || res;
        setBrands(Array.isArray(data) ? data : data.data || []);
      })
      .catch((err) => console.error("Failed to load brands", err));
  }, []);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name || "",
        price: parseVND(product.price),
        sale_price: parseVND(product.sale_price),
        description: product.description || "",
        category_id: product.category_id || "",
        brand_id: product.brand_id || "",
        stock: product.stock ?? "",
        status: product.status !== undefined ? Number(product.status) : 1,
        image: product.image || "",
      });
      setSelectedFile(null);
      if (product.image) {
        setPreviewUrl(
          product.image.startsWith("http")
            ? product.image
            : `http://localhost:8000${product.image.startsWith("/") ? "" : "/"}${product.image}`
        );
      } else {
        setPreviewUrl(null);
      }
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        price: "",
        sale_price: "",
        description: "",
        category_id: "",
        brand_id: "",
        stock: "",
        status: 1,
        image: "",
      });
      setSelectedFile(null);
      setPreviewUrl(null);
    }
    setModalError(null);
    setIsModalOpen(true);
  };

  const handlePriceKeyDown = (e) => {
    const allowed = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Home",
      "End",
    ];
    if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePriceChange = (e, field) => {
    const rawVal = parseVND(e.target.value);
    setFormData((prev) => ({
      ...prev,
      [field]: rawVal,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Upload ảnh sản phẩm lên /api/upload-image kèm kiểm tra client-side nghiêm ngặt
  const handleProductImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Kiểm tra định dạng phía client (PNG hoặc JPG/JPEG)
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      alert("Chỉ chấp nhận file ảnh định dạng PNG hoặc JPG/JPEG!");
      e.target.value = "";
      return;
    }

    // 2. Kiểm tra dung lượng phía client (Tối đa 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("Dung lượng ảnh vượt quá giới hạn cho phép (Tối đa 10MB)!");
      e.target.value = "";
      return;
    }

    setIsUploadingImage(true);
    try {
      const uploadData = new FormData();
      uploadData.append("image", file);

      const res = await axiosClient.post("/upload-image", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.success && res.url) {
        setFormData((prev) => ({ ...prev, image: res.url }));
        setPreviewUrl(res.url);
        setSelectedFile(null); // Đã có link trực tiếp từ API upload
      } else {
        alert(res.message || "Tải ảnh không thành công!");
      }
    } catch (err) {
      console.error("Lỗi khi tải ảnh sản phẩm:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.image?.[0] ||
        "Không thể kết nối đến máy chủ để tải ảnh. Vui lòng thử lại!";
      alert("Lỗi: " + msg);
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: "",
      price: "",
      sale_price: "",
      description: "",
      category_id: "",
      brand_id: "",
      stock: "",
      status: 1,
      image: "",
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setEditingId(null);
    setModalError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);

    if (
      formData.sale_price !== "" &&
      formData.sale_price !== null &&
      Number(formData.sale_price) >= Number(formData.price)
    ) {
      const msg = "Giá khuyến mãi không được lớn hơn hoặc bằng giá gốc";
      setModalError(msg);
      alert("Lỗi: " + msg);
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("price", formData.price);
      if (formData.sale_price !== "" && formData.sale_price !== null) {
        payload.append("sale_price", formData.sale_price);
      }
      if (formData.description) payload.append("description", formData.description);
      if (formData.category_id !== "" && formData.category_id !== null) {
        payload.append("category_id", formData.category_id);
      }
      if (formData.brand_id !== "" && formData.brand_id !== null) {
        payload.append("brand_id", formData.brand_id);
      }
      if (formData.stock !== "" && formData.stock !== null) {
        payload.append("stock", formData.stock);
      }
      payload.append("status", formData.status !== undefined ? formData.status : 1);

      if (selectedFile) {
        payload.append("image", selectedFile);
      } else if (formData.image) {
        payload.append("image", formData.image);
      }

      if (editingId) {
        payload.append("_method", "PUT");
        await axiosClient.post(`/products/${editingId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosClient.post("/products", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      handleCloseModal();
      fetchProducts(currentPage);
    } catch (err) {
      setModalError(err.message);
      alert("Lỗi: " + err.message);
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
      alert("Lỗi: " + err.message);
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
    <div className="space-y-6">
      {/* Top Header & Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-zinc-900 tracking-tight">Quản lý sản phẩm điện thoại</h2>
          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
            CẤU HÌNH THIẾT BỊ • BẢNG GIÁ • QUẢN LÝ KHO HÀNG
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-3.5 py-2 rounded-lg text-xs shadow-2xs transition flex items-center gap-1.5"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>Thêm sản phẩm</span>
          </button>
          <button
            type="button"
            onClick={() => fetchProducts(currentPage)}
            className="bg-white hover:bg-zinc-50 text-zinc-700 font-semibold px-3 py-2 rounded-lg border border-zinc-200 text-xs shadow-2xs transition flex items-center gap-1.5"
          >
            <RefreshIcon className="w-3.5 h-3.5" />
            <span>Tải lại</span>
          </button>
        </div>
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
            Đang tải dữ liệu sản phẩm từ máy chủ...
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs space-y-2">
            <SmartphoneIcon className="w-8 h-8 text-zinc-400 mx-auto" />
            <p className="font-semibold text-zinc-700">Không tìm thấy sản phẩm nào trong cơ sở dữ liệu.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead className="bg-zinc-50/80 text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-200 font-mono">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">ID</th>
                  <th className="py-3 px-4 w-14 text-center">Ảnh</th>
                  <th className="py-3 px-4">Tên sản phẩm</th>
                  <th className="py-3 px-4">Danh mục</th>
                  <th className="py-3 px-4">Thương hiệu</th>
                  <th className="py-3 px-4 text-right">Giá bán</th>
                  <th className="py-3 px-4 text-right">Giá KM</th>
                  <th className="py-3 px-4 text-center">Tồn kho</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-center w-28">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {products.map((product) => {
                  const imgSrc = product.image
                    ? product.image.startsWith("http")
                      ? product.image
                      : `http://localhost:8000${product.image.startsWith("/") ? "" : "/"}${product.image}`
                    : FALLBACK_IMAGE;

                  return (
                    <tr key={product.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-2.5 px-4 text-center font-mono text-zinc-400">{product.id}</td>
                      <td className="py-2.5 px-4 text-center">
                        <div className="w-9 h-9 rounded-lg bg-zinc-50 border border-zinc-200 p-0.5 flex items-center justify-center mx-auto overflow-hidden">
                          <img
                            src={imgSrc}
                            alt={product.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = FALLBACK_IMAGE;
                            }}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-zinc-900">{product.name}</div>
                        {product.sku && (
                          <span className="text-[10px] text-zinc-400 font-mono">SKU: {product.sku}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-zinc-600">{product.category?.name || "—"}</td>
                      <td className="py-2.5 px-4 font-medium text-zinc-600">{product.brand?.name || "—"}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-zinc-900 tabular-nums">
                        {product.price ? Number(product.price).toLocaleString("vi-VN") + " ₫" : "Liên hệ"}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-extrabold text-rose-600 tabular-nums">
                        {product.sale_price ? Number(product.sale_price).toLocaleString("vi-VN") + " ₫" : "—"}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            (product.stock ?? 0) > 0 ? "bg-zinc-100 text-zinc-800" : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {product.stock ?? 0}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {/* Dot Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${
                            Number(product.status) === 1
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-zinc-100 text-zinc-600 border-zinc-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              Number(product.status) === 1 ? "bg-emerald-500" : "bg-zinc-400"
                            }`}
                          />
                          <span>{Number(product.status) === 1 ? "Hiện" : "Ẩn"}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenModal(product)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-medium transition flex items-center gap-1"
                          >
                            <EditIcon className="w-3.5 h-3.5" />
                            <span>Sửa</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmDelete(product.id)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-2 py-1 rounded-md text-xs font-medium transition flex items-center gap-1"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                            <span>Xóa</span>
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
              Hiển thị <b>{products.length}</b> sản phẩm (Trang <b>{meta.current_page || currentPage}</b> /{" "}
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

      {/* MODAL: THÊM / SỬA SẢN PHẨM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-zinc-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
              <h3 className="font-extrabold text-zinc-900 text-sm">
                {editingId ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center text-xs"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 font-semibold rounded-lg flex items-center gap-2">
                  <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="font-bold text-zinc-700 block">Tên sản phẩm *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-zinc-900"
                    placeholder="VD: iPhone 16 Pro Max 256GB..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-700 block">Danh mục</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-zinc-900"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-700 block">Thương hiệu</label>
                  <select
                    value={formData.brand_id}
                    onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-zinc-900"
                  >
                    <option value="">-- Chọn thương hiệu --</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-700 block">Giá bán gốc (VNĐ) *</label>
                  <input
                    type="text"
                    required
                    value={formatVND(formData.price)}
                    onKeyDown={handlePriceKeyDown}
                    onChange={(e) => handlePriceChange(e, "price")}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-zinc-900"
                    placeholder="30.000.000"
                  />
                  {formData.price && (
                    <span className="text-[10px] text-zinc-400 italic block font-sans">
                      {numberToVietnameseWords(formData.price)}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-700 block">Giá khuyến mãi (VNĐ)</label>
                  <input
                    type="text"
                    value={formatVND(formData.sale_price)}
                    onKeyDown={handlePriceKeyDown}
                    onChange={(e) => handlePriceChange(e, "sale_price")}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-zinc-900 text-rose-600 font-bold"
                    placeholder="28.000.000"
                  />
                  {formData.sale_price && (
                    <span className="text-[10px] text-zinc-400 italic block font-sans">
                      {numberToVietnameseWords(formData.sale_price)}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-700 block">Số lượng tồn kho</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-zinc-900"
                    placeholder="10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-700 block">Trạng thái hiển thị</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-zinc-900"
                  >
                    <option value={1}>Hiển thị (Bán công khai)</option>
                    <option value={0}>Ẩn (Tạm ngưng bán)</option>
                  </select>
                </div>

                <div className="col-span-2 space-y-1.5">
                  <label className="font-bold text-zinc-700 block">Mô tả sản phẩm</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-xs outline-none focus:border-zinc-900"
                    placeholder="Mô tả cấu hình và tính năng sản phẩm..."
                  />
                </div>

                <div className="col-span-2 space-y-1.5">
                  <label className="font-bold text-zinc-700 block">Hình ảnh sản phẩm</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      value={formData.image || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ ...formData, image: val });
                        setPreviewUrl(val || null);
                      }}
                      placeholder="Nhập đường dẫn URL ảnh (https://...) hoặc tải ảnh từ máy tính"
                      className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs outline-none focus:border-zinc-900"
                    />
                    <label className={`px-3 py-2 rounded-lg border border-zinc-300 font-mono text-xs font-semibold cursor-pointer shrink-0 transition inline-flex items-center justify-center gap-1.5 ${isUploadingImage ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' : 'bg-white hover:bg-zinc-100 text-zinc-800 shadow-2xs'}`}>
                      <span>📁</span>
                      <span>{isUploadingImage ? "Đang tải ảnh lên..." : "Tải ảnh sản phẩm từ máy (PNG/JPG ≤ 10MB)"}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        disabled={isUploadingImage}
                        onChange={handleProductImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Chấp nhận file định dạng PNG hoặc JPG/JPEG, dung lượng tối đa 10MB.
                  </p>
                  {previewUrl && (
                    <div className="mt-2 w-20 h-20 rounded-xl border border-zinc-200 bg-zinc-50 p-1.5 overflow-hidden flex items-center justify-center relative shadow-xs">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain mx-auto"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 flex justify-end gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-4 py-2 rounded-lg text-xs transition"
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu sản phẩm"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold px-4 py-2 rounded-lg text-xs transition"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: XÁC NHẬN XÓA MỀM */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-zinc-200 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <TrashIcon className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-zinc-900 text-sm">Xóa sản phẩm</h3>
              <p className="text-xs text-zinc-500">
                Sản phẩm sẽ được chuyển vào <b>Thùng rác</b> và tạm thời ẩn khỏi trang bán hàng. Bạn có thể khôi phục lại bất kỳ lúc nào.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 rounded-lg text-xs transition"
              >
                {isSubmitting ? "Đang xóa..." : "Đồng ý xóa"}
              </button>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
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
