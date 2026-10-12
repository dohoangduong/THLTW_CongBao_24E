export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";
export const TOKEN_KEY = "access_token";

export const getToken = () =>
  typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

/* ---------- Kiểu dữ liệu dùng chung ---------- */
export interface UserInfo {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  role: "admin" | "customer";
  status: boolean | number;
  orders_count?: number;
}
export interface OrderDetail {
  id: number;
  product_id: number | null;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
}
export interface Order {
  id: number;
  order_code: string;
  customer_name: string;
  customer_email?: string | null;
  customer_phone: string;
  shipping_address: string;
  note?: string | null;
  subtotal: number;
  shipping_fee: number;
  total: number;
  payment_method: string;
  payment_status: string;
  status: string;
  created_at: string;
  details_count?: number;
  details?: OrderDetail[];
}
export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

/* ---------- Gọi API ---------- */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface Options {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
}

export async function api<T>(path: string, { method = "GET", body, auth = true }: Options = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Laravel trả lỗi validate dạng { errors: { field: [msg] } }
    const firstError = json.errors ? (Object.values(json.errors)[0] as string[])[0] : null;
    throw new ApiError(firstError ?? json.message ?? `Lỗi ${res.status}`, res.status);
  }
  return json as T;
}

/* ---------- Hiển thị ---------- */
export const money = (v: number | string) => Number(v).toLocaleString("vi-VN") + " ₫";
export const dateVN = (s: string) => new Date(s).toLocaleString("vi-VN");

export const ORDER_STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Chờ xác nhận", cls: "bg-amber-100 text-amber-900" },
  confirmed: { label: "Đã xác nhận", cls: "bg-blue-100 text-blue-900" },
  processing: { label: "Đang chuẩn bị hàng", cls: "bg-indigo-100 text-indigo-900" },
  shipping: { label: "Đang giao", cls: "bg-cyan-100 text-cyan-900" },
  completed: { label: "Hoàn thành", cls: "bg-emerald-100 text-emerald-900" },
  cancelled: { label: "Đã hủy", cls: "bg-red-100 text-red-900" },
};
export const PAYMENT_METHOD: Record<string, string> = {
  cod: "Thanh toán khi nhận hàng",
  bank_transfer: "Chuyển khoản ngân hàng",
  momo: "Ví MoMo",
  vnpay: "VNPay",
};
export const PAYMENT_STATUS: Record<string, string> = {
  pending: "Chưa thanh toán",
  paid: "Đã thanh toán",
  failed: "Thanh toán lỗi",
  refunded: "Đã hoàn tiền",
};
