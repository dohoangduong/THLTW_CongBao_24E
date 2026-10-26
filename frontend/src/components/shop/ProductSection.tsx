import type { Product } from "@/lib/shop";
import ProductCard from "./ProductCard";

interface Props {
  title: string;
  subtitle: string;
  badge: string; // màu tiêu đề
  items: Product[];
  loading: boolean;
  addingId: number | null;
  onAdd: (p: Product) => void;
  onViewAll: () => void;
  tag?: { text: string; cls: string } | null;
}

/** Một mục trên trang chủ: "Sản phẩm mới", "Đang giảm giá", "Nổi bật"… */
export default function ProductSection({ title, subtitle, badge, items, loading, addingId, onAdd, onViewAll, tag }: Props) {
  if (!loading && items.length === 0) return null;

  return (
    <section className="mt-12" aria-label={title}>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className={`text-2xl font-extrabold ${badge}`}>{title}</h2>
          <p className="text-sm text-slate-600">{subtitle}</p>
        </div>
        <button onClick={onViewAll} className="shrink-0 text-sm font-semibold text-blue-600 hover:underline">
          Xem tất cả →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-200" />)
          : items.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} onAdd={onAdd} adding={addingId === p.id} tag={tag} />
            ))}
      </div>
    </section>
  );
}
