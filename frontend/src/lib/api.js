import axiosClient from "@/services/axiosClient";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
export const TOKEN_KEY = "access_token";

export const getToken = () =>
  typeof window === "undefined"
    ? null
    : localStorage.getItem("token") || localStorage.getItem(TOKEN_KEY);

export const setToken = (t) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem("token", t);
  }
};

export const clearToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

/* ---------- Gọi API dựa trên axiosClient ---------- */
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function api(path, { method = "GET", body } = {}) {
  try {
    const m = method.toLowerCase();
    let res;
    if (m === "get") {
      res = await axiosClient.get(path);
    } else if (m === "post") {
      res = await axiosClient.post(path, body);
    } else if (m === "put") {
      res = await axiosClient.put(path, body);
    } else if (m === "delete") {
      res = await axiosClient.delete(path, { data: body });
    } else if (m === "patch") {
      res = await axiosClient.patch(path, body);
    } else {
      res = await axiosClient.request({ url: path, method, data: body });
    }

    return res;
  } catch (err) {
    const message = err.message || "Lỗi kết nối máy chủ";
    throw new ApiError(message, err.status);
  }
}

/* ---------- Hiển thị định dạng ---------- */
export const money = (v) =>
  Number(v || 0).toLocaleString("vi-VN") + " ₫";

export const dateVN = (s) => {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleString("vi-VN");
  } catch {
    return s;
  }
};

export const ORDER_STATUS = {
  pending: { label: "Chờ xác nhận", cls: "bg-amber-100 text-amber-900 border border-amber-300" },
  confirmed: { label: "Đã xác nhận", cls: "bg-blue-100 text-blue-900 border border-blue-300" },
  processing: { label: "Đang chuẩn bị", cls: "bg-indigo-100 text-indigo-900 border border-indigo-300" },
  shipping: { label: "Đang giao hàng", cls: "bg-cyan-100 text-cyan-900 border border-cyan-300" },
  completed: { label: "Hoàn thành", cls: "bg-emerald-100 text-emerald-900 border border-emerald-300" },
  cancelled: { label: "Đã hủy", cls: "bg-red-100 text-red-900 border border-red-300" },
};

export const PAYMENT_METHOD = {
  cod: "Thanh toán khi nhận hàng (COD)",
  bank_transfer: "Chuyển khoản ngân hàng",
  momo: "Ví điện tử MoMo",
  vnpay: "Cổng thanh toán VNPay",
};

export const PAYMENT_STATUS = {
  pending: { label: "Chưa thanh toán", cls: "text-amber-700 bg-amber-50" },
  paid: { label: "Đã thanh toán", cls: "text-emerald-700 bg-emerald-50" },
  failed: { label: "Thanh toán lỗi", cls: "text-red-700 bg-red-50" },
  refunded: { label: "Đã hoàn tiền", cls: "text-gray-700 bg-gray-50" },
};

