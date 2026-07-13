'use client';

import { useMemo, useState } from 'react';

export interface PaginatedSearch<T> {
  query: string;
  setQuery: (q: string) => void;
  page: number;
  setPage: (p: number) => void;
  pageItems: T[];
  filtered: T[];
  total: number;
  totalPages: number;
  /** 1-indexed index of the first item on the current page (0 when empty). */
  from: number;
  /** 1-indexed index of the last item on the current page. */
  to: number;
  pageSize: number;
}

interface Options<T> {
  pageSize?: number;
  /** Return the string fields an item should be matched against. */
  searchFields?: (item: T) => Array<string | null | undefined>;
}

/**
 * Client-side search + pagination for in-memory lists.
 * Default page size is 10 (the app-wide "show 10, then next 10" convention).
 * Changing the query resets to page 1; the page is always clamped to a valid range.
 */
export function usePaginatedSearch<T>(items: T[], opts: Options<T> = {}): PaginatedSearch<T> {
  const pageSize = opts.pageSize ?? 10;
  const { searchFields } = opts;
  const [query, setQueryRaw] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !searchFields) return items;
    return items.filter((item) =>
      searchFields(item).some((field) => (field ?? '').toString().toLowerCase().includes(q))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, query]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  function setQuery(q: string) {
    setQueryRaw(q);
    setPage(1);
  }

  return {
    query,
    setQuery,
    page: safePage,
    setPage,
    pageItems,
    filtered,
    total,
    totalPages,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, total),
    pageSize,
  };
}
