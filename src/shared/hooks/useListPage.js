import { useState, useEffect, useCallback, useMemo } from "react";

/**
 * Shared hook for list pages (Staff, Courses, Rooms, Students).
 * Handles: search (debounced), sort, pagination, loading, data normalization.
 *
 * @param {Object}   opts
 * @param {Function} opts.fetchFn   - (page, limit, search, sortColumn, sortDirection) => axios promise
 * @param {number}   [opts.limit=6] - items per page
 */
export default function useListPage({ fetchFn, limit = 6 }) {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [sortColumn, setSortColumn] = useState("");
    const [sortDirection, setSortDirection] = useState("ascending");
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

    // ── Debounce search ──────────────────────────────────────── 
    useEffect(() => {
        const t = setTimeout(() => {
            if (search !== debouncedSearch) {
                setDebouncedSearch(search);
                setPage(1);
            }
        }, 500);
        return () => clearTimeout(t);
    }, [search, debouncedSearch]);

    // ── Fetch data ─────────────────────────────────────────────
    const reload = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetchFn(page, limit, debouncedSearch, sortColumn, sortDirection);
            const raw = res.data;
            let list, total, pages;

            if (Array.isArray(raw)) {
                list = raw; total = raw.length; pages = 1;
            } else {
                list = raw?.items ?? raw?.data ?? raw?.value ?? [];
                total = raw?.totalCount ?? raw?.total ?? raw?.count ?? list.length;
                pages = raw?.totalPages ?? raw?.pages ?? Math.ceil(total / limit) ?? 1;
            }

            setItems(Array.isArray(list) ? list : []);
            setTotalCount(total);
            setTotalPages(pages || 1);
        } catch (err) {
            console.error("Fetch failed:", err);
        } finally {
            setIsLoading(false);
        }
    }, [fetchFn, page, limit, debouncedSearch, sortColumn, sortDirection]);

    useEffect(() => { reload(); }, [reload]);

    // ── Pagination helpers ─────────────────────────────────────
    const from = totalCount === 0 ? 0 : (page - 1) * limit + 1;
    const to = Math.min(page * limit, totalCount);

    const pageNumbers = useMemo(() => {
        const pgs = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pgs.push(i);
        } else {
            pgs.push(1);
            if (page > 3) pgs.push("...");
            const s = Math.max(2, page - 1);
            const e = Math.min(totalPages - 1, page + 1);
            for (let i = s; i <= e; i++) { if (!pgs.includes(i)) pgs.push(i); }
            if (page < totalPages - 2) pgs.push("...");
            if (!pgs.includes(totalPages)) pgs.push(totalPages);
        }
        return pgs;
    }, [page, totalPages]);

    // ── Sort handlers ──────────────────────────────────────────
    const handleSort = useCallback((column) => {
        if (sortColumn === column) {
            setSortDirection(prev => prev === "ascending" ? "descending" : "ascending");
        } else {
            setSortColumn(column);
            setSortDirection("ascending");
        }
        setSortDropdownOpen(false);
        setPage(1);
    }, [sortColumn]);

    const clearSort = useCallback(() => {
        setSortColumn("");
        setSortDirection("ascending");
        setSortDropdownOpen(false);
        setPage(1);
    }, []);

    // ── Optimistic update helper ───────────────────────────────
    const updateItem = useCallback((predicate, updater) => {
        setItems(prev => prev.map(item => predicate(item) ? updater(item) : item));
    }, []);

    return {
        // Data
        items, setItems, isLoading,
        // Search
        search, setSearch,
        // Pagination
        page, setPage, totalCount, totalPages, from, to, pageNumbers, limit,
        // Sort
        sortColumn, sortDirection, sortDropdownOpen, setSortDropdownOpen,
        handleSort, clearSort,
        // Actions
        reload, updateItem,
    };
}
