import React from "react";
import { Search, ArrowUpDown, ChevronDown, Plus, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function DataListLayout({
    title,
    subtitle,
    list,
    sortOptions = [],
    onAdd,
    addLabel,
    emptyMessage,
    loadingMessage,
    renderItem,
    extraToolbar,
    searchPlaceholder,
}) {
    const { t } = useTranslation();
    const {
        items, isLoading,
        search, setSearch,
        page, setPage, totalCount, totalPages, from, to, pageNumbers,
        sortColumn, sortDirection, sortDropdownOpen, setSortDropdownOpen,
        handleSort, clearSort,
    } = list;

    const finalAddLabel = addLabel || t("common.add");
    const finalEmptyMessage = emptyMessage || t("common.noItems");
    const finalLoadingMessage = loadingMessage || t("app.loading");
    const finalSearchPlaceholder = searchPlaceholder || t("common.search");

    const sortLabel = sortOptions.find(o => o.value === sortColumn)?.label ?? sortColumn;

    return (
        <div className="space-y-4">
            {/* ── Page Header ─────────────────────────────────────── */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
                {subtitle && <p className="text-slate-400 text-sm mt-0.5">{subtitle}</p>}
            </div>

            {/* ── Toolbar ─────────────────────────────────────────── */}
            <div className="flex items-center gap-3 flex-wrap">
                {/* Search */}
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        id="datalist-search"
                        name="search"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={finalSearchPlaceholder}
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring transition"
                    />
                </div>

                {/* Add button */}
                {onAdd && (
                    <button
                        onClick={onAdd}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-2 text-text text-md font-semibold hover:bg-gray-2/70 transition flex-shrink-0"
                    >
                        <Plus className="h-4 w-4" /> {finalAddLabel}
                    </button>
                )}

                {/* Sort dropdown */}
                {sortOptions.length > 0 && (
                    <div className="relative">
                        <button
                            onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border transition-all duration-200 text-sm font-semibold
                                ${sortColumn
                                    ? "bg-indigo-50 border-indigo-200 text-text shadow-sm"
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                        >
                            <ArrowUpDown className={`h-4 w-4 ${sortColumn ? "text-text" : ""}`} />
                            {sortColumn ? `${t("common.sortedBy")}: ${sortLabel}` : t("common.sortBy")}
                            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${sortDropdownOpen ? "rotate-180" : ""}`} />
                        </button>

                        {sortDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setSortDropdownOpen(false)} />
                                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-100 shadow-xl z-20 overflow-hidden py-1 animate-in fade-in zoom-in duration-200">
                                    {sortOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleSort(opt.value)}
                                            className={`w-full text-start px-4 py-2.5 text-sm transition-colors flex items-center justify-between
                                                ${sortColumn === opt.value ? "bg-gray-1 text-text font-semibold" : "text-text hover:bg-gray-1/50"}`}
                                        >
                                            {opt.label}
                                            {sortColumn === opt.value && (
                                                <ArrowUpDown className={`h-3.5 w-3.5 ${sortDirection === "descending" ? "rotate-180" : ""} transition-transform`} />
                                            )}
                                        </button>
                                    ))}
                                    {sortColumn && (
                                        <div className="border-t border-slate-50 mt-1">
                                            <button
                                                onClick={clearSort}
                                                className="w-full text-start px-4 py-2.5 text-sm text-dashed-bg2 hover:bg-dashed-bg1 transition-colors"
                                            >
                                                {t("common.clearSort")}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {extraToolbar}
            </div>

            {/* ── List Container ───────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
                        <Loader2 className="h-7 w-7 animate-spin" />
                        <p className="text-sm">{finalLoadingMessage}</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="py-24 text-center text-slate-400 text-sm">{finalEmptyMessage}</div>
                ) : (
                    <>
                        <div className="divide-y divide-slate-50">
                            {items.map((item, index) => (
                                <React.Fragment key={index}>
                                    {renderItem(item, index)}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* ── Pagination ───────────────────────────────── */}
                        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 text-xs text-slate-500">
                            <span>{t("common.showingEntries", { from, to, totalCount })}</span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
                                >‹</button>

                                {pageNumbers.map((pg, i) =>
                                    pg === "..." ? (
                                        <span key={`ellipsis-${i}`} className="w-7 text-center">…</span>
                                    ) : (
                                        <button
                                            key={pg}
                                            onClick={() => setPage(pg)}
                                            className={`w-7 h-7 flex items-center justify-center rounded-lg font-semibold transition-colors ${page === pg
                                                ? "bg-gray-2 text-white"
                                                : "hover:bg-slate-100 text-slate-600"
                                            }`}
                                        >
                                            {pg}
                                        </button>
                                    )
                                )}

                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
                                >›</button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
