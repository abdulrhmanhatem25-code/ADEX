import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    TrendingUp, BookOpen, ChevronDown, Loader2, Download
} from "lucide-react";
import { fetchAcademicStatusApi } from "@/shared/services/studentsApi";
import { downloadDynamicReport } from "@/features/reports/services/reportsApi";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const gpaColor = (gpa) => {
    if (gpa >= 3.5) return "text-emerald-600";
    if (gpa >= 2.5) return "text-blue-600";
    if (gpa >= 1.0) return "text-amber-600";
    return "text-slate-400";
};

function StatCard({ label, value, sub, icon: Icon, color = "indigo" }) {
    const colorMap = {
        indigo: "bg-indigo-50 text-indigo-600",
        emerald: "bg-emerald-50 text-emerald-600",
        amber: "bg-amber-50 text-amber-600",
        rose: "bg-rose-50 text-rose-600",
        blue: "bg-blue-50 text-blue-600",
    };
    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
                <Icon className="h-4 w-4" />
            </div>
            <div>
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-lg font-bold text-slate-800 leading-tight">{value}</p>
                {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Academic Status Tab
// ─────────────────────────────────────────────────────────────────────────────
export default function AcademicStatus({ studentCode, student }) {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === "ar";

    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedTerms, setExpandedTerms] = useState(new Set());
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetchAcademicStatusApi(studentCode);
                setStatus(res.data);
                if (res.data?.semesters?.length > 0) {
                    setExpandedTerms(new Set([res.data.semesters[0].term]));
                }
            } catch (e) {
                setError("Failed to load academic status.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [studentCode]);

    // Helpers for bilingual display
    const displayName = (data) => isRtl ? (data?.studentNameAr || data?.studentName) : data?.studentName;
    const displayCollege = (data) => isRtl ? (data?.collegeAr || data?.college) : data?.college;
    const displaySpec = (data) => isRtl ? (data?.specializationAr || data?.specialization) : data?.specialization;
    const displayTerm = (sem) => isRtl ? (sem?.termAr || sem?.term) : sem?.term;
    const displayCourseName = (c) => isRtl ? (c?.courseNameAr || c?.courseName) : c?.courseName;

    const toggleTerm = (term) => {
        setExpandedTerms(prev => {
            const next = new Set(prev);
            next.has(term) ? next.delete(term) : next.add(term);
            return next;
        });
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await downloadDynamicReport("academic-status", { studentCode });
            const contentDisposition = response.headers?.["content-disposition"];
            let downloadName = `AcademicStatus_${studentCode}.pdf`; 
            if (contentDisposition) {
                const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (match?.[1]) {
                    downloadName = match[1].replace(/['"]/g, "");
                }
            }
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = downloadName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Export failed:", e);
        } finally {
            setIsExporting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-24 text-slate-400 gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm">{t("academicStatus.loading")}</span>
        </div>
    );

    if (error) return <p className="text-sm text-rose-600 bg-rose-50 px-4 py-3 rounded-xl">{error}</p>;

    const semesters = status?.semesters ?? [];
    const overall = status?.overallSummary ?? {};

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-5 rounded-full bg-indigo-500" />
                    <h3 className="text-base font-bold text-slate-800">{t("academicStatus.title")}</h3>
                </div>
                {status && (
                    <button 
                        onClick={handleExport} 
                        disabled={isExporting}
                        className="flex items-center gap-2 text-sm font-semibold bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExporting ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : <Download className="h-4 w-4 text-slate-400" />}
                        {t("common.export", "Export")}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm bg-slate-50 rounded-2xl px-5 py-4 border border-slate-100">
                <div><span className="text-slate-400 font-medium">{t("academicStatus.studentCode")} </span><span className="font-semibold text-slate-700 font-mono">{status?.studentCode ?? studentCode}</span></div>
                <div><span className="text-slate-400 font-medium">{t("academicStatus.name")} </span><span className="font-semibold text-slate-700">{displayName(status) ?? "—"}</span></div>
                <div><span className="text-slate-400 font-medium">{t("academicStatus.college")} </span><span className="font-semibold text-slate-700">{displayCollege(status) ?? "—"}</span></div>
                <div><span className="text-slate-400 font-medium">{t("academicStatus.specialization")} </span><span className="font-semibold text-slate-700">{displaySpec(status) ?? "—"}</span></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <StatCard label={t("academicStatus.cumulativeGpa")} value={(overall.gpa ?? 0).toFixed(2)} icon={TrendingUp} color={(overall.gpa ?? 0) >= 3.5 ? "emerald" : (overall.gpa ?? 0) >= 2.5 ? "blue" : "amber"} />
                <StatCard label={t("academicStatus.registeredHrs")} value={overall.registeredHours ?? 0} icon={BookOpen} color="indigo" />
                <StatCard label={t("academicStatus.actualHrs")} value={overall.actualHours ?? 0} icon={BookOpen} color="blue" />
                <StatCard label={t("academicStatus.acquiredHrs")} value={overall.acquiredHours ?? 0} icon={BookOpen} color="emerald" />
                <StatCard label={t("academicStatus.totalPoints")} value={(overall.totalPoints ?? 0).toFixed(1)} icon={TrendingUp} color="indigo" />
            </div>

            {semesters.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">{t("academicStatus.noData")}</div>
            ) : (
                <div className="space-y-3">
                    {semesters.map((sem, si) => {
                        const isOpen = expandedTerms.has(sem.term);
                        const sum = sem.summary ?? {};
                        const courses = sem.courses ?? [];
                        return (
                            <div key={si} className="overflow-hidden rounded-2xl border border-slate-200">
                                <button onClick={() => toggleTerm(sem.term)} className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-indigo-50 transition-colors">
                                    <span className="text-sm font-bold text-slate-800">{displayTerm(sem)}</span>
                                    <div className="flex items-center gap-4">
                                        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-500">
                                            <span>{t("academicStatus.semesterGpa")}: <b className={gpaColor(sum.semesterGPA ?? 0)}>{(sum.semesterGPA ?? 0).toFixed(2)}</b></span>
                                            <span>{t("academicStatus.cgpa")}: <b className={gpaColor(sum.cumulativeGPA ?? 0)}>{(sum.cumulativeGPA ?? 0).toFixed(2)}</b></span>
                                            <span>{t("academicStatus.acquired")}: <b className="text-slate-700">{sum.acquiredHours ?? 0}/{sum.registeredHours ?? 0} {t("academicStatus.hrs")}</b></span>
                                        </div>
                                        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                                    </div>
                                </button>
                                {isOpen && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm border-collapse">
                                            <thead>
                                                <tr className="bg-white border-b border-slate-200">
                                                    <th className="px-4 py-2.5 text-center text-xs font-bold text-slate-600 whitespace-nowrap">{t("academicRecords.courseCode")}</th>
                                                    <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-600">{t("academicRecords.courseName")}</th>
                                                    <th className="px-4 py-2.5 text-center text-xs font-bold text-slate-600 whitespace-nowrap">{t("academicRecords.creditHours")}</th>
                                                    <th className="px-4 py-2.5 text-center text-xs font-bold text-slate-600 whitespace-nowrap">{t("academicRecords.grade")}</th>
                                                    <th className="px-4 py-2.5 text-center text-xs font-bold text-slate-600 whitespace-nowrap">{t("academicStatus.points")}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {courses.map((c, ci) => (
                                                    <tr key={ci} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                                                        <td className="px-4 py-2 text-center font-mono text-xs font-semibold text-slate-600">{c.courseCode ?? "—"}</td>
                                                        <td className="px-4 py-2 text-slate-800 font-medium text-sm">{displayCourseName(c) ?? "—"}</td>
                                                        <td className="px-4 py-2 text-center text-sm text-slate-600">{c.creditHours ?? "—"}</td>
                                                        <td className="px-4 py-2 text-center">
                                                            <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full
                                                                ${c.grade === "F" ? "bg-rose-50 text-rose-600" :
                                                                    c.grade === "P" ? "bg-blue-50 text-blue-600" :
                                                                        "bg-slate-100 text-slate-700"}`}>
                                                                {c.grade ?? "—"}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-center text-sm font-semibold text-slate-700">{c.points ?? "—"}</td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-emerald-50/60 border-t border-slate-200 text-xs">
                                                    <td colSpan={2} className="px-4 py-2 text-right font-bold text-slate-600">{t("academicStatus.semesterSummary")}:</td>
                                                    <td className="px-4 py-2 text-center font-bold text-slate-700">{sum.acquiredHours ?? 0}/{sum.registeredHours ?? 0} {t("academicStatus.hrs")}</td>
                                                    <td className="px-4 py-2 text-center font-bold text-slate-700">{t("academicStatus.gpa")}: <span className={gpaColor(sum.semesterGPA ?? 0)}>{(sum.semesterGPA ?? 0).toFixed(2)}</span></td>
                                                    <td className="px-4 py-2 text-center font-bold text-slate-700">{t("academicStatus.cgpa")}: <span className={gpaColor(sum.cumulativeGPA ?? 0)}>{(sum.cumulativeGPA ?? 0).toFixed(2)}</span></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
