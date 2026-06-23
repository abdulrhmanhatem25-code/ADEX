import React, { useState, useEffect, useMemo } from "react";
import { getAllAdvisorsProgress } from "@/shared/services/advisorApi";
import { Users, CheckCircle2, Clock, ChevronRight, Loader2, AlertCircle, RefreshCw, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

function ProgressBar({ pct }) {
    return (
        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
                className="h-full rounded-full transition-all"
                style={{
                    width: `${Math.min(pct, 100)}%`,
                    background: pct === 100
                        ? "var(--adv-status-done-text)"
                        : "var(--adv-filter-active-bg)",
                }}
            />
        </div>
    );
}

function AdvisorCard({ advisor, onSelect }) {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === "ar";
    const { advisorName, advisorNameAr, totalStudents, studentsFinished, studentsRemaining, completionPercentage } = advisor;
    
    const displayName = isArabic && advisorNameAr ? advisorNameAr : advisorName;
    const initials = displayName ? displayName.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() : "";

    return (
        <button
            type="button"
            onClick={() => onSelect(advisor)}
            className="w-full text-left bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md hover:border-slate-200 transition-all group"
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                    <div
                        className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ background: "var(--adv-status-approved-bg)", color: "var(--adv-status-approved-text)" }}
                    >
                        {initials}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800 leading-tight">{displayName}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{totalStudents} {t("advisor.studentsCount")}</p>
                    </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 mt-1" />
            </div>

            <ProgressBar pct={completionPercentage} />

            <div className="flex items-center justify-between mt-2.5">
                <span className="text-[11px] font-semibold" style={{ color: "var(--adv-filter-active-bg)" }}>
                    {completionPercentage}% {t("advisor.complete")}
                </span>
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold"
                        style={{ color: "var(--adv-status-done-text)" }}>
                        <CheckCircle2 className="h-3 w-3" /> {studentsFinished}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold"
                        style={{ color: "var(--adv-status-pending-text)" }}>
                        <Clock className="h-3 w-3" /> {studentsRemaining}
                    </span>
                </div>
            </div>
        </button>
    );
}

export default function AdvisorsOverview({ onSelectAdvisor }) {
    const { t } = useTranslation();
    const [advisors, setAdvisors] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [pageNumber, setPageNumber] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 12;

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== debouncedSearch) {
                setDebouncedSearch(search);
                setPageNumber(1);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search, debouncedSearch]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAllAdvisorsProgress(pageNumber, pageSize, debouncedSearch);
            const data = res.data;
            if (Array.isArray(data)) {
                setAdvisors(data);
                setTotalCount(data.length);
                setTotalPages(1);
            } else {
                setAdvisors(data?.items ?? data?.data ?? []);
                setTotalCount(data?.totalCount ?? data?.total ?? 0);
                setTotalPages(data?.totalPages ?? data?.pages ?? 1);
            }
        } catch {
            setError(t("advisor.failedToLoadProgress"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [pageNumber, debouncedSearch]);

    const pageNumbers = useMemo(() => {
        const pgs = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pgs.push(i);
        } else {
            pgs.push(1);
            if (pageNumber > 3) pgs.push("...");
            const s = Math.max(2, pageNumber - 1);
            const e = Math.min(totalPages - 1, pageNumber + 1);
            for (let i = s; i <= e; i++) { if (!pgs.includes(i)) pgs.push(i); }
            if (pageNumber < totalPages - 2) pgs.push("...");
            if (!pgs.includes(totalPages)) pgs.push(totalPages);
        }
        return pgs;
    }, [pageNumber, totalPages]);

    const total = advisors.reduce((s, a) => s + a.totalStudents, 0);
    const finished = advisors.reduce((s, a) => s + a.studentsFinished, 0);
    const remaining = advisors.reduce((s, a) => s + a.studentsRemaining, 0);

    return (
        <div className="min-h-0 max-w-full space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Users className="h-5 w-5" style={{ color: "var(--adv-filter-active-bg)" }} />
                        {t("advisor.advisorsProgress")}
                    </h1>
                    <p className="text-sm text-slate-400 mt-0.5">
                        {t("advisor.advisorsProgressDesc")}
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:min-w-[250px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            id="advisor-search"
                            name="advisorSearch"
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t("common.search") || "Search..."}
                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={fetchData}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                        {t("advisor.refresh")}
                    </button>
                </div>
            </div>

            {/* Overall summary strip */}
            {!isLoading && !error && (
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: t("advisor.totalStudents"), value: total, colorVar: "--adv-status-approved-bg", borderVar: "--adv-status-approved-border", textVar: "--adv-status-approved-text", icon: <Users className="h-4 w-4" /> },
                        { label: t("advisor.regFinished"), value: finished, colorVar: "--adv-status-done-bg", borderVar: "--adv-status-done-border", textVar: "--adv-status-done-text", icon: <CheckCircle2 className="h-4 w-4" /> },
                        { label: t("advisor.remainingStudents"), value: remaining, colorVar: "--adv-status-pending-bg", borderVar: "--adv-status-pending-border", textVar: "--adv-status-pending-text", icon: <Clock className="h-4 w-4" /> },
                    ].map(c => (
                        <div key={c.label} className="flex items-center gap-3 px-4 py-3 rounded-2xl border bg-white shadow-sm" style={{ borderColor: `var(${c.borderVar})` }}>
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `var(${c.colorVar})` }}>
                                <span style={{ color: `var(${c.textVar})` }}>{c.icon}</span>
                            </div>
                            <div>
                                <p className="text-[11px] text-slate-400">{c.label}</p>
                                <p className="text-lg font-bold text-slate-800">{c.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-2xl text-sm"
                    style={{ color: "var(--adv-status-not-text)", background: "var(--adv-status-not-bg)" }}>
                    <AlertCircle className="h-4 w-4 shrink-0" />{error}
                </div>
            )}

            {/* Loading skeleton */}
            {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3 animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-100" />
                                <div className="space-y-1.5 flex-1">
                                    <div className="h-2.5 w-32 rounded bg-slate-100" />
                                    <div className="h-2 w-20 rounded bg-slate-100" />
                                </div>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-100" />
                            <div className="flex justify-between">
                                <div className="h-2 w-16 rounded bg-slate-100" />
                                <div className="h-2 w-20 rounded bg-slate-100" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Advisors grid */}
            {!isLoading && !error && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {advisors.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                            <Users className="h-10 w-10 opacity-30" />
                            <p className="text-sm font-medium">{t("advisor.noAdvisorsFound")}</p>
                        </div>
                    ) : (
                        advisors.map(a => (
                            <AdvisorCard key={a.instructorId} advisor={a} onSelect={onSelectAdvisor} />
                        ))
                    )}
                </div>
            )}

            {/* Pagination */}
            {!isLoading && !error && totalPages > 1 && (
                <div className="flex items-center justify-between px-1 py-3 mt-4 text-xs text-slate-500 border-t border-slate-100">
                    <span>
                        {t("common.showingEntries", {
                            from: totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1,
                            to: Math.min(pageNumber * pageSize, totalCount),
                            totalCount
                        }) || `Showing ${(pageNumber - 1) * pageSize + 1} to ${Math.min(pageNumber * pageSize, totalCount)} of ${totalCount}`}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                            disabled={pageNumber === 1}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
                        >‹</button>
                        
                        {pageNumbers.map((pg, i) =>
                            pg === "..." ? (
                                <span key={`ellipsis-${i}`} className="w-7 text-center">…</span>
                            ) : (
                                <button
                                    key={pg}
                                    onClick={() => setPageNumber(pg)}
                                    className={`w-7 h-7 flex items-center justify-center rounded-lg font-semibold transition-colors ${pageNumber === pg
                                        ? "bg-slate-800 text-white"
                                        : "hover:bg-slate-100 text-slate-600"
                                    }`}
                                >
                                    {pg}
                                </button>
                            )
                        )}

                        <button
                            onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
                            disabled={pageNumber === totalPages}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
                        >›</button>
                    </div>
                </div>
            )}
        </div>
    );
}
