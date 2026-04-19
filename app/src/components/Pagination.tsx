import { useEffect, useMemo, useState } from 'react';
import { Icon } from './Icon';

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export type PageSize = typeof PAGE_SIZE_OPTIONS[number];

interface UsePaginationArgs<T> {
  items: T[] | null | undefined;
  initialPageSize?: PageSize;
  /** Any value that should reset the page to 1 when it changes (e.g. a filter key). */
  resetKey?: string | number;
}

export interface Pagination {
  page: number;
  pageSize: PageSize;
  pageCount: number;
  total: number;
  setPage: (p: number) => void;
  setPageSize: (s: PageSize) => void;
}

// Paginate a full in-memory list. For server-side pagination, swap the slice
// for an API call and keep the same public shape.
export function usePagination<T>({ items, initialPageSize = 10, resetKey }: UsePaginationArgs<T>): {
  pageItems: T[] | null;
  pagination: Pagination;
} {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(initialPageSize);

  // Reset to page 1 when the upstream filter changes.
  useEffect(() => { setPage(1); }, [resetKey]);

  const total = items?.length ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(page, pageCount);

  const pageItems = useMemo(() => {
    if (!items) return null;
    const start = (clampedPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, clampedPage, pageSize]);

  return {
    pageItems,
    pagination: {
      page: clampedPage,
      pageSize,
      pageCount,
      total,
      setPage: (p: number) => setPage(Math.max(1, Math.min(p, pageCount))),
      setPageSize: (s: PageSize) => { setPageSize(s); setPage(1); },
    },
  };
}

interface PaginationBarProps {
  pagination: Pagination;
  /** Singular/plural label for the total ("trip" / "trips"). */
  label?: [singular: string, plural: string];
  showPageSize?: boolean;
}

export function PaginationBar({ pagination, label = ['item', 'items'], showPageSize = true }: PaginationBarProps) {
  const { page, pageCount, pageSize, total, setPage, setPageSize } = pagination;
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  // Build visible page list with an ellipsis if there are many pages.
  const pages = useMemo<(number | '…')[]>(() => {
    if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
    const out: (number | '…')[] = [1];
    const start = Math.max(2, page - 1);
    const end = Math.min(pageCount - 1, page + 1);
    if (start > 2) out.push('…');
    for (let i = start; i <= end; i++) out.push(i);
    if (end < pageCount - 1) out.push('…');
    out.push(pageCount);
    return out;
  }, [page, pageCount]);

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap mt-4">
      <div className="sr-small">
        <strong className="text-ink">{from}</strong>–<strong className="text-ink">{to}</strong> of{' '}
        <strong className="text-ink">{total}</strong> {total === 1 ? label[0] : label[1]}
      </div>

      <div className="flex items-center gap-2">
        {showPageSize && (
          <label className="inline-flex items-center gap-2 text-[12px] text-ink-3">
            <span className="sr-eyebrow">Per page</span>
            <select
              className="sr-input py-1 px-2"
              style={{ padding: '6px 10px', fontSize: 13 }}
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value) as PageSize)}
            >
              {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        )}

        <nav className="inline-flex items-center gap-1" aria-label="Pagination">
          <button
            className="sr-btn sr-btn--secondary sr-btn--sm"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <Icon name="chevron-right" size={13} style={{ transform: 'rotate(180deg)' }} />
            <span className="hidden sm:inline">Prev</span>
          </button>

          <div className="hidden sm:inline-flex items-center gap-0.5 mx-1">
            {pages.map((p, i) => p === '…' ? (
              <span key={`e${i}`} className="px-2 text-ink-4">…</span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                aria-current={p === page ? 'page' : undefined}
                className={`w-8 h-8 rounded text-[13px] font-medium transition
                  ${p === page ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-surface-2'}`}
              >{p}</button>
            ))}
          </div>

          <span className="sm:hidden font-mono text-[12px] text-ink-3 px-2">
            {page} / {pageCount}
          </span>

          <button
            className="sr-btn sr-btn--secondary sr-btn--sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= pageCount}
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <Icon name="chevron-right" size={13} />
          </button>
        </nav>
      </div>
    </div>
  );
}
