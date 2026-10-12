"use client";

import ResourceManager, { Field, FormState, StatusBadge } from "@/components/ResourceManager";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  status: number | boolean;
  products_count?: number;
}

const fields: Field[] = [
  { key: "name", label: "Tên danh mục", type: "text", required: true },
  { key: "slug", label: "Đường dẫn (slug)", type: "text", hint: "Để trống sẽ tự tạo từ tên" },
  { key: "image", label: "Link ảnh đại diện", type: "text", full: true },
  { key: "description", label: "Mô tả", type: "textarea" },
  { key: "status", label: "Đang hiển thị", type: "checkbox" },
];

const blank: FormState = { name: "", slug: "", image: "", description: "", status: true };

export default function AdminCategories() {
  return (
    <ResourceManager<Category>
      title="Quản lý danh mục"
      noun="danh mục"
      endpoint="/admin/categories"
      fields={fields}
      blank={blank}
      toForm={(c) => ({
        name: c.name,
        slug: c.slug ?? "",
        image: c.image ?? "",
        description: c.description ?? "",
        status: Boolean(c.status),
      })}
      columns={[
        {
          label: "Danh mục",
          render: (c) => (
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-slate-500">{c.slug}</p>
            </div>
          ),
        },
        { label: "Số sản phẩm", render: (c) => c.products_count ?? 0 },
        { label: "Trạng thái", render: (c) => <StatusBadge on={c.status} /> },
      ]}
    />
  );
}
