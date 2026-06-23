import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { User, AlertTriangle, ChevronDown } from "lucide-react";
import { fetchStudentsApi } from "@/shared/services/studentsApi";
import useListPage from "@/shared/hooks/useListPage";
import DataListLayout from "@/shared/components/DataListLayout";
import StatusBadge from "@/shared/components/StatusBadge";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const gpaColor = (gpa) => {
    if (gpa >= 3.5) return "text-emerald-600";
    if (gpa >= 2.5) return "text-blue-600";
    if (gpa >= 1) return "text-amber-600";
    return "text-slate-400";
};

const levelLabel = (lvl, t) => lvl ? `${t("students.level")} ${lvl}` : "—";

const getSortOptions = (t) => [
    { label: t("students.name"), value: "fullName" },
    { label: t("students.level"), value: "currentLevel" },
    { label: "GPA", value: "gpa" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Students Page
// ─────────────────────────────────────────────────────────────────────────────
export default function Students() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === "ar";
    const list = useListPage({ fetchFn: fetchStudentsApi, limit: 6 });

    const SORT_OPTIONS = getSortOptions(t);

    const goToDetail = (student) => {
        navigate(`/students/${student.studentCode}`, { state: { student } });
    };

    const getDisplayName = (s) => (isRtl && s.fullNameAr) ? s.fullNameAr : s.fullName;
    const getProgramName = (s) => (isRtl && s.programNameAr) ? s.programNameAr : s.programName;

    // ── Render Item ──────────────────────────────────────────────────────────
    const renderItem = (s) => {
        const isActive = s.isActive ?? true;
        const isWarning = s.isAcademicWarning ?? false;

        return (
            <>
                {/* ── MOBILE CARD (< sm) ── */}
                <div className="sm:hidden px-4 py-3" onClick={() => goToDetail(s)}>
                    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden cursor-pointer active:scale-[.99] transition-transform">
                        <div className="flex items-start gap-3 p-4">
                            <div className="flex-shrink-0 w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-white shadow overflow-hidden">
                                {s.imageUrl ? (
                                    <img src={s.imageUrl} alt={getDisplayName(s)} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="h-5 w-5 text-ava" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-semibold text-slate-800">{getDisplayName(s)}</p>
                                    {isWarning && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5">{s.email}</p>
                                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                                    <span className="font-mono">{s.studentCode}</span>
                                    <span>{levelLabel(s.currentLevel, t)}</span>
                                    <span className={`font-semibold ${gpaColor(s.gpa)}`}>GPA {(s.gpa ?? 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-100">
                            <StatusBadge active={isActive} />
                            <span className="text-[10px] text-indigo-500 font-semibold">View Profile →</span>
                        </div>
                    </div>
                </div>

                {/* ── DESKTOP ROW (≥ sm) ── */}
                <div
                    onClick={() => goToDetail(s)}
                    className="group hidden sm:flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 last:border-b-0 hover:bg-slate-50/60 transition-colors cursor-pointer"
                >
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                        {s.imageUrl ? (
                            <img src={s.imageUrl} alt={getDisplayName(s)} className="w-full h-full object-cover" />
                        ) : (
                            <User className="h-4 w-4 text-ava" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-800 truncate">{getDisplayName(s)}</p>
                            {isWarning && <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" title="Academic Warning" />}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                            <span className="font-mono">{s.studentCode}</span>
                            <span>{s.email}</span>
                            {getProgramName(s) && <span className="text-indigo-500 font-medium">{getProgramName(s)}</span>}
                        </div>
                    </div>

                    {/* Level + GPA */}
                    <div className="hidden md:flex items-center gap-4 text-xs">
                        <div className="text-center">
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{t("students.level")}</p>
                            <p className="font-bold text-slate-700">{s.currentLevel ?? "—"}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{t("students.gpa")}</p>
                            <p className={`font-bold ${gpaColor(s.gpa)}`}>{(s.gpa ?? 0).toFixed(2)}</p>
                        </div>
                    </div>

                    <StatusBadge active={isActive} />
                    <ChevronDown className="h-4 w-4 text-slate-300 -rotate-90 flex-shrink-0" />
                </div>
            </>
        );
    };

    return (
        <DataListLayout
            title={t("students.title")}
            subtitle={t("students.subtitle")}
            list={list}
            sortOptions={SORT_OPTIONS}
            emptyMessage={t("students.noStudents")}
            loadingMessage={t("students.loading")}
            renderItem={renderItem}
        />
    );
}
