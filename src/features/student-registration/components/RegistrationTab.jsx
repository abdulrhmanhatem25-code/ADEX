import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Loader2, AlertCircle, CheckCircle2, Save, BookOpen, TriangleAlert, Info } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useRegistration } from "../hooks/useRegistration";
import TimetableTable from "./TimetableTable";
import PendingStrip from "./PendingStrip";
import CourseBlock from "./CourseBlock";

const SEVERITY_STYLES = {
    Warning: { border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-700", icon: TriangleAlert },
    Error:   { border: "border-red-200",   bg: "bg-red-50",   text: "text-red-700",   icon: AlertCircle },
    Info:    { border: "border-blue-200",  bg: "bg-blue-50",  text: "text-blue-700",  icon: Info },
};

export default function RegistrationTab({ studentId, studentCode, onSaveSuccess }) {
    const {
        timetable, ttLoading, droppingId,
        availableCourseMap, avLoading, avError,
        offeredCourseMap, offLoading, offError,
        academicInsights,
        pending, addConflictMsg, pendingIds, blockedIds,
        saving, saveError, saveSuccess,
        openCourses,
        allowedHours, registeredHours, pendingCreditHours, totalHoursWithPending,
        handleDrop, handleAdd, handleRemovePending, toggleCourse, handleSave, clearConflictMsg
    } = useRegistration({ studentId, studentCode, onSuccess: onSaveSuccess });

    function renderCourseMap(courseMap, loading, error) {
        if (loading) return (
            <div className="flex items-center gap-2 text-slate-400 py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading…</span>
            </div>
        );
        if (error) return (
            <div className="flex items-center gap-2 text-rose-500 py-4 text-sm">
                <AlertCircle className="w-4 h-4" /> {error}
            </div>
        );
        if (courseMap.size === 0) return (
            <p className="text-sm text-slate-400 py-4 text-center italic">No courses found.</p>
        );
        return (
            <div className="space-y-2">
                {[...courseMap.entries()].map(([name, data]) => (
                    <CourseBlock
                        key={name}
                        courseName={name}
                        creditHours={data.creditHours}
                        category={data.category}
                        advisorNote={data.advisorNote}
                        groups={data.groups}
                        pendingIds={pendingIds}
                        blockedIds={blockedIds}
                        onAdd={handleAdd}
                        onRemove={handleRemovePending}
                        isOpen={openCourses.has(name)}
                        onToggle={() => toggleCourse(name)}
                    />
                ))}
            </div>
        );
    }

    const backlogAvailableMap = new Map();
    const currentAvailableMap = new Map();
    for (const [name, data] of availableCourseMap.entries()) {
        if (data.category === "Backlog") {
            backlogAvailableMap.set(name, data);
        } else {
            currentAvailableMap.set(name, data);
        }
    }

    return (
        <div className="space-y-5">
            {/* 1. Timetable table */}
            <TimetableTable
                timetable={timetable}
                onDrop={handleDrop}
                droppingId={droppingId}
                ttLoading={ttLoading}
                pending={pending}
                onRemovePending={handleRemovePending}
            />

            {/* Academic Insights */}
            {academicInsights.length > 0 && (
                <div className="space-y-2">
                    {academicInsights.map((insight, i) => {
                        const style = SEVERITY_STYLES[insight.severity] || SEVERITY_STYLES.Info;
                        const Icon = style.icon;
                        return (
                            <div
                                key={i}
                                dir="auto"
                                className={cn(
                                    "flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-xs",
                                    style.border, style.bg, style.text
                                )}
                            >
                                <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                    <p className="font-bold">{insight.title}</p>
                                    <p className="mt-0.5 opacity-80">{insight.message}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 2. Pending strip */}
            <PendingStrip pending={pending} onRemove={handleRemovePending} />

            {/* Credit hours progress bar */}
            {allowedHours > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-bold text-slate-600">
                            Credit Hours
                        </p>
                        <p className="text-xs font-bold text-slate-500">
                            {totalHoursWithPending} / {allowedHours}
                            {pendingCreditHours > 0 && (
                                <span className="text-emerald-600 ml-1">(+{pendingCreditHours} pending)</span>
                            )}
                        </p>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        {/* Registered (solid) */}
                        <div className="h-full rounded-full flex">
                            <div
                                className="h-full bg-indigo-400 transition-all duration-300"
                                style={{ width: `${Math.min(100, (registeredHours / allowedHours) * 100)}%` }}
                            />
                            {/* Pending (striped/lighter) */}
                            {pendingCreditHours > 0 && (
                                <div
                                    className={cn(
                                        "h-full transition-all duration-300",
                                        totalHoursWithPending > allowedHours ? "bg-red-400" : "bg-emerald-400"
                                    )}
                                    style={{ width: `${Math.min(100 - (registeredHours / allowedHours) * 100, (pendingCreditHours / allowedHours) * 100)}%` }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Conflict / limit alert popup */}
            {addConflictMsg && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={clearConflictMsg}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4" onClick={e => e.stopPropagation()}>
                        <div className={cn(
                            "mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 border",
                            addConflictMsg.includes("exceed") || addConflictMsg.includes("allowed")
                                ? "bg-red-50 border-red-100"
                                : "bg-amber-50 border-amber-100"
                        )}>
                            <TriangleAlert className={cn(
                                "w-6 h-6",
                                addConflictMsg.includes("exceed") || addConflictMsg.includes("allowed")
                                    ? "text-red-500"
                                    : "text-amber-500"
                            )} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">
                            {addConflictMsg.includes("exceed") || addConflictMsg.includes("allowed")
                                ? "Credit Hours Limit"
                                : "Time Conflict"}
                        </h3>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                            {addConflictMsg}
                        </p>
                        <button 
                            onClick={clearConflictMsg}
                            className="w-full py-2.5 mt-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                        >
                            Got it
                        </button>
                    </div>
                </div>,
                document.body
            )}

            {/* 3. Backlog Courses (If any) */}
            {backlogAvailableMap.size > 0 && (
                <div>
                    <h2 className="text-sm font-extrabold text-amber-600 mb-2 flex items-center gap-2">
                        <TriangleAlert className="w-4 h-4 text-amber-500" /> Backlog Courses
                    </h2>
                    {renderCourseMap(backlogAvailableMap, avLoading, avError)}
                </div>
            )}

            {/* 4. Available Enrollment Groups */}
            <div>
                <h2 className="text-sm font-extrabold text-slate-700 mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" /> Available Enrollment Groups
                </h2>
                {renderCourseMap(currentAvailableMap, avLoading, avError)}
            </div>

            {/* 4. All Offered Courses */}
            <div>
                <h2 className="text-sm font-extrabold text-slate-700 mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-violet-400" /> All Offered Courses
                </h2>
                {renderCourseMap(offeredCourseMap, offLoading, offError)}
            </div>

            {/* 5. Save */}
            <div className="sticky bottom-0 pt-3 pb-1 bg-white/90 backdrop-blur border-t border-slate-100">
                <button
                    onClick={handleSave}
                    disabled={pending.length === 0 || saving}
                    className={cn(
                        "w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl font-extrabold text-sm transition-all",
                        pending.length > 0 && !saving
                            ? "bg-slate-900 text-white hover:bg-slate-700 shadow-sm"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    )}
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Saving…" : `Save Enrollment${pending.length > 0 ? ` (${pending.length})` : ""}`}
                </button>
            </div>
        </div>
    );
}
