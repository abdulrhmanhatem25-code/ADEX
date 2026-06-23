import React, { memo } from "react";
import { useTranslation } from "react-i18next";

const COLORS = {
    retake: { bg: "bg-cmap-retake-bg", border: "border-cmap-retake-border", text: "text-cmap-retake-text" },
    core: { bg: "bg-cmap-core-bg", border: "border-cmap-core-border", text: "text-cmap-core-text" },
    elective: { bg: "bg-cmap-elective-bg", border: "border-cmap-elective-border", text: "text-cmap-elective-text" },
    locked: { bg: "bg-cmap-locked-bg", border: "border-cmap-locked-border", text: "text-cmap-locked-text" },
    completed: { bg: "bg-cmap-completed-bg", border: "border-cmap-completed-border", text: "text-cmap-completed-text" },
    default: { bg: "bg-cmap-default-bg", border: "border-cmap-default-border", text: "text-cmap-default-text" },
};

function getCardStyle(courseCode, isCompleted, statusMap) {
    if (isCompleted) return COLORS.completed;
    const s = statusMap.get(courseCode);
    if (!s) return COLORS.default;
    return COLORS[s.type] ?? COLORS.default;
}

const CourseCard = memo(({ 
    item, 
    isCompleted, 
    statusMap, 
    isHovered, 
    isFocused, 
    isPrereqHighlight, 
    onMouseEnter, 
    onMouseLeave, 
    onClick,
    registerRef 
}) => {
    const { i18n } = useTranslation();
    const isAr = i18n.language === "ar";
    
    const c = item.course;
    const style = getCardStyle(c.courseCode, isCompleted, statusMap);
    const status = statusMap.get(c.courseCode);
    const isLocked = status?.type === "locked";

    const isSlot = item.isSlot;
    const displayName = isAr ? (c.courseNameAr || c.courseName) : c.courseName;

    // Fading out if not hovered/focused
    const shouldFade = (isFocused || isHovered) && !isPrereqHighlight && !isHovered && !isFocused;
    const opacityClass = shouldFade ? "opacity-30" : "opacity-100";
    const highlightClass = (isHovered || isFocused || isPrereqHighlight) ? "ring-2 ring-offset-2 ring-cmap-hover-ring z-10" : "z-0";
    
    // Determine dimensions to match previous SVG aspect somewhat, but more flexy
    const dims = "w-32 h-20";

    if (isSlot) {
        const shortName = (item.slotName || "Elective").length > 18
            ? item.slotName.slice(0, 16) + "…"
            : (item.slotName || "Elective");
        const typeShort = (item.courseType || "").replace("Elective", "").trim() || "Elective";
        
        return (
            <div 
                ref={(el) => registerRef(item.id, el)}
                className={`relative flex flex-col items-center justify-center p-2 rounded-xl border-2 border-dashed bg-green-50/50 border-green-300 text-green-800 ${dims} ${opacityClass} transition-opacity duration-300`}
            >
                <span className="text-[10px] font-bold italic mb-1">Elective Slot</span>
                <span className="text-[11px] text-center leading-tight font-semibold">{shortName}</span>
                <span className="text-[9px] mt-1 opacity-75">{typeShort}</span>
            </div>
        );
    }

    return (
        <div
            ref={(el) => registerRef(item.id, el)}
            onMouseEnter={() => onMouseEnter(item.id, c.courseCode)}
            onMouseLeave={onMouseLeave}
            onClick={() => onClick(item.id, c.courseCode)}
            className={`relative flex flex-col p-2 rounded-xl border-2 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md ${style.bg} ${style.border} ${style.text} ${isLocked ? "border-dashed" : ""} ${dims} ${opacityClass} ${highlightClass} group`}
            title={`${c.courseCode} — ${displayName}\n${c.creditHours ?? "—"} hrs${isCompleted ? "\n✓ Completed" : ""}${status?.reason ? "\n" + status.reason : ""}`}
        >
            <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold">{c.courseCode}</span>
                    {c.creditHours > 0 && (
                        <span className="text-[10px] font-bold opacity-75">{c.creditHours} {isAr ? "س" : "hrs"}</span>
                    )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {isCompleted && (
                        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-teal-500 text-white text-[10px] font-bold">✓</span>
                    )}
                    {isLocked && !isCompleted && (
                        <span className="text-xs opacity-70">🔒</span>
                    )}
                </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
                <p className="text-[10px] font-medium leading-snug line-clamp-3" title={displayName}>
                    {displayName}
                </p>
            </div>
        </div>
    );
});

export default CourseCard;
