"use client";

import ResourceManager, { Field, FormState, StatusBadge } from "@/components/ResourceManager";

interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  status: number | boolean;
  products_count?: number;
}

const fields: Field[] = [
  { key: "name", label: "Tên thương hiệu", type: "text", required: true },
  { key: "slug", label: "Đường dẫn (slug)", type: "text", hint: "Để trống sẽ tự tạo từ tên" },
  { key: "image", label: "Link ảnh logo", type: "text", full: true },
  { key: "description", label: "Mô tả", type: "textarea" },
  { key: "status", label: "Đang hiển thị", type: "checkbox" },
];

const blank: FormState = { name: "", slug: "", image: "", description: "", status: true };

export default function AdminBrands() {
  return (
    <ResourceManager<Brand>
      title="Quản lý thương hiệu"
      noun="thương hiệu"
      endpoint="/admin/brands"
      fields={fields}
      blank={blank}
      toForm={(b) => ({
        name: b.name,
        slug: b.slug ?? "",
        image: b.image ?? "",
        description: b.description ?? "",
        status: Boolean(b.status),
      })}
      columns={[
        {
          label: "Thương hiệu",
          render: (b) => (
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100">
                {b.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.image} alt={b.name} className="h-full w-full object-contain" />
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </div>
              <div>
                <p className="font-medium">{b.name}</p>
                <p className="text-xs text-slate-500">{b.slug}</p>
              </div>
            </div>
          ),
        },
        { label: "Số sản phẩm", render: (b) => b.products_count ?? 0 },
        { label: "Trạng thái", render: (b) => <StatusBadge on={b.status} /> },
      ]}
    />
  );
}
