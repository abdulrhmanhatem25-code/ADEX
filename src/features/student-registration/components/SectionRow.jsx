import React from "react";
import { Clock, MapPin, Users2, CheckCircle2, Plus, TriangleAlert, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { dayShort } from "../utils/registrationHelpers";

function ConflictBadge({ message }) {
    return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
            <TriangleAlert className="w-3 h-3" /> {message}
        </span>
    );
}

export default function SectionRow({ section, type, groupName, courseId, classGroupId,
    onAdd, onRemove, isPending, isBlocked, conflictMessage }) {
    const cap = section.capacity;
    const isFull = cap?.isFull || cap?.remaining === 0;
    const disabled = isFull || isBlocked;

    return (
        <div className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-xl border transition-all",
            isPending
                ? "border-emerald-200 bg-emerald-50"
                : isBlocked
                    ? "border-amber-100 bg-amber-50/50 opacity-70"
                    : "border-ui-border bg-ui-bg hover:border-ui-text-subtle"
        )}>
            <span className={cn(
                "shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                type === "Lecture" ? "bg-schedule-card-lec/40 text-schedule-card-lec" : "bg-schedule-card-sec/40 text-schedule-card-sec"
            )}>
                {type === "Lecture" ? "LEC" : "LAB"}
            </span>

            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-ui-text truncate">{section.name}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                    <span className="text-[11px] text-ui-text-subtle flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {dayShort(section.schedule?.day)} · {section.schedule?.time}
                    </span>
                    <span className="text-[11px] text-ui-text-subtle flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {section.schedule?.room || "TBA"}
                    </span>
                    <span className="text-[11px] text-ui-text-subtle truncate">{section.instructor}</span>
                    <span className={cn("text-[11px] flex items-center gap-1", isFull ? "text-rose-400" : "text-ui-text-subtle")}>
                        <Users2 className="w-3 h-3" />
                        {cap ? `${cap.enrolled}/${cap.max}` : "—"}{isFull && " (Full)"}
                    </span>
                    <span className="text-[11px] text-text-4 font-medium">{groupName}</span>
                </div>
                {(conflictMessage && isBlocked) && <ConflictBadge message={conflictMessage} />}
            </div>

            <button
                onClick={() => {
                    if (isPending && onRemove) {
                        onRemove(section.sectionId);
                    } else if (!disabled && !isPending) {
                        onAdd({
                            sectionId: section.sectionId,
                            type, courseId, classGroupId,
                            schedule: section.schedule,
                            instructorName: section.instructor,
                            sectionName: section.name,
                            lectureSectionId: type === "Lecture" ? section.sectionId : null,
                            labSectionId: type === "Lab" ? section.sectionId : null,
                        });
                    }
                }}
                disabled={disabled && !isPending}
                className={cn(
                    "shrink-0 flex items-center justify-center w-7 h-7 rounded-lg border transition-all group",
                    isPending
                        ? "border-rose-300 bg-rose-100 text-rose-600 sm:border-emerald-300 sm:bg-emerald-100 sm:text-emerald-600 sm:hover:bg-rose-100 sm:hover:text-rose-600 sm:hover:border-rose-300 cursor-pointer"
                        : disabled
                            ? "border-ui-border bg-ui-bg-hover text-ui-text-subtle cursor-not-allowed"
                            : "border-ui-border bg-ui-bg text-ui-text-muted hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50"
                )}
                title={isPending ? "Click to remove" : isBlocked ? conflictMessage || "Conflict" : isFull ? "Section full" : "Add this section"}
            >
                {isPending ? (
                    <>
                        <CheckCircle2 className="w-4 h-4 hidden sm:block group-hover:sm:hidden" />
                        <X className="w-4 h-4 block sm:hidden group-hover:sm:block" />
                    </>
                ) : (
                    <Plus className="w-4 h-4" />
                )}
            </button>
        </div>
    );
}
