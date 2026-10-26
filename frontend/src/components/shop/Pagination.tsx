interface Props {
  page: number;
  lastPage: number;
  onChange: (page: number) => void;
}

// Tạo dãy trang rút gọn: 1 … 4 5 [6] 7 8 … 20
function pageList(page: number, last: number): (number | "…")[] {
  const set = new Set<number>([1, last, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((n) => set.add(n));
  if (page >= last - 2) [last - 1, last - 2, last - 3].forEach((n) => set.add(n));
  const nums = [...set].filter((n) => n >= 1 && n <= last).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
}

export default function Pagination({ page, lastPage, onChange }: Props) {
  if (lastPage <= 1) return null;

  const base =
    "grid h-10 min-w-10 place-items-center rounded-lg border px-3 text-sm font-medium transition-colors";
  const idle = "border-slate-300 bg-white text-slate-700 hover:border-slate-900";

  return (
    <nav aria-label="Phân trang" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <button
        className={`${base} ${idle} disabled:cursor-not-allowed disabled:opacity-40`}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        ← Trước
      </button>

      {pageList(page, lastPage).map((n, i) =>
        n === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-slate-400">…</span>
        ) : (
          <button
            key={n}
            aria-current={n === page ? "page" : undefined}
            className={`${base} ${n === page ? "border-slate-900 bg-slate-900 text-white" : idle}`}
            onClick={() => onChange(n)}
          >
            {n}
          </button>
        )
      )}

      <button
        className={`${base} ${idle} disabled:cursor-not-allowed disabled:opacity-40`}
        disabled={page >= lastPage}
        onClick={() => onChange(page + 1)}
      >
        Sau →
      </button>
    </nav>
  );
}
