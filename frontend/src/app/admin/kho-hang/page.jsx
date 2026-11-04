"use client";
import React, { useState, useEffect, useCallback } from "react";
import axiosClient from "@/services/axiosClient";
import {
  WarehouseIcon,
  SearchIcon,
  PlusIcon,
  RefreshCwIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  PackageIcon,
} from "@/components/Icons";

export default function AdminStockPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("inventory"); // "inventory" | "movements"

  // KPI stats
  const [stats, setStats] = useState({
    total_products: 0,
    low_stock_count: 0,
    out_of_stock_count: 0,
    total_imported: 0,
    total_exported: 0,
    total_inventory_items: 0,
  });

  // Tab 1: Inventory state
  const [inventory, setInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryFilter, setInventoryFilter] = useState("all"); // "all" | "low_stock" | "out_of_stock"
  const [inventoryPage, setInventoryPage] = useState(1);
  const [inventoryMeta, setInventoryMeta] = useState(null);

  // Tab 2: Movements state
  const [movements, setMovements] = useState([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [movementSearch, setMovementSearch] = useState("");
  const [movementType, setMovementType] = useState("all"); // "all" | "import" | "export"
  const [movementPage, setMovementPage] = useState(1);
  const [movementMeta, setMovementMeta] = useState(null);

  // Product list for import/export selectors
  const [allProducts, setAllProducts] = useState([]);

  // Modals state
  const [importModal, setImportModal] = useState({
    open: false,
    productId: "",
    quantity: 1,
    unitCost: 0,
    supplier: "",
    note: "",
    submitting: false,
    error: null,
  });

  const [exportModal, setExportModal] = useState({
    open: false,
    productId: "",
    quantity: 1,
    reason: "Xuất trả nhà cung cấp",
    note: "",
    submitting: false,
    error: null,
  });

  // Alerts
  const [alertMsg, setAlertMsg] = useState(null);

  const showAlert = (message, type = "success") => {
    setAlertMsg({ message, type });
    setTimeout(() => setAlertMsg(null), 5000);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch KPI Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await axiosClient.get("/admin/stock/stats");
      if (res.data) setStats(res.data);
      else if (res.total_products !== undefined) setStats(res);
    } catch (err) {
      console.error("Lỗi tải thống kê kho:", err);
    }
  }, []);

  // Fetch Products for dropdown
  const fetchProductsList = useCallback(async () => {
    try {
      const res = await axiosClient.get("/products?per_page=100");
      const list = res.data?.data || res.data || [];
      setAllProducts(list);
    } catch (err) {
      console.error("Lỗi tải danh mục sản phẩm:", err);
    }
  }, []);

  // Fetch Inventory
  const fetchInventory = useCallback(async (page = 1) => {
    setInventoryLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      if (inventorySearch.trim()) params.append("search", inventorySearch.trim());
      if (inventoryFilter !== "all") params.append("stock_status", inventoryFilter);

      const res = await axiosClient.get(`/admin/stock/inventory?${params.toString()}`);
      const data = res.data?.data || res.data || [];
      setInventory(data);
      setInventoryMeta({
        current_page: res.data?.current_page || res.current_page || 1,
        last_page: res.data?.last_page || res.last_page || 1,
        total: res.data?.total || res.total || 0,
      });
    } catch (err) {
      console.error("Lỗi tải danh sách tồn kho:", err);
    } finally {
      setInventoryLoading(false);
    }
  }, [inventorySearch, inventoryFilter]);

  // Fetch Movements
  const fetchMovements = useCallback(async (page = 1) => {
    setMovementsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      if (movementSearch.trim()) params.append("search", movementSearch.trim());
      if (movementType !== "all") params.append("type", movementType);

      const res = await axiosClient.get(`/admin/stock/movements?${params.toString()}`);
      const data = res.data?.data || res.data || [];
      setMovements(data);
      setMovementMeta({
        current_page: res.data?.current_page || res.current_page || 1,
        last_page: res.data?.last_page || res.last_page || 1,
        total: res.data?.total || res.total || 0,
      });
    } catch (err) {
      console.error("Lỗi tải lịch sử biến động kho:", err);
    } finally {
      setMovementsLoading(false);
    }
  }, [movementSearch, movementType]);

  useEffect(() => {
    if (mounted) {
      fetchStats();
      fetchProductsList();
    }
  }, [mounted, fetchStats, fetchProductsList]);

  useEffect(() => {
    if (mounted) {
      if (activeTab === "inventory") {
        fetchInventory(inventoryPage);
      } else {
        fetchMovements(movementPage);
      }
    }
  }, [mounted, activeTab, inventoryPage, movementPage, fetchInventory, fetchMovements]);

  // Handle Import Submit
  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importModal.productId) {
      setImportModal((prev) => ({ ...prev, error: "Vui lòng chọn sản phẩm cần nhập kho!" }));
      return;
    }
    if (Number(importModal.quantity) <= 0) {
      setImportModal((prev) => ({ ...prev, error: "Số lượng nhập phải lớn hơn 0!" }));
      return;
    }

    setImportModal((prev) => ({ ...prev, submitting: true, error: null }));
    try {
      const payload = {
        product_id: Number(importModal.productId),
        quantity: Number(importModal.quantity),
        unit_cost: Number(importModal.unitCost) || 0,
        supplier: importModal.supplier || "Nhà cung cấp đối tác",
        note: importModal.note || "",
      };
      await axiosClient.post("/admin/stock/import", payload);
      setImportModal({
        open: false,
        productId: "",
        quantity: 1,
        unitCost: 0,
        supplier: "",
        note: "",
        submitting: false,
        error: null,
      });
      showAlert("Tạo phiếu nhập kho và cập nhật số lượng tồn thành công!");
      fetchStats();
      fetchInventory(inventoryPage);
      if (activeTab === "movements") fetchMovements(1);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Lỗi tạo phiếu nhập kho!";
      setImportModal((prev) => ({ ...prev, submitting: false, error: msg }));
    }
  };

  // Handle Export Submit
  const handleExportSubmit = async (e) => {
    e.preventDefault();
    if (!exportModal.productId) {
      setExportModal((prev) => ({ ...prev, error: "Vui lòng chọn sản phẩm cần xuất kho!" }));
      return;
    }
    if (Number(exportModal.quantity) <= 0) {
      setExportModal((prev) => ({ ...prev, error: "Số lượng xuất phải lớn hơn 0!" }));
      return;
    }

    setExportModal((prev) => ({ ...prev, submitting: true, error: null }));
    try {
      const payload = {
        product_id: Number(exportModal.productId),
        quantity: Number(exportModal.quantity),
        reason: exportModal.reason || "Xuất trả nhà cung cấp",
        note: exportModal.note || "",
      };
      await axiosClient.post("/admin/stock/export", payload);
      setExportModal({
        open: false,
        productId: "",
        quantity: 1,
        reason: "Xuất trả nhà cung cấp",
        note: "",
        submitting: false,
        error: null,
      });
      showAlert("Tạo phiếu xuất kho và trừ tồn kho thành công!");
      fetchStats();
      fetchInventory(inventoryPage);
      if (activeTab === "movements") fetchMovements(1);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Lỗi tạo phiếu xuất kho!";
      setExportModal((prev) => ({ ...prev, submitting: false, error: msg }));
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <WarehouseIcon className="w-6 h-6 text-zinc-900" />
            <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight">
              Quản lý Kho hàng & Tồn kho
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1 font-mono">
            Theo dõi tồn kho thực tế, nhập kho hàng loạt & lịch sử biến động xuất nhập tồn
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setImportModal({
                open: true,
                productId: allProducts[0]?.id || "",
                quantity: 1,
                unitCost: 0,
                supplier: "",
                note: "",
                submitting: false,
                error: null,
              });
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 shadow-sm transition"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Tạo phiếu nhập hàng</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setExportModal({
                open: true,
                productId: allProducts[0]?.id || "",
                quantity: 1,
                reason: "Xuất trả nhà cung cấp",
                note: "",
                submitting: false,
                error: null,
              });
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-zinc-300 text-zinc-900 text-xs font-bold hover:bg-zinc-50 shadow-2xs transition"
          >
            <TrendingDownIcon className="w-4 h-4 text-rose-600" />
            <span>Tạo phiếu xuất kho</span>
          </button>
        </div>
      </div>

      {/* ALERT NOTIFICATION */}
      {alertMsg && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs animate-in fade-in duration-200 ${
            alertMsg.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {alertMsg.type === "error" ? (
              <AlertCircleIcon className="w-4 h-4 text-rose-600" />
            ) : (
              <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
            )}
            <span className="font-semibold">{alertMsg.message}</span>
          </div>
          <button
            onClick={() => setAlertMsg(null)}
            className="p-1 hover:bg-black/5 rounded-md transition"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng sản phẩm trong kho */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[11px] font-mono uppercase text-zinc-500 font-bold">
              Tổng SKU trong kho
            </p>
            <h3 className="text-2xl font-extrabold text-zinc-900 font-mono tabular-nums mt-1">
              {stats.total_products || stats.total_inventory_items || 0}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Sản phẩm đang quản lý</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
            <PackageIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Cảnh báo sắp hết (stock <= 5) */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[11px] font-mono uppercase text-amber-700 font-bold">
              Sắp hết hàng (≤ 5)
            </p>
            <h3 className="text-2xl font-extrabold text-amber-600 font-mono tabular-nums mt-1">
              {stats.low_stock_count || 0}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Cần nhập bổ sung gấp</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertCircleIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Lượng nhập kho tích lũy */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[11px] font-mono uppercase text-emerald-700 font-bold">
              Lượng nhập tích lũy
            </p>
            <h3 className="text-2xl font-extrabold text-emerald-700 font-mono tabular-nums mt-1">
              +{stats.total_imported || 0}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Tổng số lượng đã nhập</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUpIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Lượng xuất kho tích lũy */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[11px] font-mono uppercase text-rose-700 font-bold">
              Lượng xuất tích lũy
            </p>
            <h3 className="text-2xl font-extrabold text-rose-700 font-mono tabular-nums mt-1">
              -{stats.total_exported || 0}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Xuất bán & xuất trả</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
            <TrendingDownIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-zinc-200 gap-6 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("inventory")}
          className={`pb-3 border-b-2 transition ${
            activeTab === "inventory"
              ? "border-zinc-900 text-zinc-900 font-extrabold"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          Tồn kho hiện tại & Báo động
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("movements")}
          className={`pb-3 border-b-2 transition ${
            activeTab === "movements"
              ? "border-zinc-900 text-zinc-900 font-extrabold"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          Lịch sử biến động xuất nhập tồn
        </button>
      </div>

      {/* TAB 1: TỒN KHO THỰC TẾ */}
      {activeTab === "inventory" && (
        <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
          {/* SEARCH & FILTERS */}
          <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row gap-3 justify-between items-center bg-zinc-50/50">
            <div className="relative w-full sm:w-80">
              <SearchIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên sản phẩm, mã SKU..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setInventoryPage(1);
                    fetchInventory(1);
                  }
                }}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={inventoryFilter}
                onChange={(e) => {
                  setInventoryFilter(e.target.value);
                  setInventoryPage(1);
                }}
                className="text-xs bg-white border border-zinc-200 rounded-lg px-3 py-1.5 font-medium text-zinc-700 focus:outline-hidden focus:border-zinc-900"
              >
                <option value="all">Tất cả trạng thái kho</option>
                <option value="low_stock">Sắp hết hàng (Tồn ≤ 5)</option>
                <option value="out_of_stock">Đã hết hàng (Tồn = 0)</option>
              </select>

              <button
                type="button"
                onClick={() => fetchInventory(inventoryPage)}
                className="p-1.5 border border-zinc-200 rounded-lg bg-white hover:bg-zinc-100 text-zinc-600 transition"
                title="Làm mới"
              >
                <RefreshCwIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-mono">
                <tr>
                  <th className="py-3 px-4 font-bold">Mã / Sản phẩm</th>
                  <th className="py-3 px-4 font-bold">Danh mục</th>
                  <th className="py-3 px-4 font-bold">Giá niêm yết</th>
                  <th className="py-3 px-4 font-bold text-center">Tồn kho hiện tại</th>
                  <th className="py-3 px-4 font-bold text-center">Trạng thái kho</th>
                  <th className="py-3 px-4 font-bold text-right">Thao tác nhanh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {inventoryLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-zinc-400 font-mono">
                      Đang tải dữ liệu tồn kho...
                    </td>
                  </tr>
                ) : inventory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-zinc-400 font-mono">
                      Không tìm thấy sản phẩm nào phù hợp
                    </td>
                  </tr>
                ) : (
                  inventory.map((item) => {
                    const stock = Number(item.stock || 0);
                    let badgeCls = "bg-emerald-50 text-emerald-700 border-emerald-200";
                    let badgeLabel = "Đủ tồn kho";
                    if (stock === 0) {
                      badgeCls = "bg-rose-50 text-rose-700 border-rose-200";
                      badgeLabel = "Hết hàng";
                    } else if (stock <= 5) {
                      badgeCls = "bg-amber-50 text-amber-700 border-amber-200";
                      badgeLabel = `Sắp hết (còn ${stock})`;
                    }

                    return (
                      <tr key={item.id} className="hover:bg-zinc-50/50 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-10 object-cover rounded-lg border border-zinc-200 bg-zinc-100"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 font-mono text-[10px]">
                                No img
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-zinc-900 line-clamp-1">{item.name}</p>
                              <p className="text-[10px] text-zinc-400 font-mono">ID: #{item.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-zinc-600">
                          {item.category?.name || "Chưa phân loại"}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-zinc-800">
                          {Number(item.price || 0).toLocaleString("vi-VN")} ₫
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-mono font-extrabold text-sm text-zinc-900">
                            {stock}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${badgeCls}`}
                          >
                            {badgeLabel}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setImportModal({
                                  open: true,
                                  productId: item.id,
                                  quantity: 1,
                                  unitCost: item.price ? Number(item.price) * 0.7 : 0,
                                  supplier: "",
                                  note: "",
                                  submitting: false,
                                  error: null,
                                });
                              }}
                              className="px-2 py-1 rounded-md bg-zinc-900 text-white font-medium text-[11px] hover:bg-zinc-800 transition"
                            >
                              + Nhập
                            </button>
                            <button
                              type="button"
                              disabled={stock === 0}
                              onClick={() => {
                                setExportModal({
                                  open: true,
                                  productId: item.id,
                                  quantity: 1,
                                  reason: "Xuất trả nhà cung cấp",
                                  note: "",
                                  submitting: false,
                                  error: null,
                                });
                              }}
                              className="px-2 py-1 rounded-md border border-zinc-200 bg-white text-zinc-800 font-medium text-[11px] hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                              - Xuất
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {inventoryMeta && inventoryMeta.last_page > 1 && (
            <div className="p-4 border-t border-zinc-200 flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-mono">
                Trang {inventoryMeta.current_page} / {inventoryMeta.last_page} (Tổng {inventoryMeta.total} SKU)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={inventoryPage <= 1}
                  onClick={() => setInventoryPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition"
                >
                  « Trước
                </button>
                {Array.from({ length: inventoryMeta.last_page }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setInventoryPage(p)}
                    className={`w-7 h-7 rounded-md font-bold text-xs transition ${
                      p === inventoryPage
                        ? "bg-zinc-900 text-white"
                        : "border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={inventoryPage >= inventoryMeta.last_page}
                  onClick={() => setInventoryPage((p) => Math.min(inventoryMeta.last_page, p + 1))}
                  className="px-2.5 py-1 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition"
                >
                  Sau »
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LỊCH SỬ BIẾN ĐỘNG KHO */}
      {activeTab === "movements" && (
        <div className="bg-white border border-zinc-200 rounded-xl shadow-2xs overflow-hidden">
          {/* SEARCH & FILTERS */}
          <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row gap-3 justify-between items-center bg-zinc-50/50">
            <div className="relative w-full sm:w-80">
              <SearchIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm mã phiếu NK/XK, lý do..."
                value={movementSearch}
                onChange={(e) => setMovementSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setMovementPage(1);
                    fetchMovements(1);
                  }
                }}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={movementType}
                onChange={(e) => {
                  setMovementType(e.target.value);
                  setMovementPage(1);
                }}
                className="text-xs bg-white border border-zinc-200 rounded-lg px-3 py-1.5 font-medium text-zinc-700 focus:outline-hidden focus:border-zinc-900"
              >
                <option value="all">Tất cả loại phiếu</option>
                <option value="import">Phiếu nhập kho (Import)</option>
                <option value="export">Phiếu xuất kho (Export)</option>
              </select>

              <button
                type="button"
                onClick={() => fetchMovements(movementPage)}
                className="p-1.5 border border-zinc-200 rounded-lg bg-white hover:bg-zinc-100 text-zinc-600 transition"
                title="Làm mới"
              >
                <RefreshCwIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-mono">
                <tr>
                  <th className="py-3 px-4 font-bold">Mã phiếu</th>
                  <th className="py-3 px-4 font-bold">Loại</th>
                  <th className="py-3 px-4 font-bold">Sản phẩm</th>
                  <th className="py-3 px-4 font-bold text-center">Số lượng</th>
                  <th className="py-3 px-4 font-bold text-center">Tồn trước ➔ sau</th>
                  <th className="py-3 px-4 font-bold">Đối tác / Lý do</th>
                  <th className="py-3 px-4 font-bold">Người tạo</th>
                  <th className="py-3 px-4 font-bold text-right">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {movementsLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-zinc-400 font-mono">
                      Đang tải lịch sử kho...
                    </td>
                  </tr>
                ) : movements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-zinc-400 font-mono">
                      Chưa có phiếu xuất nhập kho nào
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => {
                    const isImport = m.type === "import";
                    return (
                      <tr key={m.id} className="hover:bg-zinc-50/50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-zinc-900">
                          {m.code}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                              isImport
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {isImport ? "Nhập kho" : "Xuất kho"}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-zinc-900">
                          {m.product?.name || `Sản phẩm #${m.product_id}`}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          <span className={isImport ? "text-emerald-700" : "text-rose-700"}>
                            {isImport ? `+${m.quantity}` : `-${m.quantity}`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-zinc-600">
                          {m.stock_before} ➔{" "}
                          <strong className="text-zinc-900">{m.stock_after}</strong>
                        </td>
                        <td className="py-3 px-4 text-zinc-700">
                          <p className="line-clamp-1">{m.supplier_or_reason || "—"}</p>
                          {m.note && (
                            <p className="text-[10px] text-zinc-400 italic line-clamp-1">
                              {m.note}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-600">
                          {m.creator?.name || m.created_by || "Admin System"}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-zinc-500 text-[11px]">
                          {m.created_at ? new Date(m.created_at).toLocaleString("vi-VN") : "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {movementMeta && movementMeta.last_page > 1 && (
            <div className="p-4 border-t border-zinc-200 flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-mono">
                Trang {movementMeta.current_page} / {movementMeta.last_page} (Tổng {movementMeta.total} phiếu)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={movementPage <= 1}
                  onClick={() => setMovementPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition"
                >
                  « Trước
                </button>
                {Array.from({ length: movementMeta.last_page }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setMovementPage(p)}
                    className={`w-7 h-7 rounded-md font-bold text-xs transition ${
                      p === movementPage
                        ? "bg-zinc-900 text-white"
                        : "border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={movementPage >= movementMeta.last_page}
                  onClick={() => setMovementPage((p) => Math.min(movementMeta.last_page, p + 1))}
                  className="px-2.5 py-1 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition"
                >
                  Sau »
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: TẠO PHIẾU NHẬP HÀNG */}
      {importModal.open && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-zinc-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <PlusIcon className="w-4 h-4 text-zinc-900" />
                <h3 className="font-extrabold text-zinc-900 text-sm">
                  Lập phiếu nhập kho (Tăng số lượng tồn)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setImportModal((prev) => ({ ...prev, open: false }))}
                className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center text-xs"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="p-6 space-y-4 text-xs">
              {importModal.error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircleIcon className="w-4 h-4 shrink-0" />
                  <span>{importModal.error}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  Chọn sản phẩm nhập kho <span className="text-rose-500">*</span>
                </label>
                <select
                  value={importModal.productId}
                  onChange={(e) => setImportModal((prev) => ({ ...prev, productId: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-medium"
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {allProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id} - {p.name} (Tồn hiện tại: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Số lượng nhập <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={importModal.quantity}
                    onChange={(e) => setImportModal((prev) => ({ ...prev, quantity: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Đơn giá nhập (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={importModal.unitCost}
                    onChange={(e) => setImportModal((prev) => ({ ...prev, unitCost: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  Nhà cung cấp / Đối tác giao hàng
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Apple Authorized Distributor Vietnam"
                  value={importModal.supplier}
                  onChange={(e) => setImportModal((prev) => ({ ...prev, supplier: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Ghi chú phiếu nhập</label>
                <textarea
                  rows="2"
                  placeholder="Thông tin lô hàng, chứng từ kèm theo..."
                  value={importModal.note}
                  onChange={(e) => setImportModal((prev) => ({ ...prev, note: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setImportModal((prev) => ({ ...prev, open: false }))}
                  className="px-4 py-2 rounded-lg border border-zinc-200 bg-white font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={importModal.submitting}
                  className="px-4 py-2 rounded-lg bg-zinc-900 font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
                >
                  {importModal.submitting ? "Đang xử lý..." : "Xác nhận nhập kho"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TẠO PHIẾU XUẤT HÀNG */}
      {exportModal.open && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-zinc-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <TrendingDownIcon className="w-4 h-4 text-rose-600" />
                <h3 className="font-extrabold text-zinc-900 text-sm">
                  Lập phiếu xuất kho (Trừ số lượng tồn)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setExportModal((prev) => ({ ...prev, open: false }))}
                className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center text-xs"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExportSubmit} className="p-6 space-y-4 text-xs">
              {exportModal.error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircleIcon className="w-4 h-4 shrink-0" />
                  <span>{exportModal.error}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  Chọn sản phẩm xuất kho <span className="text-rose-500">*</span>
                </label>
                <select
                  value={exportModal.productId}
                  onChange={(e) => setExportModal((prev) => ({ ...prev, productId: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-medium"
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {allProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id} - {p.name} (Tồn hiện tại: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Số lượng xuất <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={exportModal.quantity}
                    onChange={(e) => setExportModal((prev) => ({ ...prev, quantity: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Lý do xuất kho <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={exportModal.reason}
                    onChange={(e) => setExportModal((prev) => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 font-medium"
                  >
                    <option value="Xuất trả nhà cung cấp">Xuất trả nhà cung cấp</option>
                    <option value="Xuất hủy hàng lỗi / hỏng">Xuất hủy hàng lỗi / hỏng</option>
                    <option value="Xuất chuyển kho chi nhánh">Xuất chuyển kho chi nhánh</option>
                    <option value="Xuất hàng mẫu trải nghiệm">Xuất hàng mẫu trải nghiệm</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Ghi chú chi tiết</label>
                <textarea
                  rows="2"
                  placeholder="Mô tả nguyên nhân xuất kho hoặc số biên bản..."
                  value={exportModal.note}
                  onChange={(e) => setExportModal((prev) => ({ ...prev, note: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setExportModal((prev) => ({ ...prev, open: false }))}
                  className="px-4 py-2 rounded-lg border border-zinc-200 bg-white font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={exportModal.submitting}
                  className="px-4 py-2 rounded-lg bg-rose-600 font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {exportModal.submitting ? "Đang xử lý..." : "Xác nhận xuất kho"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
