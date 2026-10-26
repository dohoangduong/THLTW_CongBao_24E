import Link from "next/link";
import { discountPercent, finalPrice, money, type Product } from "@/lib/shop";

interface Props {
  product: Product;
  onAdd: (p: Product) => void;
  adding?: boolean;
  /** Nhãn góc phải, ví dụ "Mới" hoặc "Hot" */
  tag?: { text: string; cls: string } | null;
}

export default function ProductCard({ product: p, onAdd, adding = false, tag = null }: Props) {
  const pct = discountPercent(p);
  const out = (p.stock ?? 1) <= 0;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-md">
      <Link href={`/products/${p.id}`} className="relative grid aspect-square place-items-center bg-slate-100 p-4">
        {p.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-contain" />
        ) : (
          <span className="text-sm text-slate-400">Chưa có ảnh</span>
        )}
        {pct > 0 && (
          <span className="absolute left-3 top-3 rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
            -{pct}%
          </span>
        )}
        {tag && (
          <span className={`absolute right-3 top-3 rounded-md px-2 py-0.5 text-xs font-bold ${tag.cls}`}>
            {tag.text}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-slate-500">{p.brand?.name ?? "Điện thoại"}</p>
        <Link href={`/products/${p.id}`} className="mt-0.5 line-clamp-2 min-h-[2.75rem] font-semibold leading-snug hover:text-blue-600">
          {p.name}
        </Link>

        <div className="mt-2">
          <p className="text-lg font-extrabold text-red-600">{money(finalPrice(p))}</p>
          {pct > 0 && <p className="text-sm text-slate-400 line-through">{money(p.price)}</p>}
        </div>

        <p className={`mt-1 text-xs ${out ? "text-red-600" : "text-emerald-700"}`}>
          {out ? "Tạm hết hàng" : p.stock !== undefined ? `Còn ${p.stock} máy` : "Còn hàng"}
        </p>

        <button
          onClick={() => onAdd(p)}
          disabled={out || adding}
          className="mt-3 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {out ? "Hết hàng" : adding ? "Đang thêm…" : "Thêm vào giỏ"}
        </button>
      </div>
    </article>
  );
}
