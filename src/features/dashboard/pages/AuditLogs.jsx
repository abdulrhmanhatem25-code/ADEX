import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
    History,
    Loader2,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    X,
    Calendar,
    User,
    Layers,
    Zap,
} from "lucide-react";
import { fetchAuditLogsApi } from "@/features/dashboard/services/auditLogsApi";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const actionBadge = (action) => {
    const map = {
        Added:    "bg-emerald-50 text-emerald-600 border-emerald-200",
        Updated:  "bg-blue-50 text-blue-600 border-blue-200",
        Deleted:  "bg-rose-50 text-rose-600 border-rose-200",
        Modified: "bg-amber-50 text-amber-600 border-amber-200",
    };
    return map[action] ?? "bg-slate-50 text-slate-600 border-slate-200";
};

const PAGE_SIZE = 15;

// ─────────────────────────────────────────────────────────────────────────────
// Audit Logs Page
// ─────────────────────────────────────────────────────────────────────────────
export default function AuditLogs() {
    const { t } = useTranslation();

    // Data
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Filters
    const [showFilters, setShowFilters] = useState(false);
    const [filterAction, setFilterAction] = useState("");
    const [filterEntity, setFilterEntity] = useState("");
    const [filterUserId, setFilterUserId] = useState("");
    const [filterFrom, setFilterFrom] = useState("");
    const [filterTo, setFilterTo] = useState("");

    const fetchLogs = useCallback(async (pageNum = 1) => {
        setIsLoading(true);
        try {
            const res = await fetchAuditLogsApi({
                PageNumber: pageNum,
                PageSize: PAGE_SIZE,
                Action: filterAction,
                EntityName: filterEntity,
                UserId: filterUserId,
                FromDate: filterFrom,
                ToDate: filterTo,
            });
            const data = res.data ?? [];
            setLogs(data);
            setHasMore(data.length === PAGE_SIZE);
        } catch {
            setLogs([]);
        } finally {
            setIsLoading(false);
        }
    }, [filterAction, filterEntity, filterUserId, filterFrom, filterTo]);

    useEffect(() => {
        fetchLogs(page);
    }, [page, fetchLogs]);

    const handleApplyFilters = () => {
        setPage(1);
        fetchLogs(1);
    };

    const handleClearFilters = () => {
        setFilterAction("");
        setFilterEntity("");
        setFilterUserId("");
        setFilterFrom("");
        setFilterTo("");
        setPage(1);
    };

    const hasActiveFilters = filterAction || filterEntity || filterUserId || filterFrom || filterTo;

    return (
        <div className="space-y-5">
            {/* ── Header ──────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">{t("auditLogs.title")}</h1>
                    <p className="text-sm text-slate-400 mt-0.5">{t("auditLogs.subtitle")}</p>
                </div>
                <button
                    onClick={() => setShowFilters((p) => !p)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border transition-colors ${
                        showFilters || hasActiveFilters
                            ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                >
                    <Filter className="h-4 w-4" />
                    {t("auditLogs.filters")}
                    {hasActiveFilters && (
                        <span className="ml-1 w-2 h-2 rounded-full bg-indigo-500" />
                    )}
                </button>
            </div>

            {/* ── Filters Panel ────────────────────────────────────────────────── */}
            {showFilters && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Action */}
                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5">
                                <Zap className="h-3.5 w-3.5" />
                                {t("auditLogs.action")}
                            </label>
                            <select
                                value={filterAction}
                                onChange={(e) => setFilterAction(e.target.value)}
                                className="w-full h-9 px-3 text-sm rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none bg-white transition-all"
                            >
                                <option value="">{t("auditLogs.allActions")}</option>
                                <option value="Added">Added</option>
                                <option value="Updated">Updated</option>
                                <option value="Deleted">Deleted</option>
                                <option value="Modified">Modified</option>
                            </select>
                        </div>

                        {/* Entity */}
                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5">
                                <Layers className="h-3.5 w-3.5" />
                                {t("auditLogs.entityName")}
                            </label>
                            <input
                                type="text"
                                value={filterEntity}
                                onChange={(e) => setFilterEntity(e.target.value)}
                                placeholder={t("auditLogs.entityPlaceholder")}
                                className="w-full h-9 px-3 text-sm rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                            />
                        </div>

                        {/* UserId */}
                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5">
                                <User className="h-3.5 w-3.5" />
                                {t("auditLogs.userId")}
                            </label>
                            <input
                                type="text"
                                value={filterUserId}
                                onChange={(e) => setFilterUserId(e.target.value)}
                                placeholder={t("auditLogs.userIdPlaceholder")}
                                className="w-full h-9 px-3 text-sm rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                            />
                        </div>

                        {/* From */}
                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                {t("auditLogs.fromDate")}
                            </label>
                            <input
                                type="date"
                                value={filterFrom}
                                onChange={(e) => setFilterFrom(e.target.value)}
                                className="w-full h-9 px-3 text-sm rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                            />
                        </div>

                        {/* To */}
                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                {t("auditLogs.toDate")}
                            </label>
                            <input
                                type="date"
                                value={filterTo}
                                onChange={(e) => setFilterTo(e.target.value)}
                                className="w-full h-9 px-3 text-sm rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <button
                            onClick={handleApplyFilters}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                            <Search className="h-3.5 w-3.5" />
                            {t("auditLogs.apply")}
                        </button>
                        {hasActiveFilters && (
                            <button
                                onClick={handleClearFilters}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                <X className="h-3.5 w-3.5" />
                                {t("auditLogs.clearFilters")}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ── Logs Table ──────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <History className="h-10 w-10 mb-3 text-slate-300" />
                        <p className="text-sm font-medium">{t("auditLogs.noLogs")}</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/60">
                                        <th className="text-start px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t("auditLogs.user")}</th>
                                        <th className="text-start px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t("auditLogs.action")}</th>
                                        <th className="text-start px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t("auditLogs.description")}</th>
                                        <th className="text-start px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t("auditLogs.entity")}</th>
                                        <th className="text-start px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t("auditLogs.time")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log.id} className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/40 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                                                        <User className="h-3.5 w-3.5" />
                                                    </div>
                                                    <span className="font-semibold text-slate-700 truncate max-w-[150px]">{log.userName}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${actionBadge(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-600 max-w-[300px] truncate">{log.formattedAction}</td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{log.entityName}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">{log.timeAgo}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="md:hidden divide-y divide-slate-50">
                            {logs.map((log) => (
                                <div key={log.id} className="px-4 py-3.5 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                                                <User className="h-3 w-3" />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700">{log.userName}</span>
                                        </div>
                                        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full border ${actionBadge(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600">{log.formattedAction}</p>
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span className="font-mono bg-slate-50 px-1.5 py-0.5 rounded">{log.entityName}</span>
                                        <span>{log.timeAgo}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* ── Pagination ────────────────────────────────────────────── */}
                {!isLoading && logs.length > 0 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/40">
                        <p className="text-xs text-slate-400">
                            {t("auditLogs.page")} {page}
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="px-3 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg">{page}</span>
                            <button
                                onClick={() => setPage((p) => p + 1)}
                                disabled={!hasMore}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
