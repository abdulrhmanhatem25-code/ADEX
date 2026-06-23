import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export default function ConflictSessionBlock({ sessions, style, className }) {
    const [openId, setOpenId] = useState(null);

    // If there are no sessions, render nothing
    if (!sessions || sessions.length === 0) return null;

    // Use the first session to display the overall time in the header
    const timeRange = sessions[0].timeRange;

    return (
        <div 
            className={cn("bg-white border border-rose-300 rounded-md shadow-sm flex flex-col overflow-hidden", className)} 
            style={style}
        >
            {/* Header: Indicates conflict / multiple sessions */}
            <div className="bg-rose-100 text-rose-900 px-1 lg:px-2 py-0.5 lg:py-1 text-[7px] lg:text-[10px] font-bold text-center border-b border-rose-200 shrink-0 shadow-sm z-10 flex justify-between items-center">
                <span>{timeRange}</span>
                <span className="bg-rose-500 text-white rounded-full px-1 lg:px-1.5 py-0.5 text-[7px] lg:text-[9px] leading-none">
                    {sessions.length}
                </span>
            </div>

            {/* Scrollable list of conflicting sessions without the ugly scrollbar track */}
            <style>{`
                .no-scrollbars::-webkit-scrollbar { display: none; }
            `}</style>
            <div 
                className="flex-1 overflow-y-auto p-1 lg:p-1.5 space-y-1 lg:space-y-1.5 z-0 no-scrollbars"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {sessions.map((s) => {
                    const selected = s.selected !== undefined ? s.selected : s.variant !== "pink";
                    const isOpen = openId === s.id;

                    return (
                        <div
                            key={s.id}
                            className={cn(
                                "border rounded-md overflow-hidden transition-all text-left shadow-sm",
                                selected
                                    ? "border-sky-300/80 bg-sky-50"
                                    : "border-pink-300/80 bg-pink-50"
                            )}
                        >
                            <button
                                type="button"
                                className={cn(
                                    "w-full px-1.5 lg:px-2 py-1 lg:py-1.5 text-left flex items-center justify-between transition-colors",
                                    selected
                                        ? "bg-sky-200 hover:bg-sky-300 text-slate-800"
                                        : "bg-pink-200 hover:bg-pink-300 text-slate-800"
                                )}
                                onClick={() => setOpenId(isOpen ? null : s.id)}
                            >
                                <span className={cn(
                                    "text-[9px] lg:text-[11px] font-bold truncate flex-1 leading-tight text-slate-800"
                                )}>
                                    {s.courseName}
                                </span>
                                {isOpen ? (
                                    <ChevronDown className="h-3 w-3 lg:h-3.5 lg:w-3.5 shrink-0 ml-0.5 lg:ml-1 text-slate-600" />
                                ) : (
                                    <ChevronRight className="h-3 w-3 lg:h-3.5 lg:w-3.5 shrink-0 ml-0.5 lg:ml-1 text-slate-600" />
                                )}
                            </button>

                            {/* Accordion Content */}
                            {isOpen && (
                                <div className="p-1 lg:p-2 space-y-0.5 bg-white/60">
                                    <p className="text-[9px] lg:text-xs font-bold text-slate-900 leading-tight mb-0.5 lg:mb-1">
                                        {s.courseName}
                                    </p>
                                    <p className="text-[8px] lg:text-[10.5px] font-semibold text-slate-700 leading-tight">
                                        {s.sessionLabel}
                                    </p>
                                    <p className="text-[7.5px] lg:text-[10px] font-medium text-slate-600 leading-tight line-clamp-1" title={s.instructorName}>
                                        {s.instructorName || "\u00a0"}
                                    </p>
                                    <p className="text-[7.5px] lg:text-[10px] text-slate-500 font-medium leading-tight">
                                        {s.locationText}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
