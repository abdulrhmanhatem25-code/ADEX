import React from "react";
import { BookOpen, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import StatusBadge from "@/shared/components/StatusBadge";
import { programIdsToValue } from "../utils/programHelpers";

export function ProgramBadge({ programIds }) {
    const val = programIdsToValue(programIds);
    const config = {
        cs: { label: "CS", bg: "bg-bg-cs/30", text: "text-text-cs" },
        it: { label: "IT", bg: "bg-bg-it/80", text: "text-text-it" },
        both: { label: "CS & IT", bg: "bg-bg-share/30", text: "text-text-share" },
    };
    const c = config[val];
    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
            {c.label}
        </span>
    );
}

export default function CourseCard({ course, onEdit, onToggle }) {
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === "ar";

    const code = course.courseCode ?? course.code ?? "";
    const name = isAr 
        ? (course.courseNameAr ?? course.nameAr ?? course.courseName ?? course.name ?? "—")
        : (course.courseName ?? course.name ?? "—");
    
    const credits = course.creditHours ?? course.credits ?? 0;
    const level = course.level ?? "—";
    const isActive = course.isActive ?? true;
    const programIds = course.programIds ?? [];

    return (
        <>
            {/* ── MOBILE CARD (< sm) ── */}
            <div className="sm:hidden px-4 py-3">
                <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                    <div className="flex items-start gap-3 p-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <BookOpen className="h-4 w-4 text-ava" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800">
                                {code && <span className="text-slate-500 font-normal mr-1">{code} -</span>}
                                {name}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-slate-400">
                                <span>{credits} {t("courses.hours")}</span>
                                {level !== 0 && level !== "—" && <span>· {t("courses.level")} {level}</span>}
                                {programIds.length > 0 && <ProgramBadge programIds={programIds} />}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-100">
                        <StatusBadge active={isActive} />
                        <div className="flex items-center gap-2">
                            {onEdit && (
                                <button onClick={() => onEdit(course)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title={t("courses.edit")}>
                                    <Pencil className="h-4 w-4" />
                                </button>
                            )}
                            {onToggle && (
                                <button onClick={() => onToggle(code)} className="p-1.5 rounded-lg transition-colors" title={isActive ? t("courses.inactive") : t("courses.active")}>
                                    {isActive ? <ToggleRight className="h-5 w-5 text-active-room" /> : <ToggleLeft className="h-5 w-5 text-inactive-room" />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── DESKTOP ROW (≥ sm) ── */}
            <div className="group hidden sm:flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 last:border-b-0 hover:bg-slate-50/60 transition-colors">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-ava" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                        {code && <span className="text-slate-500 font-normal mr-1">{code} -</span>}
                        {name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>{credits} {t("courses.hours")}</span>
                        {level !== 0 && level !== "—" && <span>· {t("courses.level")} {level}</span>}
                        {programIds.length > 0 && <ProgramBadge programIds={programIds} />}
                    </p>
                </div>
                <div className="flex items-center relative overflow-hidden h-9">
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 translate-x-full group-hover:translate-x-0 transition-all duration-300 ease-out">
                        {onEdit && (
                            <button onClick={() => onEdit(course)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title={t("courses.edit")}>
                                <Pencil className="h-4 w-4" />
                            </button>
                        )}
                        {onToggle && (
                            <button onClick={() => onToggle(code)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-gray-1 transition-colors" title={isActive ? t("courses.inactive") : t("courses.active")}>
                                {isActive ? <ToggleRight className="h-5 w-5 text-active-room" /> : <ToggleLeft className="h-5 w-5 text-inactive-room" />}
                            </button>
                        )}
                    </div>
                    <span className="ml-3"><StatusBadge active={isActive} /></span>
                </div>
            </div>
        </>
    );
}
