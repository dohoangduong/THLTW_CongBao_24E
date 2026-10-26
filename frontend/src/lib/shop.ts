import { API_URL, money } from "./api";

export { money };

/* ---------- Kiểu dữ liệu (khớp ProductResource / BrandResource / CategoryResource) ---------- */
export interface Brand {
  id: number;
  name: string;
  slug?: string;
  image?: string | null;
  status?: number;
}
export interface Category {
  id: number;
  name: string;
  slug?: string;
  image?: string | null;
  parent_id?: number | null;
  children?: Category[];
}
export interface Product {
  id: number;
  name: string;
  slug?: string;
  description?: string | null;
  image?: string | null; // URL đầy đủ (backend đã đổi từ đường dẫn lưu trong DB)
  price: number | string;
  sale_price?: number | string | null;
  stock?: number;
  views?: number;
  status?: number;
  featured?: boolean;
  category_id?: number;
  brand_id?: number;
  category?: { id: number; name: string; slug?: string } | null;
  brand?: { id: number; name: string; slug?: string } | null;
}
export interface HomeData {
  new: Product[];
  sale: Product[];
  hot: Product[];
}
export interface PageResult<T> {
  items: T[];
  page: number;
  lastPage: number;
  total: number;
}

export type ProductFilter = "" | "new" | "sale" | "hot";
export type SortKey = "newest" | "price-asc" | "price-desc" | "popular";

/* ---------- Giá ---------- */
export const finalPrice = (p: Product) =>
  p.sale_price && Number(p.sale_price) > 0 && Number(p.sale_price) < Number(p.price)
    ? Number(p.sale_price)
    : Number(p.price);

export const discountPercent = (p: Product) => {
  const f = finalPrice(p);
  const o = Number(p.price);
  return f < o ? Math.round(((o - f) / o) * 100) : 0;
};

/* ---------- Gọi API công khai (không cần đăng nhập) ---------- */
async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`${path} trả về ${res.status}`);
  return res.json();
}

// Laravel Resource trả { data: [...] }, còn lại trả mảng thẳng
export async function getList<T>(path: string): Promise<T[]> {
  const json = await getJson<T[] | { data?: T[] }>(path);
  return Array.isArray(json) ? json : (json.data ?? []);
}

export const getHome = (limit = 8) => getJson<HomeData>(`/home?limit=${limit}`);

export async function getProduct(id: string | number): Promise<Product> {
  const json = await getJson<{ data: Product }>(`/products/${id}`);
  return json.data;
}

export async function getProducts(
  params: Record<string, string | number | null | undefined>
): Promise<PageResult<Product>> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  });
  // Paginate của Laravel Resource: { data, links, meta: { current_page, last_page, total } }
  const json = await getJson<{
    data: Product[];
    meta?: { current_page: number; last_page: number; total: number };
    current_page?: number;
    last_page?: number;
    total?: number;
  }>(`/products?${qs}`);
  const meta = json.meta ?? json;
  return {
    items: json.data ?? [],
    page: meta.current_page ?? 1,
    lastPage: meta.last_page ?? 1,
    total: meta.total ?? json.data?.length ?? 0,
  };
}
