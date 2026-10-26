"use client";

import { useEffect, useState } from "react";
import ResourceManager, { Field, FormState, Option, StatusBadge } from "@/components/ResourceManager";
import { api, money } from "@/lib/api";

interface Product {
  id: number;
  name: string;
  slug: string;
  sku?: string | null;
  description?: string | null;
  image?: string | null;
  image_url?: string | null;
  price: number | string;
  sale_price?: number | string | null;
  stock: number;
  status: number | boolean;
  featured: number | boolean;
  category_id: number;
  brand_id: number;
  category?: { id: number; name: string } | null;
  brand?: { id: number; name: string } | null;
}

interface Options {
  categories: { id: number; name: string }[];
  brands: { id: number; name: string }[];
}

const blank: FormState = {
  category_id: "",
  brand_id: "",
  name: "",
  sku: "",
  price: "",
  sale_price: "",
  stock: "0",
  description: "",
  status: true,
  featured: false,
};

export default function AdminProducts() {
  const [opts, setOpts] = useState<Options>({ categories: [], brands: [] });

  useEffect(() => {
    api<Options>("/admin/options").then(setOpts).catch(() => {});
  }, []);

  const categoryOptions: Option[] = opts.categories.map((c) => ({ value: c.id, label: c.name }));
  const brandOptions: Option[] = opts.brands.map((b) => ({ value: b.id, label: b.name }));

  const fields: Field[] = [
    { key: "name", label: "Tên sản phẩm", type: "text", required: true, full: true },
    { key: "category_id", label: "Danh mục", type: "select", required: true, options: categoryOptions },
    { key: "brand_id", label: "Thương hiệu", type: "select", required: true, options: brandOptions },
    { key: "price", label: "Giá gốc (₫)", type: "number", required: true },
    { key: "sale_price", label: "Giá khuyến mãi (₫)", type: "number", hint: "Để trống nếu không giảm giá, phải nhỏ hơn giá gốc" },
    { key: "stock", label: "Số lượng tồn kho", type: "number" },
    { key: "sku", label: "Mã SKU", type: "text" },
    { key: "image", label: "Ảnh sản phẩm", type: "image", full: true },
    { key: "description", label: "Mô tả", type: "textarea" },
    { key: "status", label: "Đang bán", type: "checkbox" },
    { key: "featured", label: "Sản phẩm nổi bật", type: "checkbox" },
  ];

  return (
    <ResourceManager<Product>
      title="Quản lý sản phẩm"
      noun="sản phẩm"
      endpoint="/admin/products"
      fields={fields}
      blank={blank}
      filters={[
        { key: "category_id", label: "Danh mục", options: categoryOptions },
        { key: "brand_id", label: "Hãng", options: brandOptions },
      ]}
      toForm={(p) => ({
        category_id: String(p.category_id),
        brand_id: String(p.brand_id),
        name: p.name,
        sku: p.sku ?? "",
        price: String(Number(p.price)),
        sale_price: p.sale_price ? String(Number(p.sale_price)) : "",
        stock: String(p.stock ?? 0),
        description: p.description ?? "",
        status: Boolean(p.status),
        featured: Boolean(p.featured),
      })}
      columns={[
        {
          label: "Sản phẩm",
          render: (p) => (
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100">
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt={p.name} className="h-full w-full object-contain" />
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-slate-500">{p.sku ?? "Chưa có SKU"}</p>
              </div>
            </div>
          ),
        },
        { label: "Hãng", render: (p) => p.brand?.name ?? "—" },
        { label: "Danh mục", render: (p) => p.category?.name ?? "—" },
        {
          label: "Giá",
          render: (p) =>
            p.sale_price && Number(p.sale_price) > 0 ? (
              <div>
                <p className="font-semibold text-red-600">{money(p.sale_price)}</p>
                <p className="text-xs text-slate-400 line-through">{money(p.price)}</p>
              </div>
            ) : (
              <p className="font-semibold">{money(p.price)}</p>
            ),
        },
        {
          label: "Tồn kho",
          render: (p) => <span className={p.stock <= 5 ? "font-semibold text-red-600" : ""}>{p.stock}</span>,
        },
        { label: "Trạng thái", render: (p) => <StatusBadge on={p.status} onText="Đang bán" offText="Ngừng bán" /> },
      ]}
    />
  );
}
