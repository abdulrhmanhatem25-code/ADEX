import React from "react";
import { BookOpen, CheckCircle2, ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import SectionRow from "./SectionRow";

const CATEGORY_STYLES = {
    Current:  "bg-blue-50 text-blue-600",
    Backlog:  "bg-amber-50 text-amber-600",
    Elective: "bg-violet-50 text-violet-600",
};

export default function CourseBlock({ courseName, creditHours, category, advisorNote, groups, pendingIds, blockedIds, onAdd, onRemove, isOpen, onToggle }) {
    const hasPending = groups.some(g =>
        (g.lecture && pendingIds.has(g.lecture.sectionId)) ||
        g.labs.some(l => pendingIds.has(l.sectionId))
    );

    return (
        <div className={cn(
            "rounded-2xl border overflow-hidden transition-all",
            hasPending ? "border-emerald-200" : "border-slate-100"
        )}>
            {/* Clickable header */}
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors border-b border-slate-100 text-left"
            >
                <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-sm font-extrabold text-slate-800 flex-1">{courseName}</span>
                {category && (
                    <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        CATEGORY_STYLES[category] || "bg-slate-100 text-slate-500"
                    )}>
                        {category}
                    </span>
                )}
                <span className="text-xs text-slate-400 mr-1">{creditHours} hrs</span>
                {hasPending && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1" />}
                {isOpen
                    ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                }
            </button>

            {/* Collapsible content */}
            {isOpen && (
                <div className="bg-white">
                    {/* Advisor note */}
                    {advisorNote && (
                        <div dir="auto" className="flex items-start gap-2 px-4 py-2 bg-amber-50/60 border-b border-amber-100 text-[11px] text-amber-700">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>{advisorNote}</span>
                        </div>
                    )}

                    <div className="divide-y divide-slate-50">
                        {groups.map((g, gi) => (
                            <div key={`${g.classGroupId}-${gi}`} className="px-3 py-2 space-y-1.5">
                                {g.lecture && (
                                    <SectionRow
                                        section={g.lecture}
                                        type="Lecture"
                                        groupName={g.classGroupName}
                                        courseId={g.courseId}
                                        classGroupId={g.classGroupId}
                                        isPending={pendingIds.has(g.lecture.sectionId)}
                                        isBlocked={blockedIds.has(g.lecture.sectionId)}
                                        conflictMessage={blockedIds.get(g.lecture.sectionId) || g.lecture.conflictMessage}
                                        onAdd={onAdd}
                                        onRemove={onRemove}
                                    />
                                )}
                                {g.labs.map(lab => (
                                    <SectionRow
                                        key={lab.sectionId}
                                        section={lab}
                                        type="Lab"
                                        groupName={g.classGroupName}
                                        courseId={g.courseId}
                                        classGroupId={g.classGroupId}
                                        isPending={pendingIds.has(lab.sectionId)}
                                        isBlocked={blockedIds.has(lab.sectionId)}
                                        conflictMessage={blockedIds.get(lab.sectionId) || lab.conflictMessage}
                                        onAdd={onAdd}
                                        onRemove={onRemove}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
