import React, { useMemo } from "react";
import { Users, CheckCircle2, ChevronDown, ChevronRight, BookOpen } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import AdexButton from "@/shared/ui/AdexButton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { WeeklyScheduleGrid } from "@/features/student-registration";
import SectionDropdown from "./SectionDropdown";
import { separateProjectCourses, buildGroupSessions } from "../utils/academicHelpers";

export default function GroupCard({
    group,
    isOpen,
    isSelected,
    mandatoryChoices, // { [courseId]: { lectureId, labId } }
    sidebarSelections, // sidebar selections (only relevant when selected)
    onToggle,
    onSelect,
    onSectionChange,  // (courseId, "lecture"|"lab", sectionId) => void
}) {
    const { mandatory } = separateProjectCourses(group.mandatoryCourses);

    // Compute sessions for THIS group (always, so expanding shows its schedule)
    const sessions = useMemo(
        () => buildGroupSessions(group, mandatoryChoices, sidebarSelections),
        [group, mandatoryChoices, sidebarSelections]
    );

    // Courses that have multiple lecture or lab options
    const coursesWithOptions = mandatory.filter(
        c => (c.lectureSections?.length ?? 0) > 1 || (c.labSections?.length ?? 0) > 1
    );

    return (
        <Collapsible open={isOpen} onOpenChange={open => onToggle(open)}>
            <div className={cn(
                "rounded-3xl border bg-white transition-all",
                isSelected ? "border-emerald-300 shadow-md shadow-emerald-50 ring-1 ring-emerald-200" : "border-slate-100"
            )}>
                {/* Header */}
                <CollapsibleTrigger asChild>
                    <button
                        type="button"
                        className="w-full px-4 py-3 flex items-center gap-2.5 text-left"
                        onClick={() => onToggle(!isOpen)}
                    >
                        <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                            isSelected ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500"
                        )}>
                            <Users className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                                <p className="font-extrabold text-slate-900 truncate">{group.classGroupName}</p>
                                <div className="flex items-center gap-2 shrink-0">
                                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                    <span className="text-slate-300">
                                        {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                                <p className="text-xs text-slate-400">
                                    {mandatory.length} courses
                                </p>
                                {group.availableSeats != null && (
                                    <p className="text-xs text-slate-400">
                                        · {group.availableSeats} seats available
                                    </p>
                                )}
                            </div>
                        </div>
                    </button>
                </CollapsibleTrigger>

                {/* Expanded content */}
                <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-3">
                        {/* Section swap dropdowns */}
                        {coursesWithOptions.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                                {coursesWithOptions.map(course => {
                                    const ch = mandatoryChoices?.[course.courseId] || {};
                                    return (
                                        <div key={course.courseId} className="flex flex-wrap gap-2">
                                            {course.lectureSections.length > 1 && (
                                                <SectionDropdown
                                                    label={`${course.courseName} — Lecture`}
                                                    sections={course.lectureSections}
                                                    selectedId={ch.lectureId ?? course.lectureSections[0]?.sectionId}
                                                    onChange={id => onSectionChange(course.courseId, "lecture", id)}
                                                    className="min-w-[220px]"
                                                    ignoreConflict={true}
                                                />
                                            )}
                                            {course.labSections.length > 1 && (
                                                <SectionDropdown
                                                    label={`${course.courseName} — Lab`}
                                                    sections={course.labSections}
                                                    selectedId={ch.labId ?? course.labSections[0]?.sectionId}
                                                    onChange={id => onSectionChange(course.courseId, "lab", id)}
                                                    className="min-w-[220px]"
                                                    ignoreConflict={true}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Weekly timetable */}
                        <div 
                            className="rounded-2xl border border-slate-100 overflow-x-auto no-scrollbars"
                            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                        >
                            <style>{`
                                .no-scrollbars::-webkit-scrollbar { display: none; }
                            `}</style>
                            {sessions && sessions.length > 0
                                ? <WeeklyScheduleGrid sessions={sessions} />
                                : <p className="text-sm text-center text-slate-400 py-6">No schedule data available</p>
                            }
                        </div>

                        {/* Course list */}
                        <div className="grid grid-cols-2 gap-2">
                            {mandatory.map(c => (
                                <div key={c.courseId} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                                    <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="text-xs text-slate-700 font-medium truncate">{c.courseName}</span>
                                    { (c.courseCode === 'CS402' || c.code === 'CS402' || c.courseName?.includes('CS402') || c.courseName?.toLowerCase().includes('operating systems 2')) && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200 whitespace-nowrap">
                                            Self Study
                                        </span>
                                    )}
                                    <span className="text-xs text-slate-400 ml-auto shrink-0">{c.creditHours}h</span>
                                </div>
                            ))}
                        </div>

                        {/* Select button */}
                        <AdexButton
                            variant={isSelected ? "grey" : "white"}
                            className={cn(
                                "w-full rounded-2xl font-extrabold border transition-colors",
                                isSelected
                                    ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500"
                                    : "hover:bg-slate-50 text-slate-700"
                            )}
                            onClick={() => onSelect()}
                        >
                            {isSelected ? "✓ Selected" : "Select This Group"}
                        </AdexButton>
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}
