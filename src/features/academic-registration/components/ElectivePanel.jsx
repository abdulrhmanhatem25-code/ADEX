import React from "react";
import { CheckCircle2, AlertTriangle, BookOpen } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import SectionDropdown from "./SectionDropdown";

/**
 * Elective courses panel (right sidebar).
 * Student picks courses based on available credit hours (allowedHours).
 */
export default function ElectivePanel({
    electiveCourses,
    remainingHours,    // how many credit hours still available
    totalSelectedHours,// total credit hours currently selected
    allowedHours,      // max credit hours allowed
    selectedSections, // { [courseId]: { lectureId, labId } }
    onToggle,         // (courseId) => void
    onSectionChange,  // (courseId, "lecture"|"lab", sectionId) => void
}) {
    const courses = electiveCourses || [];

    if (courses.length === 0) {
        return (
            <div className="text-sm text-slate-400 py-4 text-center">
                No elective courses available
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {courses.map(course => {
                const isSelected = Boolean(selectedSections?.[course.courseId]);
                // Can select if: already selected (to deselect) OR adding this course won't exceed hours
                const canSelect = isSelected || (remainingHours >= (course.creditHours || 0));
                const choice = selectedSections?.[course.courseId] || {};
                const isBacklog = course.category === "Backlog";

                return (
                    <div key={course.courseId} className="space-y-2">
                        <button
                            type="button"
                            disabled={!canSelect}
                            onClick={() => onToggle(course.courseId)}
                            className={cn(
                                "w-full text-left rounded-2xl border px-4 py-3 transition-all",
                                isSelected
                                    ? "border-emerald-200 bg-emerald-50 ring-1 ring-emerald-200"
                                    : course.isFullyConflicted
                                        ? "border-red-200 bg-red-50 hover:bg-red-100 ring-1 ring-red-100"
                                        : canSelect
                                            ? "border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                                            : "border-slate-100 bg-slate-50 opacity-40 cursor-not-allowed"
                            )}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <p className="text-sm font-extrabold text-slate-900 truncate">
                                        {course.courseName}
                                    </p>
                                    { (course.courseCode === 'CS402' || course.code === 'CS402' || course.courseName?.includes('CS402') || course.courseName?.toLowerCase().includes('operating systems 2')) && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 border border-blue-200 shrink-0">
                                            Self Study
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {course.isFullyConflicted && (
                                        <span 
                                            className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-red-100 text-red-600 border border-red-200 cursor-help"
                                            title="All available times for this course conflict with your selected group. Please choose a different group to take this course."
                                        >
                                            <AlertTriangle className="w-2.5 h-2.5" />
                                            Schedule Conflict
                                        </span>
                                    )}
                                    {isBacklog && (
                                        <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                                            <AlertTriangle className="w-2.5 h-2.5" />
                                            Backlog
                                        </span>
                                    )}
                                    <span className="text-xs text-slate-400">{course.creditHours}h</span>
                                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                </div>
                            </div>
                            {course.advisorNote && (
                                <p dir="rtl" className="text-[11px] text-amber-600 bg-amber-50/60 rounded-lg px-2 py-1 mt-2 leading-relaxed">
                                    {course.advisorNote}
                                </p>
                            )}
                        </button>

                        {/* Section pickers (shown when selected) */}
                        {isSelected && (
                            <div className="pl-3 space-y-2">
                                {course.lectureSections?.length > 1 && (
                                    <SectionDropdown
                                        label="Lecture"
                                        sections={course.lectureSections}
                                        selectedId={choice.lectureId}
                                        onChange={id => onSectionChange(course.courseId, "lecture", id)}
                                    />
                                )}
                                {course.labSections?.length > 1 && (
                                    <SectionDropdown
                                        label="Lab / Section"
                                        sections={course.labSections}
                                        selectedId={choice.labId}
                                        onChange={id => onSectionChange(course.courseId, "lab", id)}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
