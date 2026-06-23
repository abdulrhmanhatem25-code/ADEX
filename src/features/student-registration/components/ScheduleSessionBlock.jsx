import React from "react";
import { cn } from "@/shared/lib/utils";

/**
 * كارت حصة — هيدر (وقت في النص + خط متقطع تحته) + جسم بلون أفتح؛ بدون سكرول داخلي.
 */
export default function ScheduleSessionBlock({
    timeRange,
    courseName,
    sessionLabel,
    instructorName,
    locationText,
    selected = true,
    className,
    style,
    actionElement,
    compact = false,
    isPending = false,
}) {
    return (
        <div
            className={cn(
                "rounded-md overflow-hidden text-left shadow-sm border flex flex-col relative group",
                isPending
                    ? "border-emerald-400 bg-emerald-50/80 border-dashed border-[1.5px]"
                    : selected
                        ? "border-schedule-card-lec-border bg-schedule-card-lec/70"
                        : "border-schedule-card-sec bg-pink-50",
                className
            )}
            style={style}
        >
            {actionElement && (
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {actionElement}
                </div>
            )}
            {/* هيدر: اللون المميز والوقت */}
            <div
                className={cn(
                    compact ? "px-0.5 py-[1px]" : "px-1 lg:px-2 py-0.5 lg:py-1",
                    isPending
                        ? "bg-emerald-100/60"
                        : selected ? "bg-schedule-card-lec/70" : "bg-schedule-card-sec/20"
                )}
            >
                <div className={cn(
                    "font-bold text-center leading-tight text-slate-800 line-clamp-1",
                    compact ? "text-[7px] lg:text-[10px]" : "text-[7px] lg:text-[10px]"
                )}>
                    {timeRange}
                </div>
            </div>

            {/* تفاصيل المادة */}
            <div className={cn(
                "flex flex-col overflow-hidden",
                compact ? "p-1 gap-0" : "p-1 lg:p-2 gap-0.5 lg:gap-1"
            )}>
                <p className={cn(
                    "font-bold text-slate-900 leading-tight",
                    compact ? "text-[9px] lg:text-xs line-clamp-2" : "text-[8px] lg:text-xs line-clamp-2 lg:line-clamp-none"
                )}>
                    {courseName}
                </p>
                <div className="flex flex-col gap-0 lg:gap-0.5">
                    {sessionLabel && (
                        <span className={cn(
                            "font-semibold text-slate-700 leading-tight",
                            compact ? "text-[7.5px] lg:text-[9.5px] mt-0.5" : "text-[7.5px] lg:text-[10.5px]"
                        )}>
                            {sessionLabel}
                        </span>
                    )}
                    <span className={cn(
                        "font-medium text-slate-600 line-clamp-1 leading-tight mt-0.5",
                        compact ? "text-[8px] lg:text-[10px]" : "text-[7px] lg:text-[10px]"
                    )} title={instructorName}>
                        {instructorName || "\u00a0"}
                    </span>
                    {!compact && locationText && (
                        <span className="text-[7px] lg:text-[10px] text-slate-500 font-medium line-clamp-1 leading-tight" title={locationText}>
                            {locationText}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
