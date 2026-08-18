import { useCallback, useMemo, useState } from "react";

export function usePagination<T>(items: T[], defaultSize = 10) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(defaultSize);
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / size) || 1);
  const safePage = Math.min(page, pages);

  const slice = useMemo(() => {
    const start = (safePage - 1) * size;
    return items.slice(start, start + size);
  }, [items, safePage, size]);

  const changeSize = useCallback((next: number) => {
    setSize(next);
    setPage(1);
  }, []);

  const reset = useCallback(() => setPage(1), []);

  return {
    page: safePage,
    setPage,
    size,
    setSize: changeSize,
    pages,
    total,
    slice,
    reset,
  };
}

export function PaginationBar({
  page,
  pages,
  total,
  size,
  setPage,
  setSize,
  noun = "rows",
}: {
  page: number;
  pages: number;
  total: number;
  size: number;
  setPage: (n: number) => void;
  setSize: (n: number) => void;
  noun?: string;
}) {
  if (total === 0) return null;
  const from = (page - 1) * size + 1;
  const to = Math.min(page * size, total);
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-white px-4 py-3">
      <div className="text-[11px] text-muted">
        Showing <b className="text-navy">{from}–{to}</b> of <b className="text-navy">{total}</b> {noun}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="rounded-full border border-line px-2 py-1 text-[11px]"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
        >
          {[...new Set([6, 8, 10, 25, 50, size])].sort((a, b) => a - b).map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
        <button type="button" className="btn text-[11px]" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>
        {nums.map((n, i) => {
          const prev = nums[i - 1];
          return (
            <span key={n} className="contents">
              {prev && n - prev > 1 && <span className="px-1 text-[11px] text-muted">…</span>}
              <button
                type="button"
                className={`min-w-7 rounded-full px-2 py-1 text-[11px] font-semibold ${n === page ? "bg-navy text-white" : "border border-line text-navy"}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            </span>
          );
        })}
        <button type="button" className="btn text-[11px]" disabled={page >= pages} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
