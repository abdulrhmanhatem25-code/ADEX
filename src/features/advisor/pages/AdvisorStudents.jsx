import React from "react";
import { useTranslation } from "react-i18next";
import { AdvisorsOverview } from "@/features/dashboard";
import {
    GraduationCap,
    ClipboardCheck,
    UserCheck,
    CreditCard,
    Clock,
    Users,
    Search,
    XCircle,
    AlertCircle,
    RefreshCw,
    ArrowLeft,
} from "lucide-react";

import useAdvisorStudents from "../hooks/useAdvisorStudents";
import { FILTERS } from "../utils/advisorHelpers";
import SummaryCard from "../components/SummaryCard";
import FilterPill from "../components/FilterPill";
import StudentRow from "../components/StudentRow";

export default function AdvisorStudents() {
    const { t, i18n } = useTranslation();
    const {
        isSuperAdmin,
        selectedAdvisor,
        setSelectedAdvisor,
        isLoading,
        error,
        filter,
        setFilter,
        search,
        setSearch,
        summary,
        filterCounts,
        filtered,
        fetchData
    } = useAdvisorStudents();

    // SuperAdmin without a selection → show overview
    if (isSuperAdmin && !selectedAdvisor) {
        return <AdvisorsOverview onSelectAdvisor={setSelectedAdvisor} />;
    }

    const summaryCards = [
        { icon: <Users className="h-5 w-5" />, label: t("advisor.totalStudents"), value: summary.totalStudents, colorVar: "--adv-status-approved-bg", borderVar: "--adv-status-approved-border", textVar: "--adv-status-approved-text" },
        { icon: <ClipboardCheck className="h-5 w-5" />, label: t("advisor.regFinished"), value: summary.totalStudentsFinishedRegistration, colorVar: "--adv-status-done-bg", borderVar: "--adv-status-done-border", textVar: "--adv-status-done-text" },
        { icon: <Clock className="h-5 w-5" />, label: t("advisor.regPending"), value: summary.totalStudentsWithRemainingHours, colorVar: "--adv-status-pending-bg", borderVar: "--adv-status-pending-border", textVar: "--adv-status-pending-text" },
        { icon: <UserCheck className="h-5 w-5" />, label: t("advisor.advisorApproved"), value: summary.totalStudentsApprovedByAdvisor, colorVar: "--adv-status-done-bg", borderVar: "--adv-status-done-border", textVar: "--adv-status-done-text" },
        { icon: <AlertCircle className="h-5 w-5" />, label: t("advisor.notApproved"), value: summary.totalStudentsNotApprovedByAdvisor, colorVar: "--adv-status-not-bg", borderVar: "--adv-status-not-border", textVar: "--adv-status-not-text" },
        { icon: <CreditCard className="h-5 w-5" />, label: t("advisor.feesPaid"), value: summary.totalStudentsPaidFees, colorVar: "--adv-status-paid-bg", borderVar: "--adv-status-paid-border", textVar: "--adv-status-paid-text" },
        { icon: <XCircle className="h-5 w-5" />, label: t("advisor.feesUnpaid"), value: summary.totalStudentsNotPaidFees, colorVar: "--adv-status-not-bg", borderVar: "--adv-status-not-border", textVar: "--adv-status-not-text" },
    ];

    return (
        <div className="min-h-0 max-w-full space-y-5">
            {/* Page Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    {/* Back button for SuperAdmin drill-down */}
                    {isSuperAdmin && selectedAdvisor && (
                        <button
                            type="button"
                            onClick={() => setSelectedAdvisor(null)}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-xl border border-ui-border bg-ui-bg text-ui-text-muted hover:bg-ui-bg-hover transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-xl font-bold text-ui-text flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" style={{ color: "var(--adv-filter-active-bg)" }} />
                            {isSuperAdmin && selectedAdvisor ? `${i18n.language === "ar" && selectedAdvisor.advisorNameAr ? selectedAdvisor.advisorNameAr : selectedAdvisor.advisorName}` : t("advisor.title")}
                        </h1>
                        <p className="text-sm text-ui-text-subtle mt-0.5">{t("advisor.subtitle")}</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={fetchData}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-ui-border bg-ui-bg text-ui-text-muted hover:bg-ui-bg-hover transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                    {t("advisor.refresh")}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-3">
                {summaryCards.map((card) => (
                    <SummaryCard key={card.label} {...card} isLoading={isLoading} />
                ))}
            </div>

            {/* Filter + Search bar */}
            <div className="bg-ui-bg rounded-2xl border border-ui-border shadow-sm p-4 space-y-3">
                {/* Filter pills */}
                <div className="flex flex-wrap gap-2">
                    {FILTERS.map((f) => (
                        <FilterPill key={f.key} label={t(f.label)} count={filterCounts[f.key]} active={filter === f.key} onClick={() => setFilter(f.key)} />
                    ))}
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ui-text-subtle pointer-events-none" />
                    <input
                        id="advisor-student-search"
                        name="advisorStudentSearch"
                        type="text"
                        placeholder={t("advisor.searchPlaceholder")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-ui-border text-sm text-ui-text bg-ui-bg-hover placeholder:text-ui-text-subtle focus:outline-none focus:ring-2 focus:border-transparent transition"
                        style={{ "--tw-ring-color": "var(--adv-filter-active-bg)" }}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-ui-bg rounded-2xl border border-ui-border shadow-sm overflow-hidden">
                {/* Table header info */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-ui-border">
                    <p className="text-sm font-semibold text-ui-text">
                        {filter === "all" ? t("advisor.filterAll") : t(FILTERS.find((f) => f.key === filter)?.label ?? "")}
                        <span className="ml-2 text-xs font-normal text-ui-text-subtle">({filtered.length})</span>
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-3 p-6 text-sm"
                        style={{ color: "var(--adv-status-not-text)", background: "var(--adv-status-not-bg)" }}>
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}

                {/* Loading skeleton */}
                {isLoading && (
                    <div className="divide-y divide-ui-border">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                                <div className="h-8 w-8 rounded-full bg-ui-bg-hover shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-2.5 w-32 rounded bg-ui-bg-hover" />
                                    <div className="h-2 w-20 rounded bg-ui-bg-hover" />
                                </div>
                                <div className="h-5 w-20 rounded-full bg-ui-bg-hover" />
                                <div className="h-5 w-20 rounded-full bg-ui-bg-hover hidden md:block" />
                                <div className="h-5 w-16 rounded-full bg-ui-bg-hover hidden lg:block" />
                                <div className="h-5 w-16 rounded-full bg-ui-bg-hover" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty */}
                {!isLoading && !error && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-ui-text-subtle gap-3">
                        <GraduationCap className="h-10 w-10 opacity-30" />
                        <p className="text-sm font-medium">{t("advisor.noStudents")}</p>
                    </div>
                )}

                {/* Table */}
                {!isLoading && !error && filtered.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-ui-table-header text-xs text-ui-text-muted font-semibold border-b border-ui-border">
                                <tr>
                                    <th className="px-4 py-2.5 font-semibold">{t("advisor.student")}</th>
                                    <th className="px-4 py-2.5 font-semibold hidden sm:table-cell">{t("advisor.credits")}</th>
                                    <th className="px-4 py-2.5 font-semibold text-center">{t("advisor.registration")}</th>
                                    <th className="px-4 py-2.5 font-semibold text-center hidden md:table-cell">{t("advisor.advisor")}</th>
                                    <th className="px-4 py-2.5 font-semibold text-center hidden lg:table-cell">{t("advisor.fees")}</th>
                                    <th className="px-4 py-2.5 font-semibold text-center">{t("advisor.actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((student, i) => (
                                    <StudentRow key={student.studentCode} student={student} index={i} onRefresh={fetchData} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
