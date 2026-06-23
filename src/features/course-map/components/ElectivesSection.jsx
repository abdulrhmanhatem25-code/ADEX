import React from "react";
import CourseCard from "./CourseCard";

export default function ElectivesSection({
    pools,
    items,
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
    if (!pools || pools.length === 0 || !items || items.length === 0) return null;

    // Group elective items by pool
    const poolGroups = {};
    items.forEach(item => {
        const pn = item.poolName || "Elective";
        (poolGroups[pn] ??= []).push(item);
    });

    return (
        <div className={`relative flex-shrink-0 md:flex-shrink rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/30 p-4 pt-8 z-10 shadow-sm ${isExporting ? 'mb-0' : 'md:mb-8'}`}>
            {/* Elective Label */}
            <div className="absolute -top-3.5 left-6 bg-amber-200 text-amber-800 px-4 py-1 rounded-full text-xs font-bold border-2 border-white shadow-sm">
                Elective Pools
            </div>

            <div className={`flex ${isExporting ? 'flex-row gap-6' : 'flex-row md:flex-col gap-6 md:gap-0 md:space-y-6'}`}>
                {Object.entries(poolGroups).map(([poolName, courses]) => (
                    <div key={poolName} className={`flex-1 bg-white/60 rounded-xl p-4 border border-amber-100 ${isExporting ? 'min-w-[140px]' : 'min-w-[140px] md:min-w-0'}`}>
                        <div className="text-[11px] font-bold text-amber-800 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                            {poolName}
                        </div>
                        <div className={`flex gap-4 overflow-visible ${isExporting ? 'flex-col' : 'flex-col md:flex-row md:flex-wrap'}`}>
                            {courses.map((item) => {
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
