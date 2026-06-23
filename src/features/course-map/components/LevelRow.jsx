import React from "react";
import CourseCard from "./CourseCard";

export default function LevelRow({
    level,
    courses,
    completedCodes,
    statusMap,
    hoveredCourse,
    focusedCourse,
    relatedCourses,
    onMouseEnter,
    onMouseLeave,
    onClick,
    registerRef,
    isExporting
}) {
    // Group courses by semester
    const bySem = {};
    courses.forEach(c => {
        (bySem[c.semester] ??= []).push(c);
    });

    const semesters = Object.keys(bySem).sort((a, b) => Number(a) - Number(b));

    return (
        <div className={`relative flex-shrink-0 md:flex-shrink rounded-2xl border-2 border-slate-200 p-4 pt-8 z-10 ${isExporting ? 'mb-0' : 'md:mb-8'}`}>
            {/* Level Label */}
            <div className="absolute -top-3.5 left-6 bg-slate-200 text-slate-700 px-4 py-1 rounded-full text-xs font-bold border-2 border-white shadow-sm">
                Level {level}
            </div>

            <div className={`flex h-full ${isExporting ? 'flex-row gap-8' : 'flex-row md:flex-col gap-6 md:gap-8'}`}>
                {semesters.map((sem, idx) => (
                    <div key={sem} className={`flex-1 flex flex-col gap-3 ${isExporting ? 'min-w-[140px]' : 'min-w-[140px] md:min-w-0'}`}>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1 border-b border-slate-100 pb-1 mb-2">
                            Semester {sem}
                        </div>
                        <div className={`flex gap-4 ${isExporting ? 'flex-col' : 'flex-col md:flex-row md:flex-wrap'}`}>
                            {bySem[sem].map((item) => {
                                const code = item.course?.courseCode;
                                const isHovered = hoveredCourse === code;
                                const isFocused = focusedCourse === code;
                                const isPrereqHighlight = relatedCourses.has(code);

                                return (
                                    <CourseCard
                                        key={item.id}
                                        item={item}
                                        isCompleted={completedCodes.has(code)}
                                        statusMap={statusMap}
                                        isHovered={isHovered}
                                        isFocused={isFocused}
                                        isPrereqHighlight={isPrereqHighlight}
                                        onMouseEnter={onMouseEnter}
                                        onMouseLeave={onMouseLeave}
                                        onClick={onClick}
                                        registerRef={registerRef}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
