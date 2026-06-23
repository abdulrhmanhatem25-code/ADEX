import React, { useState } from "react";
import {
    Pencil, ToggleLeft, ToggleRight, ChevronDown,
    BookOpen, Clock, User, Hash, Mail,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import StatusBadge from "@/shared/components/StatusBadge";
import { normalizeTimeHHmm } from "@/shared/utils/timeHHmm";

// ─── Field helpers (maps new API shape) ──────────────────────────────────────
export const getId = (s) => s?.instructorId ?? null;
export const getName = (s, isAr) => (isAr && s?.nameAr ? s.nameAr : s?.name ?? "—");
export const getCode = (s) => s?.code ?? "—";
export const getType = (s, isAr) => (isAr && s?.typeAr ? s.typeAr : s?.type ?? "");
export const getImg = (s) => s?.imageUrl ?? "";
export const getActive = (s) => s?.isActive ?? true;
export const getCourses = (s) => s?.courses ?? [];
export const getAvails = (s) => s?.availabilities ?? [];
export const getMode = (s, isAr) => (isAr && s?.availabilityModeAr ? s.availabilityModeAr : s?.availabilityMode ?? "");
export const getExcludedDay = (s, isAr) => (isAr && s?.excludedDayAr ? s.excludedDayAr : s?.excludedDay ?? null);

// ─── Type Badge ───────────────────────────────────────────────────────────────
function TypeBadge({ type }) {
    if (!type) return <span className="text-[10px] text-slate-300">—</span>;
    const isDoc = type.toLowerCase().includes("doctor");
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider
            ${isDoc
                ? "bg-bg-doctor/30 text-text-doctor border border-doctor-border"
                : "bg-bg-assist/80 text-text-assist border border-assist-border"}`}>
            {isDoc ? "Doctor" : "Assistant"}
        </span>
    );
}

// ─── Expand Section ───────────────────────────────────────────────────────────
function ExpandSection({ courses, availabilities, mode, excludedDay, isAr }) {
    return (
        <div className="px-7 py-6 bg-slate-50/30 space-y-6">
            {/* Availability Mode */}
            {mode && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold">Availability:</span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 font-medium">{mode}</span>
                    {excludedDay && (
                        <span className="text-slate-400">except <strong>{excludedDay}</strong></span>
                    )}
                </div>
            )}

            {/* Courses */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                        <BookOpen className="h-3.5 w-3.5 text-enrol-ava" />
                    </div>
                    <span className="text-xs font-bold text-slate-500">Assigned Courses</span>
                </div>
                {courses.length === 0 ? (
                    <p className="text-xs text-slate-400 italic pl-8">No courses assigned.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pl-8">
                        {courses.map((c, i) => (
                            <div key={i} className="flex items-center gap-2.5 px-3 py-2 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-1.5 h-1.5 rounded-full bg-dot-course flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold text-slate-700 leading-none">{c.courseCode}</p>
                                    {(c.courseName || c.courseNameAr) && (
                                        <p className="text-[10px] text-slate-400 truncate mt-1">
                                            {isAr && c.courseNameAr ? c.courseNameAr : c.courseName}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Availabilities */}
            {availabilities.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                            <Clock className="h-3.5 w-3.5 text-avalibility-ava" />
                        </div>
                        <span className="text-xs font-bold text-slate-500">Weekly Schedule</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pl-8">
                        {availabilities.map((a, i) => (
                            <div key={i} className="flex items-center justify-between px-4 py-2.5 bg-white border border-slate-100 rounded-xl shadow-sm">
                                <span className="text-[11px] font-bold text-slate-700">
                                    {isAr && a.dayOfWeekAr ? a.dayOfWeekAr : a.dayOfWeek}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] px-2 py-0.5 bg-bg-start-time text-text-start-time rounded-md font-semibold border border-start-time-border tabular-nums">
                                        {normalizeTimeHHmm(a.startTime) || a.startTime || "—"}
                                    </span>
                                    <span className="text-slate-300">→</span>
                                    <span className="text-[10px] px-2 py-0.5 bg-bg-end-time text-text-end-time rounded-md font-semibold border border-end-time-border tabular-nums">
                                        {normalizeTimeHHmm(a.endTime) || a.endTime || "—"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── StaffCard ────────────────────────────────────────────────────────────────
/**
 * Props:
 *   staff        – single instructor object from API
 *   isSelected   – boolean
 *   onSelect     – (id) => void
 *   onEdit       – (staff, e) => void
 *   onToggle     – (staff, e) => void
 */
export default function StaffCard({ staff: s, isSelected, onSelect, onEdit, onToggle }) {
    const { i18n } = useTranslation();
    const isAr = i18n.language === "ar";
    const [expanded, setExpanded] = useState(false);
    const id = getId(s);
    const isActive = getActive(s);

    const toggleExpand = (e) => {
        if (e.target.closest("[data-no-expand]")) return;
        setExpanded((p) => !p);
    };

    // ── Shared action buttons ───────────────────────────────────────────────
    const Actions = () => (
        <div className="flex items-center gap-1" data-no-expand>
            <button
                onClick={(e) => onEdit(s, e)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                title="Edit"
            >
                <Pencil className="h-4 w-4" />
            </button>
            <button
                onClick={(e) => onToggle(s, e)}
                className="p-1.5 rounded-lg transition-colors"
                title={isActive ? "Deactivate" : "Activate"}
            >
                {isActive
                    ? <ToggleRight className="h-5 w-5 text-active-room" />
                    : <ToggleLeft className="h-5 w-5 text-inactive-room" />}
            </button>
        </div>
    );

    return (
        <>
            {/* ── MOBILE CARD (< sm) ── */}
            <div className="sm:hidden px-4 py-3" onClick={toggleExpand}>
                <div className={`rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden transition-all ${expanded ? "ring-1 ring-indigo-100" : ""}`}>
                    <div className="flex items-start gap-3 p-4">
                        {/* Checkbox */}
                        <div className="flex-shrink-0 flex items-center mt-1" data-no-expand>
                            <input
                                id={`staff-select-mobile-${id}`}
                                name="staffSelect"
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => onSelect(id)}
                                className="w-4 h-4 rounded accent-staff-add-btn-bg cursor-pointer"
                            />
                        </div>
                        {/* Avatar */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-2 border-white shadow">
                            {getImg(s) ? <img src={getImg(s)} className="w-full h-full object-cover" alt={getName(s, isAr)} /> : <User className="h-5 w-5 text-ava" />}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-slate-800">{getName(s, isAr)}</p>
                                <TypeBadge type={getType(s, false)} />
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                                <Hash className="h-3 w-3 opacity-50" />{getCode(s)}
                            </div>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-slate-300 transition-transform duration-300 flex-shrink-0 mt-1 ${expanded ? "rotate-180" : ""}`} />
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-100" data-no-expand onClick={(e) => e.stopPropagation()}>
                        <StatusBadge active={isActive} />
                        <Actions />
                    </div>
                </div>
            </div>

            {/* ── DESKTOP ROW (≥ sm) ── */}
            <div
                onClick={toggleExpand}
                className={`group hidden sm:flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-staff-card-hover transition-colors ${expanded ? "bg-staff-card-hover" : ""}`}
            >
                {/* Checkbox */}
                <div className="flex-shrink-0" data-no-expand onClick={(e) => e.stopPropagation()}>
                    <input
                        id={`staff-select-desktop-${id}`}
                        name="staffSelect"
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelect(id)}
                        className="w-4 h-4 rounded accent-staff-add-btn-bg cursor-pointer"
                    />
                </div>
                {/* Avatar */}
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border border-white shadow-sm">
                    {getImg(s) ? <img src={getImg(s)} className="w-full h-full object-cover" alt={getName(s, isAr)} /> : <User className="h-4 w-4 text-ava" />}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800 truncate">{getName(s, isAr)}</p>
                        <TypeBadge type={getType(s, false)} />
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                        <div className="flex items-center gap-1"><Hash className="h-3 w-3 opacity-50" />{getCode(s)}</div>
                    </div>
                </div>
                {/* Actions + Status */}
                <div className="flex items-center relative overflow-hidden h-9">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 translate-x-full group-hover:translate-x-0 transition-all duration-300 ease-out" data-no-expand onClick={(e) => e.stopPropagation()}>
                        <Actions />
                    </div>
                    <span className="ml-3"><StatusBadge active={isActive} /></span>
                    <ChevronDown className={`ml-2 h-4 w-4 text-slate-300 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
                </div>
            </div>

            {/* Expandable Section */}
            {expanded && (
                <div className="border-b border-slate-50">
                    <ExpandSection
                        courses={getCourses(s)}
                        availabilities={getAvails(s)}
                        mode={getMode(s, isAr)}
                        excludedDay={getExcludedDay(s, isAr)}
                        isAr={isAr}
                    />
                </div>
            )}
        </>
    );
}
