import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Download } from "lucide-react";
import { fetchAcademicRecordsApi } from "@/shared/services/studentsApi";
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

const gpaBarColor = (gpa) => {
    if (gpa >= 3.5) return "bg-emerald-500";
    if (gpa >= 2.5) return "bg-blue-500";
    if (gpa >= 1.0) return "bg-amber-500";
    return "bg-slate-300";
};

// ─────────────────────────────────────────────────────────────────────────────
// Academic Records Tab
// ─────────────────────────────────────────────────────────────────────────────
export default function AcademicRecords({ studentCode, student }) {
    const { i18n, t } = useTranslation();
    const isRtl = i18n.language === "ar";

    const [records, setRecords] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isExporting, setIsExporting] = useState(false);

    const displayName = (r) => isRtl ? (r?.nameAr || r?.name) : r?.name;
    const displayCollege = (r) => isRtl ? (r?.collegeAr || r?.college) : r?.college;
    const displaySpec = (r) => isRtl ? (r?.specializationAr || r?.specialization) : r?.specialization;
    const displayCategory = (cat) => isRtl ? (cat?.categoryAr || cat?.category) : cat?.category;
    const displayCourseName = (c) => isRtl ? (c?.nameAr || c?.name) : c?.name;
    const displayTerm = (c) => isRtl ? (c?.termAr || c?.term) : c?.term;

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetchAcademicRecordsApi(studentCode);
                setRecords(res.data);
            } catch (e) {
                setError("Failed to load academic records.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [studentCode]);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await downloadDynamicReport("academic-record", { studentCode });
            const contentDisposition = response.headers?.["content-disposition"];
            let downloadName = `AcademicRecords_${studentCode}.pdf`; 
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
            <span className="text-sm">{t("academicRecords.loading")}</span>
        </div>
    );

    if (error) return <p className="text-sm text-rose-600 bg-rose-50 px-4 py-3 rounded-xl">{error}</p>;

    const categories = records?.categories ?? [];

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-5 rounded-full bg-indigo-500" />
                    <h3 className="text-base font-bold text-slate-800">{t("academicRecords.title")}</h3>
                </div>
                {records && (
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

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm bg-slate-50 rounded-2xl px-5 py-4 border border-slate-100">
                <div><span className="text-slate-400 font-medium">{t("academicRecords.studentId")} </span><span className="font-semibold text-slate-700 font-mono">{records?.studentId ?? studentCode}</span></div>
                <div><span className="text-slate-400 font-medium">{t("academicRecords.name")} </span><span className="font-semibold text-slate-700">{displayName(records) ?? "—"}</span></div>
                <div><span className="text-slate-400 font-medium">{t("academicRecords.cumulativeGpa")} </span><span className={`font-bold ${gpaColor(records?.cumulativeGPA ?? 0)}`}>{(records?.cumulativeGPA ?? 0).toFixed(2)}</span></div>
                <div><span className="text-slate-400 font-medium">{t("academicRecords.college")} </span><span className="font-semibold text-slate-700">{displayCollege(records) ?? "—"}</span></div>
                <div><span className="text-slate-400 font-medium">{t("academicRecords.specialization")} </span><span className="font-semibold text-slate-700">{displaySpec(records) ?? "—"}</span></div>
                <div><span className="text-slate-400 font-medium">{t("academicRecords.earnedHours")} </span><span className="font-bold text-slate-700">{records?.earnedHours ?? 0}</span></div>
            </div>

            {/* GPA bar */}
            <div className="bg-white rounded-2xl border border-slate-100 px-5 py-3">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">{t("academicRecords.cumulativeGpa")}</span>
                    <span className={`text-sm font-bold ${gpaColor(records?.cumulativeGPA ?? 0)}`}>{(records?.cumulativeGPA ?? 0).toFixed(2)} / 4.00</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${gpaBarColor(records?.cumulativeGPA ?? 0)}`}
                        style={{ width: `${Math.min(((records?.cumulativeGPA ?? 0) / 4) * 100, 100)}%` }} />
                </div>
            </div>

            {/* Categories as tables */}
            {categories.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">{t("academicRecords.noRecords")}</div>
            ) : (
                <div className="space-y-5">
                    {categories.map((cat, ci) => {
                        const courses = cat.courses ?? [];
                        const totalHours = cat.totalCreditHours ?? courses.reduce((sum, c) => sum + (c.creditHours ?? 0), 0);
                        return (
                            <div key={ci} className="overflow-hidden rounded-2xl border border-slate-200">
                                <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2.5 text-center">
                                    <span className="text-sm font-bold text-indigo-800">{displayCategory(cat) ?? `Category ${ci + 1}`}</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50">
                                                <th className="px-4 py-2.5 text-center text-xs font-bold text-slate-600 border-b border-slate-200 whitespace-nowrap">{t("academicRecords.courseCode")}</th>
                                                <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-600 border-b border-slate-200">{t("academicRecords.courseName")}</th>
                                                <th className="px-4 py-2.5 text-center text-xs font-bold text-slate-600 border-b border-slate-200 whitespace-nowrap">{t("academicRecords.term")}</th>
                                                <th className="px-4 py-2.5 text-center text-xs font-bold text-slate-600 border-b border-slate-200 whitespace-nowrap">{t("academicRecords.creditHours")}</th>
                                                <th className="px-4 py-2.5 text-center text-xs font-bold text-slate-600 border-b border-slate-200 whitespace-nowrap">{t("academicRecords.grade")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {courses.length === 0 ? (
                                                <tr><td colSpan={5} className="px-4 py-4 text-center text-slate-400 text-sm">{t("academicRecords.noCourses")}</td></tr>
                                            ) : (
                                                courses.map((course, idx) => (
                                                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                                                        <td className="px-4 py-2.5 text-center font-mono text-xs font-semibold text-slate-600">{course.code ?? "—"}</td>
                                                        <td className="px-4 py-2.5 text-slate-800 font-medium">{displayCourseName(course) ?? "—"}</td>
                                                        <td className="px-4 py-2.5 text-center text-xs text-slate-500 whitespace-nowrap">{displayTerm(course) ?? "—"}</td>
                                                        <td className="px-4 py-2.5 text-center text-sm font-semibold text-slate-700">{course.creditHours ?? "—"}</td>
                                                        <td className="px-4 py-2.5 text-center">
                                                            <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">{course.grade ?? "—"}</span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                            <tr className="bg-slate-50 border-t border-slate-200">
                                                <td colSpan={3} className="px-4 py-2.5 text-right text-xs font-bold text-slate-600">{t("academicRecords.totalCreditHours")}</td>
                                                <td className="px-4 py-2.5 text-center text-sm font-bold text-slate-800">{totalHours}</td>
                                                <td />
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
