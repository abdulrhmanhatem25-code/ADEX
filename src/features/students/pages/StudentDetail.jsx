import React, { useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    ArrowLeft, User, Mail, Hash, GraduationCap, TrendingUp,
    BookOpen, AlertTriangle, XCircle, BarChart3, FileText, Activity, Download, Loader2,
    Pencil, Check, X
} from "lucide-react";
import StatusBadge from "@/shared/components/StatusBadge";
import AcademicStatus from "@/features/students/components/AcademicStatus";
import AcademicRecords from "@/features/students/components/AcademicRecords";
import { CourseMap } from "@/features/course-map";
import { useAuth } from "@/app/providers/AuthProvider";
import { updateCreditHoursApi } from "@/shared/services/studentsApi";
import toast from "@/shared/lib/toast";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const gpaColor = (gpa) => {
    if (gpa >= 3.5) return "text-emerald-600";
    if (gpa >= 2.5) return "text-blue-600";
    if (gpa >= 1.0) return "text-amber-600";
    return "text-slate-400";
};

// GraphTab placeholder removed — now using CurriculumGraph component

// ─────────────────────────────────────────────────────────────────────────────
// Main StudentDetail Page
// ─────────────────────────────────────────────────────────────────────────────
export default function StudentDetail() {
    const { studentCode } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { isSuperAdmin } = useAuth();

    const studentFromState = location.state?.student ?? null;
    const [student, setStudent] = useState(studentFromState);

    // ── Credit-hours modal state (SuperAdmin only) ────────────────────────
    const [showModal, setShowModal] = useState(false);
    const [newLimit, setNewLimit] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleOpenModal = () => {
        setNewLimit(s.allowedCreditHours ?? "");
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setNewLimit("");
    };

    const handleSaveCreditHours = async () => {
        const parsed = parseInt(newLimit, 10);
        if (isNaN(parsed) || parsed < 0) return;

        const studentId = s.studentId ?? s.id;
        if (!studentId) return;

        setIsSaving(true);
        try {
            await updateCreditHoursApi(studentId, parsed);
            toast.success(t("studentDetail.creditHoursUpdated"));
            // Update local state so UI reflects the change immediately
            setStudent((prev) => ({ ...prev, allowedCreditHours: parsed }));
            handleCloseModal();
        } catch {
            // Error toast handled globally by api.js
        } finally {
            setIsSaving(false);
        }
    };

    const TABS = [
        { id: "status", label: t("studentDetail.tabStatus"), icon: Activity },
        { id: "records", label: t("studentDetail.tabRecords"), icon: FileText },
        { id: "graph", label: t("studentDetail.tabGraph"), icon: BarChart3 },
    ];
    const [activeTab, setActiveTab] = useState("status");

    const s = student || {};
    const isActive = s.isActive ?? true;

    return (
        <div className="space-y-5">
            {/* Back button */}
            <button
                onClick={() => navigate(-1)}
                data-html2canvas-ignore="true"
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors group"
            >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                {t("studentDetail.back")}
            </button>

            {/* ── Profile Header Card ─────────────────────────────────────────────── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="h-20 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600" />

                <div className="px-6 pb-6">
                    <div className="flex items-end gap-4 -mt-8 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center flex-shrink-0">
                            <User className="h-7 w-7 text-ava" />
                        </div>
                        <div className="flex-1 min-w-0 pb-1">
                            <h2 className="text-xl font-bold text-slate-800 truncate">{s.fullName ?? studentCode}</h2>
                            <p className="text-sm text-slate-400">{s.email ?? "—"}</p>
                        </div>
                        <span className="flex-shrink-0 mb-1"><StatusBadge active={isActive} /></span>
                    </div>

                    {/* Key info row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                            <Hash className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <div>
                                <p className="text-[10px] text-slate-400 font-medium">{t("studentDetail.studentCode")}</p>
                                <p className="text-xs font-bold text-slate-700 font-mono">{s.studentCode ?? studentCode}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                            <GraduationCap className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <div>
                                <p className="text-[10px] text-slate-400 font-medium">{t("students.level")}</p>
                                <p className="text-xs font-bold text-slate-700">{t("students.level")} {s.currentLevel ?? "—"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                            <TrendingUp className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <div>
                                <p className="text-[10px] text-slate-400 font-medium">{t("students.gpa")}</p>
                                <p className={`text-xs font-bold ${gpaColor(s.gpa ?? 0)}`}>{(s.gpa ?? 0).toFixed(2)}</p>
                            </div>
                        </div>

                        {/* ── Credit Hours (with SuperAdmin edit button) ──────── */}
                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                            <BookOpen className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-slate-400 font-medium">{t("studentDetail.creditHours")}</p>
                                <p className="text-xs font-bold text-slate-700">{s.allowedCreditHours ?? "—"}</p>
                            </div>
                            {isSuperAdmin && (
                                <button
                                    onClick={handleOpenModal}
                                    title={t("studentDetail.editCreditHours")}
                                    className="p-1.5 rounded-lg bg-indigo-50 text-indigo-500 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Warning / Fees flags */}
                    {(s.isAcademicWarning || !s.hasPaidFees) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {s.isAcademicWarning && (
                                <span className="flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full">
                                    <AlertTriangle className="h-3 w-3" /> {t("studentDetail.academicWarning")}
                                </span>
                            )}
                            {!s.hasPaidFees && (
                                <span className="flex items-center gap-1 text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1 rounded-full">
                                    <XCircle className="h-3 w-3" /> {t("studentDetail.feesUnpaid")}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Tabs & Actions ─────────────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                activeTab === tab.id
                                    ? "bg-white text-indigo-700 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Tab Content ───────────────────────────────────────────────────────── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 min-h-[300px]">
                {activeTab === "status" && <AcademicStatus studentCode={studentCode} student={s} />}
                {activeTab === "records" && <AcademicRecords studentCode={studentCode} student={s} />}
                {activeTab === "graph" && <CourseMap studentCode={studentCode} student={s} />}
            </div>

            {/* ── Credit Hours Modal (SuperAdmin) ─────────────────────────────────── */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={handleCloseModal}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

                    {/* Modal card */}
                    <div
                        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-indigo-50 rounded-xl">
                                    <BookOpen className="h-4.5 w-4.5 text-indigo-600" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-800">
                                    {t("studentDetail.editCreditHours")}
                                </h3>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-5 py-5">
                            {/* Student info summary */}
                            <div className="flex items-center gap-3 mb-5 p-3 bg-slate-50 rounded-xl">
                                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                    <User className="h-4 w-4 text-indigo-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">{s.fullName ?? studentCode}</p>
                                    <p className="text-[11px] text-slate-400 font-mono">{s.studentCode ?? studentCode}</p>
                                </div>
                                <div className="ms-auto text-end">
                                    <p className="text-[10px] text-slate-400">{t("studentDetail.creditHours")}</p>
                                    <p className="text-sm font-bold text-slate-700">{s.allowedCreditHours ?? "—"}</p>
                                </div>
                            </div>

                            {/* Input */}
                            <label className="block text-xs font-semibold text-slate-600 mb-2">
                                {t("studentDetail.newCreditLimit")}
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={newLimit}
                                onChange={(e) => setNewLimit(e.target.value)}
                                placeholder={t("studentDetail.creditHoursPlaceholder")}
                                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveCreditHours();
                                    if (e.key === "Escape") handleCloseModal();
                                }}
                            />
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                {t("common.cancel")}
                            </button>
                            <button
                                onClick={handleSaveCreditHours}
                                disabled={isSaving || newLimit === ""}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSaving ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Check className="h-3.5 w-3.5" />
                                )}
                                {isSaving ? t("studentDetail.saving") : t("common.save")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
